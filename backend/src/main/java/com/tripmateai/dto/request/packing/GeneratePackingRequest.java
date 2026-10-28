package com.tripmateai.dto.request.packing; import jakarta.validation.constraints.*; public record GeneratePackingRequest(@Size(max=300) String preferences) {}
