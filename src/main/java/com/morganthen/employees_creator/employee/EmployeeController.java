package com.morganthen.employees_creator.employee;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.morganthen.employees_creator.employee.dtos.CreateEmployeeRequest;
import com.morganthen.employees_creator.employee.dtos.EmployeeResponse;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

import java.util.List;

import org.springframework.http.HttpStatus;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api/employees")
@Tag(name = "Employees", description = "Operations related to employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @GetMapping
    public ResponseEntity<List<EmployeeResponse>> getAllEmployees() {
        return ResponseEntity.ok(employeeService.findAll());
    }

    @PostMapping
    public ResponseEntity<EmployeeResponse> create(@RequestBody @Valid CreateEmployeeRequest data) {
        EmployeeResponse createdEmployee = employeeService.create(data);

        return new ResponseEntity<EmployeeResponse>(createdEmployee, HttpStatus.CREATED);
    }

}
