package com.tripmateai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class TripMateAiApplication {

    public static void main(String[] args) {
        SpringApplication.run(TripMateAiApplication.class, args);
    }
}
