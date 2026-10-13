package com.riskshield.engine.rules;

import com.riskshield.dto.TransactionRequest;
import com.riskshield.engine.FraudRule;
import com.riskshield.model.RuleResult;
import com.riskshield.model.TransactionStatus;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.Locale;

@Component
@Order(5)
public class DeviceTamperingRule implements FraudRule {

    @Override
    public String getName() {
        return "Device Integrity & Root/Emulator Detection";
    }

    @Override
    public int getOrder() {
        return 5;
    }

    @Override
    public boolean canShortCircuit() {
        return false;
    }

    @Override
    public RuleResult evaluate(TransactionRequest request) {
        long start = System.nanoTime();
        String fingerprint = request.getDeviceFingerprint();

        if (fingerprint != null) {
            String lower = fingerprint.toLowerCase(Locale.ROOT);
            if (lower.contains("emulator") || lower.contains("headless") || lower.contains("root") || lower.contains("jailbreak") || lower.contains("vpn-bot")) {
                double latencyMs = (System.nanoTime() - start) / 1_000_000.0;
                return RuleResult.trigger(
                        getName(),
                        TransactionStatus.FLAGGED,
                        "Device integrity anomaly: Suspicious hardware signature detected (" + fingerprint + ").",
                        50,
                        latencyMs
                );
            }
        }

        double latencyMs = (System.nanoTime() - start) / 1_000_000.0;
        return RuleResult.pass(getName(), latencyMs);
    }
}
