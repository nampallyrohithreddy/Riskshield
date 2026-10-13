package com.riskshield.engine.rules;

import com.riskshield.dto.TransactionRequest;
import com.riskshield.engine.FraudRule;
import com.riskshield.model.RuleResult;
import com.riskshield.model.TransactionStatus;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Set;

@Component
@Order(2)
public class RestrictedMerchantCategoryRule implements FraudRule {

    private static final Set<String> BLOCKED_CATEGORIES = Set.of(
            "ONLINE_GAMBLING", "ILLEGAL_GAMBLING", "UNLICENSED_CASINO",
            "DARKNET_MARKETPLACE", "CRYPTO_MIXER", "SHELL_COMPANY"
    );

    private static final Map<String, String> FLAGGED_CATEGORIES = Map.of(
            "BETTING_GAMBLING",  "Sports betting/gambling platform detected. Flagged per AML policy 4.2.",
            "CASINO",            "Casino transaction detected. High money-laundering risk category.",
            "LOTTERY",           "Lottery payment detected. Subject to jurisdiction-specific gambling laws.",
            "CRYPTO_EXCHANGE",   "Cryptocurrency exchange detected. Enhanced due diligence required.",
            "FOREX_TRADING",     "Foreign exchange trading platform. Potential layering risk.",
            "PAWN_SHOP",         "Pawn shop transaction. Common in structuring/layering schemes.",
            "MONEY_SERVICE",     "Money service business (MSB). FinCEN reporting threshold applies."
    );

    @Override
    public String getName() { return "Restricted Merchant Category (MCC) Policy"; }

    @Override
    public int getOrder() { return 2; }

    @Override
    public boolean canShortCircuit() { return true; }

    @Override
    public RuleResult evaluate(TransactionRequest request) {
        long start = System.nanoTime();
        String category = request.getMerchantCategory();
        if (category == null || category.isBlank()) {
            return RuleResult.pass(getName(), (System.nanoTime() - start) / 1_000_000.0);
        }
        String normalized = category.trim().toUpperCase().replace(" ", "_").replace("-", "_");
        if (BLOCKED_CATEGORIES.contains(normalized)) {
            return RuleResult.trigger(getName(), TransactionStatus.REJECTED,
                    "Merchant category '" + category + "' is on the restricted block list. Transaction declined per card network policy.",
                    90, (System.nanoTime() - start) / 1_000_000.0);
        }
        for (Map.Entry<String, String> entry : FLAGGED_CATEGORIES.entrySet()) {
            if (normalized.contains(entry.getKey()) || entry.getKey().contains(normalized)) {
                return RuleResult.trigger(getName(), TransactionStatus.FLAGGED,
                        entry.getValue(), 55, (System.nanoTime() - start) / 1_000_000.0);
            }
        }
        return RuleResult.pass(getName(), (System.nanoTime() - start) / 1_000_000.0);
    }
}
