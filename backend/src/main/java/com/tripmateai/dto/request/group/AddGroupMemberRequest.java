package com.tripmateai.dto.request.group; import jakarta.validation.constraints.*; public record AddGroupMemberRequest(@NotNull @Positive Long userId) {}
