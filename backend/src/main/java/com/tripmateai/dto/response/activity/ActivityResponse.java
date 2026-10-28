package com.tripmateai.dto.response.activity; import com.tripmateai.enums.ActivityType; public record ActivityResponse(Long id,Long itineraryId,String title,ActivityType type,Integer sortOrder) {}
