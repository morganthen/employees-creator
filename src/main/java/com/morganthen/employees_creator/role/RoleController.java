package com.morganthen.employees_creator.role;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.morganthen.employees_creator.role.dtos.RoleResponse;
import com.morganthen.employees_creator.role.entities.Role;

import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("/api/roles")
@Tag(name = "Roles", description = "Operations related to roles")
public class RoleController {

    private final RoleService roleService;

    public RoleController(RoleService roleService) {
        this.roleService = roleService;
    }

    @GetMapping
    public ResponseEntity<List<RoleResponse>> getRoles() {
        List<Role> roles = roleService.findAll();
        return ResponseEntity.ok(RoleResponse.of(roles));

    }

}
