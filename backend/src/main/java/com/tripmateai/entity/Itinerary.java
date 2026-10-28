package com.tripmateai.entity;
import jakarta.persistence.*; import jakarta.validation.constraints.*; import lombok.*; import java.util.*;
@Entity @Table(name="itineraries",uniqueConstraints=@UniqueConstraint(name="uk_itinerary_trip_day",columnNames={"trip_id","day_number"}),indexes=@Index(name="idx_itinerary_trip_day",columnList="trip_id,day_number"))
@Getter @Setter @NoArgsConstructor @EqualsAndHashCode(callSuper=true,onlyExplicitlyIncluded=true) @ToString
public class Itinerary extends BaseEntity {
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="trip_id",nullable=false) @ToString.Exclude private Trip trip;
 @NotNull @Min(1) @Column(name="day_number",nullable=false) private Integer dayNumber;
 @Size(max=300) @Column(length=300) private String title;
 @Size(max=5000) @Column(columnDefinition="TEXT") private String description;
 @OneToMany(mappedBy="itinerary",fetch=FetchType.LAZY,cascade=CascadeType.ALL,orphanRemoval=true) @OrderBy("sortOrder ASC") @ToString.Exclude private List<Activity> activities=new ArrayList<>();
}
