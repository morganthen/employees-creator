package com.morganthen.employees_creator.role.dtos;

import java.util.List;

import com.morganthen.employees_creator.role.entities.Role;

public record RoleResponse(int id, String name) {

    public static RoleResponse of(Role role) {
        return new RoleResponse(role.getId(), role.getName());
    }

    public static List<RoleResponse> of(List<Role> roles) {
        return roles.stream().map(r -> RoleResponse.of(r)).toList();

    }

}
