package com.riskshield.model;

public class RuleResult {
    private String ruleName;
    private boolean triggered;
    private TransactionStatus recommendedAction;
    private String reason;
    private int riskScoreContribution;
    private double executionTimeMs;

    public RuleResult() {}

    public RuleResult(String ruleName, boolean triggered, TransactionStatus recommendedAction, String reason, int riskScoreContribution, double executionTimeMs) {
        this.ruleName = ruleName;
        this.triggered = triggered;
        this.recommendedAction = recommendedAction;
        this.reason = reason;
        this.riskScoreContribution = riskScoreContribution;
        this.executionTimeMs = executionTimeMs;
    }

    public static RuleResult pass(String ruleName, double executionTimeMs) {
        return new RuleResult(ruleName, false, null, "Rule condition not met (Clean)", 0, executionTimeMs);
    }

    public static RuleResult trigger(String ruleName, TransactionStatus action, String reason, int riskScore, double executionTimeMs) {
        return new RuleResult(ruleName, true, action, reason, riskScore, executionTimeMs);
    }

    public String getRuleName() {
        return ruleName;
    }

    public void setRuleName(String ruleName) {
        this.ruleName = ruleName;
    }

    public boolean isTriggered() {
        return triggered;
    }

    public void setTriggered(boolean triggered) {
        this.triggered = triggered;
    }

    public TransactionStatus getRecommendedAction() {
        return recommendedAction;
    }

    public void setRecommendedAction(TransactionStatus recommendedAction) {
        this.recommendedAction = recommendedAction;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public int getRiskScoreContribution() {
        return riskScoreContribution;
    }

    public void setRiskScoreContribution(int riskScoreContribution) {
        this.riskScoreContribution = riskScoreContribution;
    }

    public double getExecutionTimeMs() {
        return executionTimeMs;
    }

    public void setExecutionTimeMs(double executionTimeMs) {
        this.executionTimeMs = executionTimeMs;
    }
}
