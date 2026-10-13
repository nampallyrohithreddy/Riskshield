package com.riskshield.filter;

import com.riskshield.service.RedisVelocityService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class GatewayRateLimitFilter extends OncePerRequestFilter {

    private final RedisVelocityService velocityService;

    @Value("${riskshield.gateway.rate-limit.requests-per-second:20}")
    private int requestsPerSecond;

    @Autowired
    public GatewayRateLimitFilter(RedisVelocityService velocityService) {
        this.velocityService = velocityService;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        // Do not rate limit actuator, h2 console, static assets, or websocket handshake
        return path.startsWith("/ws") || path.startsWith("/actuator") || path.startsWith("/h2-console");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Only enforce strict rate-limiting on transaction evaluation ingress
        if (request.getRequestURI().startsWith("/api/v1/transactions/evaluate")) {
            String clientIp = extractClientIp(request);

            boolean rateLimited = velocityService.isIpRateLimited(clientIp, requestsPerSecond, 1);
            if (rateLimited) {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                response.getWriter().write("""
                    {
                        "status": 429,
                        "error": "Too Many Requests",
                        "message": "Gateway rate limit exceeded for client IP. Throttling active."
                    }
                    """);
                return;
            }

            response.setHeader("X-RateLimit-Limit", String.valueOf(requestsPerSecond));
        }

        filterChain.doFilter(request, response);
    }

    private String extractClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
