import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ArrowLeft,
  Menu,
  X,
  ShieldCheck,
  Trash2,
  Search,
  ArrowUpLeft,
  MapPin,
  Pencil,
} from "lucide-react";
import "./AdminPanel.css";

const EMPTY_FORM = {
  name: "",
  category: "",
  location: "",
  price: "",
  image: "",
  images: [""],
  description: "",
};

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80";

export default function AdminPanel({
  products = [],
  categories = [],
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [categorySaving, setCategorySaving] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);

  const [editingProductId, setEditingProductId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("editar");
    return id !== null && id !== "" ? id : null;
  });

  const isEditing = editingProductId !== null;

  useEffect(() => {
    if (editingProductId === null) return;

    const product = products.find(
      (item) => String(item.id) === String(editingProductId)
    );

    if (!product) return;

    const categoryId =
      product.category?.id ??
      product.categoryId ??
      product.categoria?.id ??
      "";

    setForm({
      name: product.name ?? product.nombre ?? "",
      category: String(categoryId),
      location: product.location ?? product.ubicacion ?? "",
      price: String(product.price ?? product.precio ?? ""),
      image: product.image ?? product.imagen ?? "",
      images:
        Array.isArray(product.images) && product.images.length
          ? [...product.images]
          : [product.image ?? product.imagen ?? ""],
      description: product.description ?? product.descripcion ?? "",
    });

    setFormError("");
  }, [editingProductId, products, categories]);

  const currentPath = window.location.pathname.replace(/\/+$/, "") || "/";
  const isProductList = currentPath === "/administracion/productos";
  const isNewProduct = currentPath === "/administracion/productos/nuevo";

  const filteredProducts = products.filter((product) =>
    String(product.name ?? product.nombre ?? "")
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  );

  function updateField(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleEditProduct(product) {
    const categoryId =
      product.category?.id ??
      product.categoryId ??
      product.categoria?.id ??
      "";

    setEditingProductId(product.id);

    setForm({
      name: product.name ?? product.nombre ?? "",
      category: String(categoryId),
      location: product.location ?? product.ubicacion ?? "",
      price: String(product.price ?? product.precio ?? ""),
      image: product.image ?? product.imagen ?? "",
      images:
        Array.isArray(product.images) && product.images.length
          ? [...product.images]
          : [product.image ?? product.imagen ?? ""],
      description: product.description ?? product.descripcion ?? "",
    });

    setFormError("");

    window.location.href = `/administracion/productos/nuevo?editar=${product.id}`;
  }

  function updateImage(index, value) {
    setForm((current) => {
      const images = [...current.images];
      images[index] = value;

      return {
        ...current,
        images,
        image: images[0] || "",
      };
    });
  }

  function addImageField() {
    setForm((current) => ({
      ...current,
      images: [...current.images, ""],
    }));
  }

  function removeImageField(index) {
    setForm((current) => {
      const images = current.images.filter((_, i) => i !== index);

      return {
        ...current,
        images: images.length ? images : [""],
        image: images[0] || "",
      };
    });
  }

  async function handleSaveCategory(event) {
    event.preventDefault();
    setCategoryError("");

    const nombre = categoryName.trim();

    if (!nombre) {
      setCategoryError("Escribí el nombre de la categoría.");
      return;
    }

    try {
      setCategorySaving(true);

      if (editingCategoryId !== null) {
        await onUpdateCategory(editingCategoryId, nombre);
      } else {
        await onAddCategory(nombre);
      }

      setCategoryName("");
      setEditingCategoryId(null);
    } catch (error) {
      setCategoryError(
        error instanceof Error ? error.message : "No se pudo guardar la categoría."
      );
    } finally {
      setCategorySaving(false);
    }
  }

  async function handleRemoveCategory(item) {
    const confirmed = window.confirm(
      `¿Eliminar la categoría "${item.nombre ?? item}"?`
    );

    if (!confirmed) return;

    try {
      setCategoryError("");
      await onDeleteCategory(item.id);
    } catch (error) {
      setCategoryError(
        error instanceof Error ? error.message : "No se pudo eliminar la categoría."
      );
    }
  }

  async function handleCreateProduct(event) {
    event.preventDefault();
    setFormError("");

    const name = form.name.trim();
    const location = form.location.trim();
    const description = form.description.trim();
    const price = Number(form.price);

    if (!name || !location || !description || form.price.trim() === "") {
      setFormError("Completá todos los campos obligatorios.");
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setFormError("Ingresá un precio válido, igual o mayor a cero.");
      return;
    }

    const images = form.images.map((url) => url.trim()).filter(Boolean);

    if (images.length === 0) {
      setFormError("Agregá al menos una imagen.");
      return;
    }

    for (const image of images) {
      try {
        const parsedUrl = new URL(image);
        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
          throw new Error("URL inválida");
        }
      } catch {
        setFormError("Revisá las URL de las imágenes.");
        return;
      }
    }

    const saveHandler = isEditing ? onUpdateProduct : onAddProduct;

    if (!saveHandler) {
      setFormError("La función para guardar productos no está conectada.");
      return;
    }

    try {
      setSaving(true);

      const selectedCategory = categories.find(
        (item) => String(item.id) === String(form.category)
      );

      if (!selectedCategory || selectedCategory.id == null) {
        setFormError("Seleccioná una categoría válida.");
        return;
      }

      // Estructura en inglés para que coincida con el backend/servicios
      const productData = {
        name,
        category: {
          id: Number(selectedCategory.id),
        },
        location,
        price,
        image: images[0],
        images,
        description,
      };

      if (isEditing) {
        await onUpdateProduct(editingProductId, productData);
        setEditingProductId(null);
        setForm(EMPTY_FORM);
        setFormError("");
        window.location.href = "/administracion/productos";
      } else {
        await onAddProduct(productData);
        setForm(EMPTY_FORM);
        window.location.href = "/administracion/productos";
      }
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "No se pudo guardar el producto."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(product) {
    const confirmed = window.confirm(
      `¿Seguro que querés eliminar "${product.name ?? product.nombre}"?\n\nEsta acción no se puede deshacer.`
    );

    if (confirmed) {
      onDeleteProduct?.(product.id);
    }
  }

  return (
    <div className="admin-layout">
      <aside
        className={`admin-sidebar ${menuOpen ? "admin-sidebar-open" : ""}`}
      >
        <a className="admin-brand" href="/">
          <span className="admin-brand-logo">R</span>
          <span>
            <strong>ReservaYa</strong>
            <small>Administración</small>
          </span>
        </a>

        <div className="admin-menu-label">MENÚ PRINCIPAL</div>

        <nav className="admin-nav">
          <a
            className={`admin-nav-link ${isNewProduct ? "admin-nav-active" : ""}`}
            href="/administracion/productos/nuevo"
            onClick={() => setMenuOpen(false)}
          >
            {isEditing ? <Pencil size={19} /> : <PlusCircle size={19} />}
            <span>{isEditing ? "Editar producto" : "Agregar producto"}</span>
          </a>
          <a
            className={`admin-nav-link ${isProductList ? "admin-nav-active" : ""}`}
            href="/administracion/productos"
            onClick={() => setMenuOpen(false)}
          >
            <Package size={19} />
            <span>Lista de productos</span>
          </a>
        </nav>

        <a className="admin-back-home" href="/">
          <ArrowLeft size={18} />
          Volver al sitio
        </a>
      </aside>

      {menuOpen && (
        <button
          className="admin-mobile-overlay"
          aria-label="Cerrar menú"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <main className="admin-main">
        <header className="admin-topbar">
          <button
            className="admin-menu-toggle"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>

          <div>
            <span className="admin-topbar-label">
              RESERVAYA / ADMINISTRACIÓN
            </span>

            <h1>
              {isProductList
                ? "Lista de productos"
                : isEditing
                ? "Editar producto"
                : isNewProduct
                ? "Agregar producto"
                : "Panel de administración"}
            </h1>
          </div>

          <span className="admin-status">
            <span className="admin-status-dot" />
            Administración
          </span>
        </header>

        {isProductList && !isEditing ? (
          <section className="admin-section admin-product-list">
            <div className="admin-list-heading">
              <div>
                <span className="admin-eyebrow">CATÁLOGO</span>
                <h2>Productos registrados</h2>
                <p>Consultá y gestioná los productos de ReservaYa.</p>
              </div>

              <a className="admin-add-button" href="/administracion/productos/nuevo">
                <PlusCircle size={18} />
                Agregar producto
              </a>
            </div>
            <div className="admin-list-toolbar">
              <label className="admin-search">
                <Search size={18} />
                <input
                  type="search"
                  placeholder="Buscar por nombre..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>

              <span className="admin-product-count">
                {filteredProducts.length} de {products.length} productos
              </span>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Ubicación</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td className="admin-id">#{product.id}</td>

                      <td>
                        <div className="admin-product-cell">
                          <img
                            src={product.image || product.imagen || DEFAULT_IMAGE}
                            alt=""
                            className="admin-product-thumb"
                          />

                          <div>
                            <strong>{product.name ?? product.nombre}</strong>
                            <small>
                              $
                              {Number(product.price ?? product.precio ?? 0).toLocaleString("es-AR")}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="admin-category-pill">
                          {typeof product.category === "string"
                            ? product.category
                            : product.category?.nombre ??
                              product.categoria?.nombre ??
                              "Sin categoría"}
                        </span>
                      </td>

                      <td>
                        <span className="admin-location">
                          <MapPin size={14} />
                          {product.location ?? product.ubicacion}
                        </span>
                      </td>

                      <td>
                        <div className="admin-row-actions">
                          <button
                            type="button"
                            className="admin-edit-button"
                            title="Editar producto"
                            aria-label={`Editar ${product.name ?? product.nombre}`}
                            onClick={() => handleEditProduct(product)}
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            className="admin-delete-button"
                            title="Eliminar producto"
                            aria-label={`Eliminar ${product.name ?? product.nombre}`}
                            onClick={() => handleDelete(product)}
                          >
                            <Trash2 size={16} />
                            <span>Eliminar</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredProducts.length === 0 && (
                <div className="admin-empty-state">
                  <Package size={36} />
                  <h3>No encontramos productos</h3>
                  <p>
                    {search ? "Probá con otro nombre." : "Todavía no hay productos registrados."}
                  </p>

                  {search && (
                    <button
                      className="admin-secondary-button"
                      onClick={() => setSearch("")}
                    >
                      Limpiar búsqueda
                    </button>
                  )}
                </div>
              )}
            </div>

            <a className="admin-list-back" href="/administracion">
              <ArrowUpLeft size={17} />
              Volver al panel
            </a>
          </section>
        ) : isNewProduct || isEditing ? (
          <section className="admin-section admin-form-section">
            <div className="admin-list-heading">
              <div>
                <span className="admin-eyebrow">
                  {isEditing ? "EDICIÓN DE PRODUCTO" : "NUEVO PRODUCTO"}
                </span>

                <h2>
                  {isEditing ? "Editando producto" : "Agregando producto"}
                </h2>

                <p>
                  {isEditing
                    ? "Estás modificando los datos del producto seleccionado."
                    : "Completá los datos para agregar una nueva experiencia a ReservaYa."}
                </p>
              </div>
            </div>

            <form className="admin-product-form" onSubmit={handleCreateProduct}>
              <div className="admin-form-grid">
                <label className="admin-field">
                  Nombre del producto *
                  <input
                    name="name"
                    value={form.name}
                    onChange={updateField}
                    placeholder="Ej. Hotel Boutique Palermo"
                    maxLength={120}
                    required
                  />
                </label>

                <label className="admin-field">
                  Categoría *
                  <select
                    name="category"
                    value={form.category}
                    onChange={updateField}
                    required
                    disabled={categories.length === 0}
                  >
                    <option value="">
                      {categories.length === 0
                        ? "No hay categorías disponibles"
                        : "Seleccioná una categoría"}
                    </option>

                    {categories.map((item) => (
                      <option key={item.id} value={String(item.id)}>
                        {item.nombre}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="admin-field">
                  Ubicación *
                  <input
                    name="location"
                    value={form.location}
                    onChange={updateField}
                    placeholder="Ej. Palermo, Buenos Aires"
                    maxLength={180}
                    required
                  />
                </label>

                <label className="admin-field">
                  Precio de referencia (ARS) *
                  <input
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={updateField}
                    placeholder="85000"
                    required
                  />
                </label>

                <div className="admin-field admin-field-full">
                  <label>Imágenes del producto *</label>

                  <span className="admin-field-help">
                    Pegá una URL pública por imagen. La primera será la imagen principal.
                  </span>

                  <div className="admin-images-form-list">
                    {form.images.map((image, index) => (
                      <div className="admin-image-input-row" key={index}>
                        <input
                          type="url"
                          value={image}
                          onChange={(event) =>
                            updateImage(index, event.target.value)
                          }
                          placeholder={`https://ejemplo.com/imagen-${index + 1}.jpg`}
                          aria-label={`URL de imagen ${index + 1}`}
                          required={index === 0}
                        />

                        {form.images.length > 1 && (
                          <button
                            type="button"
                            className="admin-remove-image"
                            onClick={() => removeImageField(index)}
                            aria-label={`Eliminar imagen ${index + 1}`}
                          >
                            <X size={18} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="admin-secondary-button admin-add-image"
                    onClick={addImageField}
                  >
                    <PlusCircle size={17} />
                    Agregar otra imagen
                  </button>
                </div>

                <label className="admin-field admin-field-full">
                  Descripción *
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={updateField}
                    placeholder="Describí el producto o la experiencia..."
                    maxLength={1000}
                    rows={5}
                    required
                  />
                </label>
              </div>

              {formError && (
                <p className="admin-form-message admin-form-error" role="alert">
                  {formError}
                </p>
              )}

              <div className="admin-form-actions">
                <button
                  type="button"
                  className="admin-cancel-button"
                  onClick={() => {
                    setEditingProductId(null);
                    setForm(EMPTY_FORM);
                    setFormError("");
                    window.location.href = "/administracion/productos";
                  }}
                >
                  Cancelar
                </button>
                <button
                  className="admin-add-button"
                  type="submit"
                  disabled={saving}
                >
                  <PlusCircle size={18} />
                  {saving
                    ? "Guardando..."
                    : isEditing
                    ? "Guardar cambios"
                    : "Guardar producto"}
                </button>
              </div>
            </form>
          </section>
        ) : (
          <>
            <section className="admin-section">
              <div className="admin-section-heading">
                <h2>Gestión de categorías</h2>
                <p>Creá y administrá las categorías de tu catálogo.</p>
              </div>

              <form className="admin-product-form" onSubmit={handleSaveCategory}>
                <div className="admin-field">
                  <label htmlFor="categoryName">Nombre de la categoría</label>
                  <input
                    id="categoryName"
                    value={categoryName}
                    onChange={(event) => setCategoryName(event.target.value)}
                    placeholder="Ej. Hoteles, Vuelos, Moda..."
                    maxLength={100}
                    required
                  />
                </div>

                {categoryError && (
                  <p className="admin-form-message admin-form-error" role="alert">
                    {categoryError}
                  </p>
                )}

                <div className="admin-form-actions">
                  {editingCategoryId !== null && (
                    <button
                      type="button"
                      className="admin-cancel-button"
                      onClick={() => {
                        setEditingCategoryId(null);
                        setCategoryName("");
                        setCategoryError("");
                      }}
                    >
                      Cancelar edición
                    </button>
                  )}

                  <button
                    type="submit"
                    className="admin-add-button"
                    disabled={categorySaving}
                  >
                    <PlusCircle size={18} />
                    {categorySaving
                      ? "Guardando..."
                      : editingCategoryId !== null
                      ? "Guardar cambios"
                      : "Crear categoría"}
                  </button>
                </div>
              </form>

              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Categoría</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {categories.map((item) => {
                      const nombre =
                        typeof item === "string" ? item : item.nombre;
                      const id = typeof item === "string" ? nombre : item.id;

                      return (
                        <tr key={id}>
                          <td>{nombre}</td>
                          <td>
                            <div className="admin-row-actions">
                              <button
                                type="button"
                                className="admin-edit-button"
                                title="Editar categoría"
                                onClick={() => {
                                  setEditingCategoryId(item.id);
                                  setCategoryName(nombre);
                                  setCategoryError("");
                                }}
                              >
                                <Pencil size={16} />
                              </button>

                              <button
                                type="button"
                                className="admin-delete-button"
                                onClick={() => handleRemoveCategory(item)}
                              >
                                <Trash2 size={16} />
                                <span>Eliminar</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {categories.length === 0 && (
                      <tr>
                        <td colSpan={2}>
                          Todavía no hay categorías. Creá la primera arriba.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="admin-welcome">
              <span className="admin-eyebrow">CENTRO DE GESTIÓN</span>
              <h2>¡Bienvenido a ReservaYa!</h2>
              <p>
                Administrá los productos que se muestran en el catálogo
                de tu aplicación desde un único lugar.
              </p>
            </section>

            <section className="admin-section">
              <div className="admin-section-heading">
                <h2>Gestión de productos</h2>
                <p>Seleccioná una opción para continuar.</p>
              </div>

              <div className="admin-actions-grid">
                <a
                  className="admin-action-card"
                  href="/administracion/productos"
                >
                  <span className="admin-action-icon">
                    <Package size={25} />
                  </span>
                  <h3>Lista de productos</h3>
                  <p>Consultá los productos del catálogo.</p>
                  <span className="admin-action-link">
                    Ver productos →
                  </span>
                  <span className="admin-card-count">
                    {products.length} productos registrados
                  </span>
                </a>

                <a
                  className="admin-action-card"
                  href="/administracion/productos/nuevo"
                >
                  <span className="admin-action-icon">
                    <PlusCircle size={25} />
                  </span>
                  <h3>Agregar producto</h3>
                  <p>Completá el formulario de alta.</p>
                  <span className="admin-action-link">
                    Crear producto →
                  </span>
                </a>
              </div>
            </section>
          </>
        )}

        <footer className="admin-footer">
          ReservaYa · Panel de administración
        </footer>
      </main>
    </div>
  );
}