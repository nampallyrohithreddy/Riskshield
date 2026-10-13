package com.riskshield.engine.rules;

import com.riskshield.dto.TransactionRequest;
import com.riskshield.engine.FraudRule;
import com.riskshield.model.RuleResult;
import com.riskshield.model.TransactionStatus;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@Order(4)
public class HighAmountRule implements FraudRule {

    @Value("${riskshield.engine.high-amount-threshold:10000.00}")
    private BigDecimal highAmountThreshold;

    @Override
    public String getName() {
        return "High-Value Transaction Threshold";
    }

    @Override
    public int getOrder() {
        return 4;
    }

    @Override
    public boolean canShortCircuit() {
        return false;
    }

    @Override
    public RuleResult evaluate(TransactionRequest request) {
        long start = System.nanoTime();

        if (request.getAmount() != null && request.getAmount().compareTo(highAmountThreshold) > 0) {
            double latencyMs = (System.nanoTime() - start) / 1_000_000.0;
            return RuleResult.trigger(
                    getName(),
                    TransactionStatus.FLAGGED,
                    "Transaction amount ($" + request.getAmount() + ") exceeds standard verification threshold ($" + highAmountThreshold + "). Requires MFA/Step-Up.",
                    60,
                    latencyMs
            );
        }

        double latencyMs = (System.nanoTime() - start) / 1_000_000.0;
        return RuleResult.pass(getName(), latencyMs);
    }
}
