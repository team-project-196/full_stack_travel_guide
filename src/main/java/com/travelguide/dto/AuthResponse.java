package com.travelguide.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String message;
    private String role;

    public AuthResponse(String token, String message) {
        this.token = token;
        this.message = message;
        this.role = null;
    }
}