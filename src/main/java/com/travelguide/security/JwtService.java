package com.travelguide.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secretKeyString;

    @Value("${jwt.expiration}")
    private long EXPIRATION_TIME;

    private Key getKey() {
        return Keys.hmacShaKeyFor(secretKeyString.getBytes());
    }

    // 🔹 Generate Token
    public String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // 🔹 Extract Username
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // 🔹 Validate Token
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) &&
                !isTokenExpired(token));
    }

    // 🔹 Check Expiration
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    // 🔹 Generic Claim Extractor
    private <T> T extractClaim(String token,
                               Function<Claims, T> claimsResolver) {
        final Claims claims = Jwts.parserBuilder()
                .setSigningKey(getKey())
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claimsResolver.apply(claims);
    }
}