package com.riskshield.dto;

import com.riskshield.model.TransactionStatus;
import java.math.BigDecimal;
import java.time.Instant;

public class FraudDecisionResponse {

    private String transactionId;
    private String accountId;
    private BigDecimal amount;
    private String currency;
    private TransactionStatus status;
    private int riskScore;
    private boolean shortCircuited;
    private String triggeredRule;
    private String decisionReason;
    private double evaluationLatencyMs;
    private Instant timestamp;

    public FraudDecisionResponse() {}

    public FraudDecisionResponse(String transactionId, String accountId, BigDecimal amount, String currency, TransactionStatus status, int riskScore, boolean shortCircuited, String triggeredRule, String decisionReason, double evaluationLatencyMs, Instant timestamp) {
        this.transactionId = transactionId;
        this.accountId = accountId;
        this.amount = amount;
        this.currency = currency;
        this.status = status;
        this.riskScore = riskScore;
        this.shortCircuited = shortCircuited;
        this.triggeredRule = triggeredRule;
        this.decisionReason = decisionReason;
        this.evaluationLatencyMs = evaluationLatencyMs;
        this.timestamp = timestamp;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public String getAccountId() {
        return accountId;
    }

    public void setAccountId(String accountId) {
        this.accountId = accountId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public TransactionStatus getStatus() {
        return status;
    }

    public void setStatus(TransactionStatus status) {
        this.status = status;
    }

    public int getRiskScore() {
        return riskScore;
    }

    public void setRiskScore(int riskScore) {
        this.riskScore = riskScore;
    }

    public boolean isShortCircuited() {
        return shortCircuited;
    }

    public void setShortCircuited(boolean shortCircuited) {
        this.shortCircuited = shortCircuited;
    }

    public String getTriggeredRule() {
        return triggeredRule;
    }

    public void setTriggeredRule(String triggeredRule) {
        this.triggeredRule = triggeredRule;
    }

    public String getDecisionReason() {
        return decisionReason;
    }

    public void setDecisionReason(String decisionReason) {
        this.decisionReason = decisionReason;
    }

    public double getEvaluationLatencyMs() {
        return evaluationLatencyMs;
    }

    public void setEvaluationLatencyMs(double evaluationLatencyMs) {
        this.evaluationLatencyMs = evaluationLatencyMs;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }
}
