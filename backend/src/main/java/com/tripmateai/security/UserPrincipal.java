package com.tripmateai.security;

import com.tripmateai.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public record UserPrincipal(User user) implements UserDetails {
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (user == null || user.getRoles() == null) {
            return List.of();
        }
        return user.getRoles().stream()
                .map(r -> new SimpleGrantedAuthority("ROLE_" + r.getName().name()))
                .toList();
    }

    @Override
    public String getPassword() {
        return user != null ? user.getPassword() : null;
    }

    @Override
    public String getUsername() {
        return user != null ? user.getEmail() : null;
    }

    @Override
    public boolean isEnabled() {
        return user != null && user.isActive();
    }
}
