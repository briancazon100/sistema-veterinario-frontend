import { apiRequest, escaparHTML } from "../api.js";

let mascotasDisponibles = [];
let veterinariosDisponibles = [];
let consultasActuales = [];
let mascotaSeleccionadaId = "";

function formatearFechaHora(fechaHora) {
    if (!fechaHora) return "—";

    const fecha = new Date(fechaHora);
    if (Number.isNaN(fecha.getTime())) {
        return escaparHTML(String(fechaHora));
    }

    return fecha.toLocaleString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function formatearSexo(sexo) {
    if (!sexo) return "No informado";
    const normalizado = String(sexo).toUpperCase();
    if (normalizado === "MACHO") return "Macho";
    if (normalizado === "HEMBRA") return "Hembra";
    return sexo;
}

export function mostrarConsultasMedicas() {
    return `
        <div class="page-heading">
            <div>
                <h1>Consultas médicas</h1>
                <p class="page-subtitle">
                    Consultá el historial clínico de las mascotas y registrá nuevas consultas.
                </p>
            </div>

            <button class="btn btn-success" id="btnNuevaConsulta">
                <i class="bi bi-plus-lg me-2"></i>
                Nueva consulta
            </button>
        </div>

        <div id="mensajeConsultas"></div>

        <div class="content-card mb-4">
            <div class="content-card-body">
                <div class="row g-3 align-items-end">
                    <div class="col-12 col-md-8">
                        <label for="filtroMascotaConsulta" class="form-label fw-semibold">
                            Seleccioná una mascota para ver su historial y antecedentes
                        </label>
                        <select id="filtroMascotaConsulta" class="form-select">
                            <option value="">Seleccioná una mascota</option>
                        </select>
                    </div>

                    <div class="col-12 col-md-4 d-grid">
                        <button type="button"
                                class="btn btn-outline-secondary"
                                id="btnLimpiarMascotaConsulta">
                            <i class="bi bi-x-circle me-1"></i>
                            Limpiar selección
                        </button>
                    </div>
                </div>

                <!-- AQUÍ SE MUESTRAN ALERGIAS, ENFERMEDADES CRÓNICAS, SEXO Y ESTERILIZADO -->
                <div id="resumenClinicoMascota"></div>
            </div>
        </div>

        <div class="content-card">
            <div class="content-card-header">
                <h2 class="h6 mb-0">Historial de consultas</h2>
            </div>

            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light">
                        <tr>
                            <th>Fecha</th>
                            <th>Motivo</th>
                            <th>Diagnóstico</th>
                            <th>Tratamiento</th>
                            <th>Veterinario</th>
                        </tr>
                    </thead>

                    <tbody id="tablaConsultas">
                        <tr>
                            <td colspan="5" class="text-center text-secondary py-4">
                                Seleccioná una mascota para ver sus consultas.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- MODAL: NUEVA CONSULTA MÉDICA -->
        <div class="modal fade"
             id="modalNuevaConsulta"
             tabindex="-1"
             aria-hidden="true">
            <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Registrar consulta médica</h5>
                        <button type="button"
                                class="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Cerrar"></button>
                    </div>

                    <form id="formConsulta">
                        <div class="modal-body">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label for="consultaMascota" class="form-label">
                                        Mascota *
                                    </label>
                                    <select id="consultaMascota" class="form-select" required>
                                        <option value="">Seleccioná una mascota</option>
                                    </select>
                                </div>

                                <div class="col-md-6">
                                    <label for="consultaVeterinario" class="form-label">
                                        Veterinario *
                                    </label>
                                    <select id="consultaVeterinario" class="form-select" required>
                                        <option value="">Seleccioná un veterinario</option>
                                    </select>
                                </div>
                            </div>

                            <!-- También mostramos los antecedentes dentro del modal al elegir mascota -->
                            <div id="resumenClinicoModalConsulta"></div>

                            <div class="mt-3">
                                <label for="consultaMotivo" class="form-label">
                                    Motivo de consulta *
                                </label>
                                <input type="text"
                                       id="consultaMotivo"
                                       class="form-control"
                                       required>
                            </div>

                            <div class="mt-3">
                                <label for="consultaDiagnostico" class="form-label">
                                    Diagnóstico *
                                </label>
                                <textarea id="consultaDiagnostico"
                                          class="form-control"
                                          rows="3"
                                          required></textarea>
                            </div>

                            <div class="mt-3">
                                <label for="consultaTratamiento" class="form-label">
                                    Tratamiento indicado *
                                </label>
                                <textarea id="consultaTratamiento"
                                          class="form-control"
                                          rows="3"
                                          required></textarea>
                            </div>

                            <div class="mt-3">
                                <label for="consultaObservaciones" class="form-label">
                                    Observaciones
                                </label>
                                <textarea id="consultaObservaciones"
                                          class="form-control"
                                          rows="2"></textarea>
                            </div>
                        </div>

                        <div class="modal-footer">
                            <button type="button"
                                    class="btn btn-light"
                                    data-bs-dismiss="modal">
                                Cancelar
                            </button>
                            <button type="submit"
                                    id="btnGuardarConsulta"
                                    class="btn btn-success">
                                Guardar consulta
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
}

function mostrarMensaje(mensaje, tipo = "success") {
    const contenedor = document.getElementById("mensajeConsultas");
    if (!contenedor) return;

    contenedor.innerHTML = `
        <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
            ${escaparHTML(mensaje)}
            <button type="button"
                    class="btn-close"
                    data-bs-dismiss="alert"
                    aria-label="Cerrar"></button>
        </div>
    `;
}

function construirTarjetaAntecedentes(mascota) {
    if (!mascota) return "";

    const tieneAlergias = Boolean(mascota.alergiasConocidas?.trim());
    const tieneCondiciones = Boolean(mascota.condicionesCronicas?.trim());
    const alergiasTexto = mascota.alergiasConocidas?.trim() || "Ninguna alergia registrada";
    const condicionesTexto = mascota.condicionesCronicas?.trim() || "Sin condiciones crónicas registradas";

    return `
        <div class="p-3 rounded-3 border ${tieneAlergias ? "border-warning bg-warning-subtle" : "bg-body-tertiary"} mt-3">
            <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
                <span class="fw-semibold small">
                    <i class="bi bi-clipboard2-heart me-1"></i>
                    Antecedentes clínicos de ${escaparHTML(mascota.nombre)}
                    ${
                        mascota.nombreClienteCompleto
                            ? `<span class="text-secondary fw-normal">(${escaparHTML(mascota.nombreClienteCompleto)})</span>`
                            : ""
                    }
                </span>

                <div class="d-flex flex-wrap gap-1">
                    <span class="badge text-bg-light border">
                        ${escaparHTML(formatearSexo(mascota.sexo))}
                    </span>
                    <span class="badge text-bg-light border">
                        ${mascota.esterilizado ? "Esterilizado" : "No esterilizado"}
                    </span>
                </div>
            </div>

            <div class="row g-2 small">
                <div class="col-12 col-md-6">
                    <strong class="${tieneAlergias ? "text-warning-emphasis" : "text-secondary"}">
                        <i class="bi bi-exclamation-triangle-fill me-1"></i>
                        Alergias:
                    </strong>
                    <span class="text-break">${escaparHTML(alergiasTexto)}</span>
                </div>

                <div class="col-12 col-md-6">
                    <strong class="${tieneCondiciones ? "text-info-emphasis" : "text-secondary"}">
                        <i class="bi bi-heart-pulse me-1"></i>
                        Condiciones crónicas:
                    </strong>
                    <span class="text-break">${escaparHTML(condicionesTexto)}</span>
                </div>
            </div>
        </div>
    `;
}

function actualizarResumenClinico(mascotaId, destinoId = "resumenClinicoMascota") {
    const contenedor = document.getElementById(destinoId);
    if (!contenedor) return;

    if (!mascotaId) {
        contenedor.innerHTML = "";
        return;
    }

    const mascota = mascotasDisponibles.find(
        item => String(item.id) === String(mascotaId)
    );

    contenedor.innerHTML = construirTarjetaAntecedentes(mascota);
}

async function cargarMascotasYVeterinarios() {
    const selectFiltro = document.getElementById("filtroMascotaConsulta");
    const selectModal = document.getElementById("consultaMascota");
    const selectVet = document.getElementById("consultaVeterinario");

    try {
        const [paginaMascotas, vets] = await Promise.all([
            apiRequest("/mascotas/buscar?page=0&size=200"),
            apiRequest("/veterinarios")
        ]);

        mascotasDisponibles = Array.isArray(paginaMascotas?.content)
            ? paginaMascotas.content
            : [];

        veterinariosDisponibles = Array.isArray(vets)
            ? vets.filter(v => v.estado !== false)
            : [];

        const opcionesMascotas = mascotasDisponibles.map(m => `
            <option value="${escaparHTML(m.id)}">
                ${escaparHTML(m.nombre)} (${escaparHTML(m.especie || "—")})${
                    m.nombreClienteCompleto ? ` — ${escaparHTML(m.nombreClienteCompleto)}` : ""
                }
            </option>
        `).join("");

        if (selectFiltro) {
            selectFiltro.innerHTML = `<option value="">Seleccioná una mascota</option>${opcionesMascotas}`;
        }

        if (selectModal) {
            selectModal.innerHTML = `<option value="">Seleccioná una mascota</option>${opcionesMascotas}`;
        }

        if (selectVet) {
            selectVet.innerHTML = `
                <option value="">Seleccioná un veterinario</option>
                ${veterinariosDisponibles.map(v => `
                    <option value="${escaparHTML(v.id)}">
                        ${escaparHTML(v.nombre)} ${escaparHTML(v.apellido)}
                    </option>
                `).join("")}
            `;
        }
    } catch (error) {
        console.error("Error al cargar datos iniciales de consultas:", error);
        mostrarMensaje(
            `No se pudieron cargar mascotas o veterinarios: ${error.message}`,
            "danger"
        );
    }
}

function obtenerNombreVeterinario(registro) {
    if (registro.nombreVeterinario) return registro.nombreVeterinario;

    const vetId = registro.veterinarioId ?? registro.veterinario?.id;
    const vet = veterinariosDisponibles.find(
        item => String(item.id) === String(vetId)
    );

    if (vet) return `${vet.nombre} ${vet.apellido}`;
    return vetId != null ? `Veterinario #${vetId}` : "—";
}

function renderizarConsultas() {
    const tabla = document.getElementById("tablaConsultas");
    if (!tabla) return;

    if (!mascotaSeleccionadaId) {
        tabla.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-secondary py-4">
                    Seleccioná una mascota para ver sus consultas.
                </td>
            </tr>
        `;
        return;
    }

    if (consultasActuales.length === 0) {
        tabla.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-secondary py-4">
                    Esta mascota todavía no tiene consultas registradas.
                </td>
            </tr>
        `;
        return;
    }

    tabla.innerHTML = consultasActuales.map(c => `
        <tr>
            <td>${formatearFechaHora(c.fechaHora ?? c.fechaConsulta ?? c.fecha)}</td>
            <td>${escaparHTML(c.motivo ?? c.motivoConsulta ?? "—")}</td>
            <td>${escaparHTML(c.diagnostico ?? "—")}</td>
            <td>${escaparHTML(c.tratamiento ?? "—")}</td>
            <td>${escaparHTML(obtenerNombreVeterinario(c))}</td>
        </tr>
    `).join("");
}

async function cargarConsultasPorMascota(mascotaId) {
    mascotaSeleccionadaId = mascotaId || "";
    actualizarResumenClinico(mascotaSeleccionadaId, "resumenClinicoMascota");

    const tabla = document.getElementById("tablaConsultas");
    if (!mascotaSeleccionadaId) {
        consultasActuales = [];
        renderizarConsultas();
        return;
    }

    tabla.innerHTML = `
        <tr>
            <td colspan="5" class="text-center text-secondary py-4">
                <span class="spinner-border spinner-border-sm me-2"></span>
                Cargando consultas...
            </td>
        </tr>
    `;

    try {
        const datos = await apiRequest(
            `/consultas/mascota/${encodeURIComponent(mascotaSeleccionadaId)}`
        );
        consultasActuales = Array.isArray(datos) ? datos : [];
        renderizarConsultas();
    } catch (error) {
        console.error("Error al cargar consultas:", error);
        consultasActuales = [];
        tabla.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-danger py-4">
                    ${escaparHTML(error.message)}
                </td>
            </tr>
        `;
    }
}

async function guardarConsulta(evento) {
    evento.preventDefault();

    const mascotaId = document.getElementById("consultaMascota").value;
    const veterinarioId = document.getElementById("consultaVeterinario").value;
    const motivo = document.getElementById("consultaMotivo").value.trim();
    const diagnostico = document.getElementById("consultaDiagnostico").value.trim();
    const tratamiento = document.getElementById("consultaTratamiento").value.trim();
    const observaciones = document.getElementById("consultaObservaciones").value.trim();

    if (!mascotaId || !veterinarioId || !motivo || !diagnostico || !tratamiento) {
        mostrarMensaje("Completá todos los campos obligatorios.", "warning");
        return;
    }

    const boton = document.getElementById("btnGuardarConsulta");
    boton.disabled = true;

    try {
        await apiRequest("/consultas", {
            method: "POST",
            body: JSON.stringify({
                mascotaId: Number(mascotaId),
                veterinarioId: Number(veterinarioId),
                motivo,
                diagnostico,
                tratamiento,
                observaciones: observaciones || null
            })
        });

        bootstrap.Modal
            .getOrCreateInstance(document.getElementById("modalNuevaConsulta"))
            .hide();

        document.getElementById("formConsulta").reset();
        document.getElementById("resumenClinicoModalConsulta").innerHTML = "";

        mostrarMensaje("Consulta médica registrada correctamente.");

        if (mascotaSeleccionadaId === String(mascotaId)) {
            await cargarConsultasPorMascota(mascotaId);
        } else {
            const selectFiltro = document.getElementById("filtroMascotaConsulta");
            if (selectFiltro) selectFiltro.value = String(mascotaId);
            await cargarConsultasPorMascota(mascotaId);
        }
    } catch (error) {
        console.error("Error al guardar consulta:", error);
        mostrarMensaje(error.message, "danger");
    } finally {
        boton.disabled = false;
    }
}

export function inicializarConsultasMedicas() {
    const selectFiltro = document.getElementById("filtroMascotaConsulta");
    const selectModalMascota = document.getElementById("consultaMascota");

    selectFiltro?.addEventListener("change", () => {
        cargarConsultasPorMascota(selectFiltro.value);
    });

    document.getElementById("btnLimpiarMascotaConsulta")
        ?.addEventListener("click", () => {
            if (selectFiltro) selectFiltro.value = "";
            cargarConsultasPorMascota("");
        });

    selectModalMascota?.addEventListener("change", () => {
        actualizarResumenClinico(
            selectModalMascota.value,
            "resumenClinicoModalConsulta"
        );
    });

    document.getElementById("btnNuevaConsulta")
        ?.addEventListener("click", () => {
            document.getElementById("formConsulta").reset();
            if (mascotaSeleccionadaId && selectModalMascota) {
                selectModalMascota.value = mascotaSeleccionadaId;
                actualizarResumenClinico(
                    mascotaSeleccionadaId,
                    "resumenClinicoModalConsulta"
                );
            } else {
                document.getElementById("resumenClinicoModalConsulta").innerHTML = "";
            }

            bootstrap.Modal
                .getOrCreateInstance(document.getElementById("modalNuevaConsulta"))
                .show();
        });

    document.getElementById("formConsulta")
        ?.addEventListener("submit", guardarConsulta);

    cargarMascotasYVeterinarios();
}