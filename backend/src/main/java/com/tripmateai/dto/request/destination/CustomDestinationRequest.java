package com.tripmateai.dto.request.destination;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CustomDestinationRequest(
        @NotBlank(message = "Destination city or name is required")
        @Size(max = 120, message = "Destination name cannot exceed 120 characters")
        String city,

        @Size(max = 120, message = "State name cannot exceed 120 characters")
        String state
) {}
