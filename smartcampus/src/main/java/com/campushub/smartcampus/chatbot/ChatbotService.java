package com.campushub.smartcampus.chatbot;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ChatbotService {

    private final RestClient restClient;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final CampusTools campusTools;
    private final String model;

    private final Map<String, List<Map<String, Object>>> conversationStore = new ConcurrentHashMap<>();

    private static final int MAX_TOOL_ROUNDS = 5;

    private static final String TOOLS_JSON = """
            [
              {
                "type": "function",
                "function": {
                  "name": "list_resources",
                  "description": "List all campus rooms/resources.",
                  "parameters": {
                    "type": "object",
                    "properties": {},
                    "required": []
                  }
                }
              },
              {
                "type": "function",
                "function": {
                  "name": "search_resource_by_name",
                  "description": "Search campus room/resource by name.",
                  "parameters": {
                    "type": "object",
                    "properties": {
                      "name": {
                        "type": "string",
                        "description": "Resource name or partial resource name"
                      }
                    },
                    "required": ["name"]
                  }
                }
              },
              {
                "type": "function",
                "function": {
                  "name": "create_booking",
                  "description": "Create a room/resource booking.",
                  "parameters": {
                    "type": "object",
                    "properties": {
                      "resourceId": {
                        "type": "integer",
                        "description": "Resource ID"
                      },
                      "startTime": {
                        "type": "string",
                        "description": "Start datetime in yyyy-MM-ddTHH:mm:ss format"
                      },
                      "endTime": {
                        "type": "string",
                        "description": "End datetime in yyyy-MM-ddTHH:mm:ss format"
                      },
                      "purpose": {
                        "type": "string",
                        "description": "Booking purpose"
                      },
                      "attendees": {
                        "type": "integer",
                        "description": "Number of attendees"
                      }
                    },
                    "required": ["resourceId", "startTime", "endTime", "purpose", "attendees"]
                  }
                }
              },
              {
                "type": "function",
                "function": {
                  "name": "get_user_bookings",
                  "description": "Get bookings of current user.",
                  "parameters": {
                    "type": "object",
                    "properties": {},
                    "required": []
                  }
                }
              },
              {
                "type": "function",
                "function": {
                  "name": "cancel_booking",
                  "description": "Cancel a resource booking by booking ID.",
                  "parameters": {
                    "type": "object",
                    "properties": {
                      "bookingId": {
                        "type": "integer",
                        "description": "Booking ID"
                      }
                    },
                    "required": ["bookingId"]
                  }
                }
              },
              {
                "type": "function",
                "function": {
                  "name": "list_equipment",
                  "description": "List all campus equipment.",
                  "parameters": {
                    "type": "object",
                    "properties": {},
                    "required": []
                  }
                }
              },
              {
                "type": "function",
                "function": {
                  "name": "create_equipment_booking",
                  "description": "Book equipment for a user.",
                  "parameters": {
                    "type": "object",
                    "properties": {
                      "equipmentId": {
                        "type": "integer",
                        "description": "Equipment ID"
                      },
                      "startTime": {
                        "type": "string",
                        "description": "Start datetime in yyyy-MM-ddTHH:mm:ss format"
                      },
                      "endTime": {
                        "type": "string",
                        "description": "End datetime in yyyy-MM-ddTHH:mm:ss format"
                      },
                      "purpose": {
                        "type": "string",
                        "description": "Purpose of equipment booking"
                      }
                    },
                    "required": ["equipmentId", "startTime", "endTime", "purpose"]
                  }
                }
              },
              {
                "type": "function",
                "function": {
                  "name": "get_user_tickets",
                  "description": "Get tickets reported by current user.",
                  "parameters": {
                    "type": "object",
                    "properties": {},
                    "required": []
                  }
                }
              }
            ]
            """;

    public ChatbotService(@Value("${groq.api.key}") String apiKey,
                          @Value("${groq.api.model:llama-3.3-70b-versatile}") String model,
                          CampusTools campusTools) {
        this.model = model;
        this.campusTools = campusTools;

        this.restClient = RestClient.builder()
                .baseUrl("https://api.groq.com/openai/v1")
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    public String ask(String message, String conversationId, Long userId) {
        List<Map<String, Object>> history = conversationStore.computeIfAbsent(
                conversationId,
                key -> new ArrayList<>()
        );

        history.add(Map.of("role", "user", "content", message));

        if (history.size() > 20) {
            history = new ArrayList<>(history.subList(history.size() - 20, history.size()));
            conversationStore.put(conversationId, history);
        }

        String systemPrompt = """
                You are the Smart Campus Chatbot Assistant.

                You help users with:
                - campus resource listing
                - resource searching
                - room/resource bookings
                - booking cancellation
                - equipment listing
                - equipment booking
                - viewing user tickets

                Rules:
                - Use tools for real system data or real actions.
                - If user gives a resource/equipment name but not ID, search or list first.
                - For booking, collect missing details before creating.
                - Date/time format required by backend: yyyy-MM-ddTHH:mm:ss
                - Example: 2026-05-02T10:00:00
                - Today's date is %s.
                - Be short, friendly, and clear.
                - If user asks unrelated questions, politely redirect to campus operations.
                - After using a tool, always show the actual tool result to the user.
            - Do not summarize as "Here are the resources" without listing names and IDs.
            - If tool result contains IDs, names, dates, or statuses, include them in the final answer.
                
                Current user context:
                %s
                """.formatted(LocalDate.now(), campusTools.getUserContext(userId));

        try {
            for (int round = 0; round < MAX_TOOL_ROUNDS; round++) {
                List<Map<String, Object>> messages = new ArrayList<>();
                messages.add(Map.of("role", "system", "content", systemPrompt));
                messages.addAll(history);

                ObjectNode requestBody = objectMapper.createObjectNode();
                requestBody.put("model", model);
                requestBody.set("messages", objectMapper.valueToTree(messages));
                requestBody.put("temperature", 0.4);
                requestBody.put("max_completion_tokens", 1024);
                requestBody.set("tools", objectMapper.readTree(TOOLS_JSON));

                String response = restClient.post()
                        .uri("/chat/completions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(objectMapper.writeValueAsString(requestBody))
                        .retrieve()
                        .body(String.class);

                JsonNode root = objectMapper.readTree(response);
                JsonNode choice = root.path("choices").get(0);
                JsonNode messageNode = choice.path("message");
                String finishReason = choice.path("finish_reason").asText();

                if ("tool_calls".equals(finishReason) && messageNode.has("tool_calls")) {
                    Map<String, Object> assistantMessage = new LinkedHashMap<>();
                    assistantMessage.put("role", "assistant");

                    if (messageNode.has("content") && !messageNode.path("content").isNull()) {
                        assistantMessage.put("content", messageNode.path("content").asText());
                    } else {
                        assistantMessage.put("content", null);
                    }

                    List<Map<String, Object>> toolCalls = new ArrayList<>();

                    for (JsonNode tc : messageNode.path("tool_calls")) {
                        Map<String, Object> toolCall = new LinkedHashMap<>();
                        toolCall.put("id", tc.path("id").asText());
                        toolCall.put("type", "function");

                        Map<String, String> function = new LinkedHashMap<>();
                        function.put("name", tc.path("function").path("name").asText());
                        function.put("arguments", tc.path("function").path("arguments").asText());

                        toolCall.put("function", function);
                        toolCalls.add(toolCall);
                    }

                    assistantMessage.put("tool_calls", toolCalls);
                    history.add(assistantMessage);

                    for (JsonNode tc : messageNode.path("tool_calls")) {
                        String toolCallId = tc.path("id").asText();
                        String functionName = tc.path("function").path("name").asText();
                        String argsJson = tc.path("function").path("arguments").asText();

                        JsonNode args = objectMapper.readTree(argsJson);
                        String result = executeTool(functionName, args, userId);

                        Map<String, Object> toolResultMessage = new LinkedHashMap<>();
                        toolResultMessage.put("role", "tool");
                        toolResultMessage.put("tool_call_id", toolCallId);
                        toolResultMessage.put("content", result);

                        history.add(toolResultMessage);
                    }

                    continue;
                }

                String reply = messageNode.path("content").asText("No response generated.");
                history.add(Map.of("role", "assistant", "content", reply));
                return reply;
            }

            return "I tried to complete the request, but it took too many steps. Please try again with clearer details.";

        } catch (Exception e) {
            return "Chatbot error: " + e.getMessage();
        }
    }

    private String executeTool(String functionName, JsonNode args, Long userId) {
        return switch (functionName) {
            case "list_resources" -> campusTools.listResources();

            case "search_resource_by_name" -> campusTools.searchResourceByName(
                    args.path("name").asText()
            );

            case "create_booking" -> campusTools.createBooking(
                    args.path("resourceId").asLong(),
                    userId,
                    args.path("startTime").asText(),
                    args.path("endTime").asText(),
                    args.path("purpose").asText(),
                    args.path("attendees").asInt()
            );

            case "get_user_bookings" -> campusTools.getUserBookings(userId);

            case "cancel_booking" -> campusTools.cancelBooking(
                    args.path("bookingId").asLong()
            );

            case "list_equipment" -> campusTools.listEquipment();

            case "create_equipment_booking" -> campusTools.createEquipmentBooking(
                    args.path("equipmentId").asLong(),
                    userId,
                    args.path("startTime").asText(),
                    args.path("endTime").asText(),
                    args.path("purpose").asText()
            );

            case "get_user_tickets" -> campusTools.getUserTickets(userId);

            default -> "Unknown tool: " + functionName;
        };
    }
}