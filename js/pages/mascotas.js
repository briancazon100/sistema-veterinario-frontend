
import { apiRequest, escaparHTML } from "../api.js";
import {
    mostrarFichaMascota,
    inicializarFichaMascota
} from "./ficha-mascota.js";

let mascotas = [];
let clientesDisponibles = [];

export function mostrarMascotas() {
    return `
        <div class="page-heading">
            <div>
                <h1>Mascotas</h1>
                <p class="page-subtitle">
                    Gestioná las mascotas y sus propietarios.
                </p>
            </div>

            <button class="btn btn-success" id="btnNuevaMascota">
                <i class="bi bi-plus-lg me-2"></i>
                Nueva mascota
            </button>
        </div>

        <div id="mensajeMascotas"></div>

        <div class="content-card">
            <div class="content-card-header">
                <div class="row g-2 align-items-center">
                    <div class="col-12 col-md-7">
                        <input
                            type="search"
                            id="buscarMascota"
                            class="form-control"
                            placeholder="Buscar por nombre, especie, raza o dueño...">
                    </div>

                   
                </div>
            </div>

            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light">
                        <tr>
                            <th>Nombre</th>
                            <th>Especie</th>
                            <th>Raza</th>
                            <th>Nacimiento</th>
                            <th>Propietario</th>
                            <th class="text-end">Acciones</th>
                        </tr>
                    </thead>

                    <tbody id="tablaMascotas">
                        <tr>
                            <td colspan="6"
                                class="text-center text-secondary py-4">
                                Cargando mascotas..
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- FORMULARIO DE ALTA Y EDICIÓN -->
        <div class="modal fade"
             id="mascotaModal"
             tabindex="-1"
             aria-labelledby="mascotaModalTitulo"
             aria-hidden="true">

            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">

                    <div class="modal-header">
                        <h5 class="modal-title" id="mascotaModalTitulo">
                            Nueva mascota
                        </h5>

                        <button type="button"
                                class="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Cerrar"></button>
                    </div>

                    <form id="formMascota">
                        <div class="modal-body">

                            <input type="hidden" id="mascotaId">

                            <div class="mb-3">
                                <label for="mascotaNombre"
                                       class="form-label">
                                    Nombre *
                                </label>

                                <input type="text"
                                       id="mascotaNombre"
                                       class="form-control"
                                       required>
                            </div>

                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label for="mascotaEspecie"
                                           class="form-label">
                                        Especie *
                                    </label>

                                    <input type="text"
                                           id="mascotaEspecie"
                                           class="form-control"
                                           placeholder="Ej. Perro"
                                           required>
                                </div>

                                <div class="col-md-6">
                                    <label for="mascotaRaza"
                                           class="form-label">
                                        Raza *
                                    </label>

                                    <input type="text"
                                           id="mascotaRaza"
                                           class="form-control"
                                           placeholder="Ej. Labrador"
                                           required>
                                </div>
                            </div>

                            <div class="mt-3">
                                <label for="mascotaFechaNacimiento"
                                       class="form-label">
                                    Fecha de nacimiento *
                                </label>

                                <input type="date"
                                       id="mascotaFechaNacimiento"
                                       class="form-control"
                                       required>
                            </div>

                            <div class="mt-3">
                                <label for="mascotaCliente"
                                       class="form-label">
                                    Propietario *
                                </label>

                                <select id="mascotaCliente"
                                        class="form-select"
                                        required>
                                    <option value="">
                                        Seleccioná un propietario
                                    </option>
                                </select>

                                <div class="form-text">
                                    El propietario debe estar registrado
                                    previamente en Clientes.
                                </div>
                            </div>

                        </div>

                        <div class="modal-footer">
                            <button type="button"
                                    class="btn btn-light"
                                    data-bs-dismiss="modal">
                                Cancelar
                            </button>

                            <button type="submit"
                                    id="btnGuardarMascota"
                                    class="btn btn-success">
                                Guardar mascota
                            </button>
                        </div>
                    </form>

                </div>
            </div>
        </div>
    `;
}

// UTILIDADES

function fechaActualLocal() {
    const ahora = new Date();
    ahora.setMinutes(
        ahora.getMinutes() - ahora.getTimezoneOffset()
    );

    return ahora.toISOString().slice(0, 10);
}

function formatearFecha(fecha) {
    if (!fecha) return "—";

    const partes = fecha.split("-");

    if (partes.length !== 3) return fecha;

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function mostrarMensaje(mensaje, tipo = "success") {
    const contenedor = document.getElementById("mensajeMascotas");

    if (!contenedor) return;

    contenedor.innerHTML = `
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

// CARGAR PROPIETARIOS DESDE LA API DE CLIENTES

async function cargarClientesDisponibles() {
    const selector = document.getElementById("mascotaCliente");

    try {
        const datos = await apiRequest("/clientes");

        if (!Array.isArray(datos)) {
            throw new Error("La API de clientes no devolvió una lista.");
        }

        clientesDisponibles = datos;

        selector.innerHTML = `
            <option value="">Seleccioná un propietario</option>
            ${clientesDisponibles.map(cliente => `
                <option value="${escaparHTML(cliente.id)}">
                    ${escaparHTML(cliente.nombre)}
                    ${escaparHTML(cliente.apellido)}
                    — ${escaparHTML(cliente.telefono)}
                </option>
            `).join("")}
        `;

        if (clientesDisponibles.length === 0) {
            selector.innerHTML = `
                <option value="">Primero registrá un cliente</option>
            `;
        }

    } catch (error) {
        selector.innerHTML = `
            <option value="">
                No se pudieron cargar los clientes
            </option>
        `;

        mostrarMensaje(
            `Error al cargar propietarios: ${error.message}`,
            "danger"
        );

        console.error("Error al cargar propietarios:", error);
    }
}

// LISTAR MASCOTAS DESDE LA API

async function cargarMascotas() {
    const tabla = document.getElementById("tablaMascotas");

    tabla.innerHTML = `
        <tr>
            <td colspan="6" class="text-center text-secondary py-4">
                Cargando mascotas...
            </td>
        </tr>
    `;

    try {
        const datos = await apiRequest("/mascotas");

        if (!Array.isArray(datos)) {
            throw new Error("La API no devolvió una lista de mascotas.");
        }

        mascotas = datos;
        renderizarMascotas();

    } catch (error) {
        tabla.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-danger py-4">
                    ${escaparHTML(error.message)}
                </td>
            </tr>
        `;

        console.error("Error al cargar mascotas:", error);
    }
}

// CONSTRUIR LAS FILAS Y APLICAR LA BÚSQUEDA LOCAL

function renderizarMascotas() {
    const tabla = document.getElementById("tablaMascotas");

    const busqueda = document.getElementById("buscarMascota")
        .value.trim().toLowerCase();

    const filtradas = mascotas.filter(mascota => {
        const cliente = clientesDisponibles.find(
            item => String(item.id) === String(mascota.clienteId)
        );

        const propietario = mascota.nombreClienteCompleto ||
            (cliente
                ? `${cliente.nombre} ${cliente.apellido}`
                : "");

        const texto = [
            mascota.nombre,
            mascota.especie,
            mascota.raza,
            mascota.fechaNacimiento,
            propietario
        ].join(" ").toLowerCase();

        return texto.includes(busqueda);
    });

    if (filtradas.length === 0) {
        tabla.innerHTML = `
            <tr>
                <td colspan="6"
                    class="text-center text-secondary py-4">
                    No se encontraron mascotas.
                </td>
            </tr>
        `;
        return;
    }

    tabla.innerHTML = filtradas.map(mascota => {
        const cliente = clientesDisponibles.find(
            item => String(item.id) === String(mascota.clienteId)
        );

        const propietario = mascota.nombreClienteCompleto ||
            (cliente
                ? `${cliente.nombre} ${cliente.apellido}`
                : `Cliente #${mascota.clienteId}`);

        return `
            <tr>
                <td>
                    ${escaparHTML(mascota.nombre)}
                </td>

                <td>${escaparHTML(mascota.especie)}</td>
                <td>${escaparHTML(mascota.raza)}</td>
                <td>${escaparHTML(
                    formatearFecha(mascota.fechaNacimiento)
                )}</td>

                <td>${escaparHTML(propietario)}</td>

                <td class="text-end text-nowrap">
                  <button type="button"
                            class="btn btn-sm btn-outline-success me-1"
                            data-accion="ficha"
                            data-id="${escaparHTML(mascota.id)}"
                            title="Ver ficha sanitaria">
                            <i class="bi bi-clipboard2-pulse"></i>
                    </button>
                    <button type="button"
                            class="btn btn-sm btn-outline-primary me-1"
                            data-accion="editar"
                            data-id="${escaparHTML(mascota.id)}"
                            title="Editar">
                        <i class="bi bi-pencil"></i>
                    </button>

                    <button type="button"
                            class="btn btn-sm btn-outline-danger"
                            data-accion="eliminar"
                            data-id="${escaparHTML(mascota.id)}"
                            title="Eliminar">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join("");
}

// ABRIR EL FORMULARIO

function abrirFormularioMascota(mascota = null) {
    const formulario = document.getElementById("formMascota");

    formulario.reset();

    document.getElementById("mascotaId").value =
        mascota?.id ?? "";

    document.getElementById("mascotaNombre").value =
        mascota?.nombre ?? "";

    document.getElementById("mascotaEspecie").value =
        mascota?.especie ?? "";

    document.getElementById("mascotaRaza").value =
        mascota?.raza ?? "";

    document.getElementById("mascotaFechaNacimiento").value =
        mascota?.fechaNacimiento ?? "";

    document.getElementById("mascotaFechaNacimiento").max =
        fechaActualLocal();

    document.getElementById("mascotaCliente").value =
        mascota?.clienteId != null
            ? String(mascota.clienteId)
            : "";

    document.getElementById("mascotaModalTitulo").textContent =
        mascota ? "Editar mascota" : "Nueva mascota";

    bootstrap.Modal
        .getOrCreateInstance(document.getElementById("mascotaModal"))
        .show();
}

// GUARDAR O ACTUALIZAR

async function guardarMascota(evento) {
    evento.preventDefault();

    const id = document.getElementById("mascotaId").value;

    const clienteId =
        document.getElementById("mascotaCliente").value;

    const mascota = {
        nombre: document.getElementById("mascotaNombre").value.trim(),
        especie: document.getElementById("mascotaEspecie").value.trim(),
        raza: document.getElementById("mascotaRaza").value.trim(),
        fechaNacimiento:
            document.getElementById("mascotaFechaNacimiento").value,
        clienteId: Number(clienteId)
    };

    if (
        !mascota.nombre ||
        !mascota.especie ||
        !mascota.raza ||
        !mascota.fechaNacimiento ||
        !clienteId
    ) {
        mostrarMensaje(
            "Completá todos los campos obligatorios.",
            "warning"
        );
        return;
    }

    if (mascota.fechaNacimiento > fechaActualLocal()) {
        mostrarMensaje(
            "La fecha de nacimiento no puede ser futura.",
            "warning"
        );
        return;
    }

    const boton = document.getElementById("btnGuardarMascota");
    boton.disabled = true;

    try {
        const ruta = id
            ? `/mascotas/${encodeURIComponent(id)}`
            : "/mascotas";

        await apiRequest(ruta, {
            method: id ? "PUT" : "POST",
            body: JSON.stringify(mascota)
        });

        bootstrap.Modal
            .getOrCreateInstance(document.getElementById("mascotaModal"))
            .hide();

        await cargarMascotas();

        mostrarMensaje(
            id
                ? "Mascota actualizada correctamente."
                : "Mascota registrada correctamente."
        );

    } catch (error) {
        mostrarMensaje(error.message, "danger");
        console.error("Error al guardar mascota:", error);

    } finally {
        boton.disabled = false;
    }
}

// ELIMINAR MASCOTA

async function eliminarMascota(id) {
    const mascota = mascotas.find(
        item => String(item.id) === String(id)
    );

    if (!mascota) return;

    const confirmar = window.confirm(
        `¿Querés eliminar a ${mascota.nombre}?`
    );

    if (!confirmar) return;

    try {
        await apiRequest(`/mascotas/${encodeURIComponent(id)}`, {
            method: "DELETE"
        });

        await cargarMascotas();

        mostrarMensaje("Mascota eliminada correctamente.");

    } catch (error) {
        mostrarMensaje(error.message, "danger");
        console.error("Error al eliminar mascota:", error);
    }
}

// INICIALIZAR LA PANTALLA

export function inicializarMascotas() {
    document.getElementById("btnNuevaMascota")
        .addEventListener("click", () => {
            const selector = document.getElementById("mascotaCliente");

            if (clientesDisponibles.length === 0) {
                mostrarMensaje(
                    "Necesitás registrar al menos un cliente antes de cargar una mascota.",
                    "warning"
                );
                return;
            }

           
            abrirFormularioMascota();
        });

    document.getElementById("formMascota")
        .addEventListener("submit", guardarMascota);

    document.getElementById("buscarMascota")
        .addEventListener("input", renderizarMascotas);

    document.getElementById("tablaMascotas")
        .addEventListener("click", evento => {
            const boton = evento.target.closest("button[data-accion]");

            if (!boton) return;

            const id = boton.dataset.id;
            if (boton.dataset.accion === "ficha") {
                const mascota = mascotas.find(
                item => String(item.id) === String(id)
            );

            if (mascota) {
                abrirFicha(mascota);
            }

    return;
}

            if (boton.dataset.accion === "editar") {
                const mascota = mascotas.find(
                    item => String(item.id) === String(id)
                );

                if (mascota) {
                    abrirFormularioMascota(mascota);
                }
            }

            if (boton.dataset.accion === "eliminar") {
                eliminarMascota(id);
            }
        });

    // Pedimos propietarios y mascotas a la API.
    cargarClientesDisponibles().then(() => {
        renderizarMascotas();
    });

    function abrirFicha(mascota) {
    const appContent = document.getElementById("app-content");

    appContent.innerHTML = mostrarFichaMascota(mascota);

    inicializarFichaMascota(mascota, () => {
        appContent.innerHTML = mostrarMascotas();
        inicializarMascotas();
    });
}

    cargarMascotas();

}
