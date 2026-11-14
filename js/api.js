
const API_BASE = "https://sistema-veterinario.onrender.com/api/v1";

export async function apiRequest(ruta, opciones = {}) {

    const token = localStorage.getItem("token");

    const headers = new Headers(opciones.headers || {});

    headers.set("Accept", "application/json");

    // Adjuntar JWT solamente si existe.
    if (token) {

        headers.set(
            "Authorization",
            token.startsWith("Bearer ") ? token : `Bearer ${token}`
        );

    }

    // Detectar si estamos enviando un archivo mediante FormData.
    const esFormData =
        typeof FormData !== "undefined" &&
        opciones.body instanceof FormData;

    if (esFormData) {

        headers.delete("Content-Type");

    } else if (
        opciones.body !== undefined &&
        opciones.body !== null
    ) {

        headers.set("Content-Type", "application/json");

    }

    const respuesta = await fetch(`${API_BASE}${ruta}`, {
        ...opciones,
        headers
    });


    // ==========================================
    // MANEJO DE ERRORES HTTP
    // ==========================================

    if (!respuesta.ok) {

        let mensaje = `Error HTTP ${respuesta.status}`;

        try {

            const error = await respuesta.json();

            mensaje =
                error.message ||
                error.detail ||
                error.error ||
                mensaje;

        } catch {
            // El backend puede no devolver JSON.
        }

        if (respuesta.status === 401) {

            mensaje = ruta === "/auth/login"
                ? "Usuario o contraseña incorrectos."
                : "No estás autenticado.";

        }

        if (respuesta.status === 403) {

            mensaje = ruta === "/auth/login"
                ? "Usuario o contraseña incorrectos."
                : "No tenés permisos para realizar esta operación.";

        }

        throw new Error(mensaje);

    }


    // ==========================================
    // RESPUESTAS SIN CONTENIDO
    // ==========================================

    // DELETE puede responder HTTP 204.
    if (respuesta.status === 204) {
        return null;
    }


    // ==========================================
    // LEER RESPUESTA DEL SERVIDOR
    // ==========================================

    const texto = await respuesta.text();

    if (!texto) {
        return null;
    }

    // Si es JSON, devolver objeto.
    // Si es texto plano, devolver el texto.
    try {

        return JSON.parse(texto);

    } catch {

        return texto;

    }

}


// ==========================================
// ESCAPAR HTML
// ==========================================

export function escaparHTML(valor) {

    return String(valor ?? "").replace(/[&<>"']/g, caracter => ({

        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"

    })[caracter]);

}
