package com.reservaYa.RYV1.Repository;

import com.reservaYa.RYV1.Model.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategoriaRepository
        extends JpaRepository<Categoria, Long> {

    Optional<Categoria> findByNombreIgnoreCase(String nombre);
}
