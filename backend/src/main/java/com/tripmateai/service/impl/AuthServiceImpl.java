package com.tripmateai.service.impl;

import com.tripmateai.dto.request.auth.*;
import com.tripmateai.dto.response.auth.*;
import com.tripmateai.dto.response.user.UserProfileResponse;
import com.tripmateai.entity.*;
import com.tripmateai.enums.RoleName;
import com.tripmateai.exception.*;
import com.tripmateai.mapper.UserMapper;
import com.tripmateai.repository.*;
import com.tripmateai.security.*;
import com.tripmateai.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository users;
    private final RoleRepository roles;
    private final PasswordEncoder encoder;
    private final AuthenticationManager manager;
    private final JwtService jwt;
    private final RefreshTokenService refresh;

    @Transactional
    public AuthResponse register(RegisterRequest r) {
        String normalizedEmail = r.email().trim().toLowerCase();
        if (users.existsByEmail(normalizedEmail)) {
            throw new BadRequestException("Email is already registered");
        }

        var u = new User();
        u.setFullName(r.fullName().trim());
        u.setEmail(normalizedEmail);
        u.setPhoneNumber(r.phoneNumber() != null ? r.phoneNumber().trim() : null);
        u.setPassword(encoder.encode(r.password()));
        u.getRoles().add(roles.findByName(RoleName.USER).orElseGet(() -> {
            var role = new Role();
            role.setName(RoleName.USER);
            role.setDescription("Default application user");
            return roles.save(role);
        }));

        return response(users.save(u));
    }

    @Transactional
    public AuthResponse login(LoginRequest r) {
        String normalizedEmail = r.email().trim().toLowerCase();
        manager.authenticate(new UsernamePasswordAuthenticationToken(normalizedEmail, r.password()));
        User user = users.findByEmail(normalizedEmail)
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));
        return response(user);
    }

    @Transactional
    public AuthResponse refresh(RefreshTokenRequest r) {
        var token = refresh.validate(r.refreshToken());
        refresh.revoke(r.refreshToken());
        return response(token.getUser());
    }

    @Transactional
    public void logout(RefreshTokenRequest r) {
        refresh.revoke(r.refreshToken());
    }

    @Transactional(readOnly = true)
    public UserProfileResponse me() {
        var p = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(p instanceof UserPrincipal principal)) {
            throw new UnauthorizedException("Authentication required");
        }
        return UserMapper.toProfile(principal.user());
    }

    private AuthResponse response(User u) {
        var rt = refresh.create(u);
        return new AuthResponse(
                UserMapper.toProfile(u),
                new JwtResponse(jwt.generate(u.getEmail(), 900), rt.getToken(), "Bearer")
        );
    }
}

