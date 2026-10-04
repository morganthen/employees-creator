package com.morganthen.employees_creator.role;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.morganthen.employees_creator.role.entities.Role;

public interface RoleRepository extends JpaRepository<Role, Integer> {

    Optional<Role> findByName(String name);

    boolean existsByName(String name);

}