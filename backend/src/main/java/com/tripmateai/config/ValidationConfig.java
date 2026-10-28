package com.tripmateai.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

@Configuration
public class ValidationConfig {

    @Bean
    LocalValidatorFactoryBean defaultValidator() {
        return new LocalValidatorFactoryBean();
    }
}
