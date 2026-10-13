package com.riskshield.engine.rules;

import com.riskshield.dto.TransactionRequest;
import com.riskshield.engine.FraudRule;
import com.riskshield.model.RuleResult;
import com.riskshield.model.TransactionStatus;
import com.riskshield.service.RedisVelocityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(2)
public class VelocityBreachRule implements FraudRule {

    private final RedisVelocityService velocityService;

    @Value("${riskshield.engine.velocity-threshold-window-seconds:60}")
    private int windowSeconds;

    @Value("${riskshield.engine.velocity-threshold-max-transactions:4}")
    private int maxTransactionsPerWindow;

    @Autowired
    public VelocityBreachRule(RedisVelocityService velocityService) {
        this.velocityService = velocityService;
    }

    @Override
    public String getName() {
        return "Sliding-Window Velocity & Burst Rate";
    }

    @Override
    public int getOrder() {
        return 2;
    }

    @Override
    public boolean canShortCircuit() {
        return true;
    }

    @Override
    public RuleResult evaluate(TransactionRequest request) {
        long start = System.nanoTime();

        // 1. Check for rapid sub-second burst attack (e.g. automated credential stuffing / script injection)
        boolean burstSpike = velocityService.checkBurstSpike(request.getAccountId(), 3, 3);
        if (burstSpike) {
            double latencyMs = (System.nanoTime() - start) / 1_000_000.0;
            return RuleResult.trigger(
                    getName(),
                    TransactionStatus.REJECTED,
                    "High-frequency robotic burst detected (>3 tx within 3 seconds) for account " + request.getAccountId(),
                    95,
                    latencyMs
            );
        }

        // 2. Sliding-window Redis ZSET velocity check
        long velocityCount = velocityService.recordAndGetVelocity(
                request.getAccountId(),
                request.getTransactionId() != null ? request.getTransactionId() : "tx-" + System.currentTimeMillis(),
                windowSeconds
        );

        if (velocityCount > maxTransactionsPerWindow) {
            double latencyMs = (System.nanoTime() - start) / 1_000_000.0;
            return RuleResult.trigger(
                    getName(),
                    TransactionStatus.REJECTED,
                    "Velocity limit breached: " + velocityCount + " transactions in " + windowSeconds + "s window (Limit: " + maxTransactionsPerWindow + ")",
                    85,
                    latencyMs
            );
        }

        double latencyMs = (System.nanoTime() - start) / 1_000_000.0;
        return RuleResult.pass(getName(), latencyMs);
    }
}
