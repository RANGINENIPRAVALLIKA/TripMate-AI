package com.tripmateai.entity;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.util.*;
@Entity @Table(name="users", indexes={@Index(name="idx_users_email",columnList="email"),@Index(name="idx_users_verified",columnList="is_verified")})
@Getter @Setter @NoArgsConstructor @EqualsAndHashCode(callSuper=true, onlyExplicitlyIncluded=true) @ToString
public class User extends BaseEntity {
    @NotBlank @Size(max=120) @Column(name="full_name",nullable=false,length=120) private String fullName;
    @NotBlank @Email @Size(max=255) @Column(nullable=false,unique=true,length=255) private String email;
    @NotBlank @Size(min=8,max=255) @JsonProperty(access=JsonProperty.Access.WRITE_ONLY) @Column(nullable=false,length=255) private String password;
    @Size(max=30) @Column(name="phone_number",length=30) private String phoneNumber;
    @Size(max=2048) @Column(name="profile_image",length=2048) private String profileImage;
    @Column(name="is_verified",nullable=false) private boolean isVerified;
    @Column(nullable=false) private boolean active=true;
    @ManyToMany(fetch=FetchType.EAGER) @JoinTable(name="user_roles",joinColumns=@JoinColumn(name="user_id"),inverseJoinColumns=@JoinColumn(name="role_id")) @ToString.Exclude private Set<Role> roles=new HashSet<>();
    @OneToMany(mappedBy="user",fetch=FetchType.LAZY,cascade=CascadeType.ALL,orphanRemoval=true) @ToString.Exclude private List<Trip> trips=new ArrayList<>();
}
