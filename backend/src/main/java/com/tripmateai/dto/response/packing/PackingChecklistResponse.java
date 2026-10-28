package com.tripmateai.dto.response.packing; import java.util.*; public record PackingChecklistResponse(Long id,String name,List<PackingItemResponse> items) {}
