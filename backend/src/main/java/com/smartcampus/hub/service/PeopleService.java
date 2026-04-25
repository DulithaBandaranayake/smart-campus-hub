package com.smartcampus.hub.service;

import com.smartcampus.hub.dto.StudentDTO;
import com.smartcampus.hub.dto.ParentDTO;
import com.smartcampus.hub.dto.LecturerDTO;
import com.smartcampus.hub.model.Student;
import com.smartcampus.hub.model.Parent;
import com.smartcampus.hub.model.Lecturer;
import com.smartcampus.hub.model.User;
import com.smartcampus.hub.repository.StudentRepository;
import com.smartcampus.hub.repository.ParentRepository;
import com.smartcampus.hub.repository.LecturerRepository;
import com.smartcampus.hub.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PeopleService {

    @Autowired private StudentRepository studentRepository;
    @Autowired private ParentRepository parentRepository;
    @Autowired private LecturerRepository lecturerRepository;
    @Autowired private UserRepository userRepository;

    // Students
    public List<StudentDTO> getAllStudents() {
        return studentRepository.findAll().stream()
                .map(this::mapStudentToDTO)
                .collect(Collectors.toList());
    }

    public List<StudentDTO> getStudentsByParentId(Long parentId) {
        return studentRepository.findByParentId(parentId).stream()
                .map(this::mapStudentToDTO)
                .collect(Collectors.toList());
    }

    public List<StudentDTO> getStudentsByUserId(Long userId) {
        return studentRepository.findByUserId(userId).stream()
                .map(this::mapStudentToDTO)
                .collect(Collectors.toList());
    }

    public StudentDTO getStudentById(Long id) {
        return studentRepository.findById(id)
                .map(this::mapStudentToDTO)
                .orElse(null);
    }

    public StudentDTO getStudentByEmail(String email) {
        return studentRepository.findByUserEmail(email)
                .map(this::mapStudentToDTO)
                .orElse(null);
    }

    public StudentDTO createStudent(StudentDTO dto) {
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Student student = new Student();
        student.setUser(user);
        student.setGrade(dto.getGrade());
        student.setEnrollmentDate(java.time.LocalDate.now());
        
        if (dto.getParentId() != null) {
            parentRepository.findById(dto.getParentId())
                .ifPresent(student::setParent);
        }
        
        return mapStudentToDTO(studentRepository.save(student));
    }

    public StudentDTO updateStudent(Long id, StudentDTO dto) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        if (dto.getGrade() != null) student.setGrade(dto.getGrade());
        if (dto.getParentId() != null) {
            parentRepository.findById(dto.getParentId())
                .ifPresent(student::setParent);
        }
        return mapStudentToDTO(studentRepository.save(student));
    }

    public void deleteStudent(Long id) {
        studentRepository.deleteById(id);
    }

    private StudentDTO mapStudentToDTO(Student s) {
        StudentDTO dto = new StudentDTO();
        dto.setId(s.getId());
        if (s.getUser() != null) {
            dto.setUserId(s.getUser().getId());
            dto.setUserName(s.getUser().getName());
            dto.setUserEmail(s.getUser().getEmail());
        }
        dto.setGrade(s.getGrade());
        dto.setEnrollmentDate(s.getEnrollmentDate() != null ? s.getEnrollmentDate().toString() : null);
        if (s.getParent() != null) {
            dto.setParentId(s.getParent().getId());
            if (s.getParent().getUser() != null) {
                dto.setParentName(s.getParent().getUser().getName());
            }
        }
        return dto;
    }

    // Parents
    public List<ParentDTO> getAllParents() {
        return parentRepository.findAll().stream()
                .map(this::mapParentToDTO)
                .collect(Collectors.toList());
    }

    public List<ParentDTO> getParentsByUserId(Long userId) {
        return parentRepository.findByUserId(userId).stream()
                .map(this::mapParentToDTO)
                .collect(Collectors.toList());
    }

    public ParentDTO getParentById(Long id) {
        return parentRepository.findById(id)
                .map(this::mapParentToDTO)
                .orElse(null);
    }

    public ParentDTO createParent(ParentDTO dto) {
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Parent parent = new Parent();
        parent.setUser(user);
        parent.setPhoneNumber(dto.getPhoneNumber());
        parent.setAddress(dto.getAddress());
        
        return mapParentToDTO(parentRepository.save(parent));
    }

    public ParentDTO updateParent(Long id, ParentDTO dto) {
        Parent parent = parentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Parent not found"));
        if (dto.getPhoneNumber() != null) parent.setPhoneNumber(dto.getPhoneNumber());
        if (dto.getAddress() != null) parent.setAddress(dto.getAddress());
        return mapParentToDTO(parentRepository.save(parent));
    }

    public void deleteParent(Long id) {
        parentRepository.deleteById(id);
    }

    private ParentDTO mapParentToDTO(Parent p) {
        ParentDTO dto = new ParentDTO();
        dto.setId(p.getId());
        if (p.getUser() != null) {
            dto.setUserId(p.getUser().getId());
            dto.setUserName(p.getUser().getName());
            dto.setUserEmail(p.getUser().getEmail());
        }
        dto.setPhoneNumber(p.getPhoneNumber());
        dto.setAddress(p.getAddress());
        return dto;
    }

    // Lecturers
    public List<LecturerDTO> getAllLecturers() {
        return lecturerRepository.findAll().stream()
                .map(this::mapLecturerToDTO)
                .collect(Collectors.toList());
    }

    public List<LecturerDTO> getLecturersByUserId(Long userId) {
        return lecturerRepository.findByUserId(userId).stream()
                .map(this::mapLecturerToDTO)
                .collect(Collectors.toList());
    }

    public LecturerDTO getLecturerById(Long id) {
        return lecturerRepository.findById(id)
                .map(this::mapLecturerToDTO)
                .orElse(null);
    }

    public LecturerDTO createLecturer(LecturerDTO dto) {
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Lecturer lecturer = new Lecturer();
        lecturer.setUser(user);
        lecturer.setDepartment(dto.getDepartment());
        lecturer.setEmployeeId(dto.getEmployeeId());
        
        return mapLecturerToDTO(lecturerRepository.save(lecturer));
    }

    public LecturerDTO updateLecturer(Long id, LecturerDTO dto) {
        Lecturer lecturer = lecturerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lecturer not found"));
        if (dto.getDepartment() != null) lecturer.setDepartment(dto.getDepartment());
        if (dto.getEmployeeId() != null) lecturer.setEmployeeId(dto.getEmployeeId());
        return mapLecturerToDTO(lecturerRepository.save(lecturer));
    }

    public void deleteLecturer(Long id) {
        lecturerRepository.deleteById(id);
    }

    private LecturerDTO mapLecturerToDTO(Lecturer l) {
        LecturerDTO dto = new LecturerDTO();
        dto.setId(l.getId());
        if (l.getUser() != null) {
            dto.setUserId(l.getUser().getId());
            dto.setUserName(l.getUser().getName());
            dto.setUserEmail(l.getUser().getEmail());
        }
        dto.setDepartment(l.getDepartment());
        dto.setEmployeeId(l.getEmployeeId());
        return dto;
    }
}