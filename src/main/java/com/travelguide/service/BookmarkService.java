package com.travelguide.service;

import com.travelguide.exception.ResourceNotFoundException;
import com.travelguide.model.*;
import com.travelguide.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BookmarkService {

    private final BookmarkRepository bookmarkRepository;
    private final UserRepository userRepository;
    private final DestinationRepository destinationRepository;

    public BookmarkService(BookmarkRepository bookmarkRepository,
                           UserRepository userRepository,
                           DestinationRepository destinationRepository) {
        this.bookmarkRepository = bookmarkRepository;
        this.userRepository = userRepository;
        this.destinationRepository = destinationRepository;
    }

    @Transactional
    public void addBookmark(String email, Long destinationId) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (bookmarkRepository.existsByUser_IdAndDestination_Id(user.getId(), destinationId)) {
            return; // already bookmarked
        }

        Destination destination = destinationRepository.findById(destinationId)
                .orElseThrow(() -> new ResourceNotFoundException("Destination not found"));

        Bookmark bookmark = new Bookmark();
        bookmark.setUser(user);
        bookmark.setDestination(destination);

        bookmarkRepository.save(bookmark);
    }

    public List<Bookmark> getUserBookmarks(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return bookmarkRepository.findByUser(user);
    }

    @Transactional
    public void removeBookmark(String email, Long destinationId) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        bookmarkRepository.deleteByUser_IdAndDestination_Id(
                user.getId(), destinationId);
    }
}