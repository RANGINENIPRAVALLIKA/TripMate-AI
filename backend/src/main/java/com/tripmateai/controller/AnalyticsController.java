package com.tripmateai.controller;
import com.tripmateai.dto.response.ApiResponse;
import com.tripmateai.dto.response.analytics.TravelAnalyticsResponse;
import com.tripmateai.service.AnalyticsService;
import com.tripmateai.util.ResponseUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/analytics") @RequiredArgsConstructor
public class AnalyticsController { private final AnalyticsService service; @GetMapping("/me") public ResponseEntity<ApiResponse<TravelAnalyticsResponse>> mine(){return ResponseUtils.success(service.getMyTravelAnalytics(),"Travel analytics retrieved");} }
