package com.travelguide.controller;

import com.travelguide.model.User;
import com.travelguide.model.Booking;
import com.travelguide.model.Destination;
import com.travelguide.service.UserService;
import com.travelguide.service.BookingService;
import com.travelguide.service.DestinationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final UserService userService;
    private final BookingService bookingService;
    private final DestinationService destinationService;

    public AdminController(UserService userService,
                          BookingService bookingService,
                          DestinationService destinationService) {
        this.userService = userService;
        this.bookingService = bookingService;
        this.destinationService = destinationService;
    }

    // Get all users
    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    // Get all bookings
    @GetMapping("/bookings")
    public List<Booking> getAllBookings() {
        return bookingService.getAllBookings();
    }

    // Get all destinations
    @GetMapping("/destinations")
    public List<Destination> getAllDestinations() {
        return destinationService.getAllDestinations();
    }
}
