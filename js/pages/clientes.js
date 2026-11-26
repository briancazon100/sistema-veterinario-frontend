import { apiRequest, escaparHTML } from "../api.js";

let clientes = [];
let paginaActualClientes = 0;
let totalPaginasClientes = 0;
const tamanoPaginaClientes = 10;
let temporizadorBusquedaClientes = null;

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
                <div class="row g-2 align-items-center">
                    <div class="col-12 col-sm-6 col-md-3">
                        <input
                            type="search"
                            id="buscarClienteNombre"
                            class="form-control"
                            placeholder="Nombre...">
                    </div>

                    <div class="col-12 col-sm-6 col-md-3">
                        <input
                            type="search"
                            id="buscarClienteApellido"
                            class="form-control"
                            placeholder="Apellido...">
                    </div>

                    <div class="col-12 col-sm-6 col-md-2">
                        <input
                            type="search"
                            id="buscarClienteTelefono"
                            class="form-control"
                            placeholder="Teléfono...">
                    </div>

                    <div class="col-12 col-sm-6 col-md-3">
                        <input
                            type="search"
                            id="buscarClienteDireccion"
                            class="form-control"
                            placeholder="Dirección...">
                    </div>

                    <div class="col-12 col-md-1 d-grid">
                        <button
                            type="button"
                            class="btn btn-outline-secondary"
                            id="btnLimpiarFiltrosClientes"
                            title="Limpiar filtros"
                            aria-label="Limpiar filtros">
                            <i class="bi bi-x-lg"></i>
                        </button>
                    </div>
                </div>
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

            <div class="content-card-body border-top d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                <small id="infoPaginacionClientes" class="text-secondary">
                    Cargando información...
                </small>

                <div class="d-flex gap-2">
                    <button
                        type="button"
                        class="btn btn-outline-primary btn-sm"
                        id="btnPaginaAnteriorClientes"
                        disabled
                    >
                        <i class="bi bi-chevron-left me-1"></i>
                        Anterior
                    </button>

                    <button
                        type="button"
                        class="btn btn-outline-primary btn-sm"
                        id="btnPaginaSiguienteClientes"
                        disabled
                    >
                        Siguiente
                        <i class="bi bi-chevron-right ms-1"></i>
                    </button>
                </div>
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

// OBTENER PARÁMETROS DE BÚSQUEDA Y FILTRO

function obtenerParametrosBusquedaClientes(pagina = paginaActualClientes) {
    const parametros = new URLSearchParams({
        page: String(pagina),
        size: String(tamanoPaginaClientes)
    });

    const nombre = document.getElementById("buscarClienteNombre")?.value.trim();
    const apellido = document.getElementById("buscarClienteApellido")?.value.trim();
    const telefono = document.getElementById("buscarClienteTelefono")?.value.trim();
    const direccion = document.getElementById("buscarClienteDireccion")?.value.trim();

    if (nombre) parametros.set("nombre", nombre);
    if (apellido) parametros.set("apellido", apellido);
    if (telefono) parametros.set("telefono", telefono);
    if (direccion) parametros.set("direccion", direccion);

    return parametros;
}

// BUSCAR Y LISTAR CLIENTES PAGINADOS

async function cargarClientes(pagina = paginaActualClientes) {
    const tabla = document.getElementById("tablaClientes");

    tabla.innerHTML = `
        <tr>
            <td colspan="5" class="text-center text-secondary py-4">
                <span class="spinner-border spinner-border-sm me-2"></span>
                Buscando clientes...
            </td>
        </tr>
    `;

    try {
        const parametros = obtenerParametrosBusquedaClientes(pagina);

        const resultado = await apiRequest(
            `/clientes/buscar?${parametros.toString()}`
        );

        if (!resultado || !Array.isArray(resultado.content)) {
            throw new Error(
                "La API no devolvió una página válida de clientes."
            );
        }

        paginaActualClientes = resultado.number ?? pagina;
        totalPaginasClientes = resultado.totalPages ?? 0;
        clientes = resultado.content;

        renderizarClientes();
        actualizarControlesPaginacionClientes(resultado);

    } catch (error) {
        tabla.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-danger py-4">
                    ${escaparHTML(error.message)}
                </td>
            </tr>
        `;

        document.getElementById("infoPaginacionClientes").textContent =
            "No se pudo cargar la paginación.";
        document.getElementById("btnPaginaAnteriorClientes").disabled = true;
        document.getElementById("btnPaginaSiguienteClientes").disabled = true;

        console.error("Error al cargar clientes:", error);
    }
}

function programarBusquedaClientes() {
    clearTimeout(temporizadorBusquedaClientes);
    temporizadorBusquedaClientes = setTimeout(() => {
        cargarClientes(0);
    }, 350);
}

function configurarFiltrosClientes() {
    const campos = [
        document.getElementById("buscarClienteNombre"),
        document.getElementById("buscarClienteApellido"),
        document.getElementById("buscarClienteTelefono"),
        document.getElementById("buscarClienteDireccion")
    ];

    campos.forEach(campo => {
        campo?.addEventListener("input", programarBusquedaClientes);
    });

    document.getElementById("btnLimpiarFiltrosClientes")
        ?.addEventListener("click", () => {
            clearTimeout(temporizadorBusquedaClientes);
            campos.forEach(campo => {
                if (campo) campo.value = "";
            });
            cargarClientes(0);
        });
}

function actualizarControlesPaginacionClientes(resultado) {
    const botonAnterior = document.getElementById("btnPaginaAnteriorClientes");
    const botonSiguiente = document.getElementById("btnPaginaSiguienteClientes");
    const informacion = document.getElementById("infoPaginacionClientes");

    const totalElementos = resultado.totalElements ?? 0;
    const numeroPagina = resultado.number ?? 0;
    const tamanio = resultado.size ?? tamanoPaginaClientes;

    const desde = totalElementos === 0
        ? 0
        : numeroPagina * tamanio + 1;

    const hasta = Math.min(
        (numeroPagina + 1) * tamanio,
        totalElementos
    );

    informacion.textContent =
        `Mostrando ${desde} a ${hasta} de ${totalElementos} clientes`;

    botonAnterior.disabled = resultado.first ?? numeroPagina === 0;
    botonSiguiente.disabled =
        resultado.last ?? numeroPagina >= totalPaginasClientes - 1;
}

function configurarPaginacionClientes() {
    const botonAnterior = document.getElementById("btnPaginaAnteriorClientes");
    const botonSiguiente = document.getElementById("btnPaginaSiguienteClientes");

    botonAnterior.addEventListener("click", async () => {
        if (paginaActualClientes > 0) {
            await cargarClientes(paginaActualClientes - 1);
        }
    });

    botonSiguiente.addEventListener("click", async () => {
        if (paginaActualClientes < totalPaginasClientes - 1) {
            await cargarClientes(paginaActualClientes + 1);
        }
    });
}

function renderizarClientes() {
    const tabla = document.getElementById("tablaClientes");

    if (clientes.length === 0) {
        tabla.innerHTML = `
            <tr>
                <td colspan="5"
                    class="text-center text-secondary py-4">
                    No se encontraron clientes con esos criterios.
                </td>
            </tr>
        `;
        return;
    }

    tabla.innerHTML = clientes.map(cliente => `
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

        await cargarClientes(id ? paginaActualClientes : 0);

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

        await cargarClientes(paginaActualClientes);

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

    configurarFiltrosClientes();
    configurarPaginacionClientes();

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

    cargarClientes(0);
}