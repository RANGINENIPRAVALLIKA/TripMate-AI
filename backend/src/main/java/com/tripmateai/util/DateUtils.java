package com.tripmateai.util;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;

public final class DateUtils {

    public static final DateTimeFormatter ISO_DATE_TIME_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    private DateUtils() {
    }

    public static LocalDateTime nowUtc() {
        return LocalDateTime.now(ZoneOffset.UTC);
    }

    public static String formatIso(LocalDateTime dateTime) {
        return dateTime.format(ISO_DATE_TIME_FORMATTER);
    }

    public static LocalDateTime parseIso(String value) {
        return LocalDateTime.parse(value, ISO_DATE_TIME_FORMATTER);
    }
}
