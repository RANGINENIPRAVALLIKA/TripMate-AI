package com.tripmateai.dto.response.ai; import java.util.List; public record AiItineraryDayResponse(Integer dayNumber,String title,List<AiActivityPlanResponse> activities) {}
