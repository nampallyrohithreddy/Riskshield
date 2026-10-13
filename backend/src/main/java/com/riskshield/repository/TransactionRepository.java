package com.riskshield.repository;

import com.riskshield.model.Transaction;
import com.riskshield.model.TransactionStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Optional<Transaction> findByTransactionId(String transactionId);

    List<Transaction> findByAccountIdOrderByTimestampDesc(String accountId, Pageable pageable);

    List<Transaction> findAllByOrderByTimestampDesc(Pageable pageable);

    long countByStatus(TransactionStatus status);

    long countByShortCircuited(boolean shortCircuited);

    @Query("SELECT COALESCE(AVG(t.evaluationLatencyMs), 0.0) FROM Transaction t")
    Double getAverageEvaluationLatency();
}
