package com.reservaYa.RYV1.Repository;

import com.reservaYa.RYV1.Model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Producto,Long> {
}
