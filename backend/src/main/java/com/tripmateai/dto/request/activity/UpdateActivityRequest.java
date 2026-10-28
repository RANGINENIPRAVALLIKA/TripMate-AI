package com.tripmateai.dto.request.activity; import jakarta.validation.constraints.*; public record UpdateActivityRequest(@NotBlank String title,@NotNull @Min(1) Integer sortOrder) {}
