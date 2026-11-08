
import { apiRequest, escaparHTML } from "../api.js";

let clientes = [];

export function mostrarClientes() {
    return `
        <div class="page-heading">
            <div>
                <h1>Clientes</h1>
                <p class="page-subtitle">
                    Gestioná los propietarios de las mascotas.
                </p>
            </div>

            <button class="btn btn-success" id="btnNuevoCliente">
                <i class="bi bi-plus-lg me-2"></i>
                Nuevo cliente
            </button>
        </div>

        <div id="mensajeClientes"></div>

        <div class="content-card">
            <div class="content-card-header">
                <input
                    type="search"
                    id="buscarCliente"
                    class="form-control"
                    placeholder="Buscar por nombre, apellido o teléfono..."
                    style="max-width: 450px;">
            </div>

            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light">
                        <tr>
                            <th>Nombre</th>
                            <th>Apellido</th>
                            <th>Teléfono</th>
                            <th>Dirección</th>
                            <th class="text-end">Acciones</th>
                        </tr>
                    </thead>

                    <tbody id="tablaClientes">
                        <tr>
                            <td colspan="5"
                                class="text-center text-secondary py-4">
                                Cargando clientes...
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Modal de alta y edición -->
        <div class="modal fade"
             id="clienteModal"
             tabindex="-1"
             aria-hidden="true">

            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">

                    <div class="modal-header">
                        <h5 class="modal-title" id="clienteModalTitulo">
                            Nuevo cliente
                        </h5>

                        <button type="button"
                                class="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Cerrar"></button>
                    </div>

                    <form id="formCliente">
                        <div class="modal-body">

                            <input type="hidden" id="clienteId">

                            <div class="mb-3">
                                <label for="clienteNombre"
                                       class="form-label">
                                    Nombre *
                                </label>

                                <input type="text"
                                       id="clienteNombre"
                                       class="form-control"
                                       maxlength="100"
                                       required>
                            </div>

                            <div class="mb-3">
                                <label for="clienteApellido"
                                       class="form-label">
                                    Apellido *
                                </label>

                                <input type="text"
                                       id="clienteApellido"
                                       class="form-control"
                                       maxlength="100"
                                       required>
                            </div>

                            <div class="mb-3">
                                <label for="clienteTelefono"
                                       class="form-label">
                                    Teléfono *
                                </label>

                                <input type="tel"
                                       id="clienteTelefono"
                                       class="form-control"
                                       maxlength="30"
                                       required>
                            </div>

                            <div class="mb-3">
                                <label for="clienteDireccion"
                                       class="form-label">
                                    Dirección *
                                </label>

                                <input type="text"
                                       id="clienteDireccion"
                                       class="form-control"
                                       maxlength="150"
                                       required>
                            </div>

                        </div>

                        <div class="modal-footer">
                            <button type="button"
                                    class="btn btn-light"
                                    data-bs-dismiss="modal">
                                Cancelar
                            </button>

                            <button type="submit"
                                    class="btn btn-success"
                                    id="btnGuardarCliente">
                                Guardar cliente
                            </button>
                        </div>
                    </form>

                </div>
            </div>
        </div>
    `;
}

// LISTAR CLIENTES

async function cargarClientes() {
    const tabla = document.getElementById("tablaClientes");

    tabla.innerHTML = `
        <tr>
            <td colspan="5" class="text-center py-4">
                Cargando clientes...
            </td>
        </tr>
    `;

    try {
        const datos = await apiRequest("/clientes");

        if (!Array.isArray(datos)) {
            throw new Error("La API no devolvió una lista de clientes.");
        }

        clientes = datos;
        renderizarClientes();

    } catch (error) {
        tabla.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-danger py-4">
                    ${escaparHTML(error.message)}
                </td>
            </tr>
        `;

        console.error("Error al cargar clientes:", error);
    }
}

function renderizarClientes() {
    const tabla = document.getElementById("tablaClientes");
    const busqueda = document
        .getElementById("buscarCliente")
        .value
        .trim()
        .toLowerCase();

    const filtrados = clientes.filter(cliente => {
        const texto = [
            cliente.nombre,
            cliente.apellido,
            cliente.telefono,
            cliente.direccion
        ].join(" ").toLowerCase();

        return texto.includes(busqueda);
    });

    if (filtrados.length === 0) {
        tabla.innerHTML = `
            <tr>
                <td colspan="5"
                    class="text-center text-secondary py-4">
                    No se encontraron clientes.
                </td>
            </tr>
        `;
        return;
    }

    tabla.innerHTML = filtrados.map(cliente => `
        <tr>
            <td>${escaparHTML(cliente.nombre)}</td>
            <td>${escaparHTML(cliente.apellido)}</td>
            <td>${escaparHTML(cliente.telefono)}</td>
            <td>${escaparHTML(cliente.direccion)}</td>

            <td class="text-end text-nowrap">
                <button class="btn btn-sm btn-outline-primary me-1"
                        data-accion="editar"
                        data-id="${escaparHTML(cliente.id)}"
                        title="Editar">
                    <i class="bi bi-pencil"></i>
                </button>

                <button class="btn btn-sm btn-outline-danger"
                        data-accion="eliminar"
                        data-id="${escaparHTML(cliente.id)}"
                        title="Eliminar">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join("");
}

// ABRIR FORMULARIO

function abrirFormulario(cliente = null) {
    const formulario = document.getElementById("formCliente");

    formulario.reset();

    document.getElementById("clienteId").value = cliente?.id ?? "";
    document.getElementById("clienteNombre").value =
        cliente?.nombre ?? "";
    document.getElementById("clienteApellido").value =
        cliente?.apellido ?? "";
    document.getElementById("clienteTelefono").value =
        cliente?.telefono ?? "";
    document.getElementById("clienteDireccion").value =
        cliente?.direccion ?? "";

    document.getElementById("clienteModalTitulo").textContent =
        cliente ? "Editar cliente" : "Nuevo cliente";

    bootstrap.Modal
        .getOrCreateInstance(document.getElementById("clienteModal"))
        .show();
}

// GUARDAR O ACTUALIZAR

async function guardarCliente(evento) {
    evento.preventDefault();

    const id = document.getElementById("clienteId").value;

    const cliente = {
        nombre: document.getElementById("clienteNombre").value.trim(),
        apellido: document.getElementById("clienteApellido").value.trim(),
        telefono: document.getElementById("clienteTelefono").value.trim(),
        direccion: document.getElementById("clienteDireccion").value.trim()
    };

    if (Object.values(cliente).some(valor => !valor)) {
        mostrarMensaje("Completá todos los campos obligatorios.", "warning");
        return;
    }

    const boton = document.getElementById("btnGuardarCliente");
    boton.disabled = true;

    try {
        await apiRequest(
            id ? `/clientes/${encodeURIComponent(id)}` : "/clientes",
            {
                method: id ? "PUT" : "POST",
                body: JSON.stringify(cliente)
            }
        );

        bootstrap.Modal
            .getOrCreateInstance(document.getElementById("clienteModal"))
            .hide();

        await cargarClientes();

        mostrarMensaje(
            id ? "Cliente actualizado correctamente."
                : "Cliente registrado correctamente."
        );

    } catch (error) {
        mostrarMensaje(error.message, "danger");
    } finally {
        boton.disabled = false;
    }
}

// ELIMINAR

async function eliminarCliente(id) {
    const cliente = clientes.find(
        item => String(item.id) === String(id)
    );

    if (!cliente) return;

    const confirmar = window.confirm(
        `¿Eliminar a ${cliente.nombre} ${cliente.apellido}?`
    );

    if (!confirmar) return;

    try {
        await apiRequest(`/clientes/${encodeURIComponent(id)}`, {
            method: "DELETE"
        });

        await cargarClientes();

        mostrarMensaje("Cliente eliminado correctamente.");

    } catch (error) {
        mostrarMensaje(error.message, "danger");
    }
}

function mostrarMensaje(mensaje, tipo = "success") {
    document.getElementById("mensajeClientes").innerHTML = `
        <div class="alert alert-${tipo} alert-dismissible fade show"
             role="alert">
            ${escaparHTML(mensaje)}
            <button type="button"
                    class="btn-close"
                    data-bs-dismiss="alert"
                    aria-label="Cerrar"></button>
        </div>
    `;
}

// INICIALIZAR EL MÓDULO

export function inicializarClientes() {
    document.getElementById("btnNuevoCliente")
        .addEventListener("click", () => abrirFormulario());

    document.getElementById("formCliente")
        .addEventListener("submit", guardarCliente);

    document.getElementById("buscarCliente")
        .addEventListener("input", renderizarClientes);

    document.getElementById("tablaClientes")
        .addEventListener("click", evento => {
            const boton = evento.target.closest("button[data-accion]");

            if (!boton) return;

            if (boton.dataset.accion === "editar") {
                const cliente = clientes.find(
                    item => String(item.id) === boton.dataset.id
                );

                if (cliente) abrirFormulario(cliente);
            }

            if (boton.dataset.accion === "eliminar") {
                eliminarCliente(boton.dataset.id);
            }
        });

    cargarClientes();
}
