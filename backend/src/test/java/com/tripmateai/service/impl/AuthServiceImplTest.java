package com.tripmateai.service.impl;

import com.tripmateai.entity.User;
import com.tripmateai.exception.UnauthorizedException;
import com.tripmateai.repository.RoleRepository;
import com.tripmateai.repository.UserRepository;
import com.tripmateai.security.JwtService;
import com.tripmateai.security.UserPrincipal;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock private UserRepository users;
    @Mock private RoleRepository roles;
    @Mock private PasswordEncoder encoder;
    @Mock private AuthenticationManager manager;
    @Mock private JwtService jwt;
    @Mock private com.tripmateai.service.RefreshTokenService refresh;
    @InjectMocks private AuthServiceImpl service;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void rejectsAnonymousPrincipalWhenReadingCurrentUser() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("anonymousUser", null));

        assertThatThrownBy(service::me)
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("Authentication required");
    }

    @Test
    void returnsProfileForAuthenticatedPrincipal() {
        User user = new User();
        user.setId(7L);
        user.setFullName("Ada Lovelace");
        user.setEmail("ada@example.com");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(new UserPrincipal(user), null));

        var profile = service.me();

        assertThat(profile.id()).isEqualTo(7L);
        assertThat(profile.email()).isEqualTo("ada@example.com");
    }
}
