package com.nebrija.backend.service;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.*;
import com.stripe.param.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class StripeService {

    @Value("${stripe.secret.key}")
    private String stripeSecretKey;

    public StripeService() {
        Stripe.apiKey = stripeSecretKey;
    }

    // Crear usuario (cliente)
    public String createUser(String name, String email) throws StripeException {
        CustomerCreateParams params =
                CustomerCreateParams.builder()
                        .setName(name)
                        .setEmail(email)
                        .build();

        Customer customer = Customer.create(params);
        return customer.getId();
    }

    // Crear metodo de pago
    public String createPaymentMethod() throws StripeException {
        PaymentMethodCreateParams params =
                PaymentMethodCreateParams.builder()
                        .setType(PaymentMethodCreateParams.Type.CARD)
                        .build();

        PaymentMethod paymentMethod = PaymentMethod.create(params);
        return paymentMethod.getId();
    }

    // Asociar metodo de pago a usuario
    public void addPaymentMethodToUser(String customerId, String paymentMethodId) throws StripeException {
        PaymentMethod paymentMethod = PaymentMethod.retrieve(paymentMethodId);
        paymentMethod.attach(
                PaymentMethodAttachParams.builder()
                        .setCustomer(customerId)
                        .build()
        );
    }

    // Obtener producto
    public String getProduct() throws StripeException {
        ProductCollection products = Product.list(ProductListParams.builder().setLimit(1L).build());
        return products.getData().get(0).getId();
    }

    // Obtener precio del producto
    public String[] getProductPrice(String productId) throws StripeException {
        PriceCollection prices = Price.list(PriceListParams.builder().setProduct(productId).setLimit(1L).build());
        Price price = prices.getData().get(0);
        return new String[]{price.getId(), price.getUnitAmount().toString(), price.getCurrency()};
    }

    // Crear pago
    public String createPayment(String customerId, String paymentMethodId, String productId, Long amount, String currency) throws StripeException {
        PaymentIntentCreateParams params =
                PaymentIntentCreateParams.builder()
                        .setAmount(amount)
                        .setCurrency(currency)
                        .setCustomer(customerId)
                        .setPaymentMethod(paymentMethodId)
                        .setConfirm(true)
                        .putMetadata("product_id", productId)
                        .build();

        PaymentIntent paymentIntent = PaymentIntent.create(params);
        return paymentIntent.getId();
    }
}
