package com.example.service;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SecretController {

    @GetMapping("/api/data")
    public String getSecretData() {
        return "This is protected data accessible only to authorized Service Owners!";
    }
}
