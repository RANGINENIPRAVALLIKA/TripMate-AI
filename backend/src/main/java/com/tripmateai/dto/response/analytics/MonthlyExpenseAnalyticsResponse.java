package com.tripmateai.dto.response.analytics;
import java.math.BigDecimal;
public record MonthlyExpenseAnalyticsResponse(String month, BigDecimal totalExpenses) { }
