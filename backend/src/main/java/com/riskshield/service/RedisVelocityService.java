package com.riskshield.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Service
public class RedisVelocityService {

    private static final Logger log = LoggerFactory.getLogger(RedisVelocityService.class);

    private final StringRedisTemplate redisTemplate;

    // Resilient high-performance in-memory fallback if Redis is unavailable during local testing
    private final Map<String, Deque<Long>> inMemoryVelocityStore = new ConcurrentHashMap<>();
    private final Map<String, String> inMemoryLocationStore = new ConcurrentHashMap<>();
    private final Map<String, Deque<Long>> inMemoryRateLimitStore = new ConcurrentHashMap<>();

    private volatile boolean redisAvailable = true;

    @Autowired(required = false)
    public RedisVelocityService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    /**
     * Sliding-window velocity check: records a transaction timestamp and returns
     * the number of transactions recorded for this account within the window.
     */
    public long recordAndGetVelocity(String accountId, String transactionId, int windowSeconds) {
        long now = System.currentTimeMillis();
        long windowStart = now - (windowSeconds * 1000L);
        String key = "riskshield:velocity:" + accountId;

        if (redisTemplate != null && redisAvailable) {
            try {
                // Redis ZSET sliding window: ZADD score=timestamp, member=transactionId:timestamp
                String member = transactionId + ":" + now;
                redisTemplate.opsForZSet().add(key, member, now);
                // Remove elements outside current sliding window
                redisTemplate.opsForZSet().removeRangeByScore(key, 0, windowStart);
                // Set TTL so inactive keys expire automatically
                redisTemplate.expire(key, Duration.ofSeconds(windowSeconds * 2L));

                Long count = redisTemplate.opsForZSet().zCard(key);
                return count != null ? count : 1L;
            } catch (Exception e) {
                log.warn("Redis connectivity issue; falling back to in-memory sliding window: {}", e.getMessage());
                redisAvailable = false;
            }
        }

        // In-memory sliding window fallback
        Deque<Long> queue = inMemoryVelocityStore.computeIfAbsent(accountId, k -> new ArrayDeque<>());
        synchronized (queue) {
            queue.addLast(now);
            while (!queue.isEmpty() && queue.peekFirst() < windowStart) {
                queue.pollFirst();
            }
            return queue.size();
        }
    }

    /**
     * Checks if a sudden sub-second burst occurred for this account.
     */
    public boolean checkBurstSpike(String accountId, int thresholdCount, int burstWindowSeconds) {
        String key = "riskshield:burst:" + accountId;
        if (redisTemplate != null && redisAvailable) {
            try {
                Long count = redisTemplate.opsForValue().increment(key);
                if (count != null && count == 1) {
                    redisTemplate.expire(key, Duration.ofSeconds(burstWindowSeconds));
                }
                return count != null && count > thresholdCount;
            } catch (Exception e) {
                redisAvailable = false;
            }
        }

        // In-memory burst fallback
        return recordAndGetVelocity(accountId + ":burst", "burst-" + System.currentTimeMillis(), burstWindowSeconds) > thresholdCount;
    }

    /**
     * Rate limiter for HTTP Gateway using sliding-window per IP address.
     */
    public boolean isIpRateLimited(String ipAddress, int maxAllowed, int windowSeconds) {
        long now = System.currentTimeMillis();
        long windowStart = now - (windowSeconds * 1000L);
        String key = "riskshield:ratelimit:ip:" + ipAddress;

        if (redisTemplate != null && redisAvailable) {
            try {
                String member = String.valueOf(now) + "-" + Math.random();
                redisTemplate.opsForZSet().add(key, member, now);
                redisTemplate.opsForZSet().removeRangeByScore(key, 0, windowStart);
                redisTemplate.expire(key, Duration.ofSeconds(windowSeconds * 2L));

                Long count = redisTemplate.opsForZSet().zCard(key);
                return count != null && count > maxAllowed;
            } catch (Exception e) {
                redisAvailable = false;
            }
        }

        // In-memory rate limiting fallback
        Deque<Long> queue = inMemoryRateLimitStore.computeIfAbsent(ipAddress, k -> new ArrayDeque<>());
        synchronized (queue) {
            queue.addLast(now);
            while (!queue.isEmpty() && queue.peekFirst() < windowStart) {
                queue.pollFirst();
            }
            return queue.size() > maxAllowed;
        }
    }

    /**
     * Tracks geographical location for impossible travel speed anomaly detection.
     */
    public String getAndSetLastLocation(String accountId, String currentLocation) {
        String key = "riskshield:location:" + accountId;
        String prevLocation = null;

        if (redisTemplate != null && redisAvailable) {
            try {
                prevLocation = redisTemplate.opsForValue().get(key);
                if (currentLocation != null && !currentLocation.isBlank()) {
                    redisTemplate.opsForValue().set(key, currentLocation, 24, TimeUnit.HOURS);
                }
                return prevLocation;
            } catch (Exception e) {
                redisAvailable = false;
            }
        }

        prevLocation = inMemoryLocationStore.get(accountId);
        if (currentLocation != null && !currentLocation.isBlank()) {
            inMemoryLocationStore.put(accountId, currentLocation);
        }
        return prevLocation;
    }

    public boolean isRedisConnected() {
        return redisAvailable && redisTemplate != null;
    }
}
