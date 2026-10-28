package com.tripmateai.mapper;

import com.tripmateai.entity.User;
import com.tripmateai.dto.response.user.*;
import java.util.*;
import java.util.stream.Collectors;

public final class UserMapper {
    private UserMapper() {}

    public static UserProfileResponse toProfile(User e) {
        if (e == null) return null;
        Set<String> roles = (e.getRoles() == null)
                ? Collections.emptySet()
                : e.getRoles().stream().map(x -> x.getName().name()).collect(Collectors.toSet());
        return new UserProfileResponse(
                e.getId(),
                e.getFullName(),
                e.getEmail(),
                e.getPhoneNumber(),
                e.getProfileImage(),
                e.isVerified(),
                roles,
                e.getCreatedAt()
        );
    }

    public static UserSummaryResponse toSummary(User e) {
        return e == null ? null : new UserSummaryResponse(e.getId(), e.getFullName(), e.getProfileImage());
    }
}
