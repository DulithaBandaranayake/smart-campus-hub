package com.smartcampus.hub.config;

import com.smartcampus.hub.model.*;
import com.smartcampus.hub.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;

@Component
public class AdminDatabaseSeeder implements CommandLineRunner {

    @Autowired private UserRepository userRepository;
    @Autowired private StudentRepository studentRepository;
    @Autowired private ParentRepository parentRepository;
    @Autowired private LecturerRepository lecturerRepository;
    @Autowired private SubjectRepository subjectRepository;
    @Autowired private ClassScheduleRepository classScheduleRepository;
    @Autowired private AttendanceRepository attendanceRepository;
    @Autowired private MarkRepository markRepository;
    @Autowired private LeaveRequestRepository leaveRequestRepository;
    @Autowired private ResourceRepository resourceRepository;
    @Autowired private BookingRepository bookingRepository;
    @Autowired private TicketRepository ticketRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            System.out.println("--- Database already contains data. Skipping seeding. ---");
            return;
        }

        seedUsers();
        seedParentsAndStudents();
        seedLecturers();
        seedSubjects();
        seedClassSchedules();
        seedAttendance();
        seedMarks();
        seedLeaveRequests();
        seedResources();
        seedBookings();
        seedTickets();

        System.out.println("--- Full Database seeding complete ---");
    }

    private void seedUsers() {
        User admin = new User();
        admin.setName("System Admin");
        admin.setEmail("admin@smartcampus.com");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setRole("ADMIN");
        admin.setEnabled(true);
        admin.setApproved(true);
        userRepository.save(admin);

        User tech = new User();
        tech.setName("John Technician");
        tech.setEmail("tech@smartcampus.com");
        tech.setPassword(passwordEncoder.encode("tech123"));
        tech.setRole("TECHNICIAN");
        tech.setEnabled(true);
        tech.setApproved(true);
        userRepository.save(tech);

        User lecturer1 = new User();
        lecturer1.setName("Dr. Sarah Johnson");
        lecturer1.setEmail("sarah.johnson@smartcampus.com");
        lecturer1.setPassword(passwordEncoder.encode("lecturer123"));
        lecturer1.setRole("LECTURER");
        lecturer1.setEnabled(true);
        lecturer1.setApproved(true);
        userRepository.save(lecturer1);

        User lecturer2 = new User();
        lecturer2.setName("Prof. Michael Chen");
        lecturer2.setEmail("michael.chen@smartcampus.com");
        lecturer2.setPassword(passwordEncoder.encode("lecturer123"));
        lecturer2.setRole("LECTURER");
        lecturer2.setEnabled(true);
        lecturer2.setEnabled(true);
        lecturer2.setApproved(true);
        userRepository.save(lecturer2);

        User parent1 = new User();
        parent1.setName("James Wilson");
        parent1.setEmail("james.wilson@smartcampus.com");
        parent1.setPassword(passwordEncoder.encode("parent123"));
        parent1.setRole("PARENT");
        parent1.setEnabled(true);
        parent1.setApproved(true);
        parent1.setPreferredContact("Email");
        userRepository.save(parent1);

        User parent2 = new User();
        parent2.setName("Emily Brown");
        parent2.setEmail("emily.brown@smartcampus.com");
        parent2.setPassword(passwordEncoder.encode("parent123"));
        parent2.setRole("PARENT");
        parent2.setEnabled(true);
        parent2.setApproved(true);
        parent2.setPreferredContact("Phone");
        userRepository.save(parent2);

        User parent3 = new User();
        parent3.setName("Robert Davis");
        parent3.setEmail("robert.davis@smartcampus.com");
        parent3.setPassword(passwordEncoder.encode("parent123"));
        parent3.setRole("PARENT");
        parent3.setEnabled(true);
        parent3.setApproved(true);
        parent3.setPreferredContact("Email");
        userRepository.save(parent3);

        User studentUser1 = new User();
        studentUser1.setName("Alice Smith");
        studentUser1.setEmail("alice.smith@smartcampus.com");
        studentUser1.setPassword(passwordEncoder.encode("student123"));
        studentUser1.setRole("STUDENT");
        studentUser1.setEnabled(true);
        studentUser1.setApproved(true);
        userRepository.save(studentUser1);

        User studentUser2 = new User();
        studentUser2.setName("Bob Johnson");
        studentUser2.setEmail("bob.johnson@smartcampus.com");
        studentUser2.setPassword(passwordEncoder.encode("student123"));
        studentUser2.setRole("STUDENT");
        studentUser2.setEnabled(true);
        userRepository.save(studentUser2);

        User studentUser3 = new User();
        studentUser3.setName("Carol White");
        studentUser3.setEmail("carol.white@smartcampus.com");
        studentUser3.setPassword(passwordEncoder.encode("student123"));
        studentUser3.setRole("STUDENT");
        studentUser3.setEnabled(true);
        userRepository.save(studentUser3);

        User studentUser4 = new User();
        studentUser4.setName("David Lee");
        studentUser4.setEmail("david.lee@smartcampus.com");
        studentUser4.setPassword(passwordEncoder.encode("student123"));
        studentUser4.setRole("STUDENT");
        studentUser4.setEnabled(true);
        userRepository.save(studentUser4);

        User studentUser5 = new User();
        studentUser5.setName("Eva Martinez");
        studentUser5.setEmail("eva.martinez@smartcampus.com");
        studentUser5.setPassword(passwordEncoder.encode("student123"));
        studentUser5.setRole("STUDENT");
        studentUser5.setEnabled(true);
        userRepository.save(studentUser5);

        System.out.println("--- Users Seeded ---");
    }

    private void seedParentsAndStudents() {
        List<User> parents = userRepository.findAll().stream()
                .filter(u -> "PARENT".equals(u.getRole()))
                .toList();

        List<User> students = userRepository.findAll().stream()
                .filter(u -> "STUDENT".equals(u.getRole()))
                .toList();

        if (parents.size() >= 3 && students.size() >= 5) {
            Parent p1 = new Parent();
            p1.setUser(parents.get(0));
            p1.setPhoneNumber("+1-555-0101");
            p1.setAddress("123 Oak Street, Springfield");
            parentRepository.save(p1);

            Parent p2 = new Parent();
            p2.setUser(parents.get(1));
            p2.setPhoneNumber("+1-555-0102");
            p2.setAddress("456 Maple Avenue, Springfield");
            parentRepository.save(p2);

            Parent p3 = new Parent();
            p3.setUser(parents.get(2));
            p3.setPhoneNumber("+1-555-0103");
            p3.setAddress("789 Pine Road, Springfield");
            parentRepository.save(p3);

            Student s1 = new Student();
            s1.setUser(students.get(0));
            s1.setGrade("Grade 10");
            s1.setEnrollmentDate(LocalDate.of(2024, 1, 15));
            s1.setParent(p1);
            studentRepository.save(s1);

            Student s2 = new Student();
            s2.setUser(students.get(1));
            s2.setGrade("Grade 10");
            s2.setEnrollmentDate(LocalDate.of(2024, 1, 15));
            s2.setParent(p1);
            studentRepository.save(s2);

            Student s3 = new Student();
            s3.setUser(students.get(2));
            s3.setGrade("Grade 11");
            s3.setEnrollmentDate(LocalDate.of(2023, 9, 1));
            s3.setParent(p2);
            studentRepository.save(s3);

            Student s4 = new Student();
            s4.setUser(students.get(3));
            s4.setGrade("Grade 11");
            s4.setEnrollmentDate(LocalDate.of(2023, 9, 1));
            s4.setParent(p2);
            studentRepository.save(s4);

            Student s5 = new Student();
            s5.setUser(students.get(4));
            s5.setGrade("Grade 9");
            s5.setEnrollmentDate(LocalDate.of(2025, 1, 10));
            s5.setParent(p3);
            studentRepository.save(s5);

            System.out.println("--- Parents and Students Seeded ---");
        }
    }

    private void seedLecturers() {
        List<User> lecturers = userRepository.findAll().stream()
                .filter(u -> "LECTURER".equals(u.getRole()))
                .toList();

        Lecturer l1 = new Lecturer();
        l1.setUser(lecturers.get(0));
        l1.setDepartment("Computer Science");
        l1.setEmployeeId("CS001");
        lecturerRepository.save(l1);

        Lecturer l2 = new Lecturer();
        l2.setUser(lecturers.get(1));
        l2.setDepartment("Mathematics");
        l2.setEmployeeId("MATH001");
        lecturerRepository.save(l2);

        System.out.println("--- Lecturers Seeded ---");
    }

    private void seedSubjects() {
        List<Lecturer> lecturers = lecturerRepository.findAll();

        Subject sub1 = new Subject();
        sub1.setName("Introduction to Programming");
        sub1.setCode("CS101");
        sub1.setGradeLevel("Year 1");
        sub1.setDescription("Basic programming concepts using Java");
        sub1.setLecturer(lecturers.get(0));
        subjectRepository.save(sub1);

        Subject sub2 = new Subject();
        sub2.setName("Data Structures");
        sub2.setCode("CS201");
        sub2.setGradeLevel("Year 2");
        sub2.setDescription("Arrays, Linked Lists, Trees, Graphs");
        sub2.setLecturer(lecturers.get(0));
        subjectRepository.save(sub2);

        Subject sub3 = new Subject();
        sub3.setName("Calculus I");
        sub3.setCode("MATH101");
        sub3.setGradeLevel("Year 1");
        sub3.setDescription("Differential Calculus");
        sub3.setLecturer(lecturers.get(1));
        subjectRepository.save(sub3);

        Subject sub4 = new Subject();
        sub4.setName("Linear Algebra");
        sub4.setCode("MATH201");
        sub4.setGradeLevel("Year 2");
        sub4.setDescription("Matrices and Vector Spaces");
        sub4.setLecturer(lecturers.get(1));
        subjectRepository.save(sub4);

        Subject sub5 = new Subject();
        sub5.setName("Web Development");
        sub5.setCode("CS301");
        sub5.setGradeLevel("Year 3");
        sub5.setDescription("Full-stack web development");
        sub5.setLecturer(lecturers.get(0));
        subjectRepository.save(sub5);

        System.out.println("--- Subjects Seeded ---");
    }

    private void seedClassSchedules() {
        List<Subject> subjects = subjectRepository.findAll();

        ClassSchedule cs1 = new ClassSchedule();
        cs1.setSubject(subjects.get(0));
        cs1.setDayOfWeek("MON");
        cs1.setStartTime("09:00");
        cs1.setEndTime("10:30");
        cs1.setRoom("Room 101");
        cs1.setSemester("Semester 1 2026");
        cs1.setGradeLevel("Year 1");
        classScheduleRepository.save(cs1);

        ClassSchedule cs2 = new ClassSchedule();
        cs2.setSubject(subjects.get(0));
        cs2.setDayOfWeek("WED");
        cs2.setStartTime("09:00");
        cs2.setEndTime("10:30");
        cs2.setRoom("Room 101");
        cs2.setSemester("Semester 1 2026");
        cs2.setGradeLevel("Year 1");
        classScheduleRepository.save(cs2);

        ClassSchedule cs3 = new ClassSchedule();
        cs3.setSubject(subjects.get(1));
        cs3.setDayOfWeek("TUE");
        cs3.setStartTime("11:00");
        cs3.setEndTime("12:30");
        cs3.setRoom("Lab 1");
        cs3.setSemester("Semester 1 2026");
        cs3.setGradeLevel("Year 2");
        classScheduleRepository.save(cs3);

        ClassSchedule cs4 = new ClassSchedule();
        cs4.setSubject(subjects.get(2));
        cs4.setDayOfWeek("MON");
        cs4.setStartTime("14:00");
        cs4.setEndTime("15:30");
        cs4.setRoom("Room 201");
        cs4.setSemester("Semester 1 2026");
        cs4.setGradeLevel("Year 1");
        classScheduleRepository.save(cs4);

        ClassSchedule cs5 = new ClassSchedule();
        cs5.setSubject(subjects.get(2));
        cs5.setDayOfWeek("FRI");
        cs5.setStartTime("14:00");
        cs5.setEndTime("15:30");
        cs5.setRoom("Room 201");
        cs5.setSemester("Semester 1 2026");
        cs5.setGradeLevel("Year 1");
        classScheduleRepository.save(cs5);

        ClassSchedule cs6 = new ClassSchedule();
        cs6.setSubject(subjects.get(3));
        cs6.setDayOfWeek("THU");
        cs6.setStartTime("09:00");
        cs6.setEndTime("10:30");
        cs6.setRoom("Room 202");
        cs6.setSemester("Semester 1 2026");
        cs6.setGradeLevel("Year 2");
        classScheduleRepository.save(cs6);

        System.out.println("--- Class Schedules Seeded ---");
    }

    private void seedAttendance() {
        List<Student> students = studentRepository.findAll();
        LocalDate today = LocalDate.now();

        for (Student student : students) {
            for (int i = 0; i < 5; i++) {
                Attendance att = new Attendance();
                att.setStudent(student);
                att.setDate(today.minusDays(i));
                att.setStatus(i == 0 ? "PRESENT" : (i == 1 ? "ABSENT" : "PRESENT"));
                att.setNote(i == 1 ? "Sick leave" : null);
                attendanceRepository.save(att);
            }
        }

        System.out.println("--- Attendance Seeded ---");
    }

    private void seedMarks() {
        List<Student> students = studentRepository.findAll();
        List<Subject> subjects = subjectRepository.findAll();

        for (Student student : students) {
            for (Subject subject : subjects) {
                Mark mark = new Mark();
                mark.setStudent(student);
                mark.setSubject(subject);
                mark.setScore(70.0 + Math.random() * 25);
                mark.setMaxScore(100.0);
                mark.setExamType("Midterm");
                mark.setSemester("Semester 1 2026");
                mark.setRecordedAt(LocalDateTime.now());
                markRepository.save(mark);

                Mark mark2 = new Mark();
                mark2.setStudent(student);
                mark2.setSubject(subject);
                mark2.setScore(65.0 + Math.random() * 30);
                mark2.setMaxScore(100.0);
                mark2.setExamType("Assignment");
                mark2.setSemester("Semester 1 2026");
                mark2.setRecordedAt(LocalDateTime.now());
                markRepository.save(mark2);
            }
        }

        System.out.println("--- Marks Seeded ---");
    }

    private void seedLeaveRequests() {
        List<Student> students = studentRepository.findAll();

        LeaveRequest lr1 = new LeaveRequest();
        lr1.setStudent(students.get(0));
        lr1.setReason("Medical appointment");
        lr1.setStartDate(LocalDate.now().plusDays(2));
        lr1.setEndDate(LocalDate.now().plusDays(2));
        lr1.setStatus("PENDING_PARENT");
        lr1.setCreatedAt(LocalDateTime.now());
        leaveRequestRepository.save(lr1);

        LeaveRequest lr2 = new LeaveRequest();
        lr2.setStudent(students.get(1));
        lr2.setReason("Family event");
        lr2.setStartDate(LocalDate.now().plusDays(5));
        lr2.setEndDate(LocalDate.now().plusDays(6));
        lr2.setStatus("PENDING_ADMIN");
        lr2.setParentComment("Approved by parent");
        lr2.setCreatedAt(LocalDateTime.now().minusDays(1));
        leaveRequestRepository.save(lr2);

        LeaveRequest lr3 = new LeaveRequest();
        lr3.setStudent(students.get(2));
        lr3.setReason("Sick leave");
        lr3.setStartDate(LocalDate.now().minusDays(2));
        lr3.setEndDate(LocalDate.now().minusDays(1));
        lr3.setStatus("APPROVED");
        lr3.setParentComment("Approved");
        lr3.setAdminComment("Approved, get well soon");
        lr3.setCreatedAt(LocalDateTime.now().minusDays(3));
        lr3.setParentReviewedAt(LocalDateTime.now().minusDays(2));
        lr3.setAdminReviewedAt(LocalDateTime.now().minusDays(2));
        leaveRequestRepository.save(lr3);

        System.out.println("--- Leave Requests Seeded ---");
    }

    private void seedResources() {
        Resource r1 = new Resource();
        r1.setName("Lecture Hall A");
        r1.setType("LECTURE_HALL");
        r1.setCapacity(100);
        r1.setLocation("Building A, Floor 1");
        r1.setStatus("ACTIVE");
        r1.setAvailabilityStart("08:00");
        r1.setAvailabilityEnd("18:00");
        r1.setDescription("Main lecture hall with projector and audio system");
        resourceRepository.save(r1);

        Resource r2 = new Resource();
        r2.setName("Computer Lab 1");
        r2.setType("LAB");
        r2.setCapacity(30);
        r2.setLocation("Building B, Floor 2");
        r2.setStatus("ACTIVE");
        r2.setAvailabilityStart("08:00");
        r2.setAvailabilityEnd("20:00");
        r2.setDescription("Computer lab with 30 workstations");
        resourceRepository.save(r2);

        Resource r3 = new Resource();
        r3.setName("Meeting Room 101");
        r3.setType("MEETING_ROOM");
        r3.setCapacity(10);
        r3.setLocation("Building C, Floor 1");
        r3.setStatus("ACTIVE");
        r3.setAvailabilityStart("09:00");
        r3.setAvailabilityEnd("17:00");
        r3.setDescription("Small meeting room with whiteboard");
        resourceRepository.save(r3);

        Resource r4 = new Resource();
        r4.setName("Projector 1");
        r4.setType("EQUIPMENT");
        r4.setCapacity(1);
        r4.setLocation("Equipment Room");
        r4.setStatus("ACTIVE");
        r4.setAvailabilityStart("08:00");
        r4.setAvailabilityEnd("18:00");
        r4.setEquipmentDetails("Portable projector with remote");
        resourceRepository.save(r4);

        Resource r5 = new Resource();
        r5.setName("Science Lab");
        r5.setType("LAB");
        r5.setCapacity(25);
        r5.setLocation("Building D, Floor 1");
        r5.setStatus("ACTIVE");
        r5.setAvailabilityStart("08:00");
        r5.setAvailabilityEnd("16:00");
        r5.setDescription("Chemistry and physics lab");
        resourceRepository.save(r5);

        Resource r6 = new Resource();
        r6.setName("Library Study Room");
        r6.setType("STUDY_ROOM");
        r6.setCapacity(6);
        r6.setLocation("Library, Floor 2");
        r6.setStatus("ACTIVE");
        r6.setAvailabilityStart("09:00");
        r6.setAvailabilityEnd("21:00");
        r6.setDescription("Private study room for group work");
        resourceRepository.save(r6);

        System.out.println("--- Resources Seeded ---");
    }

    private void seedBookings() {
        List<Resource> resources = resourceRepository.findAll();
        List<User> users = userRepository.findAll();

        Booking b1 = new Booking();
        b1.setResource(resources.get(0));
        b1.setUserId(users.get(0).getId().toString());
        b1.setStartTime(LocalDateTime.now().plusDays(1).withHour(10).withMinute(0));
        b1.setEndTime(LocalDateTime.now().plusDays(1).withHour(12).withMinute(0));
        b1.setStatus("APPROVED");
        b1.setPurpose("Guest lecture");
        b1.setExpectedAttendees(50);
        b1.setCreatedAt(LocalDateTime.now());
        bookingRepository.save(b1);

        Booking b2 = new Booking();
        b2.setResource(resources.get(1));
        b2.setUserId(users.get(2).getId().toString());
        b2.setStartTime(LocalDateTime.now().plusDays(2).withHour(14).withMinute(0));
        b2.setEndTime(LocalDateTime.now().plusDays(2).withHour(16).withMinute(0));
        b2.setStatus("PENDING");
        b2.setPurpose("Programming workshop");
        b2.setExpectedAttendees(25);
        b2.setCreatedAt(LocalDateTime.now());
        bookingRepository.save(b2);

        Booking b3 = new Booking();
        b3.setResource(resources.get(2));
        b3.setUserId(users.get(3).getId().toString());
        b3.setStartTime(LocalDateTime.now().plusDays(3).withHour(9).withMinute(0));
        b3.setEndTime(LocalDateTime.now().plusDays(3).withHour(11).withMinute(0));
        b3.setStatus("APPROVED");
        b3.setPurpose("Team meeting");
        b3.setExpectedAttendees(8);
        b3.setCreatedAt(LocalDateTime.now());
        bookingRepository.save(b3);

        System.out.println("--- Bookings Seeded ---");
    }

    private void seedTickets() {
        List<Resource> resources = resourceRepository.findAll();
        List<User> users = userRepository.findAll();

        Ticket t1 = new Ticket();
        t1.setResource(resources.get(1));
        t1.setSubject("Projector not working");
        t1.setLocation("Computer Lab 1");
        t1.setReporterId(users.get(2).getId().toString());
        t1.setAssigneeId(users.get(1).getId().toString());
        t1.setPreferredContact("Email");
        t1.setCategory("Equipment");
        t1.setDescription("The projector in Computer Lab 1 is not displaying any image.");
        t1.setPriority("HIGH");
        t1.setStatus("OPEN");
        t1.setCreatedAt(LocalDateTime.now().minusDays(2));
        ticketRepository.save(t1);

        Ticket t2 = new Ticket();
        t2.setResource(resources.get(0));
        t2.setSubject("AC not cooling");
        t2.setLocation("Lecture Hall A");
        t2.setReporterId(users.get(3).getId().toString());
        t2.setAssigneeId(users.get(1).getId().toString());
        t2.setPreferredContact("Phone");
        t2.setCategory("Facilities");
        t2.setDescription("Air conditioning is not working properly. Room is too warm.");
        t2.setPriority("MEDIUM");
        t2.setStatus("IN_PROGRESS");
        t2.setResolutionNotes("Technician dispatched");
        t2.setCreatedAt(LocalDateTime.now().minusDays(5));
        ticketRepository.save(t2);

        Ticket t3 = new Ticket();
        t3.setSubject("Computer crashed");
        t3.setLocation("Computer Lab 1");
        t3.setReporterId(users.get(4).getId().toString());
        t3.setAssigneeId(users.get(1).getId().toString());
        t3.setPreferredContact("Email");
        t3.setCategory("IT Support");
        t3.setDescription("One of the computers in Lab 1 crashed during exam.");
        t3.setPriority("HIGH");
        t3.setStatus("RESOLVED");
        t3.setResolutionNotes("System restored, hard drive replaced");
        t3.setCreatedAt(LocalDateTime.now().minusDays(10));
        ticketRepository.save(t3);

        System.out.println("--- Tickets Seeded ---");
    }
}