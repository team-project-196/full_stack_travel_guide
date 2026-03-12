package com.travelguide.controller;

import com.travelguide.model.Bookmark;
import com.travelguide.service.BookmarkService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookmarks")
@CrossOrigin(origins = "*")
public class BookmarkController {

    private final BookmarkService bookmarkService;

    public BookmarkController(BookmarkService bookmarkService) {
        this.bookmarkService = bookmarkService;
    }

    @PostMapping("/{destinationId}")
    public void addBookmark(@PathVariable Long destinationId,
                            Authentication authentication) {

        bookmarkService.addBookmark(
                authentication.getName(),
                destinationId
        );
    }

    @GetMapping
    public List<Bookmark> getBookmarks(Authentication authentication) {

        return bookmarkService.getUserBookmarks(
                authentication.getName()
        );
    }

    @DeleteMapping("/{destinationId}")
    public ResponseEntity<String> removeBookmark(@PathVariable Long destinationId,
                               Authentication authentication) {

        bookmarkService.removeBookmark(
                authentication.getName(),
                destinationId
        );
        
        return ResponseEntity.ok("Bookmark removed successfully");
    }
}