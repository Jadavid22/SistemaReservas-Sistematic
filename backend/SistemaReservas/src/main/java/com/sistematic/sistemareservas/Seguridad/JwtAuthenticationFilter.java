package com.sistematic.sistemareservas.Seguridad;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtUtil jwtUtil;
    private final UserDetailsServiceImpl userDetailsService;
    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    public JwtAuthenticationFilter(JwtUtil jwtUtil, UserDetailsServiceImpl userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }
    


    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            String path = request.getServletPath();
            logger.debug("Processing request for path: {}", path);

            // Bypass authentication for public endpoints
            if (path.startsWith("/auth/") || path.equals("/error")) {
                filterChain.doFilter(request, response);
                return;
            }

            String authHeader = request.getHeader("Authorization");
            logger.debug("Authorization header: {}", authHeader);

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                logger.debug("No Bearer token found");
                filterChain.doFilter(request, response);
                return;
            }

            String token = authHeader.substring(7);
            String username = null;

            try {
                username = jwtUtil.extraerEmail(token);
                logger.debug("Extracted username from token: {}", username);
            } catch (Exception e) {
                logger.error("Error extracting username from token: {}", e.getMessage());
            }

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                logger.debug("Loaded user details for: {}", username);

                if (jwtUtil.validarToken(token, userDetails.getUsername())) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    logger.debug("Authentication successful for user: {}", username);
                } else {
                    logger.warn("Invalid token for user: {}", username);
                }
            }

            filterChain.doFilter(request, response);
        } catch (Exception e) {
            logger.error("Error in JWT authentication filter: {}", e.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Error de autenticación: " + e.getMessage());
        }
    }


}
