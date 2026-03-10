package com.travelguide.repository;

import com.travelguide.model.Bookmark;
import com.travelguide.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {

    List<Bookmark> findByUser(User user);

    boolean existsByUser_IdAndDestination_Id(Long userId, Long destinationId);

    void deleteByUser_IdAndDestination_Id(Long userId, Long destinationId);
}