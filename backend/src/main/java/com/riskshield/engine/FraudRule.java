package com.riskshield.engine;

import com.riskshield.dto.TransactionRequest;
import com.riskshield.model.RuleResult;

public interface FraudRule {

    /**
     * Unique display name of this fraud policy rule.
     */
    String getName();

    /**
     * Execution order in the Chain of Responsibility. Lower values run first.
     */
    int getOrder();

    /**
     * If true and this rule triggers with REJECT, the engine immediately terminates
     * further rule evaluation (short-circuits under 100ms).
     */
    default boolean canShortCircuit() {
        return false;
    }

    /**
     * Evaluates the incoming transaction against the rule logic.
     */
    RuleResult evaluate(TransactionRequest request);
}
