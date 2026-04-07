package com.smartcampus.hub.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "resources")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String type; // e.g., LECTURE_HALL, LAB, EQUIPMENT

    private Integer capacity;
    
    private String location;

    @Column(nullable = false)
    private String status; // ACTIVE, OUT_OF_SERVICE

    private String description;
}
