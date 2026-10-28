package com.tripmateai.entity;
import jakarta.persistence.*; import lombok.*;
@Entity @Table(name="saved_trips",uniqueConstraints=@UniqueConstraint(name="uk_saved_trip_user_trip",columnNames={"user_id","trip_id"}),indexes=@Index(name="idx_saved_trips_trip",columnList="trip_id")) @Getter @Setter @NoArgsConstructor @EqualsAndHashCode(callSuper=true,onlyExplicitlyIncluded=true) @ToString
public class SavedTrip extends BaseEntity { @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="user_id",nullable=false) @ToString.Exclude private User user; @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="trip_id",nullable=false) @ToString.Exclude private Trip trip; }
