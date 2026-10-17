package com.reservaYa.RYV1.Service;

import com.reservaYa.RYV1.Model.Categoria;
import com.reservaYa.RYV1.Model.Producto;
import com.reservaYa.RYV1.Repository.CategoriaRepository;
import com.reservaYa.RYV1.Repository.ProductRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
public class ProductoService {

    private final ProductRepository productRepository;
    private final CategoriaRepository categoriaRepository;

    public ProductoService(
            ProductRepository productRepository,
            CategoriaRepository categoriaRepository) {
        this.productRepository = productRepository;
        this.categoriaRepository = categoriaRepository;
    }

    @Transactional(readOnly = true)
    public List<Producto> listarTodos() {
        return productRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Producto> buscarPorId(Long id) {
        return productRepository.findById(id);
    }

    private Categoria resolverCategoria(Categoria categoria) {
        if (categoria == null) {
            return null;
        }

        if (categoria.getId() != null) {
            return categoriaRepository.findById(categoria.getId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "La categoría indicada no existe"
                    ));
        }

        if (categoria.getNombre() != null
                && !categoria.getNombre().isBlank()) {

            String nombre = categoria.getNombre().trim();

            return categoriaRepository.findByNombreIgnoreCase(nombre)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "La categoría indicada no existe"
                    ));
        }

        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Debés indicar una categoría válida"
        );
    }

    @Transactional
    public Producto crear(Producto producto) {
        producto.setId(null);

        producto.setCategoria(
                resolverCategoria(producto.getCategoria())
        );

        if (producto.getImages() != null
                && !producto.getImages().isEmpty()) {
            producto.setImagen(producto.getImages().get(0));
        }

        return productRepository.save(producto);
    }

    @Transactional
    public Optional<Producto> actualizar(Long id, Producto datos) {
        return productRepository.findById(id)
                .map(producto -> {
                    producto.setNombre(datos.getNombre());

                    producto.setCategoria(
                            resolverCategoria(datos.getCategoria())
                    );

                    producto.setUbicacion(datos.getUbicacion());
                    producto.setPrecio(datos.getPrecio());
                    producto.setDescripcion(datos.getDescripcion());
                    producto.setImages(datos.getImages());

                    if (datos.getImages() != null
                            && !datos.getImages().isEmpty()) {
                        producto.setImagen(datos.getImages().get(0));
                    } else {
                        producto.setImagen(datos.getImagen());
                    }

                    return productRepository.save(producto);
                });
    }

    @Transactional
    public boolean eliminar(Long id) {
        if (!productRepository.existsById(id)) {
            return false;
        }

        productRepository.deleteById(id);
        return true;
    }
}