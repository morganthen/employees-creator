package com.morganthen.employees_creator.employee;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.morganthen.employees_creator.common.exceptions.ConflictException;
import com.morganthen.employees_creator.common.exceptions.NotFoundException;
import com.morganthen.employees_creator.common.exceptions.UnprocessableContentException;
import com.morganthen.employees_creator.employee.dtos.CreateEmployeeRequest;
import com.morganthen.employees_creator.employee.dtos.EmployeeResponse;
import com.morganthen.employees_creator.employee.entities.Employee;
import com.morganthen.employees_creator.role.RoleRepository;
import com.morganthen.employees_creator.role.entities.Role;

@Service
public class EmployeeService {
    private final EmployeeRepository employeeRepository;
    private final RoleRepository roleRepository;

    public EmployeeService(EmployeeRepository employeeRepository, RoleRepository roleRepository) {
        this.employeeRepository = employeeRepository;
        this.roleRepository = roleRepository;
    }

    @Transactional(readOnly = true)
    public List<EmployeeResponse> findAll() {
        List<Employee> employees = employeeRepository.findByArchivedAtIsNull();
        return EmployeeResponse.of(employees);
    }

    private String normalizeMobile(String mobile) {
        String digits = mobile.replaceAll("\\D", "");
        if (digits.startsWith("61")) {
            digits = digits.substring(2); // drop country code
        } else if (digits.startsWith("0")) {
            digits = digits.substring(1); // drop trunk 0
        }
        return "+61" + digits;
    }

    @Transactional
    public EmployeeResponse create(CreateEmployeeRequest req) {

        // resolve role
        Role role = roleRepository.findById(req.roleId())
                .orElseThrow(
                        () -> new UnprocessableContentException("Role not found"));

        // active-email check
        boolean emailExist = employeeRepository.existsByEmailAndArchivedAtIsNull(req.email());
        if (emailExist) {
            throw new ConflictException("Email already in use");
        }

        // date rule
        if (req.endDate() != null && req.endDate().isBefore((req.startDate()))) {
            throw new UnprocessableContentException("End date must be after start date");
        }

        // map DTO -> Employee, normalise mobile to +614... then save
        Employee e = new Employee();
        e.setRole(role);
        e.setFirstName(req.firstName());
        e.setMiddleName(req.middleName());
        e.setLastName(req.lastName());
        e.setEmail(req.email());
        e.setMobileNumber(normalizeMobile(req.mobileNumber()));
        e.setAddressLine1(req.addressLine1());
        e.setAddressLine2(req.addressLine2());
        e.setSuburb(req.suburb());
        e.setState(req.state());
        e.setPostcode(req.postcode());
        e.setEmployeeStatus(req.employeeStatus());
        e.setStartDate(req.startDate());
        e.setEndDate(req.endDate());
        e.setEmploymentType(req.employmentType());
        e.setHoursPerWeek(req.hoursPerWeek());
        // save to repo
        Employee saved = employeeRepository.save(e);
        return EmployeeResponse.of(saved);

    }

    @Transactional(readOnly = true)
    public EmployeeResponse findById(Long id) {
        Employee employee = employeeRepository.findByIdAndArchivedAtIsNull(id)
                .orElseThrow(() -> new NotFoundException("Employee not found: " + id));
        return EmployeeResponse.of(employee);

    }

    @Transactional
    public void archive(Long id) {
        Employee employee = employeeRepository.findByIdAndArchivedAtIsNull(id)
                .orElseThrow(() -> new NotFoundException("Employee not found: " + id));
        employee.setArchivedAt(LocalDateTime.now());
        employeeRepository.save(employee);
    }

}
