package com.nebrija.backend.security;

import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;
import java.util.Collections;

public class FirebaseAuthenticationToken extends AbstractAuthenticationToken {

    private final Object principal;
    private Object credentials;

    // Constructor para token no autenticado
    public FirebaseAuthenticationToken(Object principal, Object credentials) {
        super(Collections.emptyList());
        this.principal = principal;
        this.credentials = credentials;
        setAuthenticated(false);
    }

    // Constructor para token autenticado
    public FirebaseAuthenticationToken(Object principal, Object credentials,
                                       Collection<? extends GrantedAuthority> authorities) {
        super(authorities);
        this.principal = principal;
        this.credentials = credentials;
        super.setAuthenticated(true);
    }

    @Override
    public Object getCredentials() {
        return this.credentials;
    }

    @Override
    public Object getPrincipal() {
        return this.principal;
    }
}
