package com.travelguide.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class BookingRequest {

    @NotNull(message = "Total amount is required")
    @Positive(message = "Total amount must be greater than 0")
    private Double totalAmount;

    @NotBlank(message = "Travel mode is required")
    private String travelMode;
}