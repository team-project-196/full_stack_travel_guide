package com.travelguide.controller;

import com.travelguide.model.Destination;
import com.travelguide.service.DestinationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/destinations")
@CrossOrigin(origins = "*")
public class DestinationController {

    private final DestinationService destinationService;

    public DestinationController(DestinationService destinationService) {
        this.destinationService = destinationService;
    }

    // PUBLIC - Get all destinations
    @GetMapping
    public List<Destination> getAll() {
        return destinationService.getAllDestinations();
    }

    // PUBLIC - Get destination by ID
    @GetMapping("/{id}")
    public Destination getById(@PathVariable Long id) {
        return destinationService.getById(id);
    }

    // ADMIN ONLY - Create destination
    @PostMapping
    public Destination create(@RequestBody Destination destination) {
        return destinationService.save(destination);
    }

    // ADMIN ONLY - Update destination
    @PutMapping("/{id}")
    public Destination update(@PathVariable Long id,
                              @RequestBody Destination destination) {

        return destinationService.updateDestination(id, destination);
    }

    // ADMIN ONLY - Delete destination
    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {

        destinationService.deleteDestination(id);

        return "Destination deleted successfully";
    }
}