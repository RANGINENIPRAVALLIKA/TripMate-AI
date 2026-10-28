package com.tripmateai.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.beans.factory.annotation.Value;

import java.time.ZoneId;
import java.util.TimeZone;

@Configuration
public class JacksonConfig {

    @Bean
    Jackson2ObjectMapperBuilderCustomizer jacksonCustomizer(@Value("${spring.jackson.time-zone:UTC}") String timeZone) {
        return builder -> builder.timeZone(TimeZone.getTimeZone(ZoneId.of(timeZone)));
    }
}
