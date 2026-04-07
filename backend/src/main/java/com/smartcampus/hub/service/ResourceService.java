package com.smartcampus.hub.service;

import com.smartcampus.hub.dto.ResourceDTO;
import com.smartcampus.hub.model.Resource;
import com.smartcampus.hub.repository.ResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ResourceService {

    @Autowired
    private ResourceRepository resourceRepository;

    public ResourceDTO createResource(ResourceDTO resourceDTO) {
        Resource resource = new Resource();
        mapDtoToEntity(resourceDTO, resource);
        Resource saved = resourceRepository.save(resource);
        return mapEntityToDto(saved);
    }

    public List<ResourceDTO> getAllResources() {
        return resourceRepository.findAll().stream()
                .map(this::mapEntityToDto)
                .toList();
    }

    public Optional<ResourceDTO> getResourceById(Long id) {
        if (id == null) throw new IllegalArgumentException("ID cannot be null");
        return resourceRepository.findById(java.util.Objects.requireNonNull(id)).map(this::mapEntityToDto);
    }

    public ResourceDTO updateResource(Long id, ResourceDTO resourceDTO) {
        if (id == null) throw new IllegalArgumentException("ID cannot be null");
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found with id: " + id));

        mapDtoToEntity(resourceDTO, resource);
        Resource updated = resourceRepository.save(java.util.Objects.requireNonNull(resource));
        return mapEntityToDto(updated);
    }

    public void deleteResource(Long id) {
        if (id == null) throw new IllegalArgumentException("ID cannot be null");
        resourceRepository.deleteById(id);
    }

    public List<ResourceDTO> findByType(String type) {
        return resourceRepository.findByType(type).stream()
                .map(this::mapEntityToDto)
                .toList();
    }

    private ResourceDTO mapEntityToDto(Resource resource) {
        return new ResourceDTO(
                resource.getId(),
                resource.getName(),
                resource.getType(),
                resource.getCapacity(),
                resource.getLocation(),
                resource.getStatus(),
                resource.getDescription()
        );
    }

    private void mapDtoToEntity(ResourceDTO dto, Resource entity) {
        entity.setName(dto.getName());
        entity.setType(dto.getType());
        entity.setCapacity(dto.getCapacity());
        entity.setLocation(dto.getLocation());
        entity.setStatus(dto.getStatus());
        entity.setDescription(dto.getDescription());
    }
}
