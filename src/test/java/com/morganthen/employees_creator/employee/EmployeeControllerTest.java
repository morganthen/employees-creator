package com.morganthen.employees_creator.employee;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.willThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.morganthen.employees_creator.common.exceptions.ConflictException;
import com.morganthen.employees_creator.common.exceptions.NotFoundException;
import com.morganthen.employees_creator.common.exceptions.UnprocessableContentException;
import com.morganthen.employees_creator.employee.dtos.EmployeeRequest;
import com.morganthen.employees_creator.employee.dtos.EmployeeResponse;
import com.morganthen.employees_creator.employee.entities.Employee;
import com.morganthen.employees_creator.role.entities.Role;

@WebMvcTest(EmployeeController.class)
class EmployeeControllerTest {

        private static final String VALID_REQUEST_JSON = """
                        {
                          "firstName": "Jane",
                          "roleId": 1,
                          "lastName": "Doe",
                          "email": "jane@example.com",
                          "mobileNumber": "0412345678",
                          "addressLine1": "1 Test St",
                          "suburb": "Melbourne",
                          "state": "VIC",
                          "postcode": "3000",
                          "employeeStatus": "PERMANENT",
                          "startDate": "2026-01-15",
                          "employmentType": "FULL_TIME",
                          "hoursPerWeek": 38
                        }
                        """;

        @Autowired
        private MockMvc mockMvc;

        @MockitoBean
        private EmployeeService employeeService;

        // ------------------------------------------------------------------- POST

        @Test
        @DisplayName("POST returns 201 and the created employee")
        void create_whenRequestValid_returns201() throws Exception {
                given(employeeService.create(any(EmployeeRequest.class)))
                                .willReturn(employeeResponse());

                mockMvc.perform(post("/api/employees")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(VALID_REQUEST_JSON))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.id").value(1))
                                .andExpect(jsonPath("$.firstName").value("Jane"))
                                .andExpect(jsonPath("$.email").value("jane@example.com"));
        }

        @Test
        @DisplayName("POST returns 400 with field details when validation fails")
        void create_whenRequestInvalid_returns400WithDetails() throws Exception {
                String invalidJson = """
                                {
                                  "firstName": "",
                                  "roleId": null,
                                  "lastName": "",
                                  "email": "not-an-email",
                                  "mobileNumber": "123",
                                  "addressLine1": "",
                                  "suburb": "",
                                  "state": "V",
                                  "postcode": "12",
                                  "employeeStatus": null,
                                  "startDate": null,
                                  "employmentType": null,
                                  "hoursPerWeek": 0
                                }
                                """;

                mockMvc.perform(post("/api/employees")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(invalidJson))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.message").value("Validation failed"))
                                .andExpect(jsonPath("$.details.firstName").exists())
                                .andExpect(jsonPath("$.details.email").exists());
        }

        @Test
        @DisplayName("POST returns 409 when the email is already in use")
        void create_whenEmailActive_returns409() throws Exception {
                willThrow(new ConflictException("Email already in use"))
                                .given(employeeService).create(any(EmployeeRequest.class));

                mockMvc.perform(post("/api/employees")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(VALID_REQUEST_JSON))
                                .andExpect(status().isConflict())
                                .andExpect(jsonPath("$.message").value("Email already in use"));
        }

        @Test
        @DisplayName("POST returns 422 when the role does not exist")
        void create_whenRoleMissing_returns422() throws Exception {
                willThrow(new UnprocessableContentException("Role not found"))
                                .given(employeeService).create(any(EmployeeRequest.class));

                mockMvc.perform(post("/api/employees")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(VALID_REQUEST_JSON))
                                .andExpect(status().is(422))
                                .andExpect(jsonPath("$.message").value("Role not found"));
        }

        @Test
        @DisplayName("POST returns 400 when firstName exceeds the column length")
        void create_whenFirstNameTooLong_returns400() throws Exception {
                String tooLong = "a".repeat(101);
                String json = VALID_REQUEST_JSON.replace("\"Jane\"", "\"" + tooLong + "\"");

                mockMvc.perform(post("/api/employees")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.details.firstName").exists());
        }

        // -------------------------------------------------------------------- PUT

        @Test
        @DisplayName("PUT returns 200 and the updated employee")
        void update_whenRequestValid_returns200() throws Exception {
                given(employeeService.update(any(Long.class), any(EmployeeRequest.class)))
                                .willReturn(employeeResponse());

                mockMvc.perform(put("/api/employees/1")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(VALID_REQUEST_JSON))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.id").value(1))
                                .andExpect(jsonPath("$.firstName").value("Jane"));
        }

        @Test
        @DisplayName("PUT returns 400 with field details when validation fails")
        void update_whenRequestInvalid_returns400WithDetails() throws Exception {
                String invalidJson = """
                                {
                                  "firstName": "",
                                  "roleId": 1,
                                  "lastName": "Doe",
                                  "email": "not-an-email",
                                  "mobileNumber": "0412345678",
                                  "addressLine1": "1 Test St",
                                  "suburb": "Melbourne",
                                  "state": "VIC",
                                  "postcode": "3000",
                                  "employeeStatus": "PERMANENT",
                                  "startDate": "2026-01-15",
                                  "employmentType": "FULL_TIME",
                                  "hoursPerWeek": 38
                                }
                                """;

                mockMvc.perform(put("/api/employees/1")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(invalidJson))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.details.firstName").exists())
                                .andExpect(jsonPath("$.details.email").exists());
        }

        @Test
        @DisplayName("PUT returns 404 when the employee does not exist")
        void update_whenEmployeeMissing_returns404() throws Exception {
                willThrow(new NotFoundException("Employee not found: 999"))
                                .given(employeeService).update(any(Long.class), any(EmployeeRequest.class));

                mockMvc.perform(put("/api/employees/999")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(VALID_REQUEST_JSON))
                                .andExpect(status().isNotFound())
                                .andExpect(jsonPath("$.message").value("Employee not found: 999"));
        }

        @Test
        @DisplayName("PUT returns 409 when the email is taken by another employee")
        void update_whenEmailTakenByAnother_returns409() throws Exception {
                willThrow(new ConflictException("Email already in use"))
                                .given(employeeService).update(any(Long.class), any(EmployeeRequest.class));

                mockMvc.perform(put("/api/employees/1")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(VALID_REQUEST_JSON))
                                .andExpect(status().isConflict());
        }

        @Test
        @DisplayName("PUT returns 422 when the role does not exist")
        void update_whenRoleMissing_returns422() throws Exception {
                willThrow(new UnprocessableContentException("Role not found"))
                                .given(employeeService).update(any(Long.class), any(EmployeeRequest.class));

                mockMvc.perform(put("/api/employees/1")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(VALID_REQUEST_JSON))
                                .andExpect(status().is(422))
                                .andExpect(jsonPath("$.message").value("Role not found"));
        }

        // ----------------------------------------------------------------- DELETE

        @Test
        @DisplayName("DELETE returns 204")
        void archive_whenEmployeeExists_returns204() throws Exception {
                mockMvc.perform(delete("/api/employees/1"))
                                .andExpect(status().isNoContent());
        }

        @Test
        @DisplayName("DELETE returns 404 when the employee does not exist")
        void archive_whenEmployeeMissing_returns404() throws Exception {
                willThrow(new NotFoundException("Employee not found: 999"))
                                .given(employeeService).archive(999L);

                mockMvc.perform(delete("/api/employees/999"))
                                .andExpect(status().isNotFound())
                                .andExpect(jsonPath("$.message").value("Employee not found: 999"));
        }

        // -------------------------------------------------------------------- GET

        @Test
        @DisplayName("GET by id returns 200 and the employee")
        void getById_whenFound_returns200() throws Exception {
                given(employeeService.findById(1L)).willReturn(employeeResponse());

                mockMvc.perform(get("/api/employees/1"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.id").value(1))
                                .andExpect(jsonPath("$.firstName").value("Jane"));
        }

        @Test
        @DisplayName("GET by id returns 404 when missing")
        void getById_whenMissing_returns404() throws Exception {
                given(employeeService.findById(999L))
                                .willThrow(new NotFoundException("Employee not found: 999"));

                mockMvc.perform(get("/api/employees/999"))
                                .andExpect(status().isNotFound())
                                .andExpect(jsonPath("$.message").value("Employee not found: 999"));
        }

        @Test
        @DisplayName("GET by id returns 400 when the id is not a number")
        void getById_whenIdNotNumeric_returns400() throws Exception {
                mockMvc.perform(get("/api/employees/abc"))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.message").value("Invalid value for 'id'"))
                                .andExpect(jsonPath("$.path").value("/api/employees/abc"));
        }

        // ---------------------------------------------------------------- helper

        private static EmployeeResponse employeeResponse() {
                Role role = new Role();
                role.setId(1);
                role.setName("Staff");

                Employee employee = new Employee();
                employee.setId(1L);
                employee.setRole(role);
                employee.setFirstName("Jane");
                employee.setLastName("Doe");
                employee.setEmail("jane@example.com");
                employee.setMobileNumber("+61412345678");
                employee.setAddressLine1("1 Test St");
                employee.setSuburb("Melbourne");
                employee.setState("VIC");
                employee.setPostcode("3000");
                employee.setEmployeeStatus(EmployeeStatus.PERMANENT);
                employee.setStartDate(LocalDate.of(2026, 1, 15));
                employee.setEmploymentType(EmploymentType.FULL_TIME);
                employee.setHoursPerWeek(new BigDecimal("38"));

                return EmployeeResponse.of(employee);
        }
}
