package com.tripmateai.dto.response.analytics;
import java.math.BigDecimal;
import java.util.*;
public record ExpenseAnalyticsResponse(BigDecimal totalExpenses, BigDecimal remainingBudget,
                                       List<ExpenseCategoryAnalyticsResponse> expenseBreakdown,
                                       List<MonthlyExpenseAnalyticsResponse> monthlyExpenses) { }
