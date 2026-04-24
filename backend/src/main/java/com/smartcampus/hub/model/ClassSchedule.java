package com.smartcampus.hub.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "class_schedules")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClassSchedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @Column(nullable = false)
    private String dayOfWeek; // MON, TUE, WED, THU, FRI

    @Column(nullable = false)
    private String startTime; // "09:00"

    @Column(nullable = false)
    private String endTime; // "10:30"

    private String room;

    private String semester;

    private String gradeLevel; // target grade level
}
