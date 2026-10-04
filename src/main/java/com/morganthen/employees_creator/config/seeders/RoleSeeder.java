package com.morganthen.employees_creator.config.seeders;

import org.springframework.boot.CommandLineRunner;

import org.springframework.stereotype.Component;

import com.morganthen.employees_creator.role.RoleRepository;
import com.morganthen.employees_creator.role.entities.Role;

@Component
public class RoleSeeder implements CommandLineRunner {
    private final RoleRepository roleRepository;

    public RoleSeeder(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (roleRepository.count() == 0) {
            Role staff = new Role("Staff");
            roleRepository.save(staff);
            Role manager = new Role("Manager");
            roleRepository.save(manager);
            Role executive = new Role("Executive");
            roleRepository.save(executive);
        }
    }

}
