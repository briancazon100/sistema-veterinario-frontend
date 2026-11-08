
const AUTH_ENDPOINT = "http://localhost:8080/api/v1/auth/login";
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
        const respuesta = await fetch(AUTH_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                username: username,
                "contraseña": password
            })
        });

      

        const resultado = await respuesta.json().catch(() => null);
        

        if (!respuesta.ok) {
            throw new Error(
                resultado?.message ||
                resultado?.error ||
                `No se pudo iniciar sesión. HTTP ${respuesta.status}.`
            );
        }

        // Según tu JwtResponseDto, el token viene en "token".
        if (
            typeof resultado?.token !== "string" ||
            !resultado.token.trim()
        ) {
            throw new Error(
                "La respuesta del servidor no contiene un JWT válido."
            );
        }

        // Guardamos el JWT para api.js.

        localStorage.setItem(TOKEN_KEY, resultado.token);

        // Entramos al panel principal.
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
