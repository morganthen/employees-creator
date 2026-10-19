package com.morganthen.employees_creator.employee.entities;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

public class EmployeeEntityTest {

    @Test
    @DisplayName("Is ongoing when end date is null")
    void isOngoing_whenEndDateIsNull_isTrue() {
        Employee employee = new Employee();
        employee.setEndDate(null);
        assertTrue(employee.isOngoing());

    }

    @Test
    @DisplayName("Is not ongoing when end date is set")
    void isOngoing_whenEndDateIsSet_isFalse() {
        Employee employee = new Employee();
        employee.setEndDate(LocalDate.of(2027, 1, 1));
        assertFalse(employee.isOngoing());
    }

}
