# ==============================================================================
# RiskShield SOC & Rules Engine Automated Test Suite
# ==============================================================================

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "       RISKSHIELD REAL-TIME FRAUD PREVENTION TEST SUITE          " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:8080/api/v1/transactions"

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [string]$Body = $null,
        [string]$ExpectedStatus = "200"
    )

    Write-Host "[TEST] $Name ... " -NoNewline -ForegroundColor Yellow

    try {
        $params = @{
            Uri = $Url
            Method = $Method
            ContentType = "application/json"
            UseBasicParsing = $true
        }
        if ($Body) {
            $params.Body = $Body
        }

        $sw = [System.Diagnostics.Stopwatch]::StartNew()
        $response = Invoke-RestMethod @params
        $sw.Stop()

        Write-Host "PASSED " -ForegroundColor Green -NoNewline
        Write-Host "($($sw.ElapsedMilliseconds)ms HTTP roundtrip)" -ForegroundColor DarkGray
        return $response
    }
    catch {
        Write-Host "FAILED: $_" -ForegroundColor Red
        return $null
    }
}

# 1. Health Diagnostic
$health = Test-Endpoint -Name "Gateway Health Diagnostic" -Url "$baseUrl/health"
if ($health) {
    Write-Host "  -> Engine Status: $($health.status), Active Rules: $($health.activeRulesCount)" -ForegroundColor Gray
}

# 2. Legitimate Clean Transaction
$cleanPayload = @{
    accountId = "ACC-LEGIT-USER-01"
    amount = 49.99
    currency = "USD"
    location = "US-NewYork"
    deviceFingerprint = "Mozilla/5.0 Mac OS X Clean"
    merchantCategory = "GROCERY"
} | ConvertTo-Json

$cleanRes = Test-Endpoint -Name "Clean Baseline Transaction (POST /evaluate)" -Url "$baseUrl/evaluate" -Method "POST" -Body $cleanPayload
if ($cleanRes) {
    Write-Host "  -> Status: $($cleanRes.status), Risk Score: $($cleanRes.riskScore), Latency: $($cleanRes.evaluationLatencyMs)ms" -ForegroundColor Green
    if ($cleanRes.status -ne "APPROVED") { Write-Warning "Expected APPROVED status!" }
}

# 3. Sanctions & Blacklist Hit (Order 1 Short-Circuit)
$blacklistRes = Test-Endpoint -Name "Sanctions Blacklist Hit (Order 1 Instant Drop)" -Url "$baseUrl/simulate?scenario=blacklist-hit" -Method "POST"
if ($blacklistRes) {
    Write-Host "  -> Status: $($blacklistRes.status), ShortCircuited: $($blacklistRes.shortCircuited), Rule: $($blacklistRes.triggeredRule)" -ForegroundColor Red
    if ($blacklistRes.status -ne "REJECTED" -or -not $blacklistRes.shortCircuited) { Write-Warning "Expected REJECTED with ShortCircuited=true" }
}

# 4. Velocity Breach Burst (Order 2 Short-Circuit)
$velocityRes = Test-Endpoint -Name "Velocity Burst Attack (Order 2 Redis Breach)" -Url "$baseUrl/simulate?scenario=velocity-burst" -Method "POST"
if ($velocityRes) {
    Write-Host "  -> Status: $($velocityRes.status), ShortCircuited: $($velocityRes.shortCircuited), Rule: $($velocityRes.triggeredRule)" -ForegroundColor Magenta
    if ($velocityRes.status -ne "REJECTED") { Write-Warning "Expected REJECTED status!" }
}

# 5. High-Value Transfer (> $10k Threshold)
$amountRes = Test-Endpoint -Name "High-Value Transaction Spike (Order 4 Flag)" -Url "$baseUrl/simulate?scenario=high-amount" -Method "POST"
if ($amountRes) {
    Write-Host "  -> Status: $($amountRes.status), Risk Score: $($amountRes.riskScore), Rule: $($amountRes.triggeredRule)" -ForegroundColor Yellow
    if ($amountRes.status -ne "FLAGGED") { Write-Warning "Expected FLAGGED status!" }
}

# 6. Impossible Travel / Geo-Velocity Jump
$geoRes = Test-Endpoint -Name "Impossible Travel Anomaly (Order 3 Flag)" -Url "$baseUrl/simulate?scenario=geo-anomaly" -Method "POST"
if ($geoRes) {
    Write-Host "  -> Status: $($geoRes.status), Reason: $($geoRes.decisionReason)" -ForegroundColor Yellow
    if ($geoRes.status -ne "FLAGGED") { Write-Warning "Expected FLAGGED status!" }
}

# 7. Device Integrity / Rooted Tamper
$deviceRes = Test-Endpoint -Name "Device Integrity & Root/Emulator (Order 5 Flag)" -Url "$baseUrl/simulate?scenario=device-tamper" -Method "POST"
if ($deviceRes) {
    Write-Host "  -> Status: $($deviceRes.status), Rule: $($deviceRes.triggeredRule)" -ForegroundColor Yellow
}

# 8. Aggregated Live Telemetry Metrics
$metrics = Test-Endpoint -Name "SOC Live Telemetry Metrics (GET /metrics)" -Url "$baseUrl/metrics"
if ($metrics) {
    Write-Host ""
    Write-Host "-------------------- LIVE SOC METRICS SUMMARY --------------------" -ForegroundColor Cyan
    Write-Host "  Total Transactions Logged : $($metrics.totalTransactions)" -ForegroundColor White
    Write-Host "  Clean Approvals           : $($metrics.approvedCount)" -ForegroundColor Green
    Write-Host "  Step-Up Review Flagged    : $($metrics.flaggedCount)" -ForegroundColor Yellow
    Write-Host "  Blocked / Rejected        : $($metrics.rejectedCount)" -ForegroundColor Red
    Write-Host "  Short-Circuited Exits     : $($metrics.shortCircuitedCount)" -ForegroundColor Magenta
    Write-Host "  Average Engine Latency    : $($metrics.averageLatencyMs) ms (SLA < 100ms)" -ForegroundColor Cyan
    Write-Host "  Real-Time Fraud Rate      : $($metrics.fraudRatePercentage) %" -ForegroundColor White
    Write-Host "------------------------------------------------------------------" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "All automated tests finished. Dashboard is live at: http://localhost:3000" -ForegroundColor Green
