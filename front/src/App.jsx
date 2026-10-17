import { useEffect, useState } from "react";
import ProductDetail from "./pages/ProductDetail";
import AdminPanel from "./pages/AdminPanel";
import AuthModal from "./components/AuthModal";
import {
  obtenerCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
} from "./services/categorias";
import {
  obtenerProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} from "./services/productos";
import {
  Search,
  Hotel,
  Plane,
  Shirt,
  CarFront,
  Tag,
  ArrowRight,
  Heart,
  MapPin,
  Menu,
  X,
} from "lucide-react";


function Header({ onHome, user, onLogin, onRegister, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);

  function goHome() {
    setMenuOpen(false);
    onHome();
  }

  const displayName = user?.name || user?.email || "Usuario";

  const initials = displayName
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  return (
    <header className="site-header">
      <div className="header-inner">
        <a
          href="#inicio"
          className="brand"
          onClick={(event) => {
            event.preventDefault();
            goHome();
          }}
        >
          <span className="brand-logo">R</span>
          <span className="brand-text">
            <strong>ReservaYa</strong>
            <small>Tu próxima experiencia comienza aquí</small>
          </span>
        </a>

        <button
          className="mobile-menu"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>

        <nav className={`header-actions ${menuOpen ? "open" : ""}`}>
          {user ? (
            <>
              <div className="user-badge" title={user.email}>
                <span className="user-avatar">{initials || "U"}</span>
                <span>{displayName}</span>
              </div>

              <button
                className="btn btn-outline"
                onClick={() => {
                  setMenuOpen(false);
                  onLogout();
                }}
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <button
                className="btn btn-outline"
                onClick={() => {
                  setMenuOpen(false);
                  onRegister();
                }}
              >
                Crear cuenta
              </button>

              <button
                className="btn btn-primary"
                onClick={() => {
                  setMenuOpen(false);
                  onLogin();
                }}
              >
                Iniciar sesión
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

function ProductCard({ product, onSelectProduct }) {
  const [favorite, setFavorite] = useState(false);
  const description = product.description || "";
  const needsExpansion = description.length > 120;

  return (
    <article className="product-card">
      <div className="product-image-container">
        <img src={product.image} alt={product.name} />

        <span className="image-category">
          {product.category}
        </span>

        <button
          className={`favorite-btn ${
            favorite ? "favorite-active" : ""
          }`}
          onClick={() => setFavorite(!favorite)}
          aria-label={
            favorite
              ? "Quitar de favoritos"
              : "Marcar como favorito"
          }
        >
          <Heart
            size={19}
            fill={favorite ? "currentColor" : "none"}
          />
        </button>
      </div>

      <div className="product-info">
        <div className="product-location">
          <MapPin size={15} />
          {product.location}
        </div>

        <h3>{product.name}</h3>

        <div className="product-description-wrapper">
          <p className="product-description">
            {description ||
            "Descubrí todos los detalles de esta propuesta."}
          </p>

          {needsExpansion && (
            <button
              type="button"
              className="read-more-btn"
              onClick={() => onSelectProduct(product)}
            >
              Leer más →
            </button>
          )}
        </div>

        <div className="product-bottom">
          <div>
            <small>Precio de referencia</small>
            <strong>
              ${Number(product.price || 0).toLocaleString("es-AR")}
            </strong>
          </div>

          <button
            className="detail-btn"
            onClick={() => onSelectProduct(product)}
          >
            Ver detalle <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}

function Footer({ onHome }) {
  return (
    <footer className="site-footer">
      <a
        href="#inicio"
        className="footer-brand"
        onClick={(event) => {
          event.preventDefault();
          onHome();
        }}
      >
        <span className="brand-logo">R</span>
        <strong>ReservaYa</strong>
      </a>

      <p>
        © {new Date().getFullYear()} ReservaYa. Todos los derechos reservados.
      </p>
    </footer>
  );
}

function App() {
  const [category, setCategory] = useState("Todos");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [authMode, setAuthMode] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  function getUserFromToken(token) {
  
  try {
    const payload = JSON.parse(
      atob(
        token.split(".")[1]
          .replace(/-/g, "+")
          .replace(/_/g, "/")
      )
    );

    if (payload.exp && payload.exp * 1000 <= Date.now()) {
      localStorage.removeItem("reservaYaToken");
      return null;
    }

    return {
      email: payload.sub,
      roles: payload.roles ?? [],
      role: (payload.roles ?? []).includes("ROLE_ADMIN")
        ? "ROLE_ADMIN"
        : (payload.roles ?? [])[0] ?? null,
    };
  } catch {
    localStorage.removeItem("reservaYaToken");
    return null;
  }
}

  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("reservaYaToken");

    if (!token) return null;

    return getUserFromToken(token);
  });

function handleAuthSuccess(result) {
  if (result.registered) {
    setAuthMode("login");
    return;
  }

  localStorage.setItem("reservaYaToken", result.token);

  const loggedUser = getUserFromToken(result.token);
  

  if (!loggedUser) {
    setUser(null);
    setAuthMode("login");
    return;
  }

  setUser(loggedUser);
  setAuthMode(null);
  }

  function handleLogout() {
    localStorage.removeItem("reservaYaToken");
    setUser(null);
    setAuthMode(null);
  }

  useEffect(() => {
  let cancelled = false;

  async function loadCategories() {
    try {
      const data = await obtenerCategorias();

      console.log("CATEGORÍAS RECIBIDAS DEL BACKEND:", data);

      if (!Array.isArray(data)) {
        throw new Error("La API no devolvió una lista de categorías");
      }

      if (!cancelled) {
        setCategories(data);
      }
    } catch (error) {
      console.error("Error cargando categorías:", error);
    } finally {
      if (!cancelled) {
        setLoadingCategories(false);
      }
    }
  }

  loadCategories();

  return () => {
    cancelled = true;
  };
  }, []);

  useEffect(() => {
    let cancelled = false;

  async function loadProducts() {
    try {
      setLoadingProducts(true);
      setProductsError("");
    const data = await obtenerProductos();

    if (!Array.isArray(data)) {
      throw new Error("La API no devolvió una lista de productos.");
    }
  const productosAdaptados = data.map((producto) => {
  const images = Array.isArray(producto.images)
    ? producto.images.filter(Boolean)
    : [];

  const mainImage =
    producto.image ?? producto.imagen ?? images[0] ?? "";

  return {
    id: producto.id,
    name: producto.name ?? producto.nombre ?? "",
    category:
    typeof producto.category === "string"
      ? producto.category
      : producto.category?.nombre ??
        (typeof producto.categoria === "string"
          ? producto.categoria
          : producto.categoria?.nombre) ??
        "",
    location: producto.location ?? producto.ubicacion ?? "",
    price: Number(producto.price ?? producto.precio ?? 0),
    image: mainImage,
    images: images.length ? images : mainImage ? [mainImage] : [],
    description: producto.description ?? producto.descripcion ?? "",
  };
  });

    if (!cancelled) {
      setProducts(productosAdaptados);
    }
    } catch (error) {
      if (!cancelled) {
        setProductsError(
          "No pudimos cargar los productos desde el servidor. " +
          "Verificá que Spring Boot esté funcionando."
        );
        console.error("Error cargando productos:", error);
      }
    } finally {
      if (!cancelled) {
        setLoadingProducts(false);
      }
    }
  }

  loadProducts();

  return () => {
    cancelled = true;
  };
}, []);

  const pageSize = 10;

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      category === "Todos" || product.category === category;

    const query = search.trim().toLowerCase();

    const matchesSearch =
      product.name.toLowerCase().includes(query) ||
      product.location.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.ceil(filteredProducts.length / pageSize);

  const visibleProducts = filteredProducts.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  function selectCategory(name) {
    setCategory(name);
    setPage(1);
  }

  function updateSearch(value) {
    setSearch(value);
    setPage(1);
  }

  function openProduct(product) {
    setSelectedProduct(product);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goHome() {
    setSelectedProduct(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const recommendations = [...products]
  .sort((a, b) => a.id - b.id)
  .slice(0, 10);

  const isAdmin = user?.role === "ROLE_ADMIN";

    console.log("USUARIO ACTUAL:", user);
    console.log("ROL ACTUAL:", user?.role);
    console.log("ROLES ACTUALES:", user?.roles);
    console.log("ES ADMIN:", isAdmin);

  if (window.location.pathname.startsWith("/administracion")) {
      if (!user) {
    return <p>Iniciá sesión para acceder.</p>;
  }

  if (!isAdmin) {
    return <p>No tenés permisos para acceder al panel.</p>;
  }
    return (
      <AdminPanel
        products={products}
        categories={categories}
        onAddProduct={async (newProduct) => {
          const created = await crearProducto(newProduct);

        const images = Array.isArray(created.images) && created.images.length
    ? created.images
    : Array.isArray(newProduct.images)
      ? newProduct.images.filter(Boolean)
      : [];

    const product = {
        id: created.id,
        name: created.name ?? created.nombre ?? newProduct.name,
        category:
        typeof created.category === "string"
          ? created.category
          : created.category?.nombre ??
            (typeof created.categoria === "string"
              ? created.categoria
              : created.categoria?.nombre) ??
            newProduct.category,
        location:
          created.location ?? created.ubicacion ?? newProduct.location,
        price: Number(
          created.price ?? created.precio ?? newProduct.price
        ),
        image:
          created.image ?? created.imagen ?? images[0] ?? newProduct.image,
        images,
        description:
          created.description ??
          created.descripcion ??
          newProduct.description,
      };

        setProducts((current) => [...current, product]);
      }}
      
            onAddCategory={async (nombre) => {
        const created = await crearCategoria(nombre);

        setCategories((current) => [...current, created]);
      }}

      onUpdateCategory={async (id, nombre) => {
        const updated = await actualizarCategoria(id, nombre);

        setCategories((current) =>
          current.map((item) =>
            String(item.id) === String(id) ? updated : item
          )
        );
      }}

      onDeleteCategory={async (id) => {
        await eliminarCategoria(id);

        setCategories((current) =>
          current.filter((item) => String(item.id) !== String(id))
        );
      }}

      onUpdateProduct={async (productId, updatedProduct) => {
        const updated = await actualizarProducto(productId, updatedProduct);

        const images =
          Array.isArray(updated.images) && updated.images.length
            ? updated.images
            : updatedProduct.images;

        const product = {
          id: updated.id,
          name: updated.name ?? updated.nombre ?? updatedProduct.name,
          category: updated.category ?? updated.categoria ?? updatedProduct.category,
          location: updated.location ?? updated.ubicacion ?? updatedProduct.location,
          price: Number(updated.price ?? updated.precio ?? updatedProduct.price),
          image:
            updated.image ?? updated.imagen ?? images[0] ?? updatedProduct.image,
          images,
          description:
            updated.description ??
            updated.descripcion ??
            updatedProduct.description,
        };

        setProducts((current) =>
        current.map((item) =>
          String(item.id) === String(productId) ? product : item
        )
      );
      }}

      onDeleteProduct={async (productId) => {
        await eliminarProducto(productId);

        setProducts((current) =>
          current.filter((product) => product.id !== productId)
        );
      }}
    />
  );
}

  if (selectedProduct) {
return (
  <div id="inicio" className="app">
    <Header
      onHome={goHome}
      user={user}
      onLogin={() => setAuthMode("login")}
      onRegister={() => setAuthMode("register")}
      onLogout={handleLogout}
    />

    {authMode && (
      <AuthModal
        mode={authMode}
        onClose={() => setAuthMode(null)}
        onSuccess={handleAuthSuccess}
      />
    )}
  
      <ProductDetail
        product={selectedProduct}
        onBack={goHome}
      />

      <Footer onHome={goHome} />
    </div>
  );
}

  return (
  <div id="inicio" className="app">
      <Header
        onHome={goHome}
        user={user}
        onLogin={() => setAuthMode("login")}
        onRegister={() => setAuthMode("register")}
        onLogout={handleLogout}
      />

      {authMode && (
        <AuthModal
          mode={authMode}
          onClose={() => setAuthMode(null)}
          onSuccess={handleAuthSuccess}
        />
      )}

      <main>
        <section className="hero">
          <div className="hero-content">
            <span className="eyebrow">
              DESCUBRÍ · EXPLORÁ · RESERVÁ
            </span>

            <h1>
              Tu próxima experiencia
              <span> empieza acá.</span>
            </h1>

            <p>
              Encontrá hoteles, viajes, moda y autos para disfrutar
              cada momento a tu manera.
            </p>

            <form
              className="search-box"
              onSubmit={(event) => {
                event.preventDefault();

                document
                  .getElementById("catalogo")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <Search size={21} />

              <input
                value={search}
                onChange={(event) => updateSearch(event.target.value)}
                placeholder="¿Qué estás buscando?"
                aria-label="Buscar productos"
              />

              <button className="btn btn-primary" type="submit">
                Buscar
              </button>
            </form>

            <div className="hero-trust">
              <span>✓ Experiencias únicas</span>
              <span>✓ Múltiples categorías</span>
            </div>
          </div>

          <div className="hero-visual">
            <img
              src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1100&q=85"
              alt="Lago rodeado de montañas"
            />

            <div className="floating-card">
              <span className="floating-icon">✦</span>

              <div>
                <strong>El mundo te espera</strong>
                <small>¿Cuál será tu próximo destino?</small>
              </div>
            </div>
          </div>
        </section>

        <section className="section categories-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">ENCONTRÁ LO QUE BUSCÁS</span>
              <h2>Explorá por categoría</h2>
              <p>
                Todo lo que necesitás para tu próxima experiencia.
              </p>
            </div>
          </div>

      <div className="categories-grid">
        <button
          className={`category-card ${
            category === "Todos" ? "category-active" : ""
          }`}
          onClick={() => selectCategory("Todos")}
        >
          <span className="category-icon">
            <Search size={25} />
          </span>
          <strong>Todos</strong>
          <span className="category-arrow">
            <ArrowRight size={17} />
          </span>
        </button>

        {categories.map((item) => {
          const name =
            typeof item === "string" ? item : item.nombre;

          const Icon =
            name === "Hoteles" ? Hotel :
            name === "Vuelos" ? Plane :
            name === "Moda" ? Shirt :
            name === "Autos" ? CarFront :
            Tag;

          if (!name) return null;

          return (
            <button
              key={item.id}
              className={`category-card ${
                category === name ? "category-active" : ""
              }`}
              onClick={() => {
                selectCategory(name);

                document
                  .getElementById("catalogo")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <span className="category-icon">
                <Icon size={25} />
              </span>

              <strong>{name}</strong>

              <span className="category-arrow">
                <ArrowRight size={17} />
              </span>
            </button>
          );
        })}
      </div>
        </section>

        <section className="section catalog-section" id="catalogo">
          <div className="section-heading catalog-heading">
          <div>
            <span className="eyebrow">INSPIRACIÓN PARA VOS</span>

            <h2>
              {category === "Todos"
                ? "Descubrí nuevas experiencias"
                : category}
            </h2>

            <p>
              Encontramos {filteredProducts.length} propuestas para vos.
            </p>
          </div>

          <span className="results-badge">
            {filteredProducts.length} productos
          </span>
        </div>
            {loadingProducts ? (
            <div className="empty-state">
              <p>Cargando experiencias...</p>
            </div>
          ) : productsError ? (
            <div className="empty-state">
              <h3>No pudimos cargar los productos</h3>
              <p>{productsError}</p>
              <button
                className="btn btn-primary"
                onClick={() => window.location.reload()}
              >
                Reintentar
              </button>
            </div>
          ) : visibleProducts.length > 0 ? (
            <div className="products-grid">
              {visibleProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelectProduct={openProduct}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Search size={32} />
              <h3>No encontramos resultados</h3>
              <p>
                Probá otra búsqueda o seleccioná una categoría diferente.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => {
                  updateSearch("");
                  selectCategory("Todos");
                }}
              >
                Ver todos los productos
              </button>
            </div>
          )}

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-outline"
                disabled={page === 1}
                onClick={() => setPage(1)}
              >
                Inicio
              </button>

              <button
                className="page-arrow"
                disabled={page === 1}
                onClick={() => setPage((current) => current - 1)}
                aria-label="Página anterior"
              >
                ←
              </button>

              <span>
                Página <strong>{page}</strong> de {totalPages}
              </span>

              <button
                className="page-arrow"
                disabled={page === totalPages}
                onClick={() => setPage((current) => current + 1)}
                aria-label="Página siguiente"
              >
                →
              </button>
            </div>
          )}
        </section>

        <section className="recommendations section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">SELECCIÓN ESPECIAL</span>
              <h2>Recomendados para vos</h2>
              <p>
                Dejá que te sorprendamos con nuevas ideas.
              </p>
            </div>
          </div>

          <div className="products-grid">
            {recommendations.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelectProduct={openProduct}
              />
            ))}
          </div>
        </section>
      </main>

      <Footer onHome={goHome} />
    </div>
  );
}

export default App;