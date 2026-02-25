package com.crm.config;

import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;

/**
 * Converts DATABASE_URL (postgresql://user:pass@host:port/db) to DB_* for Spring.
 * Used by Render, Railway, Heroku, etc.
 */
@Configuration
public class DatabaseUrlConfig {

    @PostConstruct
    public void convertDatabaseUrl() {
        String dbUrl = System.getenv("DATABASE_URL");
        if (dbUrl == null || dbUrl.isBlank()) return;

        try {
            // postgresql://user:password@host:port/database
            String clean = dbUrl.replaceFirst("^postgresql://", "");
            int at = clean.indexOf('@');
            if (at < 0) return;
            String userInfo = clean.substring(0, at);
            String hostPart = clean.substring(at + 1);
            String[] userPass = userInfo.split(":", 2);
            String user = userPass[0];
            String pass = userPass.length > 1 ? userPass[1] : "";

            int slash = hostPart.indexOf('/');
            String hostPort = slash >= 0 ? hostPart.substring(0, slash) : hostPart;
            String db = slash >= 0 ? hostPart.substring(slash + 1) : "internal_crm";
            String[] hp = hostPort.split(":");
            String host = hp[0];
            int port = hp.length > 1 ? Integer.parseInt(hp[1]) : 5432;

            String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + "/" + db;
            System.setProperty("DB_URL", jdbcUrl);
            System.setProperty("DB_USERNAME", user);
            System.setProperty("DB_PASSWORD", pass);
        } catch (Exception ignored) {
            // Fall back to env/default config
        }
    }
}
