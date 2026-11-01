package com.morganthen.employees_creator.employee;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.morganthen.employees_creator.common.exceptions.ConflictException;
import com.morganthen.employees_creator.common.exceptions.NotFoundException;
import com.morganthen.employees_creator.common.exceptions.UnprocessableContentException;
import com.morganthen.employees_creator.employee.dtos.EmployeeRequest;
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
    public EmployeeResponse create(EmployeeRequest req) {

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
        validateDates(req);

        // map DTO -> Employee, normalise mobile to +614... then save
        Employee e = new Employee();
        applyRequest(e, req, role);
        // save to repo
        Employee saved = employeeRepository.save(e);
        return EmployeeResponse.of(saved);

    }

    @Transactional
    public EmployeeResponse update(Long id, EmployeeRequest req) {

        Employee employee = employeeRepository.findByIdAndArchivedAtIsNull(id)
                .orElseThrow(() -> new NotFoundException("Employee not found: " + id));

        Role role = roleRepository.findById(req.roleId())
                .orElseThrow(
                        () -> new UnprocessableContentException("Role not found"));

        // same email on the same employee is fine; taken by someone else is not
        boolean emailTakenByAnother = employeeRepository
                .existsByEmailAndArchivedAtIsNullAndIdNot(req.email(), id);
        if (emailTakenByAnother) {
            throw new ConflictException("Email already in use");
        }

        validateDates(req);

        applyRequest(employee, req, role);
        Employee saved = employeeRepository.save(employee);
        return EmployeeResponse.of(saved);
    }

    private void validateDates(EmployeeRequest req) {
        if (req.endDate() != null && req.endDate().isBefore(req.startDate())) {
            throw new UnprocessableContentException("End date must be after start date");
        }
    }

    private void applyRequest(Employee employee, EmployeeRequest req, Role role) {
        employee.setRole(role);
        employee.setFirstName(req.firstName());
        employee.setMiddleName(req.middleName());
        employee.setLastName(req.lastName());
        employee.setEmail(req.email());
        employee.setMobileNumber(normalizeMobile(req.mobileNumber()));
        employee.setAddressLine1(req.addressLine1());
        employee.setAddressLine2(req.addressLine2());
        employee.setSuburb(req.suburb());
        employee.setState(req.state());
        employee.setPostcode(req.postcode());
        employee.setEmployeeStatus(req.employeeStatus());
        employee.setStartDate(req.startDate());
        employee.setEndDate(req.endDate());
        employee.setEmploymentType(req.employmentType());
        employee.setHoursPerWeek(req.hoursPerWeek());
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
