package com.travelguide.config;

import com.travelguide.model.Activity;
import com.travelguide.model.Destination;
import com.travelguide.model.Role;
import com.travelguide.model.User;
import com.travelguide.repository.DestinationRepository;
import com.travelguide.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class DataInitializer implements CommandLineRunner {

    private final DestinationRepository destinationRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(DestinationRepository destinationRepository,
                           UserRepository userRepository,
                           PasswordEncoder passwordEncoder) {
        this.destinationRepository = destinationRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {

        // ✅ Create Admin if not exists
        if (!userRepository.existsByEmail("admin@travel.com")) {

            User admin = new User();
            admin.setName("Admin");
            admin.setEmail("admin@travel.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);

            userRepository.save(admin);

            System.out.println("🔥 Admin Created");
        }

        // ✅ Insert Destinations only if empty
        if (destinationRepository.count() > 0) {
            return;
        }

        destinationRepository.saveAll(Arrays.asList(

                // ===== TEMPLE =====
                createDestination("Tirupati", "India", "Temple",
                        "Famous pilgrimage site home to Sri Venkateswara Temple.",
                        "September to February", 8000.0,
                        13.6288, 79.4192,
                        newActivity("Darshan", 1000.0),
                        newActivity("Hill Trek", 500.0)
                ),

                createDestination("Madurai", "India", "Temple",
                        "Meenakshi Temple city with rich culture.",
                        "October to March", 7000.0,
                        9.9252, 78.1198,
                        newActivity("Temple Visit", 800.0),
                        newActivity("Cultural Walk", 600.0)
                ),

                // ===== BEACH =====
                createDestination("Bali", "Indonesia", "Beach",
                        "Tropical paradise with beaches and temples.",
                        "April to October", 50000.0,
                        -8.3405, 115.0920,
                        newActivity("Surfing", 3000.0),
                        newActivity("Temple Tours", 2000.0)
                ),

                createDestination("Goa", "India", "Beach",
                        "Famous for beaches and nightlife.",
                        "November to February", 15000.0,
                        15.2993, 74.1240,
                        newActivity("Scuba Diving", 3500.0),
                        newActivity("Beach Party", 2000.0)
                ),

                // ===== MOUNTAIN =====
                createDestination("Manali", "India", "Mountain",
                        "Snow-capped peaks and adventure sports.",
                        "October to February", 20000.0,
                        32.2432, 77.1892,
                        newActivity("Skiing", 4000.0),
                        newActivity("Paragliding", 2500.0)
                ),

                createDestination("Interlaken", "Switzerland", "Mountain",
                        "Alpine scenic destination.",
                        "June to September", 90000.0,
                        46.6863, 7.8632,
                        newActivity("Skydiving", 12000.0),
                        newActivity("Mountain Train", 8000.0)
                ),

                // ===== CITY =====
                createDestination("Paris", "France", "City",
                        "City of lights and romance.",
                        "April to June", 85000.0,
                        48.8566, 2.3522,
                        newActivity("Eiffel Tower", 4000.0),
                        newActivity("Seine Cruise", 3000.0)
                ),

                createDestination("Tokyo", "Japan", "City",
                        "Modern technology and culture.",
                        "March to May", 95000.0,
                        35.6762, 139.6503,
                        newActivity("City Tour", 5000.0),
                        newActivity("Anime District", 2500.0)
                ),

                // ===== ADVENTURE =====
                createDestination("Rishikesh", "India", "Adventure",
                        "River rafting capital of India.",
                        "September to April", 12000.0,
                        30.0869, 78.2676,
                        newActivity("River Rafting", 2500.0),
                        newActivity("Bungee Jumping", 3500.0)
                ),

                createDestination("Dubai", "UAE", "Adventure",
                        "Desert safaris and skyscrapers.",
                        "November to March", 70000.0,
                        25.2048, 55.2708,
                        newActivity("Desert Safari", 5000.0),
                        newActivity("Skydiving", 15000.0)
                )

        ));

        System.out.println("🔥 10 Destinations Inserted Successfully!");
    }

    private Destination createDestination(
            String name, String country, String category,
            String description, String bestTime,
            Double basePrice,
            Double lat, Double lng,
            Activity... activities
    ) {

        Destination destination = new Destination();
        destination.setName(name);
        destination.setCountry(country);
        destination.setCategory(category);
        destination.setDescription(description);
        destination.setBestTime(bestTime);
        destination.setBasePrice(basePrice);

        destination.setImageUrl("/assets/images/" +
                name.toLowerCase().replace(" ", "") + ".jpeg");

        destination.setLatitude(lat);
        destination.setLongitude(lng);

        Arrays.stream(activities).forEach(a -> a.setDestination(destination));
        destination.setActivities(Arrays.asList(activities));

        return destination;
    }

    private Activity newActivity(String name, Double price) {
        Activity activity = new Activity();
        activity.setName(name);
        activity.setPrice(price);
        return activity;
    }
}