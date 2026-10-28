package com.tripmateai.entity;
import jakarta.persistence.*; import jakarta.validation.constraints.*; import lombok.*; import java.util.*;
@Entity @Table(name="travel_groups",indexes=@Index(name="idx_groups_trip",columnList="trip_id")) @Getter @Setter @NoArgsConstructor @EqualsAndHashCode(callSuper=true,onlyExplicitlyIncluded=true) @ToString
public class Group extends BaseEntity { @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="trip_id",nullable=false) @ToString.Exclude private Trip trip; @NotBlank @Size(max=150) @Column(nullable=false,length=150) private String name; @OneToMany(mappedBy="group",fetch=FetchType.LAZY,cascade=CascadeType.ALL,orphanRemoval=true) @ToString.Exclude private List<GroupMember> members=new ArrayList<>(); }
