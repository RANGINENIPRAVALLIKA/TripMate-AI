package com.tripmateai.service.impl;

import com.tripmateai.dto.request.auth.ChangePasswordRequest;
import com.tripmateai.dto.request.auth.ForgotPasswordRequest;
import com.tripmateai.dto.request.auth.ResetPasswordRequest;
import com.tripmateai.entity.PasswordResetToken;
import com.tripmateai.exception.BadRequestException;
import com.tripmateai.exception.UnauthorizedException;
import com.tripmateai.repository.PasswordResetTokenRepository;
import com.tripmateai.repository.UserRepository;
import com.tripmateai.security.UserPrincipal;
import com.tripmateai.service.PasswordResetService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordResetServiceImpl implements PasswordResetService {

    private static final String RESET_REQUEST_MESSAGE = "If an account exists for that email, password reset instructions have been generated.";

    private final UserRepository users;
    private final PasswordResetTokenRepository tokens;
    private final PasswordEncoder encoder;

    @Value("${app.auth.expose-password-reset-token:false}")
    private boolean exposePasswordResetToken;

    @Override
    public String create(ForgotPasswordRequest request) {
        var user = users.findByEmail(request.email()).orElse(null);
        if (user == null) {
            return RESET_REQUEST_MESSAGE;
        }

        var token = new PasswordResetToken();
        token.setUser(user);
        token.setToken(UUID.randomUUID().toString());
        token.setExpiresAt(LocalDateTime.now().plusMinutes(30));
        tokens.save(token);

        return exposePasswordResetToken ? token.getToken() : RESET_REQUEST_MESSAGE;
    }

    @Override
    public void reset(ResetPasswordRequest request) {
        var token = tokens.findByToken(request.token())
                .orElseThrow(() -> new BadRequestException("Invalid reset token"));
        if (token.getUsedAt() != null || token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Expired reset token");
        }
        token.getUser().setPassword(encoder.encode(request.newPassword()));
        token.setUsedAt(LocalDateTime.now());
        users.save(token.getUser());
        tokens.save(token);
    }

    @Override
    public void change(ChangePasswordRequest request) {
        var principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(principal instanceof UserPrincipal userPrincipal)) {
            throw new UnauthorizedException("Authentication required");
        }
        if (!encoder.matches(request.currentPassword(), userPrincipal.user().getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }
        userPrincipal.user().setPassword(encoder.encode(request.newPassword()));
        users.save(userPrincipal.user());
    }
}
