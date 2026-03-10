package com.travelguide.controller;

import com.travelguide.dto.BookingRequest;
import com.travelguide.model.Booking;
import com.travelguide.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    // 🔹 Create Booking
    @PostMapping("/{destinationId}")
    public Booking bookDestination(
            @PathVariable Long destinationId,
            @Valid @RequestBody BookingRequest request,
            Authentication authentication) {

        return bookingService.createBooking(
                authentication.getName(),
                destinationId,
                request.getTotalAmount(),
                request.getTravelMode()
        );
    }

    // 🔹 Get My Bookings
    @GetMapping("/my")
    public List<Booking> myBookings(Authentication authentication) {

        return bookingService.getMyBookings(authentication.getName());
    }

    // 🔹 Cancel Booking
    @DeleteMapping("/{bookingId}")
    public ResponseEntity<String> cancelBooking(
            @PathVariable Long bookingId,
            Authentication authentication) {

        bookingService.cancelBooking(
                bookingId,
                authentication.getName()
        );

        return ResponseEntity.ok("Booking cancelled successfully");
    }

    // 🔹 Admin Only - Get All Bookings
    @GetMapping("/admin/all")
    public List<Booking> allBookings() {
        return bookingService.getAllBookings();
    }
}