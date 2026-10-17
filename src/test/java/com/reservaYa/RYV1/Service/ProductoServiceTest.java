package com.reservaYa.RYV1.Service;

import com.reservaYa.RYV1.Model.Categoria;
import com.reservaYa.RYV1.Model.Producto;
import com.reservaYa.RYV1.Repository.CategoriaRepository;
import com.reservaYa.RYV1.Repository.ProductRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductoServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoriaRepository categoriaRepository;

    @InjectMocks
    private ProductoService productoService;

    private Categoria categoria;

    @BeforeEach
    void setUp() {
        categoria = new Categoria();
        categoria.setId(1L);
        categoria.setNombre("Hoteles");
    }

    @Test
    void crearProductoDebeGuardarProductoConCategoriaExistente() {
        Producto producto = new Producto();
        producto.setId(99L);
        producto.setNombre("Hotel del centro");
        producto.setCategoria(categoria);

        when(categoriaRepository.findById(1L))
                .thenReturn(Optional.of(categoria));

        when(productRepository.save(any(Producto.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Producto resultado = productoService.crear(producto);

        assertNotNull(resultado);
        assertNull(resultado.getId());
        assertEquals("Hotel del centro", resultado.getNombre());
        assertEquals(categoria, resultado.getCategoria());

        verify(categoriaRepository).findById(1L);
        verify(productRepository).save(producto);
    }

    @Test
    void crearProductoDebeUsarPrimeraImagenComoImagenPrincipal() {
        Producto producto = new Producto();
        producto.setNombre("Hotel");
        producto.setCategoria(categoria);
        producto.setImages(List.of("hotel.jpg", "habitacion.jpg"));

        when(categoriaRepository.findById(1L))
                .thenReturn(Optional.of(categoria));

        when(productRepository.save(any(Producto.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Producto resultado = productoService.crear(producto);

        assertEquals("hotel.jpg", resultado.getImagen());
        verify(productRepository).save(producto);
    }

    @Test
    void crearProductoDebeFallarSiLaCategoriaNoExiste() {
        Producto producto = new Producto();

        Categoria categoriaInexistente = new Categoria();
        categoriaInexistente.setId(999L);

        producto.setCategoria(categoriaInexistente);

        when(categoriaRepository.findById(999L))
                .thenReturn(Optional.empty());

        ResponseStatusException excepcion = assertThrows(
                ResponseStatusException.class,
                () -> productoService.crear(producto)
        );

        assertEquals(HttpStatus.BAD_REQUEST, excepcion.getStatusCode());
        verify(productRepository, never()).save(any());
    }

    @Test
    void actualizarProductoDebeGuardarLosCambios() {
        Producto existente = new Producto();
        existente.setId(10L);
        existente.setNombre("Nombre anterior");
        existente.setCategoria(categoria);

        Producto datos = new Producto();
        datos.setNombre("Nombre actualizado");
        datos.setCategoria(categoria);
        datos.setUbicacion("Buenos Aires");
        datos.setPrecio(new java.math.BigDecimal("150000.00"));
        datos.setDescripcion("Descripción nueva");
        datos.setImages(List.of("nuevo.jpg"));

        when(productRepository.findById(10L))
                .thenReturn(Optional.of(existente));

        when(categoriaRepository.findById(1L))
                .thenReturn(Optional.of(categoria));

        when(productRepository.save(any(Producto.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Optional<Producto> resultado =
                productoService.actualizar(10L, datos);

        assertTrue(resultado.isPresent());
        assertEquals("Nombre actualizado", existente.getNombre());
        assertEquals("Buenos Aires", existente.getUbicacion());
        assertEquals("Descripción nueva", existente.getDescripcion());
        assertEquals("nuevo.jpg", existente.getImagen());

        verify(productRepository).save(existente);
    }

    @Test
    void actualizarProductoInexistenteDebeDevolverOptionalVacio() {
        Producto datos = new Producto();

        when(productRepository.findById(500L))
                .thenReturn(Optional.empty());

        Optional<Producto> resultado =
                productoService.actualizar(500L, datos);

        assertTrue(resultado.isEmpty());
        verify(productRepository, never()).save(any());
    }
}