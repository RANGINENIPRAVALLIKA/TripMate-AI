package com.tripmateai.dto.response.admin;
import java.util.List;
public record AdminDashboardResponse(AdminUserStatsResponse users, AdminTripStatsResponse trips, AdminContentStatsResponse content, AdminReviewStatsResponse reviews, List<AdminRecentActivityResponse> recentAdminActivity) { }
