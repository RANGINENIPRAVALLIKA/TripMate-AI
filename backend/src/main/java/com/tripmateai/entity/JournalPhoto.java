package com.tripmateai.entity;
import jakarta.persistence.*; import jakarta.validation.constraints.*; import lombok.*;
@Entity @Table(name="journal_photos",indexes=@Index(name="idx_journal_photos_journal",columnList="journal_id")) @Getter @Setter @NoArgsConstructor @EqualsAndHashCode(callSuper=true,onlyExplicitlyIncluded=true) @ToString
public class JournalPhoto extends BaseEntity { @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="journal_id",nullable=false) @ToString.Exclude private TravelJournal journal; @NotBlank @Size(max=2048) @Column(name="image_url",nullable=false,length=2048) private String imageUrl; @Size(max=500) @Column(length=500) private String caption; @Column(name="sort_order",nullable=false) private Integer sortOrder=1; }
