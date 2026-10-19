package com.morganthen.employees_creator.employee;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.morganthen.employees_creator.common.exceptions.NotFoundException;
import com.morganthen.employees_creator.employee.entities.Employee;
import com.morganthen.employees_creator.role.RoleRepository;

@ExtendWith(MockitoExtension.class)
public class EmployeeServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private RoleRepository roleRepository;

    @InjectMocks
    private EmployeeService employeeService;

    @Test
    @DisplayName("archives an active employee")
    void archived_whenActiveEmployeeFound_setsArchivedAtAndSaves() {
        Employee employee = new Employee();
        given(employeeRepository.findByIdAndArchivedAtIsNull(1L)).willReturn(Optional.of(employee));

        employeeService.archive(1L);

        assertNotNull(employee.getArchivedAt()); // state
        verify(employeeRepository, times(1)).save(employee); // interaction

    }

    @Test
    @DisplayName("throws NotFound when the employee does not exist")
    void archive_whenEmployeeNotFound_throwsNotFound() {
        given(employeeRepository.findByIdAndArchivedAtIsNull(999L)).willReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> employeeService.archive(999L));
        verify(employeeRepository, never()).save(any());
    }

}
