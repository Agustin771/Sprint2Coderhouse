
const API_URL = "http://localhost:8080/api/categorias";

async function request(url, options = {}) {
  const token = localStorage.getItem("reservaYaToken");

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Error HTTP ${response.status}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

export function obtenerCategorias() {
  return request(API_URL);
}

export function crearCategoria(nombre) {
  return request(API_URL, {
    method: "POST",
    body: JSON.stringify({ nombre }),
  });
}

export function actualizarCategoria(id, nombre) {
  return request(`${API_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify({ nombre }),
  });
}

export function eliminarCategoria(id) {
  return request(`${API_URL}/${id}`, {
    method: "DELETE",
  });
}
