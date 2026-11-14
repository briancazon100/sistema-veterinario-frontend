
import { apiRequest, escaparHTML } from "../api.js";

// Usuario actualmente autenticado.
let usuarioActual = null;

// ==========================================
// INICIALIZAR PANEL DE USUARIO
// ==========================================

export function inicializarPanelUsuario() {

    const botonPerfil = document.getElementById("btnPerfilUsuario");
    const panel = document.getElementById("panelPerfilUsuario");

    if (!botonPerfil || !panel) {
        console.error("No se encontró el panel de usuario.");
        return;
    }

    // ABRIR Y CERRAR PANEL
    botonPerfil.addEventListener("click", async () => {

        const abrir = panel.hidden;

        panel.hidden = !abrir;

        botonPerfil.setAttribute(
            "aria-expanded",
            String(abrir)
        );

        if (abrir) {
            await cargarDatosUsuario();
        }
    });

    // CERRAR AL HACER CLIC FUERA
    document.addEventListener("click", evento => {

        if (panel.hidden) return;

        if (
            !panel.contains(evento.target) &&
            !botonPerfil.contains(evento.target)
        ) {
            cerrarPanel();
        }
    });

    // CERRAR CON ESCAPE
    document.addEventListener("keydown", evento => {

        if (evento.key === "Escape" && !panel.hidden) {
            cerrarPanel();
        }
    });

    // CREAR USUARIO
    document.getElementById("formCrearUsuario")
        ?.addEventListener("submit", crearUsuario);

    // ACTUALIZAR LISTADO
    document.getElementById("btnActualizarUsuarios")
        ?.addEventListener("click", cargarUsuariosActivos);

    // DESACTIVAR USUARIO
    document.getElementById("listaUsuarios")
        ?.addEventListener("click", async evento => {

            if (!(evento.target instanceof Element)) return;

            const boton = evento.target.closest(
                '[data-accion="desactivar"]'
            );

            if (!boton) return;

            await desactivarUsuario(boton.dataset.usuarioId);
        });
}


// ==========================================
// CERRAR PANEL
// ==========================================

function cerrarPanel() {

    const panel = document.getElementById("panelPerfilUsuario");
    const boton = document.getElementById("btnPerfilUsuario");

    panel.hidden = true;

    boton.setAttribute("aria-expanded", "false");
}


// ==========================================
// OBTENER ROL
// ==========================================

function obtenerNombreRol(rol) {

    if (typeof rol === "string") {
        return rol;
    }

    return rol?.nombre ?? "Sin rol";
}


// ==========================================
// COMPROBAR SI ES ADMIN
// ==========================================

function esAdministrador(rol) {

    const nombre = obtenerNombreRol(rol).toUpperCase();

    return nombre === "ADMIN" || nombre === "ROLE_ADMIN";
}


// ==========================================
// CARGAR INFORMACIÓN DEL USUARIO
// ==========================================

async function cargarDatosUsuario() {

    try {

        const usuario = await apiRequest("/auth/me");

        usuarioActual = usuario;

        document.getElementById("perfilUsername").textContent =
            usuario.username ?? "Sin username";

        document.getElementById("perfilRol").textContent =
            obtenerNombreRol(usuario.rol);

        // Mantener compatibilidad si todavía existen
        // los elementos anteriores del topbar.
        const usernameTopbar = document.getElementById("usuarioUsername");
        const rolTopbar = document.getElementById("usuarioRol");

        if (usernameTopbar) {
            usernameTopbar.textContent = usuario.username;
        }

        if (rolTopbar) {
            rolTopbar.textContent = obtenerNombreRol(usuario.rol);
        }

        const seccionAdmin = document.getElementById(
            "seccionAdminUsuarios"
        );

        const esAdmin = esAdministrador(usuario.rol);

        seccionAdmin.hidden = !esAdmin;

        if (esAdmin) {
            await cargarUsuariosActivos();
        }

    } catch (error) {

        console.error("Error al cargar el usuario:", error);

        usuarioActual = null;

        document.getElementById("perfilUsername").textContent =
            "Usuario no disponible";

        document.getElementById("perfilRol").textContent =
            "No se pudo cargar la información";

        document.getElementById("seccionAdminUsuarios").hidden = true;
    }
}


// ==========================================
// LISTAR USUARIOS ACTIVOS
// ==========================================

async function cargarUsuariosActivos() {

    const lista = document.getElementById("listaUsuarios");

    if (!usuarioActual || !esAdministrador(usuarioActual.rol)) {
        return;
    }

    lista.innerHTML = `
        <div class="text-center text-secondary py-3">
            <span class="spinner-border spinner-border-sm me-2"></span>
            Cargando usuarios...
        </div>
    `;

    try {

        const usuarios = await apiRequest("/auth/listarActivos");

        if (!Array.isArray(usuarios)) {
            throw new Error("La API no devolvió una lista de usuarios válida.");
        }

        if (usuarios.length === 0) {

            lista.innerHTML = `
                <p class="text-secondary small text-center">
                    No hay usuarios activos.
                </p>
            `;

            return;
        }

        lista.innerHTML = usuarios.map(usuario => {

            const esCuentaActual =
                Number(usuario.id) === Number(usuarioActual.id);

            return `
                <div class="d-flex justify-content-between align-items-center
                            gap-2 py-3 border-bottom">

                    <div class="overflow-hidden">

                        <strong class="d-block text-break">
                            ${escaparHTML(usuario.username)}
                        </strong>

                        <small class="text-secondary">
                            ${escaparHTML(obtenerNombreRol(usuario.rol))}
                        </small>

                    </div>

                    <div class="flex-shrink-0">

                        ${
                            esCuentaActual
                                ? `
                                    <span class="badge text-bg-primary">
                                        Tu cuenta
                                    </span>
                                `
                                : `
                                    <button
                                        type="button"
                                        class="btn btn-sm btn-outline-danger"
                                        data-accion="desactivar"
                                        data-usuario-id="${escaparHTML(usuario.id)}">

                                        <i class="bi bi-person-x me-1"></i>
                                        Desactivar

                                    </button>
                                `
                        }

                    </div>

                </div>
            `;

        }).join("");

    } catch (error) {

        console.error("Error al listar usuarios:", error);

        lista.innerHTML = `
            <div class="alert alert-danger small">
                ${escaparHTML(error.message)}
            </div>
        `;
    }
}


// ==========================================
// CREAR USUARIO
// ==========================================

async function crearUsuario(evento) {

    evento.preventDefault();

    const formulario = document.getElementById("formCrearUsuario");

    const boton = document.getElementById("btnCrearUsuario");

    const username = document.getElementById("nuevoUsername")
        .value.trim();

    const contraseña = document.getElementById("nuevaContraseña")
        .value;

    const rolNombre = document.getElementById("nuevoRol").value;

    if (!username || !contraseña || !rolNombre) {

        mostrarMensajeUsuarios(
            "Completá todos los campos.",
            "warning"
        );

        return;
    }

    const registro = {
        username: username,
        contraseña: contraseña,
        rolNombre: rolNombre
    };

    boton.disabled = true;

    boton.innerHTML = `
        <span class="spinner-border spinner-border-sm me-1"></span>
        Creando usuario...
    `;

    try {

        await apiRequest("/auth/register", {
            method: "POST",
            body: JSON.stringify(registro)
        });

        formulario.reset();

        mostrarMensajeUsuarios(
            "Usuario creado correctamente.",
            "success"
        );

        await cargarUsuariosActivos();

    } catch (error) {

        console.error("Error al crear usuario:", error);

        mostrarMensajeUsuarios(
            error.message || "No se pudo crear el usuario.",
            "danger"
        );

    } finally {

        boton.disabled = false;

        boton.innerHTML = `
            <i class="bi bi-person-plus me-1"></i>
            Crear usuario
        `;
    }
}


// ==========================================
// DESACTIVAR USUARIO
// ==========================================

async function desactivarUsuario(id) {

    if (!id) {
        return;
    }

    const usuario = usuarioActual;

    if (!usuario || Number(id) === Number(usuario.id)) {

        mostrarMensajeUsuarios(
            "No podés desactivar tu propia cuenta.",
            "warning"
        );

        return;
    }

    const confirmar = window.confirm(
        "¿Estás seguro de que querés desactivar este usuario?"
    );

    if (!confirmar) {
        return;
    }

    try {

        await apiRequest(
            `/auth/${encodeURIComponent(id)}/desactivar`,
            {
                method: "DELETE"
            }
        );

        mostrarMensajeUsuarios(
            "Usuario desactivado correctamente.",
            "success"
        );

        await cargarUsuariosActivos();

    } catch (error) {

        console.error("Error al desactivar usuario:", error);

        mostrarMensajeUsuarios(
            error.message || "No se pudo desactivar el usuario.",
            "danger"
        );
    }
}


// ==========================================
// MOSTRAR MENSAJES
// ==========================================

function mostrarMensajeUsuarios(mensaje, tipo = "success") {

    const contenedor = document.getElementById("mensajeUsuarios");

    contenedor.innerHTML = `
        <div class="alert alert-${tipo} alert-dismissible fade show"
             role="alert">

            ${escaparHTML(mensaje)}

            <button
                type="button"
                class="btn-close"
                data-bs-dismiss="alert">
            </button>

        </div>
    `;
}
