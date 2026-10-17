import { useEffect, useState } from "react";
import {
  ArrowLeft,
  MapPin,
  Heart,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import "../App.css";


function formatPrice(price) {
  const amount = Number(price);

  if (!Number.isFinite(amount)) {
    return "Consultar";
  }

  return `$${amount.toLocaleString("es-AR")}`;
}

export default function ProductDetail({ product, onBack }) {
  const [showGallery, setShowGallery] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [favorite, setFavorite] = useState(false);

  const productImages = Array.isArray(product?.images)
    ? product.images.filter(
        (image) => typeof image === "string" && image.trim()
      )
    : [];

  const images = product.images?.length
    ? product.images
    : product.image
      ? [product.image]
      : [];

  useEffect(() => {
    setShowGallery(false);
    setActiveImage(0);
    setFavorite(false);
  }, [product?.id]);

  useEffect(() => {
    if (!showGallery) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setShowGallery(false);
      }

      if (event.key === "ArrowLeft") {
        setActiveImage(
          (current) => (current - 1 + images.length) % images.length
        );
      }

      if (event.key === "ArrowRight") {
        setActiveImage((current) => (current + 1) % images.length);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showGallery, images.length]);

  if (!product) {
    return (
      <main className="detail-not-found">
        <h2>Producto no encontrado</h2>
        <p>Volvé al catálogo para elegir otra experiencia.</p>

        <button className="btn btn-primary" onClick={onBack}>
          Volver al catálogo
        </button>
      </main>
    );
  }

  function previousImage() {
    setActiveImage(
      (current) => (current - 1 + images.length) % images.length
    );
  }

  function nextImage() {
    setActiveImage((current) => (current + 1) % images.length);
  }

  function openImage(index) {
    setActiveImage(index);
    setShowGallery(true);
  }

  return (
    <main className="product-detail-page">
      <header className="detail-header">
        <div className="detail-header-inner">
          <div className="detail-heading">
            <span className="detail-category">
              {product.category || "Experiencia"}
            </span>

            <h1>{product.name || "Producto"}</h1>
          </div>

          <button className="back-button" onClick={onBack}>
            <ArrowLeft size={18} />
            Volver
          </button>
        </div>
      </header>

      <div className="detail-content">
        <div className="detail-location">
          <MapPin size={18} />
          {product.location || "Ubicación a consultar"}
        </div>

        <section
          className="detail-gallery"
          aria-label="Galería del producto"
        >
          <button
            type="button"
            className="gallery-main"
            onClick={() => openImage(0)}
            aria-label="Ver imagen principal"
          >
            <img
              src={images[0]}
              alt={`${product.name || "Producto"}, imagen 1`}
            />
          </button>

          <div className="gallery-side">
            {images.slice(1, 5).map((image, index) => (
              <button
                type="button"
                className="gallery-thumb"
                key={image}
                onClick={() => openImage(index + 1)}
                aria-label={`Ver imagen ${index + 2}`}
              >
                <img
                  src={image}
                  alt={`${product.name || "Producto"}, imagen ${
                    index + 2
                  }`}
                />

                {index === 3 && images.length > 5 && (
                  <span className="gallery-more">
                    Ver más <span>＋</span>
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>

        <section className="detail-information">
          <div className="detail-description">
            <span className="eyebrow">CONOCÉ MÁS</span>
            <h2>Acerca de esta experiencia</h2>

            <p>
              {product.description ||
                "Descubrí todos los detalles de esta propuesta."}
            </p>

            <p>
              Explorá esta propuesta y preparate para disfrutar de tu
              próxima experiencia con ReservaYa.
            </p>
          </div>

          <aside className="detail-price-card">
            <button
              type="button"
              className={`detail-favorite ${
                favorite ? "favorite-active" : ""
              }`}
              onClick={() => setFavorite((current) => !current)}
              aria-pressed={favorite}
            >
              <Heart
                size={19}
                fill={favorite ? "currentColor" : "none"}
              />
              {favorite ? "Guardado" : "Guardar favorito"}
            </button>

            <span className="detail-price-label">
              Precio de referencia
            </span>

            <strong className="detail-price">
              {formatPrice(product.price)}
            </strong>

            <p>
              El precio final dependerá de la disponibilidad del servicio.
            </p>

            <button
              type="button"
              className="btn btn-primary detail-reserve-btn"
              onClick={() =>
                window.alert(
                  "La consulta de disponibilidad estará disponible próximamente."
                )
              }
            >
              Consultar disponibilidad
            </button>
          </aside>
        </section>
      </div>

      {showGallery && (
        <div
          className="gallery-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Galería de imágenes"
          onClick={() => setShowGallery(false)}
        >
          <button
            type="button"
            className="gallery-close"
            onClick={() => setShowGallery(false)}
            aria-label="Cerrar galería"
          >
            <X size={26} />
          </button>

          <span className="gallery-counter">
            {activeImage + 1} / {images.length}
          </span>

          <button
            type="button"
            className="gallery-navigation gallery-previous"
            onClick={(event) => {
              event.stopPropagation();
              previousImage();
            }}
            aria-label="Imagen anterior"
          >
            <ChevronLeft size={30} />
          </button>

          <img
            className="gallery-modal-image"
            src={images[activeImage]}
            alt={`${product.name || "Producto"}, imagen ${
              activeImage + 1
            }`}
            onClick={(event) => event.stopPropagation()}
          />

          <button
            type="button"
            className="gallery-navigation gallery-next"
            onClick={(event) => {
              event.stopPropagation();
              nextImage();
            }}
            aria-label="Imagen siguiente"
          >
            <ChevronRight size={30} />
          </button>
        </div>
      )}
    </main>
  );
}