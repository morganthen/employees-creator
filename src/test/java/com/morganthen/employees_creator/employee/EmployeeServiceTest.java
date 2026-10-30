package com.morganthen.employees_creator.employee;

import static org.junit.jupiter.api.Assertions.assertAll;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.morganthen.employees_creator.common.exceptions.ConflictException;
import com.morganthen.employees_creator.common.exceptions.NotFoundException;
import com.morganthen.employees_creator.common.exceptions.UnprocessableContentException;
import com.morganthen.employees_creator.employee.dtos.CreateEmployeeRequest;
import com.morganthen.employees_creator.employee.dtos.EmployeeResponse;
import com.morganthen.employees_creator.employee.entities.Employee;
import com.morganthen.employees_creator.role.RoleRepository;
import com.morganthen.employees_creator.role.entities.Role;

@ExtendWith(MockitoExtension.class)
public class EmployeeServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private RoleRepository roleRepository;

    @InjectMocks
    private EmployeeService employeeService;

    // ------------------------------------------------------------------ archive

    @Test
    @DisplayName("archives an active employee")
    void archive_whenActiveEmployeeFound_setsArchivedAtAndSaves() {

        // given
        Employee employee = new Employee();
        given(employeeRepository.findByIdAndArchivedAtIsNull(1L)).willReturn(Optional.of(employee));
        LocalDateTime before = LocalDateTime.now();
        // when
        employeeService.archive(1L);
        // then
        assertNotNull(employee.getArchivedAt());
        assertFalse(employee.getArchivedAt().isBefore(before));
        verify(employeeRepository, times(1)).save(employee);
    }

    @Test
    @DisplayName("throws NotFound when the employee does not exist")
    void archive_whenEmployeeNotFound_throwsNotFound() {
        given(employeeRepository.findByIdAndArchivedAtIsNull(999L)).willReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> employeeService.archive(999L));
        verify(employeeRepository, never()).save(any());
    }

    @Test
    @DisplayName("throws NotFound when the employee is already archived")
    void archive_whenEmployeeAlreadyArchived_throwsNotFound() {
        given(employeeRepository.findByIdAndArchivedAtIsNull(1L))
                .willReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> employeeService.archive(1L));
        verify(employeeRepository, never()).save(any(Employee.class));
    }

    // ------------------------------------------------------------------- create

    @Test
    @DisplayName("creates an employee when the request is valid")
    void create_whenRequestValid_savesAndReturnsEmployee() {
        Role role = new Role();
        given(roleRepository.findById(1)).willReturn(Optional.of(role));
        given(employeeRepository.existsByEmailAndArchivedAtIsNull("jane@example.com"))
                .willReturn(false);
        given(employeeRepository.save(any(Employee.class)))
                .willAnswer(inv -> inv.getArgument(0));

        EmployeeResponse res = employeeService.create(validRequest());

        ArgumentCaptor<Employee> captor = ArgumentCaptor.forClass(Employee.class);
        verify(employeeRepository).save(captor.capture());
        Employee saved = captor.getValue();

        assertAll(
                () -> assertEquals("+61412345678", saved.getMobileNumber()),
                () -> assertEquals("jane@example.com", saved.getEmail()),
                () -> assertEquals(role, saved.getRole()),
                () -> assertEquals("Jane", res.firstName()));
    }

    @Test
    @DisplayName("throws UnprocessableContent when the role does not exist")
    void create_whenRoleMissing_throwsUnprocessableContent() {
        given(roleRepository.findById(1)).willReturn(Optional.empty());

        assertThrows(UnprocessableContentException.class,
                () -> employeeService.create(validRequest()));

        // role resolution fails first, so nothing else is touched
        verify(employeeRepository, never()).existsByEmailAndArchivedAtIsNull(anyString());
        verify(employeeRepository, never()).save(any(Employee.class));
    }

    @Test
    @DisplayName("throws Conflict when the email is already in use")
    void create_whenEmailActive_throwsConflict() {
        given(roleRepository.findById(1)).willReturn(Optional.of(new Role()));
        given(employeeRepository.existsByEmailAndArchivedAtIsNull("jane@example.com"))
                .willReturn(true);

        assertThrows(ConflictException.class, () -> employeeService.create(validRequest()));

        verify(employeeRepository, never()).save(any(Employee.class));
    }

    @Test
    @DisplayName("throws UnprocessableContent when the end date is before the start date")
    void create_whenEndDateBeforeStartDate_throwsUnprocessableContent() {
        given(roleRepository.findById(1)).willReturn(Optional.of(new Role()));
        given(employeeRepository.existsByEmailAndArchivedAtIsNull("jane@example.com"))
                .willReturn(false);

        CreateEmployeeRequest request = requestWithDates(
                LocalDate.of(2026, 2, 1),
                LocalDate.of(2026, 1, 1));

        assertThrows(UnprocessableContentException.class,
                () -> employeeService.create(request));

        verify(employeeRepository, never()).save(any(Employee.class));
    }

    @ParameterizedTest(name = "{0} -> {1}")
    @DisplayName("normalises the mobile number to +61")
    @CsvSource({
            "0412345678,    +61412345678",
            "+61412345678,  +61412345678",
            "61412345678,   +61412345678",
            "0412 345 678,  +61412345678"
    })
    void create_normalisesMobileNumber(String input, String expected) {
        given(roleRepository.findById(1)).willReturn(Optional.of(new Role()));
        given(employeeRepository.existsByEmailAndArchivedAtIsNull("jane@example.com"))
                .willReturn(false);
        given(employeeRepository.save(any(Employee.class)))
                .willAnswer(inv -> inv.getArgument(0));

        employeeService.create(requestWithMobile(input));

        ArgumentCaptor<Employee> captor = ArgumentCaptor.forClass(Employee.class);
        verify(employeeRepository).save(captor.capture());
        assertEquals(expected, captor.getValue().getMobileNumber());
    }

    // ------------------------------------------------------------------ helpers

    private static CreateEmployeeRequest validRequest() {
        return requestWithMobile("0412345678");
    }

    private static CreateEmployeeRequest requestWithMobile(String mobile) {
        return new CreateEmployeeRequest(
                "Jane", 1, null, "Doe", "jane@example.com", mobile,
                "1 Test St", null, "Melbourne", "VIC", "3000",
                EmployeeStatus.PERMANENT,
                LocalDate.of(2026, 1, 15), null,
                EmploymentType.FULL_TIME,
                new BigDecimal("38"));
    }

    private static CreateEmployeeRequest requestWithDates(LocalDate start, LocalDate end) {
        return new CreateEmployeeRequest(
                "Jane", 1, null, "Doe", "jane@example.com", "0412345678",
                "1 Test St", null, "Melbourne", "VIC", "3000",
                EmployeeStatus.PERMANENT,
                start, end,
                EmploymentType.FULL_TIME,
                new BigDecimal("38"));
    }
}
