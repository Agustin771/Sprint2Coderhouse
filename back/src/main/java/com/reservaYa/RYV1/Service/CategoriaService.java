package com.reservaYa.RYV1.Service;

import com.reservaYa.RYV1.Model.Categoria;
import com.reservaYa.RYV1.Repository.CategoriaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    public CategoriaService(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    @Transactional(readOnly = true)
    public List<Categoria> listarTodas() {
        return categoriaRepository.findAll();
    }

    @Transactional
    public Categoria crear(Categoria categoria) {
        if (categoria.getNombre() == null
                || categoria.getNombre().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El nombre de la categoría es obligatorio"
            );
        }

        String nombre = categoria.getNombre().trim();

        if (categoriaRepository
                .findByNombreIgnoreCase(nombre).isPresent()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "La categoría ya existe"
            );
        }

        Categoria nueva = new Categoria();
        nueva.setNombre(nombre);

        return categoriaRepository.save(nueva);
    }

    @Transactional
    public Categoria actualizar(Long id, Categoria categoria) {
        Categoria existente = categoriaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "La categoría no existe"
                ));

        if (categoria.getNombre() == null
                || categoria.getNombre().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El nombre de la categoría es obligatorio"
            );
        }

        String nombre = categoria.getNombre().trim();

        categoriaRepository.findByNombreIgnoreCase(nombre)
                .filter(otra -> !otra.getId().equals(id))
                .ifPresent(otra -> {
                    throw new ResponseStatusException(
                            HttpStatus.CONFLICT,
                            "Ya existe otra categoría con ese nombre"
                    );
                });

        existente.setNombre(nombre);

        return categoriaRepository.save(existente);
    }

    @Transactional
    public void eliminar(Long id) {
        Categoria existente = categoriaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "La categoría no existe"
                ));

        categoriaRepository.delete(existente);
    }
}