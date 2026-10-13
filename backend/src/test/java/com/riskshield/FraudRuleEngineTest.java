package com.riskshield;

import com.riskshield.dto.FraudDecisionResponse;
import com.riskshield.dto.TransactionRequest;
import com.riskshield.engine.FraudRuleEngine;
import com.riskshield.engine.rules.*;
import com.riskshield.model.TransactionStatus;
import com.riskshield.service.RedisVelocityService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

class FraudRuleEngineTest {

    private FraudRuleEngine engine;
    private RedisVelocityService velocityService;

    @BeforeEach
    void setUp() {
        velocityService = Mockito.mock(RedisVelocityService.class);

        BlacklistRule blacklistRule = new BlacklistRule();
        VelocityBreachRule velocityRule = new VelocityBreachRule(velocityService);
        ReflectionTestUtils.setField(velocityRule, "windowSeconds", 60);
        ReflectionTestUtils.setField(velocityRule, "maxTransactionsPerWindow", 4);

        GeoMismatchRule geoRule = new GeoMismatchRule(velocityService);
        HighAmountRule amountRule = new HighAmountRule();
        ReflectionTestUtils.setField(amountRule, "highAmountThreshold", new BigDecimal("10000.00"));

        DeviceTamperingRule deviceRule = new DeviceTamperingRule();

        engine = new FraudRuleEngine(List.of(blacklistRule, velocityRule, geoRule, amountRule, deviceRule));
        ReflectionTestUtils.setField(engine, "shortCircuitEnabled", true);
    }

    @Test
    @DisplayName("Clean transaction should be APPROVED with sub-100ms latency")
    void testCleanTransaction() {
        TransactionRequest req = new TransactionRequest();
        req.setAccountId("ACC-CLEAN-123");
        req.setAmount(new BigDecimal("75.00"));
        req.setLocation("US-NewYork");
        req.setDeviceFingerprint("Mozilla/5.0 Clean Mac");

        when(velocityService.recordAndGetVelocity(anyString(), anyString(), anyInt())).thenReturn(1L);
        when(velocityService.checkBurstSpike(anyString(), anyInt(), anyInt())).thenReturn(false);

        FraudDecisionResponse response = engine.evaluateTransaction(req);

        assertEquals(TransactionStatus.APPROVED, response.getStatus());
        assertEquals(0, response.getRiskScore());
        assertFalse(response.isShortCircuited());
        assertTrue(response.getEvaluationLatencyMs() < 100.0, "Latency should be well under 100ms");
    }

    @Test
    @DisplayName("Blacklisted account triggers instant REJECT and short-circuits chain")
    void testBlacklistShortCircuit() {
        TransactionRequest req = new TransactionRequest();
        req.setAccountId("ACC-FRAUD-999");
        req.setAmount(new BigDecimal("250.00"));

        FraudDecisionResponse response = engine.evaluateTransaction(req);

        assertEquals(TransactionStatus.REJECTED, response.getStatus());
        assertTrue(response.isShortCircuited(), "Should short-circuit chain immediately");
        assertEquals("Sanctions & Blacklist Screening", response.getTriggeredRule());
        assertTrue(response.getEvaluationLatencyMs() < 50.0);
    }

    @Test
    @DisplayName("Velocity breach triggers short-circuit REJECT")
    void testVelocityBreach() {
        TransactionRequest req = new TransactionRequest();
        req.setAccountId("ACC-NORMAL-500");
        req.setAmount(new BigDecimal("100.00"));

        when(velocityService.checkBurstSpike(anyString(), anyInt(), anyInt())).thenReturn(false);
        // Exceed limit of 4
        when(velocityService.recordAndGetVelocity(anyString(), anyString(), anyInt())).thenReturn(8L);

        FraudDecisionResponse response = engine.evaluateTransaction(req);

        assertEquals(TransactionStatus.REJECTED, response.getStatus());
        assertTrue(response.isShortCircuited());
        assertEquals("Sliding-Window Velocity & Burst Rate", response.getTriggeredRule());
    }

    @Test
    @DisplayName("High amount (> $10k) flags for step-up review")
    void testHighAmountFlag() {
        TransactionRequest req = new TransactionRequest();
        req.setAccountId("ACC-USER-111");
        req.setAmount(new BigDecimal("25000.00"));

        when(velocityService.recordAndGetVelocity(anyString(), anyString(), anyInt())).thenReturn(1L);

        FraudDecisionResponse response = engine.evaluateTransaction(req);

        assertEquals(TransactionStatus.FLAGGED, response.getStatus());
        assertEquals("High-Value Transaction Threshold", response.getTriggeredRule());
    }
}
