package com.morganthen.employees_creator.config.seeders;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import com.morganthen.employees_creator.employee.EmployeeRepository;
import com.morganthen.employees_creator.employee.EmployeeService;
import com.morganthen.employees_creator.employee.EmployeeStatus;
import com.morganthen.employees_creator.employee.EmploymentType;
import com.morganthen.employees_creator.employee.dtos.CreateEmployeeRequest;
import com.morganthen.employees_creator.role.RoleRepository;

@Component
@Order(2)
public class EmployeeSeeder implements CommandLineRunner {

    private final EmployeeService employeeService;
    private final EmployeeRepository employeeRepository;
    private final RoleRepository roleRepository;

    public EmployeeSeeder(EmployeeService employeeService, EmployeeRepository employeeRepository,
            RoleRepository roleRepository) {
        this.employeeService = employeeService;
        this.employeeRepository = employeeRepository;
        this.roleRepository = roleRepository;
    }

    @Override
    public void run(String... args) throws Exception {

        if (employeeRepository.count() == 0) {

            Integer staffId = roleRepository.findByName("Staff").orElseThrow().getId();
            Integer managerId = roleRepository.findByName("Manager").orElseThrow().getId();
            Integer execId = roleRepository.findByName("Executive").orElseThrow().getId();

            // create new CreateEmployeeRequest object
            CreateEmployeeRequest req = new CreateEmployeeRequest("John", staffId, null, "Doe", "john.doe@example.com",
                    "0412345678", "1 Example Street", null, "Melbourne", "VIC", "3000", EmployeeStatus.PERMANENT,
                    LocalDate.of(2026, 10, 12), null, EmploymentType.FULL_TIME, new BigDecimal("37.5"));
            employeeService.create(req);

            CreateEmployeeRequest req2 = new CreateEmployeeRequest("Jane", managerId, null, "Doe",
                    "jane.doe@example.com",
                    "0487654321", "12 Example Street", null, "Melbourne", "VIC", "3000", EmployeeStatus.CONTRACT,
                    LocalDate.of(2026, 6, 12), LocalDate.of(2027, 6, 12), EmploymentType.PART_TIME,
                    new BigDecimal("26"));
            employeeService.create(req2);

            CreateEmployeeRequest req3 = new CreateEmployeeRequest("Jill", execId, null, "Doe", "jill.doe@example.com",
                    "0488888888", "Unit 88/483", "Example Lane", "Sydney", "NSW", "2000", EmployeeStatus.PERMANENT,
                    LocalDate.of(2025, 11, 6), null, EmploymentType.FULL_TIME, new BigDecimal("37.5"));
            employeeService.create(req3);

        }
    }
}