package com.riskshield.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;

@Configuration
public class DataSourceConfig {

    private static final Logger log = LoggerFactory.getLogger(DataSourceConfig.class);

    @Value("${spring.datasource.url:#{null}}")
    private String configuredUrl;

    @Value("${spring.datasource.username:#{null}}")
    private String configuredUsername;

    @Value("${spring.datasource.password:#{null}}")
    private String configuredPassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        // Render & standard cloud providers provide DATABASE_URL (or SPRING_DATASOURCE_URL)
        String envDbUrl = System.getenv("DATABASE_URL");
        if (envDbUrl == null || envDbUrl.isBlank()) {
            envDbUrl = System.getenv("SPRING_DATASOURCE_URL");
        }
        if (envDbUrl == null || envDbUrl.isBlank()) {
            envDbUrl = configuredUrl;
        }

        String username = System.getenv("SPRING_DATASOURCE_USERNAME");
        if (username == null || username.isBlank()) {
            username = System.getenv("DATABASE_USER");
        }
        if (username == null || username.isBlank()) {
            username = configuredUsername;
        }

        String password = System.getenv("SPRING_DATASOURCE_PASSWORD");
        if (password == null || password.isBlank()) {
            password = System.getenv("DATABASE_PASSWORD");
        }
        if (password == null || password.isBlank()) {
            password = configuredPassword;
        }

        HikariConfig hikariConfig = createHikariConfig(envDbUrl, username, password);

        // Connection pool defaults optimized for cloud/containerized deployment
        hikariConfig.setMaximumPoolSize(10);
        hikariConfig.setMinimumIdle(2);
        hikariConfig.setIdleTimeout(30000);
        hikariConfig.setMaxLifetime(1800000);
        hikariConfig.setConnectionTimeout(20000);

        log.info("Initialized DataSource with JDBC URL: {}", maskUrl(hikariConfig.getJdbcUrl()));
        return new HikariDataSource(hikariConfig);
    }

    public static HikariConfig createHikariConfig(String envUrl, String envUsername, String envPassword) {
        HikariConfig config = new HikariConfig();

        if (envUrl == null || envUrl.isBlank() || envUrl.trim().equals("jdbc:")) {
            // Safe fallback to in-memory H2 database with PostgreSQL compatibility mode
            config.setJdbcUrl("jdbc:h2:mem:riskshield_db;DB_CLOSE_DELAY=-1;MODE=PostgreSQL");
            config.setDriverClassName("org.h2.Driver");
            config.setUsername("sa");
            config.setPassword("");
            return config;
        }

        String url = envUrl.trim();

        // Strip accidental duplicate jdbc: prefix (e.g., jdbc:jdbc:postgresql://...)
        while (url.startsWith("jdbc:jdbc:")) {
            url = url.substring(5);
        }

        // Render & Heroku standard format: postgres://user:password@host:port/dbname
        // or postgresql://user:password@host:port/dbname
        if (url.startsWith("postgres://") || url.startsWith("postgresql://")) {
            int schemeEnd = url.indexOf("://");
            String afterScheme = url.substring(schemeEnd + 3);

            String username = envUsername;
            String password = envPassword;

            int atIndex = afterScheme.lastIndexOf('@');
            String hostAndPath = afterScheme;
            if (atIndex != -1) {
                String credentials = afterScheme.substring(0, atIndex);
                hostAndPath = afterScheme.substring(atIndex + 1);
                int colonIndex = credentials.indexOf(':');
                if (colonIndex != -1) {
                    username = credentials.substring(0, colonIndex);
                    password = credentials.substring(colonIndex + 1);
                } else {
                    username = credentials;
                }
            }

            config.setJdbcUrl("jdbc:postgresql://" + hostAndPath);
            config.setDriverClassName("org.postgresql.Driver");
            if (username != null && !username.isBlank()) {
                config.setUsername(username);
            }
            if (password != null && !password.isBlank()) {
                config.setPassword(password);
            }
            return config;
        }

        // Handle jdbc:postgresql://user:password@host:port/dbname
        if (url.startsWith("jdbc:postgresql://") && url.contains("@")) {
            String afterPrefix = url.substring("jdbc:postgresql://".length());
            int atIndex = afterPrefix.lastIndexOf('@');
            String credentials = afterPrefix.substring(0, atIndex);
            String hostAndPath = afterPrefix.substring(atIndex + 1);

            String username = envUsername;
            String password = envPassword;
            int colonIndex = credentials.indexOf(':');
            if (colonIndex != -1) {
                username = credentials.substring(0, colonIndex);
                password = credentials.substring(colonIndex + 1);
            } else {
                username = credentials;
            }

            config.setJdbcUrl("jdbc:postgresql://" + hostAndPath);
            config.setDriverClassName("org.postgresql.Driver");
            if (username != null && !username.isBlank()) {
                config.setUsername(username);
            }
            if (password != null && !password.isBlank()) {
                config.setPassword(password);
            }
            return config;
        }

        if (!url.startsWith("jdbc:")) {
            url = "jdbc:" + url;
        }

        config.setJdbcUrl(url);

        if (url.contains(":postgresql:")) {
            config.setDriverClassName("org.postgresql.Driver");
        } else if (url.contains(":h2:")) {
            config.setDriverClassName("org.h2.Driver");
        }

        if (envUsername != null && !envUsername.isBlank()) {
            config.setUsername(envUsername);
        }
        if (envPassword != null && !envPassword.isBlank()) {
            config.setPassword(envPassword);
        }

        return config;
    }

    private static String maskUrl(String url) {
        if (url == null) return "null";
        return url.replaceAll("://([^:]+):([^@]+)@", "://$1:****@");
    }
}
