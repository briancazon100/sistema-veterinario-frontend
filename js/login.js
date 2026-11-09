
import { apiRequest } from "./api.js";

const TOKEN_KEY = "token";

const formulario = document.getElementById("formLogin");
const botonLogin = document.getElementById("btnLogin");
const mensaje = document.getElementById("mensajeLogin");

function mostrarError(texto) {
    mensaje.textContent = texto;
    mensaje.className = "alert alert-danger";
}

formulario.addEventListener("submit", async evento => {
    evento.preventDefault();

    mensaje.textContent = "";
    mensaje.className = "";

    const username = document.getElementById("usuario").value.trim();
    const password = document.getElementById("password").value;

    botonLogin.disabled = true;
    botonLogin.textContent = "Ingresando...";

    try {
        const resultado = await apiRequest("/auth/login", {
            method: "POST",
            body: JSON.stringify({
                username: username,
                contraseña: password
            })
        });

        if (
            typeof resultado?.token !== "string" ||
            !resultado.token.trim()
        ) {
            throw new Error(
                "La respuesta del servidor no contiene un JWT válido."
            );
        }

        localStorage.setItem(TOKEN_KEY, resultado.token);

        window.location.replace("/");

    } catch (error) {
        mostrarError(error.message);
        console.error("Error al iniciar sesión:", error);

    } finally {
        botonLogin.disabled = false;
        botonLogin.innerHTML =
            '<i class="bi bi-box-arrow-in-right me-2"></i>Ingresar';
    }
});