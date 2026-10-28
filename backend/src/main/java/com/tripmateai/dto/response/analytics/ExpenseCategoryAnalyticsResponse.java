package com.tripmateai.dto.response.analytics;
import java.math.BigDecimal;
public record ExpenseCategoryAnalyticsResponse(String category, BigDecimal totalExpenses) { }
