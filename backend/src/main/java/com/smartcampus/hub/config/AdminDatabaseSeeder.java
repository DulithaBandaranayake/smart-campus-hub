package com.smartcampus.hub.config;

import com.smartcampus.hub.model.*;
import com.smartcampus.hub.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class AdminDatabaseSeeder implements CommandLineRunner {

    @Autowired private UserRepository userRepository;
    @Autowired private StudentRepository studentRepository;
    @Autowired private ParentRepository parentRepository;
    @Autowired private LecturerRepository lecturerRepository;
    @Autowired private SubjectRepository subjectRepository;
    @Autowired private MarkRepository markRepository;
    @Autowired private AttendanceRepository attendanceRepository;
    @Autowired private ClassScheduleRepository scheduleRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            System.out.println("--- Database already contains users. Skipping initial seeding. ---");
            return;
        }
        // 1. Create Admin
        if (!userRepository.existsByEmail("admin@smartcampus.com")) {
            User admin = new User();
            admin.setName("System Admin");
            admin.setEmail("admin@smartcampus.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole("ADMIN");
            userRepository.save(admin);
            System.out.println("--- Admin Created: admin@smartcampus.com / admin123 ---");
        }

        // 2. Create Dummy Parent
        if (!userRepository.existsByEmail("parent@example.com")) {
            User parentUser = new User();
            parentUser.setName("John Parent");
            parentUser.setEmail("parent@example.com");
            parentUser.setPassword(passwordEncoder.encode("password123"));
            parentUser.setRole("PARENT");
            userRepository.save(parentUser);

            Parent parent = new Parent();
            parent.setUser(parentUser);
            parent.setPhoneNumber("+1 555-0199");
            parent.setAddress("123 Education Lane");
            parentRepository.save(parent);

            // 3. Create Dummy Student (linked to Parent)
            User studentUser = new User();
            studentUser.setName("Alice Student");
            studentUser.setEmail("alice@example.com");
            studentUser.setPassword(passwordEncoder.encode("password123"));
            studentUser.setRole("STUDENT");
            userRepository.save(studentUser);

            Student student = new Student();
            student.setUser(studentUser);
            student.setParent(parent);
            student.setGrade("Year 1");
            student.setEnrollmentDate(LocalDate.now().minusMonths(6));
            studentRepository.save(student);

            // 4. Create Dummy Lecturer
            User lecturerUser = new User();
            lecturerUser.setName("Dr. Smith");
            lecturerUser.setEmail("smith@example.com");
            lecturerUser.setPassword(passwordEncoder.encode("password123"));
            lecturerUser.setRole("LECTURER");
            userRepository.save(lecturerUser);

            Lecturer lecturer = new Lecturer();
            lecturer.setUser(lecturerUser);
            lecturer.setDepartment("Computer Science");
            lecturer.setEmployeeId("EMP-001");
            lecturerRepository.save(lecturer);

            // 5. Create Dummy Subject
            Subject subject = new Subject();
            subject.setName("Introduction to Java");
            subject.setCode("CS101");
            subject.setGradeLevel("Year 1");
            subject.setLecturer(lecturer);
            subjectRepository.save(subject);

            // 6. Create Dummy Schedule
            ClassSchedule sched = new ClassSchedule();
            sched.setSubject(subject);
            sched.setDayOfWeek("MON");
            sched.setStartTime("09:00");
            sched.setEndTime("10:30");
            sched.setRoom("Lab A");
            scheduleRepository.save(sched);

            // 7. Create Dummy Mark
            Mark mark = new Mark();
            mark.setStudent(student);
            mark.setSubject(subject);
            mark.setScore(85.0);
            mark.setMaxScore(100.0);
            mark.setExamType("Midterm");
            mark.setSemester("Semester 1 2024");
            mark.setRecordedAt(LocalDateTime.now());
            markRepository.save(mark);

            // 8. Create Dummy Attendance
            Attendance att = new Attendance();
            att.setStudent(student);
            att.setDate(LocalDate.now());
            att.setStatus("PRESENT");
            att.setNote("On time");
            attendanceRepository.save(att);

            System.out.println("--- Demo Data Seeded Successfully ---");
        }
    }
}
