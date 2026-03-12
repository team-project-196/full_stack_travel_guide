package com.travelguide.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User user;

    @ManyToOne
    private Destination destination;

    private LocalDateTime bookingDate;

    private Double totalAmount;

    private String travelMode;

    private String startCity;

    private String status; // CONFIRMED / CANCELLED
}