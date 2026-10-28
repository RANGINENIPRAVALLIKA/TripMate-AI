package com.tripmateai.dto.response.admin;
import java.util.List;
public record AdminUserStatsResponse(long totalUsers, List<AdminRecentUserResponse> recentRegistrations) { }
