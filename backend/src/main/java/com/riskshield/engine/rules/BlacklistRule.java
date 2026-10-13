package com.riskshield.engine.rules;

import com.riskshield.dto.TransactionRequest;
import com.riskshield.engine.FraudRule;
import com.riskshield.model.RuleResult;
import com.riskshield.model.TransactionStatus;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
@Order(1)
public class BlacklistRule implements FraudRule {

    // Known malicious accounts, sanctioned entities, and blocked IP addresses
    private static final Set<String> BLACKLISTED_ACCOUNTS = Set.of(
            "ACC-FRAUD-999", "ACC-DARKNET-404", "ACC-SANCTIONED-001", "ACC-STOLEN-777"
    );

    private static final Set<String> BLACKLISTED_IPS = Set.of(
            "185.220.101.5", "194.26.29.11", "45.154.255.88", "198.51.100.99"
    );

    @Override
    public String getName() {
        return "Sanctions & Blacklist Screening";
    }

    @Override
    public int getOrder() {
        return 1;
    }

    @Override
    public boolean canShortCircuit() {
        return true;
    }

    @Override
    public RuleResult evaluate(TransactionRequest request) {
        long start = System.nanoTime();

        if (request.getAccountId() != null && BLACKLISTED_ACCOUNTS.contains(request.getAccountId().toUpperCase())) {
            double latencyMs = (System.nanoTime() - start) / 1_000_000.0;
            return RuleResult.trigger(
                    getName(),
                    TransactionStatus.REJECTED,
                    "Account " + request.getAccountId() + " is present on global fraud/sanctions watchlist.",
                    100,
                    latencyMs
            );
        }

        if (request.getTargetAccountId() != null && BLACKLISTED_ACCOUNTS.contains(request.getTargetAccountId().toUpperCase())) {
            double latencyMs = (System.nanoTime() - start) / 1_000_000.0;
            return RuleResult.trigger(
                    getName(),
                    TransactionStatus.REJECTED,
                    "Target recipient " + request.getTargetAccountId() + " is flagged on global sanctions watchlist.",
                    100,
                    latencyMs
            );
        }

        if (request.getIpAddress() != null && BLACKLISTED_IPS.contains(request.getIpAddress().trim())) {
            double latencyMs = (System.nanoTime() - start) / 1_000_000.0;
            return RuleResult.trigger(
                    getName(),
                    TransactionStatus.REJECTED,
                    "Originating IP " + request.getIpAddress() + " identified as known malicious botnet / exit node.",
                    100,
                    latencyMs
            );
        }

        double latencyMs = (System.nanoTime() - start) / 1_000_000.0;
        return RuleResult.pass(getName(), latencyMs);
    }
}
