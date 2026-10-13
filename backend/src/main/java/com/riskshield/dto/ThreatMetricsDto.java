package com.riskshield.dto;

public class ThreatMetricsDto {
    private long totalTransactions;
    private long approvedCount;
    private long flaggedCount;
    private long rejectedCount;
    private double averageLatencyMs;
    private long shortCircuitedCount;
    private double fraudRatePercentage;
    private double currentTps;

    public ThreatMetricsDto() {}

    public ThreatMetricsDto(long totalTransactions, long approvedCount, long flaggedCount, long rejectedCount, double averageLatencyMs, long shortCircuitedCount, double fraudRatePercentage, double currentTps) {
        this.totalTransactions = totalTransactions;
        this.approvedCount = approvedCount;
        this.flaggedCount = flaggedCount;
        this.rejectedCount = rejectedCount;
        this.averageLatencyMs = averageLatencyMs;
        this.shortCircuitedCount = shortCircuitedCount;
        this.fraudRatePercentage = fraudRatePercentage;
        this.currentTps = currentTps;
    }

    public long getTotalTransactions() {
        return totalTransactions;
    }

    public void setTotalTransactions(long totalTransactions) {
        this.totalTransactions = totalTransactions;
    }

    public long getApprovedCount() {
        return approvedCount;
    }

    public void setApprovedCount(long approvedCount) {
        this.approvedCount = approvedCount;
    }

    public long getFlaggedCount() {
        return flaggedCount;
    }

    public void setFlaggedCount(long flaggedCount) {
        this.flaggedCount = flaggedCount;
    }

    public long getRejectedCount() {
        return rejectedCount;
    }

    public void setRejectedCount(long rejectedCount) {
        this.rejectedCount = rejectedCount;
    }

    public double getAverageLatencyMs() {
        return averageLatencyMs;
    }

    public void setAverageLatencyMs(double averageLatencyMs) {
        this.averageLatencyMs = averageLatencyMs;
    }

    public long getShortCircuitedCount() {
        return shortCircuitedCount;
    }

    public void setShortCircuitedCount(long shortCircuitedCount) {
        this.shortCircuitedCount = shortCircuitedCount;
    }

    public double getFraudRatePercentage() {
        return fraudRatePercentage;
    }

    public void setFraudRatePercentage(double fraudRatePercentage) {
        this.fraudRatePercentage = fraudRatePercentage;
    }

    public double getCurrentTps() {
        return currentTps;
    }

    public void setCurrentTps(double currentTps) {
        this.currentTps = currentTps;
    }
}
