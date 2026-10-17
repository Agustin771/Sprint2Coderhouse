import { useState } from "react";
import { registrarUsuario, iniciarSesion } from "../services/auth";

export default function AuthModal({ mode, onClose, onSuccess }) {
  const isRegister = mode === "register";

  const [form, setForm] = useState({
    name: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (isRegister && form.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    try {
      setLoading(true);

      if (isRegister) {
        await registrarUsuario(form);

        // Una vez registrado, pasamos al login.
        onSuccess({ registered: true, email: form.email });
        return;
      }

      const response = await iniciarSesion({
        email: form.email,
        password: form.password,
      });

      if (!response?.token) {
        throw new Error("El servidor no devolvió un token válido.");
      }

      onSuccess({ token: response.token });
    } catch (err) {
      setError(err.message || "No se pudo completar la operación.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-overlay" onClick={onClose}>
      <section
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="auth-close"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>

        <h2 id="auth-title">
          {isRegister ? "Crear cuenta" : "Iniciar sesión"}
        </h2>

        <p>
          {isRegister
            ? "Registrate para comenzar tu próxima experiencia."
            : "Ingresá a tu cuenta de ReservaYa."}
        </p>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <label>
                Nombre
                <input
                  name="name"
                  value={form.name}
                  onChange={updateField}
                  maxLength={80}
                  autoComplete="given-name"
                  required
                />
              </label>

              <label>
                Apellido
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={updateField}
                  maxLength={80}
                  autoComplete="family-name"
                  required
                />
              </label>
            </>
          )}

          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={updateField}
              autoComplete="email"
              required
            />
          </label>

          <label>
            Contraseña
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={updateField}
              minLength={8}
              autoComplete={isRegister ? "new-password" : "current-password"}
              required
            />
          </label>

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          <button
            className="btn btn-primary"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Procesando..."
              : isRegister
              ? "Crear cuenta"
              : "Iniciar sesión"}
          </button>
        </form>
      </section>
    </div>
  );
}