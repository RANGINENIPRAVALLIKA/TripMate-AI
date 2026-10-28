package com.tripmateai.dto.response.expense; import java.math.*; import java.time.*; public record ExpenseResponse(Long id,String title,BigDecimal amount,LocalDate expenseDate,String status) {}
