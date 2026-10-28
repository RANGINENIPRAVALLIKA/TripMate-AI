package com.tripmateai.dto.response.budget; import java.math.BigDecimal; public record BudgetSummaryResponse(BigDecimal totalBudget,BigDecimal totalExpenses,BigDecimal remainingBudget) {}
