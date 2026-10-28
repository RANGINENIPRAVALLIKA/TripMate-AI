package com.tripmateai.dto.response.nearby; import java.math.*; public record NearbyPlaceResponse(Long id,String name,String category,String address,BigDecimal latitude,BigDecimal longitude) {}
