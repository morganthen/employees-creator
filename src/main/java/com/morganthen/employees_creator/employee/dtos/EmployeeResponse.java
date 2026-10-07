package com.morganthen.employees_creator.employee.dtos;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.morganthen.employees_creator.employee.EmployeeStatus;
import com.morganthen.employees_creator.employee.EmploymentType;
import com.morganthen.employees_creator.employee.entities.Employee;

public record EmployeeResponse(Long id,
        String firstName,
        String middleName,
        String lastName,
        String email,
        String mobileNumber,
        String addressLine1,
        String addressLine2,
        String suburb,
        String state,
        String postcode,
        Integer roleId,
        String roleName,
        EmployeeStatus employeeStatus,
        LocalDate startDate,
        LocalDate endDate,
        EmploymentType employmentType,
        BigDecimal hoursPerWeek,
        LocalDateTime archivedAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {

    public static EmployeeResponse of(Employee employee) {
        return new EmployeeResponse(
                employee.getId(),
                employee.getFirstName(),
                employee.getMiddleName(),
                employee.getLastName(),
                employee.getEmail(),
                employee.getMobileNumber(),
                employee.getAddressLine1(),
                employee.getAddressLine2(),
                employee.getSuburb(),
                employee.getState(),
                employee.getPostcode(),
                employee.getRole().getId(),
                employee.getRole().getName(),
                employee.getEmployeeStatus(),
                employee.getStartDate(),
                employee.getEndDate(),
                employee.getEmploymentType(),
                employee.getHoursPerWeek(),
                employee.getArchivedAt(),
                employee.getCreatedAt(),
                employee.getUpdatedAt());

    }

    public static List<EmployeeResponse> of(List<Employee> employees) {
        return employees.stream().map(e -> EmployeeResponse.of(e)).toList();
    }

}
