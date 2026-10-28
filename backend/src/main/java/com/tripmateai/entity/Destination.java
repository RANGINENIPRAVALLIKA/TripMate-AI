package com.tripmateai.entity;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.*;
@Entity @Table(name="destinations",indexes={@Index(name="idx_destinations_country_city",columnList="country,city")})
@Getter @Setter @NoArgsConstructor @EqualsAndHashCode(callSuper=true, onlyExplicitlyIncluded=true) @ToString
public class Destination extends BaseEntity {
 @NotBlank @Size(max=120) @Column(nullable=false,length=120) private String city;
 @Size(max=120) @Column(length=120) private String state;
 @NotBlank @Size(max=120) @Column(nullable=false,length=120) private String country;
 @Size(max=5000) @Column(columnDefinition="TEXT") private String description;
 @Size(max=2048) @Column(name="image_url",length=2048) private String imageUrl;
 @Size(max=100) @Column(name="best_season",length=100) private String bestSeason;
 @DecimalMin("0.00") @Column(name="average_budget",precision=12,scale=2) private BigDecimal averageBudget;
 @DecimalMin("-90.0") @DecimalMax("90.0") @Column(precision=10,scale=7) private BigDecimal latitude;
 @DecimalMin("-180.0") @DecimalMax("180.0") @Column(precision=10,scale=7) private BigDecimal longitude;
 @OneToMany(mappedBy="destination",fetch=FetchType.LAZY) @ToString.Exclude private List<Trip> trips=new ArrayList<>();
}
