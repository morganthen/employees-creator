package com.morganthen.employees_creator.employee;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.morganthen.employees_creator.employee.entities.Employee;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    boolean existsByEmailAndArchivedAtIsNull(String email);

    List<Employee> findByArchivedAtIsNull();

    Optional<Employee> findByIdAndArchivedAtIsNull(Long id);

}
