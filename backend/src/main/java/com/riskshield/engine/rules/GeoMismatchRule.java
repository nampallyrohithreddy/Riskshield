package com.riskshield.engine.rules;

import com.riskshield.dto.TransactionRequest;
import com.riskshield.engine.FraudRule;
import com.riskshield.model.RuleResult;
import com.riskshield.model.TransactionStatus;
import com.riskshield.service.RedisVelocityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(3)
public class GeoMismatchRule implements FraudRule {

    private final RedisVelocityService velocityService;

    @Autowired
    public GeoMismatchRule(RedisVelocityService velocityService) {
        this.velocityService = velocityService;
    }

    @Override
    public String getName() {
        return "Geo-Velocity & Impossible Travel Anomaly";
    }

    @Override
    public int getOrder() {
        return 3;
    }

    @Override
    public boolean canShortCircuit() {
        return false;
    }

    @Override
    public RuleResult evaluate(TransactionRequest request) {
        long start = System.nanoTime();
        String currentLocation = request.getLocation();

        if (currentLocation == null || currentLocation.isBlank()) {
            double latencyMs = (System.nanoTime() - start) / 1_000_000.0;
            return RuleResult.pass(getName(), latencyMs);
        }

        String previousLocation = velocityService.getAndSetLastLocation(request.getAccountId(), currentLocation);

        if (previousLocation != null && !previousLocation.equalsIgnoreCase(currentLocation)) {
            // Check if country codes differ (e.g. US vs RU, US vs CN)
            String prevCountry = extractCountry(previousLocation);
            String currCountry = extractCountry(currentLocation);

            if (!prevCountry.equalsIgnoreCase(currCountry)) {
                double latencyMs = (System.nanoTime() - start) / 1_000_000.0;
                return RuleResult.trigger(
                        getName(),
                        TransactionStatus.FLAGGED,
                        "Impossible travel speed detected: Location jumped from " + previousLocation + " to " + currentLocation + " in under 24 hours.",
                        70,
                        latencyMs
                );
            }
        }

        double latencyMs = (System.nanoTime() - start) / 1_000_000.0;
        return RuleResult.pass(getName(), latencyMs);
    }

    private String extractCountry(String location) {
        if (location.contains("-")) {
            return location.split("-")[0].trim();
        }
        return location.trim();
    }
}
