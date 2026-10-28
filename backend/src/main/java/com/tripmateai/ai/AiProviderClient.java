package com.tripmateai.ai;

import com.tripmateai.dto.request.ai.AiTripPlanRequest;
import com.tripmateai.dto.response.ai.AiItineraryDayResponse;
import com.tripmateai.dto.response.packing.AiPackingItemResponse;
import com.tripmateai.entity.*;
import com.tripmateai.exception.BadRequestException;
import java.util.List;

public interface AiProviderClient {
    List<AiItineraryDayResponse> generate(AiTripPlanRequest request, Destination destination);
    default List<AiPackingItemResponse> generatePacking(Trip trip, String preferences) { throw new BadRequestException("AI packing generation is not configured"); }
    default String chat(String prompt) { throw new BadRequestException("AI chat is not configured"); }
}
