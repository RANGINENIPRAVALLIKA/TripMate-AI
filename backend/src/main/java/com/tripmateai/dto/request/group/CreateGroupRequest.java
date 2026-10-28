package com.tripmateai.dto.request.group; import jakarta.validation.constraints.*; public record CreateGroupRequest(@NotBlank @Size(max=150) String name) {}
