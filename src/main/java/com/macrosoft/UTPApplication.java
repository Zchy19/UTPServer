package com.macrosoft;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;

@SpringBootApplication
@EntityScan("com.macrosoft.model")
public class UTPApplication {

    public static void main(String[] args) {
        try {
            SpringApplication.run(UTPApplication.class, args);
        } catch (Exception e) {
            e.printStackTrace();
        }

    }

}
