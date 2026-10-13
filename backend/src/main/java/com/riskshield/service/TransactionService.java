package com.riskshield.service;

import com.riskshield.dto.FraudDecisionResponse;
import com.riskshield.dto.ThreatMetricsDto;
import com.riskshield.dto.TransactionRequest;
import com.riskshield.engine.FraudRuleEngine;
import com.riskshield.model.Transaction;
import com.riskshield.model.TransactionStatus;
import com.riskshield.repository.TransactionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class TransactionService {

    private static final Logger log = LoggerFactory.getLogger(TransactionService.class);

    private final FraudRuleEngine ruleEngine;
    private final TransactionRepository transactionRepository;
    private final SimpMessagingTemplate messagingTemplate;

    private final AtomicLong processedCount = new AtomicLong(0);
    private final AtomicLong windowStartTime = new AtomicLong(System.currentTimeMillis());

    @Autowired
    public TransactionService(
            FraudRuleEngine ruleEngine,
            TransactionRepository transactionRepository,
            SimpMessagingTemplate messagingTemplate) {
        this.ruleEngine = ruleEngine;
        this.transactionRepository = transactionRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public FraudDecisionResponse processTransaction(TransactionRequest request) {
        if (request.getTransactionId() == null || request.getTransactionId().isBlank()) {
            request.setTransactionId("TX-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }

        // 1. Evaluate against Chain of Responsibility Rules Engine (< 100ms)
        FraudDecisionResponse decision = ruleEngine.evaluateTransaction(request);

        // 2. Persist audit log record into Database (Postgres)
        Transaction entity = new Transaction();
        entity.setTransactionId(decision.getTransactionId());
        entity.setAccountId(decision.getAccountId());
        entity.setTargetAccountId(request.getTargetAccountId());
        entity.setAmount(decision.getAmount());
        entity.setCurrency(decision.getCurrency());
        entity.setIpAddress(request.getIpAddress());
        entity.setLocation(request.getLocation());
        entity.setDeviceFingerprint(request.getDeviceFingerprint());
        entity.setMerchantCategory(request.getMerchantCategory());
        entity.setStatus(decision.getStatus());
        entity.setRiskScore(decision.getRiskScore());
        entity.setShortCircuited(decision.isShortCircuited());
        entity.setTriggeredRule(decision.getTriggeredRule());
        entity.setDecisionReason(decision.getDecisionReason());
        entity.setEvaluationLatencyMs(decision.getEvaluationLatencyMs());
        entity.setTimestamp(decision.getTimestamp());

        transactionRepository.save(entity);
        processedCount.incrementAndGet();

        // 3. Real-time broadcast to WebSockets for SOC dashboard
        try {
            messagingTemplate.convertAndSend("/topic/threat-feed", decision);
            broadcastMetrics();
        } catch (Exception e) {
            log.warn("Failed to broadcast threat feed event over WebSocket: {}", e.getMessage());
        }

        log.info("Evaluated TX {} in {}ms => Status: {}, Score: {}, ShortCircuited: {}",
                decision.getTransactionId(),
                String.format("%.2f", decision.getEvaluationLatencyMs()),
                decision.getStatus(),
                decision.getRiskScore(),
                decision.isShortCircuited());

        return decision;
    }

    public List<Transaction> getRecentTransactions(int limit) {
        return transactionRepository.findAllByOrderByTimestampDesc(PageRequest.of(0, Math.min(limit, 100)));
    }

    public ThreatMetricsDto getLiveMetrics() {
        long total = transactionRepository.count();
        long approved = transactionRepository.countByStatus(TransactionStatus.APPROVED);
        long flagged = transactionRepository.countByStatus(TransactionStatus.FLAGGED);
        long rejected = transactionRepository.countByStatus(TransactionStatus.REJECTED);
        long shortCircuited = transactionRepository.countByShortCircuited(true);
        Double avgLatency = transactionRepository.getAverageEvaluationLatency();

        double fraudRate = total > 0 ? ((double) rejected / total) * 100.0 : 0.0;

        long elapsedSec = (System.currentTimeMillis() - windowStartTime.get()) / 1000;
        double currentTps = elapsedSec > 0 ? (double) processedCount.get() / elapsedSec : 0.0;

        return new ThreatMetricsDto(
                total,
                approved,
                flagged,
                rejected,
                avgLatency != null ? Math.round(avgLatency * 100.0) / 100.0 : 0.0,
                shortCircuited,
                Math.round(fraudRate * 10.0) / 10.0,
                Math.round(currentTps * 10.0) / 10.0
        );
    }

    public void broadcastMetrics() {
        try {
            messagingTemplate.convertAndSend("/topic/metrics", getLiveMetrics());
        } catch (Exception ignored) {}
    }

    /**
     * Helper to simulate predefined attack scenarios for interactive testing and demos.
     */
    public FraudDecisionResponse simulateAttack(String scenario) {
        TransactionRequest req = new TransactionRequest();
        req.setCurrency("USD");

        switch (scenario.toLowerCase()) {
            case "velocity-burst":
                req.setAccountId("ACC-BURST-" + (int)(Math.random() * 5));
                req.setAmount(new BigDecimal("120.00"));
                req.setLocation("US-NewYork");
                req.setDeviceFingerprint("iPhone15,2/iOS-17.4");
                req.setMerchantCategory("ECOMMERCE");
                // Submit quickly to trigger velocity burst with distinct transaction IDs
                for (int i = 0; i < 4; i++) {
                    req.setTransactionId(null);
                    processTransaction(req);
                }
                req.setTransactionId(null);
                return processTransaction(req);

            case "blacklist-hit":
                req.setAccountId("ACC-FRAUD-999");
                req.setTargetAccountId("ACC-DARKNET-404");
                req.setAmount(new BigDecimal("4500.00"));
                req.setIpAddress("185.220.101.5");
                req.setLocation("UNKNOWN");
                req.setDeviceFingerprint("DESKTOP-BOTNET-01");
                req.setMerchantCategory("CRYPTO_EXCHANGE");
                return processTransaction(req);

            case "high-amount":
                req.setAccountId("ACC-VIP-" + (int)(Math.random() * 1000));
                req.setAmount(new BigDecimal("85000.00"));
                req.setLocation("US-SanFrancisco");
                req.setDeviceFingerprint("MacBookPro18,1/macOS-14.2");
                req.setMerchantCategory("LUXURY_GOODS");
                return processTransaction(req);

            case "geo-anomaly":
                String acc = "ACC-TRAVEL-" + (int)(Math.random() * 50);
                req.setAccountId(acc);
                req.setAmount(new BigDecimal("299.00"));
                req.setLocation("US-Chicago");
                processTransaction(req); // First record in US
                // Rapid subsequent in Russia
                TransactionRequest jumpReq = new TransactionRequest();
                jumpReq.setAccountId(acc);
                jumpReq.setAmount(new BigDecimal("1500.00"));
                jumpReq.setLocation("RU-Moscow");
                jumpReq.setDeviceFingerprint("Android-Pixel-7");
                return processTransaction(jumpReq);

            case "device-tamper":
                req.setAccountId("ACC-USER-" + (int)(Math.random() * 1000));
                req.setAmount(new BigDecimal("350.00"));
                req.setLocation("DE-Berlin");
                req.setDeviceFingerprint("EMULATOR-QEMU-ROOTED");
                req.setMerchantCategory("GAMING");
                return processTransaction(req);

            case "normal":
            default:
                req.setAccountId("ACC-LEGIT-" + (1000 + (int)(Math.random() * 9000)));
                req.setAmount(new BigDecimal(String.format("%.2f", 10.0 + Math.random() * 180.0)));
                req.setLocation("US-Seattle");
                req.setDeviceFingerprint("Pixel8Pro/Android-14");
                req.setMerchantCategory("GROCERY");
                return processTransaction(req);
        }
    }
}
