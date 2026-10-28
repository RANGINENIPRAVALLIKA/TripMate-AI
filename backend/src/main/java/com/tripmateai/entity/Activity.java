package com.tripmateai.entity;
import com.tripmateai.enums.ActivityType; import jakarta.persistence.*; import jakarta.validation.constraints.*; import lombok.*; import java.math.BigDecimal; import java.time.LocalTime;
@Entity @Table(name="activities",uniqueConstraints=@UniqueConstraint(name="uk_activity_itinerary_order",columnNames={"itinerary_id","sort_order"}),indexes=@Index(name="idx_activities_itinerary",columnList="itinerary_id"))
@Getter @Setter @NoArgsConstructor @EqualsAndHashCode(callSuper=true,onlyExplicitlyIncluded=true) @ToString
public class Activity extends BaseEntity {
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="itinerary_id",nullable=false) @ToString.Exclude private Itinerary itinerary;
 @NotBlank @Size(max=200) @Column(nullable=false,length=200) private String title;
 @Size(max=5000) @Column(columnDefinition="TEXT") private String description;
 @Enumerated(EnumType.STRING) @Column(nullable=false,length=30) private ActivityType type=ActivityType.OTHER;
 @NotNull @Min(1) @Column(name="sort_order",nullable=false) private Integer sortOrder;
 @Column(name="start_time") private LocalTime startTime; @Column(name="end_time") private LocalTime endTime;
 @DecimalMin("0.00") @Column(name="estimated_cost",precision=12,scale=2) private BigDecimal estimatedCost;
 @Size(max=255) @Column(length=255) private String location;
}
