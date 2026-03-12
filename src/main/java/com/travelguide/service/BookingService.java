package com.travelguide.service;

import com.travelguide.exception.ResourceNotFoundException;
import com.travelguide.model.*;
import com.travelguide.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Transactional
    public Booking createBooking(String email,
                                 Long destinationId,
                                 Double totalAmount,
                                 String travelMode,
                                 String startCity) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Destination destination = destinationRepository.findById(destinationId)
                .orElseThrow(() -> new ResourceNotFoundException("Destination not found"));

        // prevent duplicate booking of same destination by same user
        if (bookingRepository.existsByUser_IdAndDestination_Id(user.getId(), destinationId)) {
            throw new ResourceNotFoundException("You have already booked this destination");
        }

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setDestination(destination);
        booking.setBookingDate(LocalDateTime.now());
        booking.setTotalAmount(totalAmount);
        // travelMode may be null or blank
        booking.setTravelMode(travelMode == null ? "" : travelMode);
        booking.setStartCity(startCity == null ? "" : startCity);
        booking.setStatus("CONFIRMED");

        return bookingRepository.save(booking);
    }

    public List<Booking> getMyBookings(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return bookingRepository.findByUser(user);
    }

    @Transactional
    public void cancelBooking(Long bookingId, String email) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getUser().getEmail().equals(email)) {
            throw new ResourceNotFoundException("You cannot cancel this booking");
        }

        bookingRepository.delete(booking);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }
}