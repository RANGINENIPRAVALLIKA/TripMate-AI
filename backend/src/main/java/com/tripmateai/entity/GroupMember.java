package com.tripmateai.entity;
import jakarta.persistence.*; import jakarta.validation.constraints.*; import lombok.*;
@Entity @Table(name="group_members",uniqueConstraints=@UniqueConstraint(name="uk_group_member",columnNames={"group_id","user_id"})) @Getter @Setter @NoArgsConstructor @EqualsAndHashCode(callSuper=true,onlyExplicitlyIncluded=true) @ToString
public class GroupMember extends BaseEntity { @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="group_id",nullable=false) @ToString.Exclude private Group group; @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="user_id",nullable=false) @ToString.Exclude private User user; @Column(nullable=false) private boolean active=true; @Size(max=30) @Column(length=30) private String memberRole="MEMBER"; }
