package com.nebrija.backend.controller;

import com.nebrija.backend.service.StripeService;
import com.stripe.exception.StripeException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stripe")
@CrossOrigin("http://localhost:4200")
public class StripeController {

    @Autowired
    private StripeService stripeService;

    @PostMapping("/create-user")
    public ResponseEntity<String> createUser(@RequestParam String name, @RequestParam String email) {
        try {
            String customerId = stripeService.createUser(name, email);
            return ResponseEntity.ok(customerId);
        } catch (StripeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/create-payment-method")
    public ResponseEntity<String> createPaymentMethod() {
        try {
            String paymentMethodId = stripeService.createPaymentMethod();
            return ResponseEntity.ok(paymentMethodId);
        } catch (StripeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/add-payment-method")
    public ResponseEntity<String> addPaymentMethod(@RequestParam String customerId, @RequestParam String paymentMethodId) {
        try {
            stripeService.addPaymentMethodToUser(customerId, paymentMethodId);
            return ResponseEntity.ok("Método de pago agregado correctamente");
        } catch (StripeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/product")
    public ResponseEntity<String> getProduct() {
        try {
            String productId = stripeService.getProduct();
            return ResponseEntity.ok(productId);
        } catch (StripeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/product-price")
    public ResponseEntity<String[]> getProductPrice(@RequestParam String productId) {
        try {
            String[] priceInfo = stripeService.getProductPrice(productId);
            return ResponseEntity.ok(priceInfo);
        } catch (StripeException e) {
            return ResponseEntity.badRequest().body(new String[]{e.getMessage()});
        }
    }

    @PostMapping("/create-payment")
    public ResponseEntity<String> createPayment(@RequestParam String customerId, @RequestParam String paymentMethodId, @RequestParam String productId, @RequestParam Long amount, @RequestParam String currency) {
        try {
            String paymentId = stripeService.createPayment(customerId, paymentMethodId, productId, amount, currency);
            return ResponseEntity.ok(paymentId);
        } catch (StripeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
