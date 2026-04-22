package com.campushub.smartcampus.service;

import com.campushub.smartcampus.dto.AuthUserResponseDTO;
import com.campushub.smartcampus.entity.User;
import com.campushub.smartcampus.enums.UserType;
import com.campushub.smartcampus.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.Optional;

@Service
@Transactional
public class GoogleAuthService {

    private static final URI GOOGLE_TOKEN_INFO_URI = URI.create("https://oauth2.googleapis.com/tokeninfo");
    private static final DateTimeFormatter YEAR_CODE = DateTimeFormatter.ofPattern("yy");

    private final UserRepository userRepository;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.google-client-id:}")
    private String googleClientId;

    public GoogleAuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.httpClient = HttpClient.newHttpClient();
    }

    public AuthUserResponseDTO authenticate(String credential) {
        if (!StringUtils.hasText(googleClientId)) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Google client ID is not configured"
            );
        }

        GoogleTokenInfo tokenInfo = verifyToken(credential);
        UserSyncResult result = upsertUser(tokenInfo);
        return AuthUserResponseDTO.fromEntity(result.user(), result.created());
    }

    private GoogleTokenInfo verifyToken(String credential) {
        if (!StringUtils.hasText(credential)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Google credential is required");
        }

        try {
            String encodedToken = URLEncoder.encode(credential, StandardCharsets.UTF_8);
            URI requestUri = URI.create(GOOGLE_TOKEN_INFO_URI + "?id_token=" + encodedToken);

            HttpRequest request = HttpRequest.newBuilder(requestUri)
                    .header("Accept", "application/json")
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Google token validation failed");
            }

            JsonNode payload = objectMapper.readTree(response.body());
            String audience = textValue(payload, "aud");
            if (!googleClientId.equals(audience)) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Google token audience mismatch");
            }

            String issuer = textValue(payload, "iss");
            if (!"accounts.google.com".equals(issuer) && !"https://accounts.google.com".equals(issuer)) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Google token issuer mismatch");
            }

            boolean emailVerified = payload.path("email_verified").asBoolean(false);
            if (!emailVerified) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Google email is not verified");
            }

            String subject = textValue(payload, "sub");
            String email = textValue(payload, "email");
            if (!StringUtils.hasText(subject) || !StringUtils.hasText(email)) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Google token is missing required fields");
            }

            return new GoogleTokenInfo(
                    subject,
                    email.trim().toLowerCase(Locale.ROOT),
                    optionalText(payload, "name"),
                    optionalText(payload, "picture")
            );
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to read Google token response", e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Google token validation was interrupted", e);
        }
    }

    private UserSyncResult upsertUser(GoogleTokenInfo tokenInfo) {
        Optional<User> existingByProvider = userRepository.findByProviderAndProviderId("GOOGLE", tokenInfo.subject());
        Optional<User> existingByEmail = userRepository.findByEmailIgnoreCase(tokenInfo.email());

        User user;
        boolean created = false;

        if (existingByProvider.isPresent()) {
            user = existingByProvider.get();
        } else if (existingByEmail.isPresent()) {
            user = existingByEmail.get();
        } else {
            user = new User();
            user.setRole("USER");
            user.setUserType(UserType.STUDENT);
            user.setRegistrationYear(LocalDate.now().getYear());
            user.setUniversityId(generateGoogleUniversityId());
            created = true;
        }

        if (!StringUtils.hasText(user.getUniversityId())) {
            user.setUniversityId(generateGoogleUniversityId());
        }

        user.setName(resolveDisplayName(tokenInfo, user));
        user.setEmail(tokenInfo.email());
        user.setProvider("GOOGLE");
        user.setProviderId(tokenInfo.subject());
        user.setProfileImageUrl(tokenInfo.picture());

        if (user.getUserType() == null) {
            user.setUserType(UserType.STUDENT);
        }
        if (user.getRegistrationYear() == null) {
            user.setRegistrationYear(LocalDate.now().getYear());
        }

        User saved = userRepository.save(user);
        return new UserSyncResult(saved, created);
    }

    private String resolveDisplayName(GoogleTokenInfo tokenInfo, User existingUser) {
        if (StringUtils.hasText(tokenInfo.name())) {
            return tokenInfo.name().trim();
        }
        if (StringUtils.hasText(existingUser.getName())) {
            return existingUser.getName();
        }
        String localPart = tokenInfo.email().contains("@")
                ? tokenInfo.email().substring(0, tokenInfo.email().indexOf('@'))
                : tokenInfo.email();
        return localPart.replace('.', ' ');
    }

    private String generateGoogleUniversityId() {
        String yearCode = LocalDate.now().format(YEAR_CODE);
        String prefix = "GGL" + yearCode;

        String lastId = userRepository.findTopByUniversityIdStartingWithOrderByUniversityIdDesc(prefix)
                .map(User::getUniversityId)
                .orElse(null);

        int nextSequence = 1;
        if (StringUtils.hasText(lastId) && lastId.length() >= prefix.length() + 4) {
            String tail = lastId.substring(lastId.length() - 4);
            try {
                nextSequence = Math.max(1, Integer.parseInt(tail) + 1);
            } catch (NumberFormatException ignored) {
                nextSequence = 1;
            }
        }

        return prefix + String.format("%04d", nextSequence);
    }

    private String textValue(JsonNode node, String field) {
        String value = optionalText(node, field);
        if (!StringUtils.hasText(value)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Google token is missing " + field);
        }
        return value;
    }

    private String optionalText(JsonNode node, String field) {
        JsonNode value = node.get(field);
        return value != null && !value.isNull() ? value.asText() : null;
    }

    private record GoogleTokenInfo(String subject, String email, String name, String picture) {}

    private record UserSyncResult(User user, boolean created) {}
}
