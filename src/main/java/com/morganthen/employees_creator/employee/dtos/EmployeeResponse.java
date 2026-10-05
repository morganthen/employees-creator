package com.morganthen.employees_creator.employee.dtos;

import java.util.List;

import com.morganthen.employees_creator.employee.entities.Employee;

public record EmployeeResponse(Long id, String name) {

    public static EmployeeResponse of(Employee employee) {
        return new EmployeeResponse(employee.getId(), employee.getFirstName());
    }

    public static List<EmployeeResponse> of(List<Employee> employees) {
        return employees.stream().map(e -> EmployeeResponse.of(e)).toList();
    }

}
