package com.reservaYa.RYV1.Service;

import com.reservaYa.RYV1.Model.Categoria;
import com.reservaYa.RYV1.Repository.CategoriaRepository;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoriaServiceTest {

    @Mock
    private CategoriaRepository categoriaRepository;

    @InjectMocks
    private CategoriaService categoriaService;

    @Test
    void crearCategoriaDebeGuardarNombreSinEspaciosExtras() {
        Categoria categoria = new Categoria();
        categoria.setNombre("  Hoteles  ");

        when(categoriaRepository.findByNombreIgnoreCase("Hoteles"))
                .thenReturn(Optional.empty());

        when(categoriaRepository.save(any(Categoria.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Categoria resultado = categoriaService.crear(categoria);

        assertEquals("Hoteles", resultado.getNombre());
        verify(categoriaRepository).save(any(Categoria.class));
    }

    @Test
    void crearCategoriaDuplicadaDebeLanzarConflict() {
        Categoria nueva = new Categoria();
        nueva.setNombre("Hoteles");

        Categoria existente = new Categoria();
        existente.setId(1L);
        existente.setNombre("hoteles");

        when(categoriaRepository.findByNombreIgnoreCase("Hoteles"))
                .thenReturn(Optional.of(existente));

        ResponseStatusException excepcion = assertThrows(
                ResponseStatusException.class,
                () -> categoriaService.crear(nueva)
        );

        assertEquals(HttpStatus.CONFLICT, excepcion.getStatusCode());
        verify(categoriaRepository, never()).save(any());
    }

    @Test
    void crearCategoriaSinNombreDebeLanzarBadRequest() {
        Categoria categoria = new Categoria();
        categoria.setNombre("  ");

        ResponseStatusException excepcion = assertThrows(
                ResponseStatusException.class,
                () -> categoriaService.crear(categoria)
        );

        assertEquals(HttpStatus.BAD_REQUEST, excepcion.getStatusCode());
        verify(categoriaRepository, never()).save(any());
    }

    @Test
    void actualizarCategoriaInexistenteDebeLanzarNotFound() {
        Categoria datos = new Categoria();
        datos.setNombre("Viajes");

        when(categoriaRepository.findById(999L))
                .thenReturn(Optional.empty());

        ResponseStatusException excepcion = assertThrows(
                ResponseStatusException.class,
                () -> categoriaService.actualizar(999L, datos)
        );

        assertEquals(HttpStatus.NOT_FOUND, excepcion.getStatusCode());
        verify(categoriaRepository, never()).save(any());
    }

    @Test
    void actualizarCategoriaDebeGuardarElNuevoNombre() {
        Categoria existente = new Categoria();
        existente.setId(1L);
        existente.setNombre("Hoteles");

        Categoria datos = new Categoria();
        datos.setNombre("Alojamientos");

        when(categoriaRepository.findById(1L))
                .thenReturn(Optional.of(existente));

        when(categoriaRepository.findByNombreIgnoreCase("Alojamientos"))
                .thenReturn(Optional.empty());

        when(categoriaRepository.save(any(Categoria.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Categoria resultado = categoriaService.actualizar(1L, datos);

        assertEquals("Alojamientos", resultado.getNombre());
        verify(categoriaRepository).save(existente);
    }
}