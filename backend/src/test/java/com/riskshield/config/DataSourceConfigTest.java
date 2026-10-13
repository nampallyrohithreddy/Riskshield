package com.riskshield.config;

import com.zaxxer.hikari.HikariConfig;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class DataSourceConfigTest {

    @Test
    void testRenderPostgresUrlParsing() {
        String renderUrl = "postgres://rs_user:secret_pass123@dpg-c123456789-a.oregon-postgres.render.com:5432/riskshield_db";
        HikariConfig config = DataSourceConfig.createHikariConfig(renderUrl, null, null);

        assertEquals("jdbc:postgresql://dpg-c123456789-a.oregon-postgres.render.com:5432/riskshield_db", config.getJdbcUrl());
        assertEquals("rs_user", config.getUsername());
        assertEquals("secret_pass123", config.getPassword());
        assertEquals("org.postgresql.Driver", config.getDriverClassName());
    }

    @Test
    void testRenderPostgresqlWithParams() {
        String renderUrl = "postgresql://myuser:mypass@dpg-host:5432/mydb?sslmode=require";
        HikariConfig config = DataSourceConfig.createHikariConfig(renderUrl, null, null);

        assertEquals("jdbc:postgresql://dpg-host:5432/mydb?sslmode=require", config.getJdbcUrl());
        assertEquals("myuser", config.getUsername());
        assertEquals("mypass", config.getPassword());
        assertEquals("org.postgresql.Driver", config.getDriverClassName());
    }

    @Test
    void testJdbcWithEmbeddedCredentials() {
        String url = "jdbc:postgresql://admin:supersecret@localhost:5432/riskshield";
        HikariConfig config = DataSourceConfig.createHikariConfig(url, null, null);

        assertEquals("jdbc:postgresql://localhost:5432/riskshield", config.getJdbcUrl());
        assertEquals("admin", config.getUsername());
        assertEquals("supersecret", config.getPassword());
        assertEquals("org.postgresql.Driver", config.getDriverClassName());
    }

    @Test
    void testDoubleJdbcPrefixCleanup() {
        String url = "jdbc:jdbc:postgresql://postgres:5432/riskshield";
        HikariConfig config = DataSourceConfig.createHikariConfig(url, "postgres", "postgres");

        assertEquals("jdbc:postgresql://postgres:5432/riskshield", config.getJdbcUrl());
        assertEquals("postgres", config.getUsername());
        assertEquals("postgres", config.getPassword());
        assertEquals("org.postgresql.Driver", config.getDriverClassName());
    }

    @Test
    void testEmptyFallbackToH2() {
        HikariConfig configNull = DataSourceConfig.createHikariConfig(null, null, null);
        assertTrue(configNull.getJdbcUrl().contains(":h2:mem:"));
        assertEquals("org.h2.Driver", configNull.getDriverClassName());

        HikariConfig configBlank = DataSourceConfig.createHikariConfig("", null, null);
        assertTrue(configBlank.getJdbcUrl().contains(":h2:mem:"));

        HikariConfig configJdbcOnly = DataSourceConfig.createHikariConfig("jdbc:", null, null);
        assertTrue(configJdbcOnly.getJdbcUrl().contains(":h2:mem:"));
    }
}
