package com.riskshield.engine;

import com.riskshield.dto.FraudDecisionResponse;
import com.riskshield.dto.TransactionRequest;
import com.riskshield.model.RuleResult;
import com.riskshield.model.TransactionStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
public class FraudRuleEngine {

    private static final Logger log = LoggerFactory.getLogger(FraudRuleEngine.class);

    private final List<FraudRule> ruleChain;

    @Value("${riskshield.engine.short-circuit-enabled:true}")
    private boolean shortCircuitEnabled;

    @Autowired
    public FraudRuleEngine(List<FraudRule> rules) {
        // Sort rules by @Order annotation or getOrder()
        this.ruleChain = new ArrayList<>(rules);
        this.ruleChain.sort(Comparator.comparingInt(FraudRule::getOrder));
        log.info("Initialized Fraud Rule Chain with {} rules in order: {}",
                this.ruleChain.size(),
                this.ruleChain.stream().map(FraudRule::getName).toList());
    }

    public FraudDecisionResponse evaluateTransaction(TransactionRequest request) {
        long engineStartTime = System.nanoTime();

        if (request.getTransactionId() == null || request.getTransactionId().isBlank()) {
            request.setTransactionId("TX-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }

        int cumulativeRiskScore = 0;
        TransactionStatus finalStatus = TransactionStatus.APPROVED;
        String triggeredRuleName = null;
        String decisionReason = "All fraud policies evaluated clean. Transaction approved.";
        boolean shortCircuited = false;

        List<RuleResult> results = new ArrayList<>();

        for (FraudRule rule : ruleChain) {
            RuleResult result = rule.evaluate(request);
            results.add(result);

            if (result.isTriggered()) {
                cumulativeRiskScore += result.getRiskScoreContribution();

                if (triggeredRuleName == null) {
                    triggeredRuleName = result.getRuleName();
                    decisionReason = result.getReason();
                } else {
                    decisionReason += " | " + result.getReason();
                }

                // Short-circuit check: instantly reject without executing remaining rules
                if (shortCircuitEnabled && rule.canShortCircuit() && result.getRecommendedAction() == TransactionStatus.REJECTED) {
                    shortCircuited = true;
                    finalStatus = TransactionStatus.REJECTED;
                    cumulativeRiskScore = Math.max(cumulativeRiskScore, 85);
                    log.warn("[SHORT-CIRCUIT] Rule '{}' triggered instant REJECT for TX {}. Skipping downstream rules.",
                            rule.getName(), request.getTransactionId());
                    break;
                }
            }
        }

        // Cap risk score between 0 and 100
        cumulativeRiskScore = Math.min(100, cumulativeRiskScore);

        // Final status determination if not already short-circuited
        if (!shortCircuited) {
            if (cumulativeRiskScore >= 75) {
                finalStatus = TransactionStatus.REJECTED;
            } else if (cumulativeRiskScore >= 50) {
                finalStatus = TransactionStatus.FLAGGED;
            } else {
                finalStatus = TransactionStatus.APPROVED;
            }
        }

        double totalLatencyMs = (System.nanoTime() - engineStartTime) / 1_000_000.0;

        return new FraudDecisionResponse(
                request.getTransactionId(),
                request.getAccountId(),
                request.getAmount(),
                request.getCurrency(),
                finalStatus,
                cumulativeRiskScore,
                shortCircuited,
                triggeredRuleName,
                decisionReason,
                totalLatencyMs,
                Instant.now()
        );
    }

    public List<FraudRule> getRuleChain() {
        return ruleChain;
    }
}
