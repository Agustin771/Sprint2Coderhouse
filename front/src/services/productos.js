const API_URL = "http://localhost:8080/api/productos";

async function request(url, options = {}) {
  const token = localStorage.getItem("reservaYaToken");

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && {
        Authorization: `Bearer ${token}`,
      }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const message = await response.text();

    throw new Error(
      message || `Error HTTP ${response.status}`
    );
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function obtenerProductos() {
  return request(API_URL);
}

export function obtenerProducto(id) {
  return request(`${API_URL}/${id}`);
}

export function crearProducto(producto) {
  return request(API_URL, {
    method: "POST",
    body: JSON.stringify(producto),
  });
}

export function actualizarProducto(id, producto) {
  return request(`${API_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(producto),
  });
}

export function eliminarProducto(id) {
  return request(`${API_URL}/${id}`, {
    method: "DELETE",
  });
}