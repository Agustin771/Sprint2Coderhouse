
const API_URL = "http://localhost:8080/auth";

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const text = await response.text();

  let data = text;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // El servidor devolvió texto plano, no JSON.
  }

  if (!response.ok) {
    const message =
      typeof data === "string"
        ? data
        : data?.message || `Error HTTP ${response.status}`;

    throw new Error(message || "Ocurrió un error.");
  }

  return data;
}

export function registrarUsuario(user) {
  return request(`${API_URL}/register`, {
    method: "POST",
    body: JSON.stringify(user),
  });
}

export function iniciarSesion(credentials) {
  return request(`${API_URL}/login`, {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}
