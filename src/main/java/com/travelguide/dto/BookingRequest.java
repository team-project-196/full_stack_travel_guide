package com.travelguide.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class BookingRequest {

    @NotNull(message = "Total amount is required")
    @Positive(message = "Total amount must be greater than 0")
    private Double totalAmount;

    // travelMode is optional now; kept for backwards compatibility
    private String travelMode;

    // start city chosen in trip planner
    private String startCity;
}