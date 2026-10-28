package com.tripmateai.entity;

import com.tripmateai.enums.*;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.Check;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Entity
@Table(
    name = "trips",
    indexes = {
        @Index(name = "idx_trips_user_status", columnList = "user_id,trip_status"),
        @Index(name = "idx_trips_destination_dates", columnList = "destination_id,start_date,end_date")
    }
)
@Check(name = "chk_trips_dates", constraints = "end_date >= start_date")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@ToString
public class Trip extends BaseEntity {

    @NotBlank
    @Size(max = 200)
    @Column(name = "trip_name", nullable = false, length = 200)
    private String tripName;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    @ToString.Exclude
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "destination_id", nullable = false)
    @ToString.Exclude
    private Destination destination;

    @NotNull
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @NotNull
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @NotNull
    @DecimalMin("0.00")
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal budget;

    @NotNull
    @Min(1)
    @Column(name = "number_of_travelers", nullable = false)
    private Integer numberOfTravelers;

    @Enumerated(EnumType.STRING)
    @Column(name = "trip_status", nullable = false, length = 20)
    private TripStatus tripStatus = TripStatus.PLANNING;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "trip_preferences", joinColumns = @JoinColumn(name = "trip_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "preference", length = 30)
    private Set<TravelPreference> preferences = new HashSet<>();

    @OneToMany(mappedBy = "trip", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private List<Itinerary> itineraries = new ArrayList<>();

    @OneToOne(mappedBy = "trip", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private Budget tripBudget;

    @OneToMany(mappedBy = "trip", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private List<Expense> expenses = new ArrayList<>();

    @OneToMany(mappedBy = "trip", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private List<Booking> bookings = new ArrayList<>();

    @OneToMany(mappedBy = "trip", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private List<TravelJournal> travelJournals = new ArrayList<>();

    @OneToMany(mappedBy = "trip", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private List<PackingChecklist> packingChecklists = new ArrayList<>();

    @OneToMany(mappedBy = "trip", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private List<Group> groups = new ArrayList<>();

    @OneToMany(mappedBy = "trip", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private List<SavedTrip> savedTrips = new ArrayList<>();
}
