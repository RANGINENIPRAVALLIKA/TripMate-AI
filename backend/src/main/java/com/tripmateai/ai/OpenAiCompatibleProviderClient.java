package com.tripmateai.ai;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tripmateai.dto.request.ai.AiTripPlanRequest;
import com.tripmateai.dto.response.ai.AiActivityPlanResponse;
import com.tripmateai.dto.response.ai.AiItineraryDayResponse;
import com.tripmateai.dto.response.packing.AiPackingItemResponse;
import com.tripmateai.entity.Destination;
import com.tripmateai.entity.Trip;
import com.tripmateai.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

/** Isolated OpenAI-compatible client shared by planning, packing, and chat with resilient fallback. */
@Slf4j
@Component
public class OpenAiCompatibleProviderClient implements AiProviderClient {

    private static final Set<String> CATEGORIES = Set.of(
            "CLOTHING", "TOILETRIES", "ELECTRONICS", "DOCUMENTS", "MEDICINE", "TRAVEL", "ACCESSORIES", "OTHER"
    );

    private final ObjectMapper json;
    private final String key;
    private final String url;
    private final String model;
    private final int timeout;

    public OpenAiCompatibleProviderClient(
            ObjectMapper json,
            @Value("${app.ai.api-key:}") String key,
            @Value("${app.ai.base-url:https://api.openai.com/v1/chat/completions}") String url,
            @Value("${app.ai.model:gpt-4o-mini}") String model,
            @Value("${app.ai.timeout-seconds:30}") int timeout
    ) {
        this.json = json;
        this.key = key;
        this.url = url;
        this.model = model;
        this.timeout = timeout;
    }

    @Override
    public List<AiItineraryDayResponse> generate(AiTripPlanRequest request, Destination destination) {
        if (!key.isBlank()) {
            try {
                String stateContext = destination.getState() != null ? destination.getState() + ", " : "";
                JsonNode node = jsonRequest("Return JSON only: {days:[{dayNumber,title,activities:[{title,description,location,startTime,endTime,estimatedCost}]}]}. "
                        + "Create an authentic India-first travel itinerary for " + request.numberOfDays() + " days for "
                        + destination.getCity() + ", " + stateContext + destination.getCountry()
                        + ". Estimated costs must be realistic amounts in Indian Rupees (INR ₹), considering local transport (auto-rickshaw, cab, metro), regional meals/thalis, and temple/monument fees. Preferences: "
                        + request.preferences() + ". No prose.");
                if (node.has("days")) {
                    node = node.get("days");
                }
                return json.convertValue(node, new TypeReference<List<AiItineraryDayResponse>>() {});
            } catch (Exception e) {
                log.warn("Remote AI provider call failed ({}), activating curated itinerary planner fallback", e.getMessage());
            }
        }
        return generateCuratedItinerary(request, destination);
    }

    @Override
    public List<AiPackingItemResponse> generatePacking(Trip trip, String preferences) {
        long days = ChronoUnit.DAYS.between(trip.getStartDate(), trip.getEndDate()) + 1;
        if (!key.isBlank()) {
            try {
                String stateContext = trip.getDestination().getState() != null ? trip.getDestination().getState() + ", " : "";
                JsonNode node = jsonRequest("Return JSON only: {items:[{name,category,quantity}]}. Make a practical India travel packing checklist for destination="
                        + trip.getDestination().getCity() + ", " + stateContext + trip.getDestination().getCountry() + ", days=" + days + ", travelers="
                        + trip.getNumberOfTravelers() + ", travelPreferences=" + trip.getPreferences() + ", optionalUserPreferences="
                        + (preferences == null ? "none" : preferences) + ". Include essentials for Indian travel (temple modesty clothing, slip-on footwear, mosquito repellent, power bank, UPI payment readiness). Categories must be one of " + CATEGORIES
                        + " and quantity must be a positive integer. No prose.");
                if (node.has("items")) {
                    node = node.get("items");
                }
                List<AiPackingItemResponse> result = json.convertValue(node, new TypeReference<List<AiPackingItemResponse>>() {});
                if (result != null && !result.isEmpty()) {
                    for (var item : result) validate(item);
                    return result;
                }
            } catch (Exception e) {
                log.warn("Remote AI packing generation failed ({}), activating curated packing generator fallback", e.getMessage());
            }
        }
        return generateCuratedPacking(trip, days);
    }

    @Override
    public String chat(String prompt) {
        if (!key.isBlank()) {
            try {
                return requestContent(prompt, false);
            } catch (Exception e) {
                log.warn("Remote AI chat failed ({}), falling back to assistant engine", e.getMessage());
            }
        }
        return generateChatResponse(prompt);
    }

    private JsonNode jsonRequest(String prompt) {
        try {
            return json.readTree(requestContent(prompt, true));
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("AI provider returned an invalid response");
        }
    }

    private String requestContent(String prompt, boolean jsonOnly) {
        if (key.isBlank()) {
            throw new BadRequestException("AI provider is not configured");
        }
        try {
            Map<String, Object> bodyData = new LinkedHashMap<>();
            bodyData.put("model", model);
            bodyData.put("messages", List.of(Map.of("role", "user", "content", prompt)));
            if (jsonOnly) {
                bodyData.put("response_format", Map.of("type", "json_object"));
            }

            HttpRequest request = HttpRequest.newBuilder(URI.create(url))
                    .timeout(Duration.ofSeconds(timeout))
                    .header("Authorization", "Bearer " + key)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json.writeValueAsString(bodyData)))
                    .build();

            HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() / 100 != 2) {
                throw new BadRequestException("AI provider HTTP status " + response.statusCode());
            }

            String content = json.readTree(response.body()).at("/choices/0/message/content").asText();
            if (content.isBlank()) {
                throw new BadRequestException("AI provider returned empty content");
            }
            return content.trim();
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("AI provider request failed: " + e.getMessage());
        }
    }

    private void validate(AiPackingItemResponse item) {
        if (item == null || item.name() == null || item.name().isBlank() || item.name().length() > 200
                || item.quantity() == null || item.quantity() < 1
                || item.category() == null || !CATEGORIES.contains(item.category().toUpperCase())) {
            throw new BadRequestException("AI provider returned an invalid packing item");
        }
    }

    // --- CURATED RESILIENT GENERATORS ---

    private List<AiItineraryDayResponse> generateCuratedItinerary(AiTripPlanRequest request, Destination destination) {
        String city = destination.getCity();
        int daysCount = request.numberOfDays();
        List<AiItineraryDayResponse> days = new ArrayList<>();

        String[] themes = {
                "Arrival, Historic Forts & Heritage Landmarks",
                "Spiritual Walk, Ancient Temples & Cultural Immersion",
                "Scenic Hillside, Waterfalls & Nature Escapes",
                "Royal Palaces, Local Bazaars & Handloom Trails",
                "Authentic Culinary Journey & Regional Street Flavors",
                "Sunrise Ghats / Tea Plantations & Serene Lakes",
                "Cultural Performances, Artisan Crafts & Evening Aarti",
                "Leisurely Farewell Stroll & Keepsake Shopping"
        };

        for (int i = 1; i <= daysCount; i++) {
            String dayTheme = themes[(i - 1) % themes.length];
            List<AiActivityPlanResponse> acts = new ArrayList<>();

            acts.add(new AiActivityPlanResponse(
                    "Morning exploration of " + city + " Heritage & Monuments",
                    "Begin early with a heritage walk through iconic monuments, temple courtyards, and vibrant morning flower markets via auto-rickshaw or metro.",
                    city + " Old City / Heritage Quarter",
                    LocalTime.of(8, 30),
                    LocalTime.of(11, 30),
                    BigDecimal.valueOf(250)
            ));

            acts.add(new AiActivityPlanResponse(
                    "Signature Regional Thali & Local Culinary Discovery",
                    "Savor an authentic traditional thali featuring regional specialties, local bread, and refreshing filter coffee or lassi at a top-rated heritage eatery.",
                    city + " Traditional Dining Hub",
                    LocalTime.of(12, 30),
                    LocalTime.of(14, 0),
                    BigDecimal.valueOf(400)
            ));

            acts.add(new AiActivityPlanResponse(
                    "Afternoon Cultural Landmark, Forts & Scenic Photography",
                    "Explore historic palaces, panoramic hill viewpoints, or artisan handicraft centers with prime photo backdrops.",
                    city + " Central Cultural District",
                    LocalTime.of(14, 30),
                    LocalTime.of(17, 30),
                    BigDecimal.valueOf(350)
            ));

            acts.add(new AiActivityPlanResponse(
                    "Sunset Vista, Evening Aarti / Boat Ride & Dinner Gathering",
                    "Unwind by the lake, beach, or riverside ghat for a serene sunset or Aarti, followed by dinner with live classical music or cultural storytelling.",
                    city + " Waterfront / Promenade Quarter",
                    LocalTime.of(18, 30),
                    LocalTime.of(21, 30),
                    BigDecimal.valueOf(650)
            ));

            days.add(new AiItineraryDayResponse(i, "Day " + i + ": " + dayTheme, acts));
        }

        return days;
    }

    private List<AiPackingItemResponse> generateCuratedPacking(Trip trip, long days) {
        List<AiPackingItemResponse> items = new ArrayList<>();
        int travelers = Math.max(1, trip.getNumberOfTravelers());
        int clothesCount = Math.max(3, (int) Math.min(days + 2, 10));

        items.add(new AiPackingItemResponse("Government Photo ID (Aadhaar / Voter ID / Passport)", "DOCUMENTS", travelers));
        items.add(new AiPackingItemResponse("IRCTC Train / Flight booking vouchers & hotel confirmations", "DOCUMENTS", 1));
        items.add(new AiPackingItemResponse("Comfortable slip-on walking footwear (convenient for temples)", "CLOTHING", travelers));
        items.add(new AiPackingItemResponse("Breathable cotton daywear & kurtas", "CLOTHING", clothesCount));
        items.add(new AiPackingItemResponse("Modest temple attire (scarf/dupatta, shoulder/knee cover)", "CLOTHING", travelers));
        items.add(new AiPackingItemResponse("Light jacket / shawl (for air-conditioned transit & hill stations)", "CLOTHING", travelers));
        items.add(new AiPackingItemResponse("Smartphones with UPI payment apps & fast charger", "ELECTRONICS", travelers));
        items.add(new AiPackingItemResponse("Portable power bank (10,000mAh+)", "ELECTRONICS", 1));
        items.add(new AiPackingItemResponse("Mosquito repellent / Odomos cream & sunscreen", "TOILETRIES", 1));
        items.add(new AiPackingItemResponse("Travel toiletry kit & sanitizing wet wipes", "TOILETRIES", travelers));
        items.add(new AiPackingItemResponse("Personal prescription medication, ORS sachets & digestive aid", "MEDICINE", 1));
        items.add(new AiPackingItemResponse("Reusable insulated water bottle & compact daypack", "TRAVEL", travelers));
        items.add(new AiPackingItemResponse("Polarized sunglasses & sun protection hat", "ACCESSORIES", travelers));
        items.add(new AiPackingItemResponse("Compact umbrella or rain poncho", "TRAVEL", travelers));

        return items;
    }

    private String generateChatResponse(String prompt) {
        String lower = prompt.toLowerCase();
        if (lower.contains("kerala") || lower.contains("munnar") || lower.contains("alappuzha") || lower.contains("alleppey") || lower.contains("kochi")) {
            return "Kerala ('God's Own Country') is truly magical! For the perfect experience: 1) Spend 2 days in Munnar exploring the mist-clad Kolukkumalai and tea estates; 2) Take an overnight eco-houseboat cruise on Vembanad Lake in Alappuzha enjoying fresh Karimeen Pollichathu; 3) Explore Fort Kochi's Chinese fishing nets and Jew Town. Remember to pack light cottons, an umbrella for sudden showers, and booking your houseboat in advance!";
        } else if (lower.contains("rajasthan") || lower.contains("jaipur") || lower.contains("udaipur") || lower.contains("jodhpur") || lower.contains("jaisalmer")) {
            return "Rajasthan is an unforgettable land of royals and legends! Key highlights: In Jaipur ('Pink City'), tour Amber Fort early in the morning and admire Hawa Mahal; in Udaipur ('City of Lakes'), take a boat ride on Lake Pichola at sunset; in Jodhpur, explore the imposing Mehrangarh Fort. Indulge in an authentic Dal Baati Churma thali, and carry light cottons with a stole for sun protection.";
        } else if (lower.contains("varanasi") || lower.contains("banaras") || lower.contains("kashi")) {
            return "Varanasi (Kashi) is one of the world's oldest living spiritual cities. Essential experiences: 1) Dawn boat ride along the Ganges from Assi Ghat to Manikarnika Ghat; 2) Experience the divine evening Ganga Aarti at Dashashwamedh Ghat; 3) Visit the sacred Kashi Vishwanath temple corridor; 4) Relish morning kachori-jalebi, banarasi paan, and Blue Lassi. Wear modest attire and comfortable slip-on shoes for ghat walks.";
        } else if (lower.contains("goa")) {
            return "Goa offers the quintessential coastal escape! For relaxed heritage and quiet sands, head to South Goa (Palolem, Agonda, Old Goa Portuguese churches, and spice plantations). For water sports, cafes, and flea markets, North Goa (Anjuna, Vagator, Ashwem) is ideal. Make sure to rent a scooter or car for scenic coastal drives and savor Goan fish curry with poi bread!";
        } else if (lower.contains("himachal") || lower.contains("manali") || lower.contains("shimla") || lower.contains("dharamshala") || lower.contains("kasol")) {
            return "The Himalayan landscapes of Himachal Pradesh are serene and majestic! In Manali, visit Solang Valley and Atal Tunnel towards Sissu; in Shimla, take a scenic ride on the Kalka-Shimla UNESCO toy train; in Dharamshala/McLeod Ganj, experience Tibetan culture and monastery tranquility. Pack warm thermal layers, sturdy trekking boots, and motion sickness medicine for mountain roads.";
        } else if (lower.contains("hyderabad") || lower.contains("telangana")) {
            return "Hyderabad is a city of Nawabs, pearls, and incredible gastronomy! Highlights include touring Golconda Fort with its legendary acoustics, photographing Charminar, exploring Ramappa Temple (UNESCO heritage in Warangal), and savoring authentic Hyderabadi Dum Biryani followed by Irani Chai and Osmania biscuits at an old-city cafe.";
        } else if (lower.contains("budget") || lower.contains("cost") || lower.contains("expense") || lower.contains("rupee") || lower.contains("inr")) {
            return "To plan your Indian travel budget efficiently with TripMate AI: 1) Allocate roughly 35% for stays (homestays, heritage havelis, or hotels), 25% for dining & street food, 20% for experiences & monument entry, and 20% for trains/cabs. 2) A comfortable mid-range trip in India typically averages ₹3,000 to ₹6,000 per person per day. 3) Log all expenses in our Budget tab and split shared dining or cab fares effortlessly in the Group Splitter!";
        } else if (lower.contains("pack") || lower.contains("bag")) {
            return "Packing tips for India: 1) Modest cotton clothing (kurtas, light trousers, scarves) for temples and heritage sites; 2) Slip-on sandals or walking shoes since shoes must be removed at temples; 3) Insect repellent (Odomos), sunscreen, and an umbrella; 4) Power bank and UPI-ready phone. Generate an automated destination-tailored packing checklist right inside your Trip Workspace!";
        } else {
            return "Namaste! I'm your TripMate AI Indian travel companion. I can help you discover magnificent heritage forts, serene hill stations, spiritual ghats, sun-drenched beaches, and authentic regional cuisines across all 28 states and 8 union territories of India. Where in India would you like to explore next?";
        }
    }
}
