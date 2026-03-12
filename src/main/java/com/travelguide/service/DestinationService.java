package com.travelguide.service;

import com.travelguide.exception.ResourceNotFoundException;
import com.travelguide.model.Destination;
import com.travelguide.repository.DestinationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DestinationService {

    private final DestinationRepository destinationRepository;

    public DestinationService(DestinationRepository destinationRepository) {
        this.destinationRepository = destinationRepository;
    }

    // Get all destinations
    public List<Destination> getAllDestinations() {
        return destinationRepository.findAll();
    }

    // Get by ID
    public Destination getById(Long id) {
        return destinationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Destination not found with ID: " + id));
    }

    // Save new destination (Admin use)
    public Destination save(Destination destination) {
        return destinationRepository.save(destination);
    }

    public Destination updateDestination(Long id, Destination updatedDestination) {

        Destination existing = destinationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Destination not found with ID: " + id));

        existing.setName(updatedDestination.getName());
        existing.setCountry(updatedDestination.getCountry());
        existing.setCategory(updatedDestination.getCategory());
        existing.setDescription(updatedDestination.getDescription());
        existing.setBestTime(updatedDestination.getBestTime());
        existing.setBasePrice(updatedDestination.getBasePrice());
        existing.setImageUrl(updatedDestination.getImageUrl());
        existing.setLatitude(updatedDestination.getLatitude());
        existing.setLongitude(updatedDestination.getLongitude());

        return destinationRepository.save(existing);
    }

    public void deleteDestination(Long id) {

        Destination destination = destinationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Destination not found with ID: " + id));

        destinationRepository.delete(destination);
    }
}