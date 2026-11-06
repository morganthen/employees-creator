package com.morganthen.employees_creator.employee.dtos;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.morganthen.employees_creator.employee.EmployeeStatus;
import com.morganthen.employees_creator.employee.EmploymentType;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record EmployeeRequest(

                @NotBlank @Size(max = 100) String firstName,
                @NotNull Integer roleId,
                @Size(max = 100) String middleName,

                @NotBlank @Size(max = 100) String lastName,
                @NotBlank @Email @Size(max = 255) String email,
                @NotBlank @Pattern(regexp = "^0?4\\d{8}$") String mobileNumber,

                @NotBlank @Size(max = 255) String addressLine1,
                @Size(max = 255) String addressLine2,
                @NotBlank @Size(max = 100) String suburb,
                @NotBlank @Size(min = 2, max = 3) String state,
                @NotBlank @Pattern(regexp = "\\d{4}") String postcode,

                @NotNull EmployeeStatus employeeStatus,
                @NotNull LocalDate startDate,
                LocalDate endDate,
                @NotNull EmploymentType employmentType,

                @NotNull @DecimalMin("1") @DecimalMax("38") BigDecimal hoursPerWeek) {
}
