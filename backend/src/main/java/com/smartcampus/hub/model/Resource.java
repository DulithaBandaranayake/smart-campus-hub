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

    private String name;

    private String type;

    private Integer capacity;
    
    private String location;

    private String status;

    private String description;

    private String availabilityStart;

    private String availabilityEnd;

    @Column(columnDefinition = "TEXT")
    private String equipmentDetails;
    
    @PrePersist
    protected void onCreate() {
        if (status == null || status.isEmpty()) {
            status = "ACTIVE";
        }
    }
}