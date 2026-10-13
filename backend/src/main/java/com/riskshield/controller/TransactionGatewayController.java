package com.riskshield.controller;

import com.riskshield.dto.FraudDecisionResponse;
import com.riskshield.dto.ThreatMetricsDto;
import com.riskshield.dto.TransactionRequest;
import com.riskshield.engine.FraudRuleEngine;
import com.riskshield.model.Transaction;
import com.riskshield.service.RedisVelocityService;
import com.riskshield.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/transactions")
public class TransactionGatewayController {

    private final TransactionService transactionService;
    private final FraudRuleEngine ruleEngine;
    private final RedisVelocityService velocityService;

    @Autowired
    public TransactionGatewayController(
            TransactionService transactionService,
            FraudRuleEngine ruleEngine,
            RedisVelocityService velocityService) {
        this.transactionService = transactionService;
        this.ruleEngine = ruleEngine;
        this.velocityService = velocityService;
    }

    /**
     * Real-time Transaction Fraud Evaluation Gateway
     * High concurrency, short-circuit sub-100ms response time.
     */
    @PostMapping("/evaluate")
    public ResponseEntity<FraudDecisionResponse> evaluateTransaction(@Valid @RequestBody TransactionRequest request) {
        FraudDecisionResponse response = transactionService.processTransaction(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Get recent transactions for SOC dashboard hydration
     */
    @GetMapping("/recent")
    public ResponseEntity<List<Transaction>> getRecentTransactions(
            @RequestParam(defaultValue = "25") int limit) {
        return ResponseEntity.ok(transactionService.getRecentTransactions(limit));
    }

    /**
     * Aggregated live metrics for SOC dashboard
     */
    @GetMapping("/metrics")
    public ResponseEntity<ThreatMetricsDto> getMetrics() {
        return ResponseEntity.ok(transactionService.getLiveMetrics());
    }

    /**
     * Interactive scenario simulator endpoint for live demos & attack simulations
     */
    @PostMapping("/simulate")
    public ResponseEntity<FraudDecisionResponse> simulateAttack(
            @RequestParam(defaultValue = "normal") String scenario) {
        FraudDecisionResponse response = transactionService.simulateAttack(scenario);
        return ResponseEntity.ok(response);
    }

    /**
     * Gateway and engine diagnostic health check
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getHealth() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("gateway", "RiskShield Gateway v1.0.0");
        health.put("redisConnected", velocityService.isRedisConnected());
        health.put("activeRulesCount", ruleEngine.getRuleChain().size());
        health.put("rules", ruleEngine.getRuleChain().stream().map(r -> r.getName() + " [Order: " + r.getOrder() + "]").toList());
        return ResponseEntity.ok(health);
    }
}
