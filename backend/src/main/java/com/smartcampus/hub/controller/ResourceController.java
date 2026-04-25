package com.smartcampus.hub.controller;

import com.smartcampus.hub.dto.ResourceDTO;
import com.smartcampus.hub.service.ResourceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
public class ResourceController {

    @Autowired
    private ResourceService resourceService;

    @PostMapping
    public ResponseEntity<ResourceDTO> createResource(@jakarta.validation.Valid @RequestBody ResourceDTO resource) {
        return ResponseEntity.ok(resourceService.createResource(resource));
    }

    @GetMapping
    public ResponseEntity<List<ResourceDTO>> getAllResources() {
        return ResponseEntity.ok(resourceService.getAllResources());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResourceDTO> getResourceById(@PathVariable Long id) {
        return resourceService.getResourceById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResourceDTO> updateResource(@PathVariable Long id, @jakarta.validation.Valid @RequestBody ResourceDTO resourceDetails) {
        return ResponseEntity.ok(resourceService.updateResource(id, resourceDetails));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        resourceService.deleteResource(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/filter")
    public ResponseEntity<List<ResourceDTO>> findByType(@RequestParam String type) {
        return ResponseEntity.ok(resourceService.findByType(type));
    }
}
