package com.reservaYa.RYV1.Repository;

import com.reservaYa.RYV1.Model.ERole;
import com.reservaYa.RYV1.Model.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Integer> {
    Optional<Role> findByNameRole(ERole nameRole);
}
