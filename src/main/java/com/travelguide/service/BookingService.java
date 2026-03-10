package com.travelguide.service;

import com.travelguide.model.*;
import com.travelguide.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final DestinationRepository destinationRepository;

    public BookingService(BookingRepository bookingRepository,
                          UserRepository userRepository,
                          DestinationRepository destinationRepository) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.destinationRepository = destinationRepository;
    }

    public Booking createBooking(String email,
                                 Long destinationId,
                                 Double totalAmount,
                                 String travelMode) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Destination destination = destinationRepository.findById(destinationId)
                .orElseThrow(() -> new RuntimeException("Destination not found"));

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setDestination(destination);
        booking.setBookingDate(LocalDateTime.now());
        booking.setTotalAmount(totalAmount);
        booking.setTravelMode(travelMode);
        booking.setStatus("CONFIRMED");

        return bookingRepository.save(booking);
    }

    public List<Booking> getMyBookings(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return bookingRepository.findByUser(user);
    }

    public void cancelBooking(Long bookingId, String email) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getUser().getEmail().equals(email)) {
            throw new RuntimeException("You cannot cancel this booking");
        }

        bookingRepository.delete(booking);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }
}