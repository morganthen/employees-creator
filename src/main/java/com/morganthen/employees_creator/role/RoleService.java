package com.morganthen.employees_creator.role;

import java.util.List;

import org.springframework.stereotype.Service;

import com.morganthen.employees_creator.role.entities.Role;

@Service
public class RoleService {
    private final RoleRepository roleRepository;

    public RoleService(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    public List<Role> findAll() {
        return roleRepository.findAll();
    }

    public Role getDefaultRole() {
        return roleRepository.findByName("Staff")
                .orElseThrow(() -> new IllegalStateException("Default role 'Staff' was not seeded"));
    }

}
