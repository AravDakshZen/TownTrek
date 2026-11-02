package com.towntrek;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@SpringBootApplication
@EnableTransactionManagement
public class TownTrekApplication {
    public static void main(String[] args) {
        SpringApplication.run(TownTrekApplication.class, args);
    }
}

