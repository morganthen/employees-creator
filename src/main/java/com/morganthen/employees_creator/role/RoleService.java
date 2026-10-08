package com.morganthen.employees_creator.role;

import java.util.List;

import org.springframework.stereotype.Service;

import com.morganthen.employees_creator.role.dtos.RoleResponse;
import com.morganthen.employees_creator.role.entities.Role;

@Service
public class RoleService {
    private final RoleRepository roleRepository;

    public RoleService(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    public List<RoleResponse> findAll() {
        List<Role> roles = roleRepository.findAll();
        return RoleResponse.of(roles);
    }

    public RoleResponse getDefaultRole() {
        Role defaultRole = roleRepository.findByName("Staff")
                .orElseThrow(() -> new IllegalStateException("Default role 'Staff' was not seeded"));
        return RoleResponse.of(defaultRole);
    }

}
