
import { apiRequest, escaparHTML } from "../api.js";

let usuarioActual = null;

// ==========================================
// VISTA PRINCIPAL
// ==========================================

export function mostrarUsuario() {

    return `
        <div class="page-heading">

            <div>
                <h1>Mi cuenta</h1>

                <p class="page-subtitle">
                    Consultá tu información personal y administrá las cuentas del sistema.
                </p>
            </div>

            <button
                type="button"
                class="btn btn-outline-secondary"
                id="btnVolverUsuario">

                <i class="bi bi-arrow-left me-1"></i>
                Volver

            </button>

        </div>

        <div id="mensajePerfil"></div>

        <!-- INFORMACIÓN PERSONAL -->
        <div class="content-card mb-4">

            <div class="content-card-header">
                <h2 class="h5 mb-0">
                    <i class="bi bi-person-circle me-2"></i>
                    Información personal
                </h2>
            </div>

            <div class="content-card-body">

                <div id="datosPerfilUsuario">

                    <div class="text-center py-3 text-secondary">
                        <span class="spinner-border spinner-border-sm me-2"></span>
                        Cargando información...
                    </div>

                </div>

            </div>

        </div>

        <!-- ADMINISTRACIÓN DE USUARIOS -->
        <section id="panelAdministracionUsuarios" hidden>

            <div class="page-heading mb-3">
                <div>
                    <h2 class="h4">Gestión de usuarios</h2>

                    <p class="page-subtitle">
                        Creá nuevas cuentas y administrá los usuarios del sistema.
                    </p>
                </div>
            </div>

            <div id="mensajeUsuarios"></div>

            <div class="row g-4">

                <!-- FORMULARIO DE CREACIÓN -->
                <div class="col-12 col-lg-4">

                    <div class="content-card h-100">

                        <div class="content-card-header">
                            <h3 class="h5 mb-0">
                                <i class="bi bi-person-plus me-2"></i>
                                Crear usuario
                            </h3>
                        </div>

                        <div class="content-card-body">

                            <form id="formCrearUsuario">

                                <div class="mb-3">

                                    <label
                                        for="nuevoUsername"
                                        class="form-label">

                                        Nombre de usuario

                                    </label>

                                    <input
                                        type="text"
                                        class="form-control"
                                        id="nuevoUsername"
                                        required>

                                </div>

                                <div class="mb-3">

                                    <label
                                        for="nuevaContraseña"
                                        class="form-label">

                                        Contraseña inicial

                                    </label>

                                    <input
                                        type="password"
                                        class="form-control"
                                        id="nuevaContraseña"
                                        required>

                                </div>

                                <div class="alert alert-light small">
                                    <i class="bi bi-info-circle me-1"></i>

                                    La cuenta se creará automáticamente con el rol USER.
                                </div>

                                <button
                                    type="submit"
                                    class="btn btn-primary w-100"
                                    id="btnCrearUsuario">

                                    <i class="bi bi-person-plus me-1"></i>
                                    Crear usuario

                                </button>

                            </form>

                        </div>

                    </div>

                </div>

                <!-- LISTADO DE USUARIOS -->
                <div class="col-12 col-lg-8">

                    <div class="content-card">

                        <div class="content-card-header
                                    d-flex justify-content-between
                                    align-items-center">

                            <h3 class="h5 mb-0">
                                Usuarios activos
                            </h3>

                            <button
                                type="button"
                                class="btn btn-outline-secondary btn-sm"
                                id="btnActualizarUsuarios">

                                <i class="bi bi-arrow-clockwise me-1"></i>
                                Actualizar

                            </button>

                        </div>

                        <div class="content-card-body">

                            <div class="table-responsive">

                                <table class="table table-hover align-middle">

                                    <thead class="table-light">
                                        <tr>
                                            <th>Usuario</th>
                                            <th>Rol</th>
                                            <th>Estado</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>

                                    <tbody id="tablaUsuarios">

                                        <tr>
                                            <td colspan="4"
                                                class="text-center text-secondary py-4">

                                                Cargando usuarios...

                                            </td>
                                        </tr>

                                    </tbody>

                                </table>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </section>
    `;
}


// ==========================================
// INICIALIZACIÓN
// ==========================================

export async function inicializarUsuario(volver) {

    // Volver a la pantalla anterior.
    document.getElementById("btnVolverUsuario")
        .addEventListener("click", volver);

    // Crear usuario.
    document.getElementById("formCrearUsuario")
        .addEventListener("submit", crearUsuario);

    // Actualizar listado.
    document.getElementById("btnActualizarUsuarios")
        .addEventListener("click", cargarUsuariosActivos);

    // Delegación de eventos para desactivar usuarios.
    document.getElementById("tablaUsuarios")
        .addEventListener("click", async evento => {

            if (!(evento.target instanceof Element)) {
                return;
            }

            const boton = evento.target.closest(
                '[data-accion="desactivar"]'
            );

            if (!boton) {
                return;
            }

            await desactivarUsuario(boton.dataset.usuarioId, boton);

        });

    // Consultar perfil al entrar a la pantalla.
    await cargarPerfil();
}


// ==========================================
// OBTENER NOMBRE DEL ROL
// ==========================================

function obtenerNombreRol(rol) {

    const nombre = typeof rol === "string"
        ? rol
        : rol?.nombre;

    return nombre || "Sin rol";
}

function formatearRol(rol) {

    return obtenerNombreRol(rol)
        .replace(/^ROLE_/, "");
}

function esAdministrador(rol) {

    return obtenerNombreRol(rol).toUpperCase() === "ROLE_ADMIN";
}


// ==========================================
// CARGAR INFORMACIÓN DEL PERFIL
// ==========================================

async function cargarPerfil() {

    const contenedor = document.getElementById("datosPerfilUsuario");
    const panelAdmin = document.getElementById("panelAdministracionUsuarios");

    usuarioActual = null;
    panelAdmin.hidden = true;

    contenedor.innerHTML = `
        <div class="text-center py-3 text-secondary">
            <span class="spinner-border spinner-border-sm me-2"></span>
            Cargando información...
        </div>
    `;

    try {

        const usuario = await apiRequest("/auth/me");

        usuarioActual = usuario;

        contenedor.innerHTML = `

            <div class="d-flex flex-wrap align-items-center gap-3">

                <div class="user-avatar"
                     style="width:60px;height:60px;font-size:28px;">

                    <i class="bi bi-person-fill"></i>

                </div>

                <div>

                    <h3 class="h5 mb-1">
                        ${escaparHTML(usuario.username)}
                    </h3>

                    <span class="badge ${
                        esAdministrador(usuario.rol)
                            ? "text-bg-primary"
                            : "text-bg-secondary"
                    }">

                        ${escaparHTML(formatearRol(usuario.rol))}

                    </span>

                </div>

            </div>

        `;

        // También actualizar el nombre y rol en el navbar,
        // si los elementos anteriores todavía existen.
        const usernameTopbar = document.getElementById("usuarioUsername");
        const rolTopbar = document.getElementById("usuarioRol");

        if (usernameTopbar) {
            usernameTopbar.textContent = usuario.username;
        }

        if (rolTopbar) {
            rolTopbar.textContent = formatearRol(usuario.rol);
        }

        // Mostrar gestión solamente para ADMIN.
        if (esAdministrador(usuario.rol)) {

            panelAdmin.hidden = false;

            await cargarUsuariosActivos();
        }

    } catch (error) {

        console.error("Error al cargar el perfil:", error);

        contenedor.innerHTML = `
            <div class="alert alert-danger mb-0">
                ${escaparHTML(error.message || "No se pudo cargar tu perfil.")}
            </div>
        `;
    }
}


// ==========================================
// LISTAR USUARIOS ACTIVOS
// ==========================================

async function cargarUsuariosActivos() {

    const tabla = document.getElementById("tablaUsuarios");

    if (!usuarioActual || !esAdministrador(usuarioActual.rol)) {
        return;
    }

    tabla.innerHTML = `
        <tr>
            <td colspan="4" class="text-center py-4 text-secondary">

                <span class="spinner-border spinner-border-sm me-2"></span>
                Cargando usuarios...

            </td>
        </tr>
    `;

    try {

        const usuarios = await apiRequest("/auth/listarActivos");

        if (!Array.isArray(usuarios)) {
            throw new Error("La API no devolvió una lista válida de usuarios.");
        }

        if (usuarios.length === 0) {

            tabla.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-secondary py-4">
                        No hay usuarios activos.
                    </td>
                </tr>
            `;

            return;
        }

        tabla.innerHTML = usuarios.map(usuario => {

            const esCuentaActual =
                Number(usuario.id) === Number(usuarioActual.id);

            return `
                <tr>

                    <td>
                        <strong>
                            ${escaparHTML(usuario.username)}
                        </strong>

                        ${
                            esCuentaActual
                                ? `<span class="badge text-bg-info ms-1">Tu cuenta</span>`
                                : ""
                        }
                    </td>

                    <td>
                        ${escaparHTML(formatearRol(usuario.rol))}
                    </td>

                    <td>
                        <span class="badge text-bg-success">
                            Activo
                        </span>
                    </td>

                    <td>

                        ${
                            esCuentaActual
                                ? `<span class="text-secondary small">—</span>`
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

                    </td>

                </tr>
            `;

        }).join("");

    } catch (error) {

        console.error("Error al listar usuarios:", error);

        tabla.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-danger py-4">
                    ${escaparHTML(error.message || "No se pudieron cargar los usuarios.")}
                </td>
            </tr>
        `;
    }
}


// ==========================================
// CREAR USUARIO
// ==========================================

async function crearUsuario(evento) {

    evento.preventDefault();

    if (!usuarioActual || !esAdministrador(usuarioActual.rol)) {
        mostrarMensajeUsuarios("No tenés permisos para crear usuarios.", "danger");
        return;
    }

    const formulario = document.getElementById("formCrearUsuario");
    const boton = document.getElementById("btnCrearUsuario");

    const username = document.getElementById("nuevoUsername")
        .value.trim();

    const contraseña = document.getElementById("nuevaContraseña").value;

    if (!username || !contraseña) {

        mostrarMensajeUsuarios(
            "Completá el nombre de usuario y la contraseña.",
            "warning"
        );

        return;
    }

   const registro = {
    username,
    contraseña,
    rolNombre: "ROLE_USER"
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

async function desactivarUsuario(id, boton) {

    if (!id || !usuarioActual) {
        return;
    }

    if (Number(id) === Number(usuarioActual.id)) {

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

    boton.disabled = true;

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

        boton.disabled = false;
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
                data-bs-dismiss="alert"
                aria-label="Cerrar">
            </button>

        </div>
    `;
}
