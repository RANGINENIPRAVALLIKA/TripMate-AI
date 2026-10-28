package com.tripmateai.entity;
import com.tripmateai.enums.RoleName;
import jakarta.persistence.*;
import lombok.*;
import java.util.*;
@Entity @Table(name="roles", uniqueConstraints=@UniqueConstraint(name="uk_roles_name",columnNames="name"))
@Getter @Setter @NoArgsConstructor @EqualsAndHashCode(callSuper=true, onlyExplicitlyIncluded=true) @ToString
public class Role extends BaseEntity {
    @Enumerated(EnumType.STRING) @Column(nullable=false,length=30) private RoleName name;
    @Column(length=500) private String description;
    @ManyToMany(mappedBy="roles", fetch=FetchType.LAZY) @ToString.Exclude private Set<User> users=new HashSet<>();
}
