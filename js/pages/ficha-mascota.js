
import { apiRequest, escaparHTML } from "../api.js";

let veterinariosDisponibles = [];
let mascotaActual = null;
let seccionActual = "vacunas";

export function mostrarFichaMascota(mascota) {
    return `
        <div class="page-heading">
            <div>
                <button id="btnVolverMascotas"
                        class="btn btn-sm btn-outline-secondary mb-3">
                    <i class="bi bi-arrow-left me-1"></i>
                    Volver a mascotas
                </button>

                <h1>${escaparHTML(mascota.nombre)}</h1>

                <p class="page-subtitle">
                    ${escaparHTML(mascota.especie)}
                    · ${escaparHTML(mascota.raza)}
                    · Propietario:
                    ${escaparHTML(mascota.nombreClienteCompleto || "No informado")}
                </p>
            </div>
        </div>

        <div id="mensajeFichaMascota"></div>

        <ul class="nav nav-tabs mb-3" id="tabsSanitarios">
            <li class="nav-item">
                <button class="nav-link active"
                        type="button"
                        data-seccion="vacunas">
                    <i class="bi bi-syringe me-1"></i>
                    Vacunas
                </button>
            </li>

            <li class="nav-item">
                <button class="nav-link"
                        type="button"
                        data-seccion="desparasitaciones">
                    <i class="bi bi-shield-check me-1"></i>
                    Desparasitaciones
                </button>
            </li>
        </ul>

        <div id="contenidoHistorialMascota">
            <div class="text-center text-secondary py-5">
                Cargando historial...
            </div>
        </div>

        <!-- MODAL: REGISTRAR VACUNA -->
        <div class="modal fade"
             id="modalVacuna"
             tabindex="-1"
             aria-hidden="true">

            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">

                    <div class="modal-header">
                        <h5 class="modal-title">Registrar vacuna</h5>

                        <button type="button"
                                class="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Cerrar"></button>
                    </div>

                    <form id="formVacuna">
                        <div class="modal-body">

                            <div class="mb-3">
                                <label for="nombreVacuna"
                                       class="form-label">
                                    Nombre de la vacuna *
                                </label>

                                <input type="text"
                                       id="nombreVacuna"
                                       class="form-control"
                                       required>
                            </div>

                            <div class="mb-3">
                                <label for="fechaAplicacionVacuna"
                                       class="form-label">
                                    Fecha de aplicación *
                                </label>

                                <input type="date"
                                       id="fechaAplicacionVacuna"
                                       class="form-control"
                                       required>
                            </div>

                            <div class="mb-3">
                                <label for="proximaDosisVacuna"
                                       class="form-label">
                                    Próxima dosis *
                                </label>

                                <input type="date"
                                       id="proximaDosisVacuna"
                                       class="form-control"
                                       required>
                            </div>

                            <div class="mb-3">
                                <label for="veterinarioVacuna"
                                       class="form-label">
                                    Veterinario *
                                </label>

                                <select id="veterinarioVacuna"
                                        class="form-select"
                                        required>
                                    <option value="">
                                        Seleccioná un veterinario
                                    </option>
                                </select>
                            </div>

                        </div>

                        <div class="modal-footer">
                            <button type="button"
                                    class="btn btn-light"
                                    data-bs-dismiss="modal">
                                Cancelar
                            </button>

                            <button type="submit"
                                    id="btnGuardarVacuna"
                                    class="btn btn-success">
                                Guardar vacuna
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- MODAL: REGISTRAR DESPARASITACIÓN -->
        <div class="modal fade"
             id="modalDesparasitacion"
             tabindex="-1"
             aria-hidden="true">

            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">

                    <div class="modal-header">
                        <h5 class="modal-title">
                            Registrar desparasitación
                        </h5>

                        <button type="button"
                                class="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Cerrar"></button>
                    </div>

                    <form id="formDesparasitacion">
                        <div class="modal-body">

                            <div class="mb-3">
                                <label for="productoUsado"
                                       class="form-label">
                                    Producto utilizado *
                                </label>

                                <input type="text"
                                       id="productoUsado"
                                       class="form-control"
                                       required>
                            </div>

                            <div class="mb-3">
                                <label for="fechaAplicacionDesparasitacion"
                                       class="form-label">
                                    Fecha de aplicación *
                                </label>

                                <input type="date"
                                       id="fechaAplicacionDesparasitacion"
                                       class="form-control"
                                       required>
                            </div>

                            <div class="mb-3">
                                <label for="proximaDosisDesparasitacion"
                                       class="form-label">
                                    Próxima dosis *
                                </label>

                                <input type="date"
                                       id="proximaDosisDesparasitacion"
                                       class="form-control"
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
                                    id="btnGuardarDesparasitacion"
                                    class="btn btn-success">
                                Guardar desparasitación
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
}

// FORMATEAR FECHAS SIN CAMBIAR EL DÍA POR ZONA HORARIA

function formatearFecha(fecha) {
    if (!fecha) return "—";

    const partes = fecha.split("-");

    if (partes.length !== 3) {
        return escaparHTML(fecha);
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

// MENSAJES

function mostrarMensajeFicha(mensaje, tipo = "success") {
    const contenedor =
        document.getElementById("mensajeFichaMascota");

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

// CARGAR VETERINARIOS PARA EL FORMULARIO DE VACUNAS

async function cargarVeterinarios() {
    const selector = document.getElementById("veterinarioVacuna");

    try {
        const datos = await apiRequest("/veterinarios");

        if (!Array.isArray(datos)) {
            throw new Error("La API no devolvió una lista de veterinarios.");
        }

        veterinariosDisponibles = datos.filter(
            veterinario => veterinario.estado !== false
        );

        selector.innerHTML = `
            <option value="">Seleccioná un veterinario</option>

            ${veterinariosDisponibles.map(veterinario => `
                <option value="${escaparHTML(veterinario.id)}">
                    ${escaparHTML(veterinario.nombre)}
                    ${escaparHTML(veterinario.apellido)}
                    — ${escaparHTML(veterinario.matricula)}
                </option>
            `).join("")}
        `;

        if (veterinariosDisponibles.length === 0) {
            selector.innerHTML = `
                <option value="">No hay veterinarios activos</option>
            `;
        }

    } catch (error) {
        selector.innerHTML = `
            <option value="">No se pudieron cargar los veterinarios</option>
        `;

        console.error("Error al cargar veterinarios:", error);

        mostrarMensajeFicha(
            `No se pudieron cargar los veterinarios: ${error.message}`,
            "danger"
        );
    }
}

// MOSTRAR UNA TABLA DE HISTORIAL

function renderizarTabla(registros, tipo) {
    const contenido =
        document.getElementById("contenidoHistorialMascota");

    const esVacuna = tipo === "vacunas";

    const titulo = esVacuna ? "Historial de vacunas" :
        "Historial de desparasitaciones";

    const columnas = esVacuna
        ? ["Vacuna", "Aplicación", "Próxima dosis", "Veterinario"]
        : ["Producto utilizado", "Aplicación", "Próxima dosis"];

    const encabezados = columnas.map(columna =>
        `<th>${columna}</th>`
    ).join("");

    const filas = registros.length === 0
        ? `
            <tr>
                <td colspan="${columnas.length}"
                    class="text-center text-secondary py-4">
                    No hay registros todavía.
                </td>
            </tr>
        `
        : registros.map(registro => {
            const celdas = esVacuna
                ? `
                    <td>${escaparHTML(registro.nombreVacuna)}</td>
                    <td>${formatearFecha(registro.fechaAplicacion)}</td>
                    <td>${formatearFecha(registro.fechaProximaDosis)}</td>
                    <td>${escaparHTML(
                        obtenerNombreVeterinario(registro.veterinarioId)
                    )}</td>
                `
                : `
                    <td>${escaparHTML(registro.productoUsado)}</td>
                    <td>${formatearFecha(registro.fechaAplicacion)}</td>
                    <td>${formatearFecha(registro.fechaProximaDosis)}</td>
                `;

            return `<tr>${celdas}</tr>`;
        }).join("");

    contenido.innerHTML = `
        <div class="page-heading">
            <div>
                <h2 class="h5 mb-1">${titulo}</h2>
                
            </div>

            <button class="btn btn-success"
                    id="btnNuevoRegistroSanitario">
                <i class="bi bi-plus-lg me-2"></i>
                ${esVacuna ? "Registrar vacuna" : "Registrar desparasitación"}
            </button>
        </div>

        <div class="content-card">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light">
                        <tr>${encabezados}</tr>
                    </thead>

                    <tbody>${filas}</tbody>
                </table>
            </div>
        </div>
    `;

    document.getElementById("btnNuevoRegistroSanitario")
        .addEventListener("click", () => {
            const idModal = esVacuna
                ? "modalVacuna"
                : "modalDesparasitacion";

            bootstrap.Modal
                .getOrCreateInstance(document.getElementById(idModal))
                .show();
        });
}

function obtenerNombreVeterinario(id) {
    const veterinario = veterinariosDisponibles.find(
        item => String(item.id) === String(id)
    );

    if (!veterinario) {
        return `Veterinario #${id ?? "—"}`;
    }

    return `${veterinario.nombre} ${veterinario.apellido}`;
}

// CONSULTAR HISTORIAL SEGÚN LA PESTAÑA SELECCIONADA

async function cargarHistorial(tipo) {
    seccionActual = tipo;

    document.querySelectorAll("[data-seccion]").forEach(boton => {
        boton.classList.toggle(
            "active",
            boton.dataset.seccion === tipo
        );
    });

    const contenido =
        document.getElementById("contenidoHistorialMascota");

    contenido.innerHTML = `
        <div class="text-center text-secondary py-5">
            Cargando historial...
        </div>
    `;

    try {
        const ruta = tipo === "vacunas"
            ? `/vacunas/${encodeURIComponent(mascotaActual.id)}`
            : `/desparasitaciones/${encodeURIComponent(mascotaActual.id)}`;

        const datos = await apiRequest(ruta);

        if (!Array.isArray(datos)) {
            throw new Error("La API no devolvió una lista de registros.");
        }

        renderizarTabla(datos, tipo);

    } catch (error) {
        contenido.innerHTML = `
            <div class="alert alert-danger">
                No se pudo cargar el historial:
                ${escaparHTML(error.message)}
            </div>
        `;

        console.error(`Error al cargar ${tipo}:`, error);
    }
}

// GUARDAR VACUNA

async function guardarVacuna(evento) {
    evento.preventDefault();

    const veterinarioId =
        document.getElementById("veterinarioVacuna").value;

    const vacuna = {
        nombreVacuna: document.getElementById("nombreVacuna").value.trim(),
        fechaAplicacion:
            document.getElementById("fechaAplicacionVacuna").value,
        fechaProximaDosis:
            document.getElementById("proximaDosisVacuna").value,
        veterinarioId: Number(veterinarioId),
        mascotaId: mascotaActual.id
    };

    if (
        !vacuna.nombreVacuna ||
        !vacuna.fechaAplicacion ||
        !vacuna.fechaProximaDosis ||
        !veterinarioId
    ) {
        mostrarMensajeFicha(
            "Completá todos los campos obligatorios de la vacuna.",
            "warning"
        );
        return;
    }

    if (vacuna.fechaProximaDosis < vacuna.fechaAplicacion) {
        mostrarMensajeFicha(
            "La próxima dosis no puede ser anterior a la aplicación.",
            "warning"
        );
        return;
    }

    const boton = document.getElementById("btnGuardarVacuna");
    boton.disabled = true;

    try {
        await apiRequest("/vacunas", {
            method: "POST",
            body: JSON.stringify(vacuna)
        });

        bootstrap.Modal
            .getOrCreateInstance(document.getElementById("modalVacuna"))
            .hide();

        document.getElementById("formVacuna").reset();

        mostrarMensajeFicha("Vacuna registrada correctamente.");

        await cargarHistorial("vacunas");

    } catch (error) {
        mostrarMensajeFicha(error.message, "danger");
        console.error("Error al guardar vacuna:", error);

    } finally {
        boton.disabled = false;
    }
}

// GUARDAR DESPARASITACIÓN

async function guardarDesparasitacion(evento) {
    evento.preventDefault();

    const desparasitacion = {
        productoUsado:
            document.getElementById("productoUsado").value.trim(),
        fechaAplicacion:
            document.getElementById("fechaAplicacionDesparasitacion").value,
        fechaProximaDosis:
            document.getElementById("proximaDosisDesparasitacion").value,
        mascotaId: mascotaActual.id
    };

    if (
        !desparasitacion.productoUsado ||
        !desparasitacion.fechaAplicacion ||
        !desparasitacion.fechaProximaDosis
    ) {
        mostrarMensajeFicha(
            "Completá todos los campos obligatorios.",
            "warning"
        );
        return;
    }

    if (
        desparasitacion.fechaProximaDosis <
        desparasitacion.fechaAplicacion
    ) {
        mostrarMensajeFicha(
            "La próxima dosis no puede ser anterior a la aplicación.",
            "warning"
        );
        return;
    }

    const boton = document.getElementById(
        "btnGuardarDesparasitacion"
    );

    boton.disabled = true;

    try {
        await apiRequest("/desparasitaciones", {
            method: "POST",
            body: JSON.stringify(desparasitacion)
        });

        bootstrap.Modal
            .getOrCreateInstance(
                document.getElementById("modalDesparasitacion")
            )
            .hide();

        document.getElementById("formDesparasitacion").reset();

        mostrarMensajeFicha(
            "Desparasitación registrada correctamente."
        );

        await cargarHistorial("desparasitaciones");

    } catch (error) {
        mostrarMensajeFicha(error.message, "danger");
        console.error("Error al guardar desparasitación:", error);

    } finally {
        boton.disabled = false;
    }
}

// INICIALIZAR FICHA

export function inicializarFichaMascota(mascota, volverAListado) {
    mascotaActual = mascota;

    document.getElementById("btnVolverMascotas")
        .addEventListener("click", volverAListado);

    document.getElementById("tabsSanitarios")
        .addEventListener("click", evento => {
            const boton = evento.target.closest("[data-seccion]");

            if (boton) {
                cargarHistorial(boton.dataset.seccion);
            }
        });

    document.getElementById("formVacuna")
        .addEventListener("submit", guardarVacuna);

    document.getElementById("formDesparasitacion")
        .addEventListener("submit", guardarDesparasitacion);

    cargarVeterinarios();
    cargarHistorial("vacunas");
}
