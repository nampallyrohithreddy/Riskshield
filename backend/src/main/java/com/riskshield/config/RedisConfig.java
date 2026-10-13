package com.riskshield.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceClientConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.net.URI;
import java.time.Duration;

@Configuration
public class RedisConfig {

    private static final Logger log = LoggerFactory.getLogger(RedisConfig.class);

    @Value("${spring.data.redis.host:localhost}")
    private String redisHost;

    @Value("${spring.data.redis.port:6379}")
    private int redisPort;

    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        String envRedisUrl = System.getenv("REDIS_URL");
        if (envRedisUrl == null || envRedisUrl.isBlank()) {
            envRedisUrl = System.getenv("SPRING_DATA_REDIS_URL");
        }

        LettuceClientConfiguration clientConfig = LettuceClientConfiguration.builder()
                .commandTimeout(Duration.ofMillis(1000))
                .build();

        if (envRedisUrl != null && !envRedisUrl.isBlank()) {
            try {
                URI uri = URI.create(envRedisUrl);
                RedisStandaloneConfiguration redisConfig = new RedisStandaloneConfiguration();
                redisConfig.setHostName(uri.getHost());
                redisConfig.setPort(uri.getPort() > 0 ? uri.getPort() : 6379);

                String userInfo = uri.getUserInfo();
                if (userInfo != null && !userInfo.isEmpty()) {
                    String[] parts = userInfo.split(":", 2);
                    if (parts.length > 1) {
                        redisConfig.setPassword(parts[1]);
                    } else {
                        redisConfig.setPassword(parts[0]);
                    }
                }

                if (envRedisUrl.startsWith("rediss://")) {
                    clientConfig = LettuceClientConfiguration.builder()
                            .useSsl()
                            .and()
                            .commandTimeout(Duration.ofMillis(1000))
                            .build();
                }

                log.info("Configured Redis connection to host: {}, port: {}", uri.getHost(), redisConfig.getPort());
                LettuceConnectionFactory factory = new LettuceConnectionFactory(redisConfig, clientConfig);
                factory.afterPropertiesSet();
                return factory;
            } catch (Exception e) {
                log.warn("Failed to parse REDIS_URL [{}], falling back to host/port: {}", envRedisUrl, e.getMessage());
            }
        }

        RedisStandaloneConfiguration redisConfig = new RedisStandaloneConfiguration(redisHost, redisPort);
        LettuceConnectionFactory factory = new LettuceConnectionFactory(redisConfig, clientConfig);
        factory.afterPropertiesSet();
        return factory;
    }

    @Bean
    public StringRedisTemplate stringRedisTemplate(RedisConnectionFactory connectionFactory) {
        return new StringRedisTemplate(connectionFactory);
    }

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new GenericJackson2JsonRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(new GenericJackson2JsonRedisSerializer());
        template.afterPropertiesSet();
        return template;
    }
}
