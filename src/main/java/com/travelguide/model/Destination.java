package com.travelguide.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Destination {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String country;
    private String category;
    private String description;
    private String bestTime;
    private Double basePrice;
    private String imageUrl;

    private Double latitude;
    private Double longitude;

    @OneToMany(mappedBy = "destination", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<Activity> activities;
}