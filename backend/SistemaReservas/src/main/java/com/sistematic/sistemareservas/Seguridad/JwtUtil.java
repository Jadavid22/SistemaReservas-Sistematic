package com.sistematic.sistemareservas.Seguridad;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);
    private final String SECRET_KEY = "SistematicIngSoftwareGrupoideal22";
    private final long EXPIRACION = 1000 * 60 * 60; // 1 hora

    private Key getKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    }

    public String generarToken(String username, String rol, Long id) {
        return Jwts.builder()
                .setSubject(username)
                .claim("rol", rol)
                .claim("id", id)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRACION))
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims extraerTodosLosClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String extraerUsername(String token) {
        return extraerTodosLosClaims(token).getSubject();
    }

    public String extraerRol(String token) {
        try {
            return extraerTodosLosClaims(token).get("rol", String.class);
        } catch (Exception e) {
            logger.error("Error al extraer rol del token: {}", e.getMessage());
            return null;
        }
    }

    public boolean validarToken(String token) {
        try {
            Claims claims = extraerTodosLosClaims(token);
            return !claims.getExpiration().before(new Date());
        } catch (JwtException | IllegalArgumentException e) {
            logger.error("Token inválido: {}", e.getMessage());
            return false;
        }
    }

    public String extraerEmail(String token) {
        return extraerUsername(token);
    }

    public Long extraerId(String token) {
        try {
            return extraerTodosLosClaims(token).get("id", Long.class);
        } catch (Exception e) {
            logger.error("Error al extraer ID del token: {}", e.getMessage());
            return null;
        }
    }

    public boolean validarToken(String token, String email) {
        try {
            String tokenEmail = extraerEmail(token);
            return email.equals(tokenEmail) && !estaExpirado(token);
        } catch (Exception e) {
            logger.error("Error al validar token: {}", e.getMessage());
            return false;
        }
    }

    private boolean estaExpirado(String token) {
        return extraerTodosLosClaims(token).getExpiration().before(new Date());
    }
}
