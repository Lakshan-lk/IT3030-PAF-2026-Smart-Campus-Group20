package com.campushub.smartcampus.repository;

import com.campushub.smartcampus.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
	boolean existsByEmailIgnoreCase(String email);
	boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);

	boolean existsByPhone(String phone);
	boolean existsByPhoneAndIdNot(String phone, Long id);

	boolean existsByUsernameIgnoreCase(String username);
	boolean existsByUsernameIgnoreCaseAndIdNot(String username, Long id);

	Optional<User> findByEmailIgnoreCase(String email);

	Optional<User> findByProviderAndProviderId(String provider, String providerId);

	Optional<User> findTopByUniversityIdStartingWithOrderByUniversityIdDesc(String prefix);

	List<User> findAllByOrderByCreatedAtDesc();

	Optional<User> findByUsernameIgnoreCase(String username);
	List<User> findByRoleIn(List<String> roles);

	Optional<User> findFirstByRoleIgnoreCase(String role);
}
