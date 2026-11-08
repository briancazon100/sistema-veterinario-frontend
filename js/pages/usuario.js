import { apiRequest } from "../api.js";

export async function cargarDatosUsuario() {

    try {
        console.log("URL final:", "http://localhost:8080/api/v1/auth/me");

        const usuario = await apiRequest("/auth/me");

        console.log("Respuesta recibida:", usuario);

        document.getElementById("usuarioUsername").textContent =
            usuario.username;

        document.getElementById("usuarioRol").textContent =
            usuario.rol?.nombre ?? "Sin rol";

    } catch (error) {

        console.error("Error al cargar el usuario:", error);

        document.getElementById("usuarioUsername").textContent =
            "Usuario no disponible";

        document.getElementById("usuarioRol").textContent =
            "Error al cargar";
    }
}