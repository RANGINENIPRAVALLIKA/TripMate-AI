package com.tripmateai.dto.response.group; import java.math.*; public record GroupBalanceResponse(Long memberId,String name,BigDecimal totalPaid,BigDecimal totalOwed,BigDecimal netBalance) {}
