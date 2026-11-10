import { apiRequest, escaparHTML } from "../api.js";

// ==========================================
// VISTA PRINCIPAL
// ==========================================

export function mostrarTurnos() {
    return `
        <div class="page-heading">
            <h2>Gestión de turnos</h2>
            <p class="text-secondary">
                Registrá nuevos turnos y consultá los próximos turnos pendientes.
            </p>
        </div>

        <div id="mensajeTurnos"></div>

        <!-- FORMULARIO PARA REGISTRAR TURNOS -->
        <div class="content-card mb-4">
            <div class="content-card-header">
                <h5 class="mb-0">Registrar nuevo turno</h5>
            </div>

            <div class="content-card-body">
                <form id="formCrearTurno">
                    <div class="row g-3">

                        <div class="col-12 col-md-6 col-xl-3">
                            <label for="fechaHoraTurno" class="form-label">
                                Fecha y hora
                            </label>
                            <input
                                type="datetime-local"
                                class="form-control"
                                id="fechaHoraTurno"
                                required
                            >
                        </div>

                        <div class="col-12 col-md-6 col-xl-3">
                            <label for="mascotaTurno" class="form-label">
                                Mascota
                            </label>
                            <select
                                class="form-select"
                                id="mascotaTurno"
                                required
                            >
                                <option value="">Cargando mascotas...</option>
                            </select>
                        </div>

                        <div class="col-12 col-md-6 col-xl-3">
                            <label for="veterinarioTurno" class="form-label">
                                Veterinario
                            </label>
                            <select
                                class="form-select"
                                id="veterinarioTurno"
                                required
                            >
                                <option value="">Cargando veterinarios...</option>
                            </select>
                        </div>

                        <div class="col-12 col-md-6 col-xl-3">
                            <label for="motivoTurno" class="form-label">
                                Motivo
                            </label>
                            <input
                                type="text"
                                class="form-control"
                                id="motivoTurno"
                                placeholder="Ej: Control general"
                                maxlength="255"
                                required
                            >
                        </div>

                        <div class="col-12 d-flex justify-content-end">
                            <button
                                type="submit"
                                class="btn btn-primary"
                                id="btnGuardarTurno"
                            >
                                <i class="bi bi-calendar-plus me-1"></i>
                                Registrar turno
                            </button>
                        </div>

                    </div>
                </form>
            </div>
        </div>

        <!-- LISTADO DE TURNOS -->
        <div class="content-card">
            <div class="content-card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Turnos pendientes</h5>

                <button
                    type="button"
                    class="btn btn-outline-secondary btn-sm"
                    id="btnActualizarTurnos"
                >
                    <i class="bi bi-arrow-clockwise me-1"></i>
                    Actualizar
                </button>
            </div>

            <div class="content-card-body">
                <div class="table-responsive">
                    <table class="table table-hover align-middle">
                        <thead>
    <tr>
        <th>Fecha</th>
        <th>Hora</th>
        <th>Mascota</th>
        <th>Dueño</th>
        <th>Motivo</th>
        <th>Veterinario</th>
        <th>Estado</th>
        <th>Acciones</th>
    </tr>
</thead>

                        <tbody id="tablaTurnos">
                            <tr>
                                <td colspan="8" class="text-center text-secondary py-4">
                                    Cargando turnos...
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>




        </div>


                <!-- HISTORIAL DE TURNOS -->
        <div class="content-card mt-4">

            <div class="content-card-header d-flex justify-content-between align-items-center">
                <div>
                    <h5 class="mb-0">Historial de turnos</h5>
                    <small class="text-secondary">
                        Consultá los turnos anteriores y sus estados.
                    </small>
                </div>

                <button
                    type="button"
                    class="btn btn-outline-secondary btn-sm"
                    id="btnActualizarHistorial"
                >
                    <i class="bi bi-arrow-clockwise me-1"></i>
                    Actualizar
                </button>
            </div>

            <div class="content-card-body">

                <div class="table-responsive">
                    <table class="table table-hover align-middle">

                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Hora</th>
                                <th>Mascota</th>
                                <th>Dueño</th>
                                <th>Motivo</th>
                                <th>Veterinario</th>
                                <th>Estado</th>
                            </tr>
                        </thead>

                        <tbody id="tablaHistorialTurnos">
                            <tr>
                                <td colspan="7" class="text-center text-secondary py-4">
                                    Cargando historial...
                                </td>
                            </tr>
                        </tbody>

                    </table>
                </div>

                <!-- PAGINACIÓN -->
                <div class="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mt-3">

                    <small
                        id="infoPaginacionHistorial"
                        class="text-secondary"
                    >
                        Cargando información...
                    </small>

                    <div class="d-flex gap-2">

                        <button
                            type="button"
                            class="btn btn-outline-primary btn-sm"
                            id="btnPaginaAnterior"
                            disabled
                        >
                            <i class="bi bi-chevron-left me-1"></i>
                            Anterior
                        </button>

                        <button
                            type="button"
                            class="btn btn-outline-primary btn-sm"
                            id="btnPaginaSiguiente"
                            disabled
                        >
                            Siguiente
                            <i class="bi bi-chevron-right ms-1"></i>
                        </button>

                    </div>

                </div>

            </div>
        </div>


        <!-- VENTANA PARA CAMBIAR ESTADO -->
<div class="turno-modal-overlay" id="modalEstadoTurno" aria-hidden="true">

    <div class="turno-modal-dialog" role="dialog" aria-modal="true"
         aria-labelledby="tituloModalEstado">

        <div class="turno-modal-header">
            <div>
                <h5 id="tituloModalEstado" class="mb-1">
                    Cambiar estado del turno
                </h5>
                <p class="text-secondary mb-0 small">
                    Seleccioná el nuevo estado.
                </p>
            </div>

            <button
                type="button"
                class="btn-close btn-cerrar-modal-estado"
                aria-label="Cerrar">
            </button>
        </div>

        <div class="turno-modal-body">

            <button
                type="button"
                class="turno-estado-opcion btn-estado-modal"
                data-estado="ATENDIDO">

                <span class="turno-estado-icono atendido">
                    <i class="bi bi-check-circle"></i>
                </span>

                <span>
                    <strong>Marcar como atendido</strong>
                    <small>La consulta ya fue realizada.</small>
                </span>

                <i class="bi bi-chevron-right ms-auto"></i>
            </button>

            <button
                type="button"
                class="turno-estado-opcion btn-estado-modal"
                data-estado="CANCELADO">

                <span class="turno-estado-icono cancelado">
                    <i class="bi bi-x-circle"></i>
                </span>

                <span>
                    <strong>Cancelar turno</strong>
                    <small>El turno fue suspendido.</small>
                </span>

                <i class="bi bi-chevron-right ms-auto"></i>
            </button>

            <button
                type="button"
                class="turno-estado-opcion btn-estado-modal"
                data-estado="NO_ASISTIO">

                <span class="turno-estado-icono no-asistio">
                    <i class="bi bi-person-x"></i>
                </span>

                <span>
                    <strong>Marcar como no asistió</strong>
                    <small>El cliente y la mascota no se presentaron.</small>
                </span>

                <i class="bi bi-chevron-right ms-auto"></i>
            </button>

        </div>

        <div class="turno-modal-footer">
            <button
                type="button"
                class="btn btn-outline-secondary btn-cerrar-modal-estado">
                Cerrar
            </button>
        </div>

    </div>
</div>
    `;
}


// ==========================================
// INICIALIZACIÓN
// ==========================================

export async function inicializarTurnos() {

    configurarFormularioTurno();
    configurarActualizacionTurnos();
    configurarActualizacionEstado();
    configurarPaginacionHistorial();

    establecerFechaMinima();

    await cargarDatosIniciales();

    await cargarHistorialTurnos(0);
}

// ==========================================
// CARGA DE DATOS
// ==========================================

let mascotasDisponibles = [];
let veterinariosDisponibles = [];
let clientesDisponibles = [];

// ==========================================
// PAGINACIÓN DEL HISTORIAL
// ==========================================

let paginaActualHistorial = 0;
let totalPaginasHistorial = 0;

const tamanoPaginaHistorial = 10;

async function cargarDatosIniciales() {

    const resultado = await Promise.allSettled([
        apiRequest("/mascotas"),
        apiRequest("/veterinarios"),
        apiRequest("/clientes/findAll"),
        apiRequest("/turnos/pendientes")
    ]);

    // ==========================================
    // MASCOTAS
    // ==========================================

    if (
        resultado[0].status === "fulfilled" &&
        Array.isArray(resultado[0].value)
    ) {
        mascotasDisponibles = resultado[0].value;
        cargarSelectMascotas();

    } else {

        mascotasDisponibles = [];

        document.getElementById("mascotaTurno").innerHTML = `
            <option value="">No se pudieron cargar las mascotas</option>
        `;

        console.error("Error al cargar mascotas:", resultado[0].reason);
    }


    // ==========================================
    // VETERINARIOS
    // ==========================================

    if (
        resultado[1].status === "fulfilled" &&
        Array.isArray(resultado[1].value)
    ) {
        veterinariosDisponibles = resultado[1].value;
        cargarSelectVeterinarios();

    } else {

        veterinariosDisponibles = [];

        document.getElementById("veterinarioTurno").innerHTML = `
            <option value="">No se pudieron cargar los veterinarios</option>
        `;

        console.error("Error al cargar veterinarios:", resultado[1].reason);
    }


    // ==========================================
    // CLIENTES
    // ==========================================

    if (
        resultado[2].status === "fulfilled" &&
        Array.isArray(resultado[2].value)
    ) {
        clientesDisponibles = resultado[2].value;

    } else {

        clientesDisponibles = [];

        console.error("Error al cargar clientes:", resultado[2].reason);
    }


    // ==========================================
    // TURNOS
    // ==========================================

    if (
        resultado[3].status === "fulfilled" &&
        Array.isArray(resultado[3].value)
    ) {
        mostrarListaTurnos(resultado[3].value);

    } else {

        document.getElementById("tablaTurnos").innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-danger py-4">
                    No se pudieron cargar los turnos.
                </td>
            </tr>
        `;

        console.error("Error al cargar turnos:", resultado[3].reason);
    }
}


// ==========================================
// SELECT DE MASCOTAS
// ==========================================

function configurarFormularioTurno() {

    const formulario = document.getElementById("formCrearTurno");

    // Actualizar la fecha mínima cada vez que se selecciona el campo.
    const campoFechaHora = document.getElementById("fechaHoraTurno");

    campoFechaHora.addEventListener("focus", establecerFechaMinima);

    formulario.addEventListener("submit", async (evento) => {

        evento.preventDefault();

        const fechaHora = document.getElementById("fechaHoraTurno").value;
        const motivo = document.getElementById("motivoTurno").value.trim();
        const mascotaId = document.getElementById("mascotaTurno").value;
        const veterinarioId = document.getElementById("veterinarioTurno").value;

        if (!fechaHora || !motivo || !mascotaId || !veterinarioId) {
            mostrarMensajeTurnos("Completá todos los campos.", "warning");
            return;
        }

        const turno = {
            fechaHora: fechaHora,
            motivo: motivo,
            mascotaId: Number(mascotaId),
            veterinarioId: Number(veterinarioId)
        };

        const boton = document.getElementById("btnGuardarTurno");

        boton.disabled = true;
        boton.innerHTML = `
            <span class="spinner-border spinner-border-sm me-1"></span>
            Guardando...
        `;

        try {

            await apiRequest("/turnos", {
                method: "POST",
                body: JSON.stringify(turno)
            });

            mostrarMensajeTurnos("Turno registrado correctamente.", "success");

            formulario.reset();
            establecerFechaMinima();

            await cargarListaTurnos();
            await cargarHistorialTurnos(0);

        } catch (error) {

            console.error("Error al registrar turno:", error);

            mostrarMensajeTurnos(
                error.message || "No se pudo registrar el turno.",
                "danger"
            );

        } finally {

            boton.disabled = false;
            boton.innerHTML = `
                <i class="bi bi-calendar-plus me-1"></i>
                Registrar turno
            `;
        }
    });
}


// ==========================================
// SELECT DE VETERINARIOS
// ==========================================

function cargarSelectVeterinarios() {

    const select = document.getElementById("veterinarioTurno");

    if (veterinariosDisponibles.length === 0) {
        select.innerHTML = `<option value="">No hay veterinarios disponibles</option>`;
        return;
    }

    select.innerHTML = `
        <option value="">Seleccioná un veterinario</option>

        ${veterinariosDisponibles.map(veterinario => `
            <option value="${obtenerIdVeterinario(veterinario)}">
                ${escaparHTML(nombreVeterinario(veterinario))}
            </option>
        `).join("")}
    `;
}


// ==========================================
// REGISTRAR TURNO
// ==========================================

function configurarFormularioTurno() {

    const formulario = document.getElementById("formCrearTurno");

    formulario.addEventListener("submit", async (evento) => {

        evento.preventDefault();

        const fechaHora = document.getElementById("fechaHoraTurno").value;
        const motivo = document.getElementById("motivoTurno").value.trim();
        const mascotaId = document.getElementById("mascotaTurno").value;
        const veterinarioId = document.getElementById("veterinarioTurno").value;

        if (!fechaHora || !motivo || !mascotaId || !veterinarioId) {
            mostrarMensajeTurnos("Completá todos los campos.", "warning");
            return;
        }

        const turno = {
            fechaHora: fechaHora,
            motivo: motivo,
            mascotaId: Number(mascotaId),
            veterinarioId: Number(veterinarioId)
        };

        const boton = document.getElementById("btnGuardarTurno");

        boton.disabled = true;
        boton.innerHTML = `
            <span class="spinner-border spinner-border-sm me-1"></span>
            Guardando...
        `;

        try {

            await apiRequest("/turnos", {
                method: "POST",
                body: JSON.stringify(turno)
            });

            mostrarMensajeTurnos("Turno registrado correctamente.", "success");

            formulario.reset();
            establecerFechaMinima();

            await cargarListaTurnos();
await cargarHistorialTurnos(0);

        } catch (error) {

            console.error("Error al registrar turno:", error);

            mostrarMensajeTurnos(
                error.message || "No se pudo registrar el turno.",
                "danger"
            );

        } finally {

            boton.disabled = false;
            boton.innerHTML = `
                <i class="bi bi-calendar-plus me-1"></i>
                Registrar turno
            `;
        }
    });
}


// ==========================================
// LISTADO DE TURNOS
// ==========================================

async function cargarListaTurnos() {

    const tabla = document.getElementById("tablaTurnos");

    tabla.innerHTML = `
        <tr>
            <td colspan="8" class="text-center text-secondary py-4">
                Actualizando turnos...
            </td>
        </tr>
    `;

    try {

        const turnos = await apiRequest("/turnos/pendientes");

        if (!Array.isArray(turnos)) {
            throw new Error("La respuesta de turnos no tiene el formato esperado.");
        }

        mostrarListaTurnos(turnos);

    } catch (error) {

        console.error("Error al actualizar turnos:", error);

        tabla.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-danger py-4">
                    No se pudieron actualizar los turnos.
                </td>
            </tr>
        `;
    }
}


function mostrarListaTurnos(turnos) {

    const tabla = document.getElementById("tablaTurnos");

    if (turnos.length === 0) {
        tabla.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-secondary py-4">
                    <i class="bi bi-calendar-x fs-3 d-block mb-2"></i>
                    No hay turnos pendientes desde hoy en adelante.
                </td>
            </tr>
        `;
        return;
    }

    // Ordenar del turno más próximo al más lejano
    const turnosOrdenados = [...turnos].sort((a, b) =>
        new Date(a.fechaHora) - new Date(b.fechaHora)
    );

    tabla.innerHTML = turnosOrdenados.map(turno => {

        const fechaHora = formatearFechaHora(turno.fechaHora);

        // Buscar mascota
        const mascota = mascotasDisponibles.find(
            m => Number(obtenerIdMascota(m)) === Number(turno.mascotaId)
        );

        // Buscar veterinario
        const veterinario = veterinariosDisponibles.find(
            v => Number(obtenerIdVeterinario(v)) === Number(turno.veterinarioId)
        );

        // Obtener el ID del dueño desde la mascota
        const clienteId = mascota
            ? obtenerIdClienteMascota(mascota)
            : null;

        // Buscar dueño
        const cliente = clientesDisponibles.find(
            c => Number(c.id) === Number(clienteId)
        );

        // Preparar nombres
        const nombreMascotaTexto = mascota
            ? nombreMascota(mascota)
            : `Mascota #${turno.mascotaId}`;

        const nombreVeterinarioTexto = veterinario
            ? nombreVeterinario(veterinario)
            : `Veterinario #${turno.veterinarioId}`;

        const nombreClienteTexto = cliente
            ? `${cliente.nombre} ${cliente.apellido}`.trim()
            : clienteId
                ? `Cliente #${clienteId}`
                : "No disponible";

        const telefonoCliente = cliente?.telefono || "";

        return `
            <tr>
                <td>${fechaHora.fecha}</td>

                <td>
                    ${fechaHora.hora}
                </td>

                <td>
                    ${escaparHTML(nombreMascotaTexto)}
                </td>

                <td>
                    <div>${escaparHTML(nombreClienteTexto)}</div>
                    ${
                        telefonoCliente
                            ? `<small class="text-secondary">${escaparHTML(telefonoCliente)}</small>`
                            : ""
                    }
                </td>

                <td>
                    ${escaparHTML(turno.motivo || "")}
                </td>

                <td>
                    ${escaparHTML(nombreVeterinarioTexto)}
                </td>

                <td>
                    ${obtenerEtiquetaEstado(turno.estado)}
                </td>

                <td>
                    <button
                        type="button"
                        class="btn btn-sm btn-outline-secondary btn-abrir-modal-estado"
                        data-turno-id="${turno.id}">

                        <i class="bi bi-arrow-left-right me-1"></i>
                        Cambiar estado
                    </button>
                </td>
            </tr>
        `;

    }).join("");
}

// ==========================================
// HISTORIAL DE TURNOS PAGINADO
// ==========================================

async function cargarHistorialTurnos(pagina = paginaActualHistorial) {

    const tabla = document.getElementById("tablaHistorialTurnos");

    tabla.innerHTML = `
        <tr>
            <td colspan="7" class="text-center text-secondary py-4">
                <span class="spinner-border spinner-border-sm me-2"></span>
                Cargando historial...
            </td>
        </tr>
    `;

    try {

        const parametros = new URLSearchParams({
            page: String(pagina),
            size: String(tamanoPaginaHistorial)
        });

        const resultado = await apiRequest(
            `/turnos/historial?${parametros.toString()}`
        );

        if (!resultado || !Array.isArray(resultado.content)) {
            throw new Error("La respuesta del historial no tiene el formato esperado.");
        }

        paginaActualHistorial = resultado.number ?? pagina;
        totalPaginasHistorial = resultado.totalPages ?? 0;

        mostrarHistorialTurnos(resultado);

    } catch (error) {

        console.error("Error al cargar el historial:", error);

        tabla.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-danger py-4">
                    No se pudo cargar el historial de turnos.
                </td>
            </tr>
        `;

        document.getElementById("infoPaginacionHistorial").textContent =
            "No se pudo cargar la información.";

        document.getElementById("btnPaginaAnterior").disabled = true;
        document.getElementById("btnPaginaSiguiente").disabled = true;
    }
}


// ==========================================
// MOSTRAR HISTORIAL
// ==========================================

function mostrarHistorialTurnos(resultado) {

    const tabla = document.getElementById("tablaHistorialTurnos");

    const turnos = resultado.content;

    if (turnos.length === 0) {

        tabla.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-secondary py-4">
                    <i class="bi bi-clock-history fs-3 d-block mb-2"></i>
                    No hay turnos registrados en el historial.
                </td>
            </tr>
        `;

    } else {

        // IMPORTANTE:
        // No ordenamos los turnos acá.
        // Spring Boot ya devuelve el historial del más reciente al más antiguo.

        tabla.innerHTML = turnos.map(turno => {

            const fechaHora = formatearFechaHora(turno.fechaHora);

            // Buscar mascota
            const mascota = mascotasDisponibles.find(
                m => Number(obtenerIdMascota(m)) === Number(turno.mascotaId)
            );

            // Buscar veterinario
            const veterinario = veterinariosDisponibles.find(
                v => Number(obtenerIdVeterinario(v)) === Number(turno.veterinarioId)
            );

            // Obtener dueño
            const clienteId = mascota
                ? obtenerIdClienteMascota(mascota)
                : null;

            const cliente = clientesDisponibles.find(
                c => Number(c.id) === Number(clienteId)
            );

            // Preparar nombres
            const nombreMascotaTexto = mascota
                ? nombreMascota(mascota)
                : `Mascota #${turno.mascotaId}`;

            const nombreVeterinarioTexto = veterinario
                ? nombreVeterinario(veterinario)
                : `Veterinario #${turno.veterinarioId}`;

            const nombreClienteTexto = cliente
                ? `${cliente.nombre} ${cliente.apellido}`.trim()
                : clienteId
                    ? `Cliente #${clienteId}`
                    : "No disponible";

            const telefonoCliente = cliente?.telefono || "";

            return `
                <tr>

                    <td>${fechaHora.fecha}</td>

                    <td>${fechaHora.hora}</td>

                    <td>
                        ${escaparHTML(nombreMascotaTexto)}
                    </td>

                    <td>
                        <div>${escaparHTML(nombreClienteTexto)}</div>

                        ${
                            telefonoCliente
                                ? `<small class="text-secondary">${escaparHTML(telefonoCliente)}</small>`
                                : ""
                        }
                    </td>

                    <td>
                        ${escaparHTML(turno.motivo || "")}
                    </td>

                    <td>
                        ${escaparHTML(nombreVeterinarioTexto)}
                    </td>

                    <td>
                        ${obtenerEtiquetaEstado(turno.estado)}
                    </td>

                </tr>
            `;

        }).join("");
    }

    actualizarControlesPaginacion(resultado);
}


// ==========================================
// CONTROLES DE PAGINACIÓN
// ==========================================

function actualizarControlesPaginacion(resultado) {

    const botonAnterior = document.getElementById("btnPaginaAnterior");
    const botonSiguiente = document.getElementById("btnPaginaSiguiente");
    const informacion = document.getElementById("infoPaginacionHistorial");

    const totalElementos = resultado.totalElements ?? 0;
    const numeroPagina = resultado.number ?? 0;
    const tamanio = resultado.size ?? tamanoPaginaHistorial;

    const desde = totalElementos === 0
        ? 0
        : numeroPagina * tamanio + 1;

    const hasta = Math.min(
        (numeroPagina + 1) * tamanio,
        totalElementos
    );

    informacion.textContent =
        `Mostrando ${desde} a ${hasta} de ${totalElementos} turnos`;

    botonAnterior.disabled = resultado.first ?? numeroPagina === 0;

    botonSiguiente.disabled =
        resultado.last ?? numeroPagina >= totalPaginasHistorial - 1;
}


// ==========================================
// CONFIGURAR BOTONES DE PAGINACIÓN
// ==========================================

function configurarPaginacionHistorial() {

    const botonAnterior = document.getElementById("btnPaginaAnterior");
    const botonSiguiente = document.getElementById("btnPaginaSiguiente");
    const botonActualizar = document.getElementById("btnActualizarHistorial");

    botonAnterior.addEventListener("click", async () => {

        if (paginaActualHistorial > 0) {
            await cargarHistorialTurnos(paginaActualHistorial - 1);
        }
    });

    botonSiguiente.addEventListener("click", async () => {

        if (paginaActualHistorial < totalPaginasHistorial - 1) {
            await cargarHistorialTurnos(paginaActualHistorial + 1);
        }
    });

    botonActualizar.addEventListener("click", async () => {

        await cargarHistorialTurnos(paginaActualHistorial);
    });
}

// ==========================================
// ACTUALIZAR ESTADO DEL TURNO
// ==========================================

function configurarActualizacionEstado() {

    const tabla = document.getElementById("tablaTurnos");
    const modal = document.getElementById("modalEstadoTurno");

    if (!tabla || !modal) {
        console.error("No se encontraron los elementos de gestión de estados.");
        return;
    }

    // Guardamos el ID del turno seleccionado
    let turnoSeleccionadoId = null;


    // CERRAR VENTANA
    function cerrarModal() {

        modal.classList.remove("activo");
        modal.setAttribute("aria-hidden", "true");

        turnoSeleccionadoId = null;
    }


    // ABRIR VENTANA AL PRESIONAR CAMBIAR ESTADO
    tabla.addEventListener("click", (evento) => {

        const boton = evento.target.closest(".btn-abrir-modal-estado");

        if (!boton) return;

        turnoSeleccionadoId = boton.dataset.turnoId;

        modal.classList.add("activo");
        modal.setAttribute("aria-hidden", "false");
    });


    // CERRAR AL PRESIONAR LOS BOTONES DE CIERRE
    modal.addEventListener("click", async (evento) => {

        const botonCerrar = evento.target.closest(".btn-cerrar-modal-estado");

        if (botonCerrar) {
            cerrarModal();
            return;
        }

        // También cerrar si se presiona fuera de la ventana
        if (evento.target === modal) {
            cerrarModal();
            return;
        }


        // DETECTAR EL ESTADO SELECCIONADO
        const botonEstado = evento.target.closest(".btn-estado-modal");

        if (!botonEstado) return;

        if (!turnoSeleccionadoId) {
            mostrarMensajeTurnos(
                "No se pudo identificar el turno seleccionado.",
                "danger"
            );
            cerrarModal();
            return;
        }

        const estadoTurno = botonEstado.dataset.estado;

        const estadosPermitidos = [
            "ATENDIDO",
            "CANCELADO",
            "NO_ASISTIO"
        ];

        if (!estadosPermitidos.includes(estadoTurno)) {
            mostrarMensajeTurnos(
                "El estado seleccionado no es válido.",
                "warning"
            );
            return;
        }


        // DESHABILITAR OPCIONES MIENTRAS SE ACTUALIZA
        const opciones = modal.querySelectorAll(".btn-estado-modal");

        opciones.forEach(opcion => {
            opcion.disabled = true;
        });


        try {

            await apiRequest(`/turnos/${turnoSeleccionadoId}/estado`, {
                method: "PATCH",
                body: JSON.stringify({
                    estadoTurno: estadoTurno
                })
            });

            cerrarModal();

            mostrarMensajeTurnos(
                "El estado del turno se actualizó correctamente.",
                "success"
            );

            // Actualizar los listados
await cargarListaTurnos();
await cargarHistorialTurnos(paginaActualHistorial);

        } catch (error) {

            console.error("Error al actualizar estado:", error);

            cerrarModal();

            mostrarMensajeTurnos(
                error.message || "No se pudo actualizar el estado del turno.",
                "danger"
            );

        } finally {

            // Habilitar nuevamente las opciones
            opciones.forEach(opcion => {
                opcion.disabled = false;
            });
        }
    });
}


// ==========================================
// BOTÓN ACTUALIZAR LISTADO
// ==========================================

function configurarActualizacionTurnos() {

    document.getElementById("btnActualizarTurnos")
        .addEventListener("click", cargarListaTurnos);
}


// ==========================================
// FORMATO DE FECHA Y HORA
// ==========================================

function formatearFechaHora(fechaHora) {

    const fecha = new Date(fechaHora);

    if (Number.isNaN(fecha.getTime())) {
        return {
            fecha: "Fecha inválida",
            hora: "--:--"
        };
    }

    return {
        fecha: fecha.toLocaleDateString("es-AR"),
        hora: fecha.toLocaleTimeString("es-AR", {
            hour: "2-digit",
            minute: "2-digit"
        })
    };
}


// ==========================================
// ETIQUETAS DE ESTADOS
// ==========================================

function obtenerEtiquetaEstado(estado) {

    const estados = {
        PENDIENTE: {
            texto: "Pendiente",
            clase: "text-bg-warning"
        },
        ATENDIDO: {
            texto: "Atendido",
            clase: "text-bg-success"
        },
        CANCELADO: {
            texto: "Cancelado",
            clase: "text-bg-danger"
        },
        NO_ASISTIO: {
            texto: "No asistió",
            clase: "text-bg-secondary"
        }
    };

    const informacion = estados[estado] || {
        texto: estado || "Desconocido",
        clase: "text-bg-secondary"
    };

    return `
        <span class="badge ${informacion.clase}">
            ${informacion.texto}
        </span>
    `;
}


// ==========================================
// NOMBRES E IDENTIFICADORES
// ==========================================

// Estos métodos contemplan nombres alternativos habituales.
// Ajustaremos las propiedades si tus DTO utilizan otros nombres.

function obtenerIdMascota(mascota) {
    return mascota.id ?? mascota.mascotaId ?? mascota.idMascota;
}

function obtenerIdVeterinario(veterinario) {
    return veterinario.id ?? veterinario.veterinarioId ?? veterinario.idVeterinario;
}

function nombreMascota(mascota) {
    return mascota.nombre
        ?? mascota.nombreMascota
        ?? `Mascota #${obtenerIdMascota(mascota)}`;
}

function nombreVeterinario(veterinario) {

    const nombre = veterinario.nombre
        ?? veterinario.nombreVeterinario
        ?? "";

    const apellido = veterinario.apellido
        ?? veterinario.apellidoVeterinario
        ?? "";

    return `${nombre} ${apellido}`.trim()
        || `Veterinario #${obtenerIdVeterinario(veterinario)}`;
}


// ==========================================
// FECHA MÍNIMA DEL FORMULARIO
// ==========================================


function establecerFechaMinima() {

    const campo = document.getElementById("fechaHoraTurno");

    const ahora = new Date();

    // Redondear al próximo minuto para evitar seleccionar
    // una hora que ya pasó por cuestión de segundos.
    ahora.setSeconds(0, 0);
    ahora.setMinutes(ahora.getMinutes() + 1);

    const pad = valor => String(valor).padStart(2, "0");

    const fechaMinima =
        `${ahora.getFullYear()}-${pad(ahora.getMonth() + 1)}-${pad(ahora.getDate())}` +
        `T${pad(ahora.getHours())}:${pad(ahora.getMinutes())}`;

    campo.min = fechaMinima;
}



// ==========================================
// MENSAJES
// ==========================================

function mostrarMensajeTurnos(mensaje, tipo) {

    const contenedor = document.getElementById("mensajeTurnos");

    contenedor.innerHTML = `
        <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
            ${escaparHTML(mensaje)}
            <button
                type="button"
                class="btn-close"
                data-bs-dismiss="alert"
                aria-label="Cerrar"
            ></button>
        </div>
    `;

    contenedor.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });
}

function obtenerIdClienteMascota(mascota) {

    return mascota.clienteId
        ?? mascota.idCliente
        ?? mascota.cliente?.id
        ?? mascota.duenoId
        ?? mascota.propietarioId;
}