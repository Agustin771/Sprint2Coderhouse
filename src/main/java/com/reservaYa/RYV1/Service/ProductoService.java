package com.reservaYa.RYV1.Service;

import com.reservaYa.RYV1.Model.Producto;
import com.reservaYa.RYV1.Repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ProductoService {

    private final ProductRepository productRepository;

    public ProductoService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public List<Producto> listarTodos() {
        return productRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Producto> buscarPorId(Long id) {
        return productRepository.findById(id);
    }

    @Transactional
    public Producto crear(Producto producto) {
        producto.setId(null);

        // Si hay varias imágenes, la primera será la principal.
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
                    producto.setCategoria(datos.getCategoria());
                    producto.setUbicacion(datos.getUbicacion());
                    producto.setPrecio(datos.getPrecio());
                    producto.setDescripcion(datos.getDescripcion());
                    producto.setImages(datos.getImages());

                    // Actualizar la galería completa.
                    producto.setImages(datos.getImages());

                    // Mantener compatibilidad con el catálogo.
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