
import { apiRequest, escaparHTML } from "../api.js";

let veterinarios = [];

export function mostrarVeterinarios() {
    return `
        <div class="page-heading">
            <div>
                <h1>Veterinarios</h1>
                <p class="page-subtitle">
                    Gestioná los profesionales de la veterinaria.
                </p>
            </div>

            <button class="btn btn-success" id="btnNuevoVeterinario">
                <i class="bi bi-plus-lg me-2"></i>
                Nuevo veterinario
            </button>
        </div>

        <div id="mensajeVeterinarios"></div>

        <div class="content-card">
            <div class="content-card-header">
                <input
                    type="search"
                    id="buscarVeterinario"
                    class="form-control"
                    placeholder="Buscar por nombre, matrícula o especialidad..."
                    style="max-width: 450px;">
            </div>

            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light">
                        <tr>
                            <th>Nombre y apellido</th>
                            <th>Matrícula</th>
                            <th>Especialidad</th>
                            <th>Estado</th>
                            <th class="text-end">Acciones</th>
                        </tr>
                    </thead>

                    <tbody id="tablaVeterinarios">
                        <tr>
                            <td colspan="5"
                                class="text-center text-secondary py-4">
                                Cargando veterinarios...
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- FORMULARIO DE ALTA Y EDICIÓN -->
        <div class="modal fade"
             id="veterinarioModal"
             tabindex="-1"
             aria-labelledby="veterinarioModalTitulo"
             aria-hidden="true">

            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">

                    <div class="modal-header">
                        <h5 class="modal-title"
                            id="veterinarioModalTitulo">
                            Nuevo veterinario
                        </h5>

                        <button type="button"
                                class="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Cerrar"></button>
                    </div>

                    <form id="formVeterinario">
                        <div class="modal-body">

                            <input type="hidden" id="veterinarioId">

                            <div class="mb-3">
                                <label for="veterinarioNombre"
                                       class="form-label">
                                    Nombre *
                                </label>

                                <input type="text"
                                       id="veterinarioNombre"
                                       class="form-control"
                                       required>
                            </div>

                            <div class="mb-3">
                                <label for="veterinarioApellido"
                                       class="form-label">
                                    Apellido *
                                </label>

                                <input type="text"
                                       id="veterinarioApellido"
                                       class="form-control"
                                       required>
                            </div>

                            <div class="mb-3">
                                <label for="veterinarioMatricula"
                                       class="form-label">
                                    Matrícula profesional *
                                </label>

                                <input type="text"
                                       id="veterinarioMatricula"
                                       class="form-control"
                                       required>
                            </div>

                            <div class="mb-3">
                                <label for="veterinarioEspecialidad"
                                       class="form-label">
                                    Especialidad *
                                </label>

                                <input type="text"
                                       id="veterinarioEspecialidad"
                                       class="form-control"
                                       placeholder="Ej. Clínica de pequeños animales"
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
                                    id="btnGuardarVeterinario">
                                Guardar veterinario
                            </button>
                        </div>
                    </form>

                </div>
            </div>
        </div>
    `;
}

// LISTAR VETERINARIOS

async function cargarVeterinarios() {
    const tabla = document.getElementById("tablaVeterinarios");

    tabla.innerHTML = `
        <tr>
            <td colspan="5" class="text-center py-4">
                Cargando veterinarios...
            </td>
        </tr>
    `;

    try {
        const datos = await apiRequest("/veterinarios");

        if (!Array.isArray(datos)) {
            throw new Error("La API no devolvió una lista de veterinarios.");
        }

        veterinarios = datos;
        renderizarVeterinarios();

    } catch (error) {
        tabla.innerHTML = `
            <tr>
                <td colspan="5"
                    class="text-center text-danger py-4">
                    ${escaparHTML(error.message)}
                </td>
            </tr>
        `;

        console.error("Error al cargar veterinarios:", error);
    }
}

// MOSTRAR TABLA Y BUSCAR

function renderizarVeterinarios() {
    const tabla = document.getElementById("tablaVeterinarios");

    const busqueda = document
        .getElementById("buscarVeterinario")
        .value
        .trim()
        .toLowerCase();

    const filtrados = veterinarios.filter(veterinario => {
        const texto = [
            veterinario.nombre,
            veterinario.apellido,
            veterinario.matricula,
            veterinario.especialidad,
            veterinario.estado ? "activo" : "inactivo"
        ].join(" ").toLowerCase();

        return texto.includes(busqueda);
    });

    if (filtrados.length === 0) {
        tabla.innerHTML = `
            <tr>
                <td colspan="5"
                    class="text-center text-secondary py-4">
                    No se encontraron veterinarios.
                </td>
            </tr>
        `;
        return;
    }

    tabla.innerHTML = filtrados.map(veterinario => `
        <tr>
            <td>
                ${escaparHTML(veterinario.nombre)}
                ${escaparHTML(veterinario.apellido)}
            </td>

            <td>${escaparHTML(veterinario.matricula)}</td>

            <td>${escaparHTML(veterinario.especialidad)}</td>

            <td>
                ${
                    veterinario.estado
                        ? '<span class="badge text-bg-success">Activo</span>'
                        : '<span class="badge text-bg-secondary">Inactivo</span>'
                }
            </td>

            <td class="text-end text-nowrap">
                <button type="button"
                        class="btn btn-sm btn-outline-primary me-1"
                        data-accion="editar"
                        data-id="${escaparHTML(veterinario.id)}"
                        title="Editar">
                    <i class="bi bi-pencil"></i>
                </button>

                ${
                    veterinario.estado
                        ? `
                            <button type="button"
                                    class="btn btn-sm btn-outline-danger"
                                    data-accion="baja"
                                    data-id="${escaparHTML(veterinario.id)}"
                                    title="Eliminar">
                                <i class="bi bi-trash"></i>
                            </button>
                          `
                        : ""
                }
            </td>
        </tr>
    `).join("");
}

// ABRIR FORMULARIO

function abrirFormularioVeterinario(veterinario = null) {
    document.getElementById("formVeterinario").reset();

    document.getElementById("veterinarioId").value =
        veterinario?.id ?? "";

    document.getElementById("veterinarioNombre").value =
        veterinario?.nombre ?? "";

    document.getElementById("veterinarioApellido").value =
        veterinario?.apellido ?? "";

    document.getElementById("veterinarioMatricula").value =
        veterinario?.matricula ?? "";

    document.getElementById("veterinarioEspecialidad").value =
        veterinario?.especialidad ?? "";

    document.getElementById("veterinarioModalTitulo").textContent =
        veterinario ? "Editar veterinario" : "Nuevo veterinario";

    bootstrap.Modal
        .getOrCreateInstance(
            document.getElementById("veterinarioModal")
        )
        .show();
}

// ALTA Y EDICIÓN

async function guardarVeterinario(evento) {
    evento.preventDefault();

    const id = document.getElementById("veterinarioId").value;

    const veterinario = {
        nombre: document.getElementById("veterinarioNombre").value.trim(),
        apellido: document.getElementById("veterinarioApellido").value.trim(),
        matricula: document.getElementById("veterinarioMatricula").value.trim(),
        especialidad: document.getElementById("veterinarioEspecialidad").value.trim()
    };

    if (Object.values(veterinario).some(valor => !valor)) {
        mostrarMensaje(
            "Completá todos los campos obligatorios.",
            "warning"
        );
        return;
    }

    const boton = document.getElementById("btnGuardarVeterinario");
    boton.disabled = true;

    try {
        const ruta = id
            ? `/veterinarios/${encodeURIComponent(id)}`
            : "/veterinarios";

        await apiRequest(ruta, {
            method: id ? "PUT" : "POST",
            body: JSON.stringify(veterinario)
        });

        bootstrap.Modal
            .getOrCreateInstance(
                document.getElementById("veterinarioModal")
            )
            .hide();

        await cargarVeterinarios();

        mostrarMensaje(
            id
                ? "Veterinario actualizado correctamente."
                : "Veterinario registrado correctamente."
        );

    } catch (error) {
        mostrarMensaje(error.message, "danger");
        console.error("Error al guardar veterinario:", error);

    } finally {
        boton.disabled = false;
    }
}

// BAJA LÓGICA

async function darDeBajaVeterinario(id) {
    const veterinario = veterinarios.find(
        item => String(item.id) === String(id)
    );

    if (!veterinario) return;

    const confirmar = window.confirm(
        `¿Querés dar de baja a ${veterinario.nombre} ${veterinario.apellido}?`
    );

    if (!confirmar) return;

    try {
        await apiRequest(`/veterinarios/${encodeURIComponent(id)}`, {
            method: "DELETE"
        });

        await cargarVeterinarios();

        mostrarMensaje(
            "Solicitud de baja realizada correctamente."
        );

    } catch (error) {
        mostrarMensaje(error.message, "danger");
        console.error("Error al dar de baja al veterinario:", error);
    }
}

// MENSAJES

function mostrarMensaje(mensaje, tipo = "success") {
    const contenedor = document.getElementById("mensajeVeterinarios");

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

// INICIALIZAR MÓDULO

export function inicializarVeterinarios() {
    document.getElementById("btnNuevoVeterinario")
        .addEventListener("click", () => {
            abrirFormularioVeterinario();
        });

    document.getElementById("formVeterinario")
        .addEventListener("submit", guardarVeterinario);

    document.getElementById("buscarVeterinario")
        .addEventListener("input", renderizarVeterinarios);

    document.getElementById("tablaVeterinarios")
        .addEventListener("click", evento => {
            const boton = evento.target.closest("button[data-accion]");

            if (!boton) return;

            const id = boton.dataset.id;

            if (boton.dataset.accion === "editar") {
                const veterinario = veterinarios.find(
                    item => String(item.id) === String(id)
                );

                if (veterinario) {
                    abrirFormularioVeterinario(veterinario);
                }
            }

            if (boton.dataset.accion === "baja") {
                darDeBajaVeterinario(id);
            }
        });

    cargarVeterinarios();
}