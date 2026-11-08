import { apiRequest, escaparHTML } from "../api.js";

let mascotas = [];
let veterinarios = [];
let mascotaSeleccionadaId = null;
let consultas = [];
let contadorOrdenesEstudio = 0;
let consultaEstudiosActivaId = null;
let estudioSeleccionadoId = null;

// Si alguna orden falla, guardamos los datos para reintentarla
// sin volver a crear la consulta.
let ordenesFallidasPendientes = null;

export function mostrarConsultasMedicas() {
    return `
        <div class="page-heading">
            <div>
                <h1>Consultas médicas</h1>
                <p class="page-subtitle">
                    Consultá y registrá el historial clínico.
                </p>
            </div>

            <button class="btn btn-success"
                    id="btnNuevaConsulta"
                    disabled>
                <i class="bi bi-plus-lg me-2"></i>
                Nueva consulta
            </button>
        </div>

        <div id="mensajeConsultas"></div>

        <div class="content-card mb-4">
            <div class="content-card-header">
                <label for="filtroMascotaConsulta"
                       class="form-label">
                    Seleccioná una mascota
                </label>

                <select id="filtroMascotaConsulta"
                        class="form-select">
                    <option value="">Cargando mascotas...</option>
                </select>

                <div class="form-text">
                    Seleccioná una mascota para consultar su historial.
                </div>
            </div>
        </div>

        <div class="content-card">
            <div class="content-card-header">
                <h2 class="h5 mb-0" id="tituloHistorialConsultas">
                    Historial clínico
                </h2>
            </div>

            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light">
                        <tr>
                            <th>Fecha</th>
                            <th>Motivo</th>
                            <th>Peso</th>
                            <th>Temperatura</th>
                            <th>Frecuencia cardíaca</th>
                            <th>Diagnóstico</th>
                            <th>Observaciones</th>
                            <th>Veterinario</th>
                            <th>Estudios complementarios</th>
                        </tr>
                    </thead>

                    <tbody id="tablaConsultas">
                        <tr>
                            <td colspan="9"
                                class="text-center text-secondary py-4">
                                Seleccioná una mascota para comenzar.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- MODAL: NUEVA CONSULTA -->
        <div class="modal fade"
             id="modalNuevaConsulta"
             tabindex="-1"
             aria-hidden="true">

            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content">

                    <div class="modal-header">
                        <h5 class="modal-title">
                            Registrar consulta médica
                        </h5>

                        <button type="button"
                                class="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Cerrar"></button>
                    </div>

                    <form id="formConsulta">
                        <div class="modal-body">

                            <div class="alert alert-light"
                                 id="mascotaConsultaSeleccionada">
                            </div>

                            <div class="mb-3">
                                <label for="consultaMotivo"
                                       class="form-label">
                                    Motivo de consulta *
                                </label>

                                <input type="text"
                                       id="consultaMotivo"
                                       class="form-control"
                                       required>
                            </div>

                            <div class="row g-3">
                                <div class="col-md-4">
                                    <label for="consultaPeso"
                                           class="form-label">
                                        Peso (kg)
                                    </label>

                                    <input type="number"
                                           id="consultaPeso"
                                           class="form-control"
                                           min="0"
                                           step="0.01">
                                </div>

                                <div class="col-md-4">
                                    <label for="consultaTemperatura"
                                           class="form-label">
                                        Temperatura (°C)
                                    </label>

                                    <input type="number"
                                           id="consultaTemperatura"
                                           class="form-control"
                                           min="0"
                                           step="0.1">
                                </div>

                                <div class="col-md-4">
                                    <label for="consultaFrecuencia"
                                           class="form-label">
                                        Frecuencia cardíaca
                                    </label>

                                    <input type="number"
                                           id="consultaFrecuencia"
                                           class="form-control"
                                           min="0"
                                           step="1">
                                </div>
                            </div>

                            <div class="mt-3">
                                <label for="consultaDiagnostico"
                                       class="form-label">
                                    Diagnóstico
                                </label>

                                <textarea id="consultaDiagnostico"
                                          class="form-control"
                                          rows="2"></textarea>
                            </div>

                            <div class="mt-3">
                                <label for="consultaObservaciones"
                                       class="form-label">
                                    Observaciones
                                </label>

                                <textarea id="consultaObservaciones"
                                          class="form-control"
                                          rows="3"></textarea>
                            </div>

                            <div class="mt-3">
                                <label for="consultaVeterinario"
                                       class="form-label">
                                    Veterinario *
                                </label>

                                <select id="consultaVeterinario"
                                        class="form-select"
                                        required>
                                    <option value="">
                                        Seleccioná un veterinario
                                    </option>
                                </select>
                            </div>

                            <p class="form-text mt-3 mb-0">
                                La fecha de la consulta la establece
                                el backend.
                            </p>

                            <div id="mensajeFormConsulta"></div>

                            <div class="border rounded p-3 mt-4">
                                <div class="form-check d-flex align-items-center gap-2">
                                    <input
                                        class="form-check-input m-0"
                                        type="checkbox"
                                        id="incluirEstudios"
                                        style="appearance: auto !important; display: inline-block !important; opacity: 1 !important; position: static !important; width: 1rem !important; height: 1rem !important; flex-shrink: 0;"
                                    >

                                    <label
                                        class="form-check-label fw-medium"
                                        for="incluirEstudios">
                                        ¿Necesita estudios complementarios?
                                    </label>
                                </div>

                                <p class="form-text mb-0 mt-2">
                                    Podés crear varias órdenes vinculadas
                                    a esta consulta.
                                </p>

                                <div id="contenedorOrdenesEstudio"
                                     class="mt-3"
                                     hidden>

                                    <div id="listaOrdenesEstudio"
                                         class="d-grid gap-3"></div>

                                    <button
                                        type="button"
                                        class="btn btn-outline-primary mt-3"
                                        id="btnAgregarOrden">

                                        <i class="bi bi-plus-lg me-1"></i>
                                        Agregar otra orden
                                    </button>
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
                                    class="btn btn-success"
                                    id="btnGuardarConsulta">
                                Guardar consulta
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- MODAL: ÓRDENES DE ESTUDIOS DE UNA CONSULTA -->
        <div class="modal fade"
             id="modalEstudiosConsulta"
             tabindex="-1"
             aria-hidden="true">

            <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div class="modal-content">

                    <div class="modal-header">
                        <h5 class="modal-title"
                            id="tituloEstudiosConsulta">
                            Órdenes de estudios
                        </h5>

                        <button type="button"
                                class="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Cerrar"></button>
                    </div>

                    <div class="modal-body">
                        <div id="mensajeEstudiosConsulta"></div>

                        <div id="listaEstudiosConsulta">
                            <div class="text-center text-secondary py-4">
                                Cargando órdenes...
                            </div>
                        </div>
                    </div>

                    <div class="modal-footer">
                        <button type="button"
                                class="btn btn-light"
                                data-bs-dismiss="modal">
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- MODAL: CARGAR RESULTADO DEL ESTUDIO -->
        <div class="modal fade"
             id="modalResultadoEstudio"
             tabindex="-1"
             aria-hidden="true">

            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content">

                    <div class="modal-header">
                        <h5 class="modal-title"
                            id="tituloResultadoEstudio">
                            Completar estudio
                        </h5>

                        <button type="button"
                                class="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Cerrar"></button>
                    </div>

                    <form id="formResultadoEstudio">
                        <div class="modal-body">

                            <div class="alert alert-light"
                                 id="detalleEstudioResultado">
                            </div>

                            <div class="mb-3">
                                <label for="resultadoInforme"
                                       class="form-label">
                                    Resultado / informe *
                                </label>

                                <textarea
                                    id="resultadoInforme"
                                    name="resultadoInforme"
                                    class="form-control"
                                    rows="5"
                                    required
                                    placeholder="Describí los hallazgos y conclusiones del estudio..."></textarea>
                            </div>

                            <div class="mb-3">
                                <label for="fechaRealizacionEstudio"
                                       class="form-label">
                                    Fecha de realización *
                                </label>

                                <input
                                    type="date"
                                    id="fechaRealizacionEstudio"
                                    name="fechaRealizacion"
                                    class="form-control"
                                    required>
                            </div>

                            <div class="mb-3">
                                <label for="archivoResultadoEstudio"
                                       class="form-label">
                                    Archivo adjunto (opcional)
                                </label>

                                <input
                                    type="file"
                                    id="archivoResultadoEstudio"
                                    name="archivo"
                                    class="form-control">

                                <div class="form-text">
                                    Podés adjuntar el informe digitalizado
                                    o las imágenes del estudio, si corresponde.
                                </div>
                            </div>

                            <div id="mensajeFormResultadoEstudio"></div>
                        </div>

                        <div class="modal-footer">
                            <button type="button"
                                    class="btn btn-light"
                                    data-bs-dismiss="modal">
                                Cancelar
                            </button>

                            <button type="submit"
                                    class="btn btn-success"
                                    id="btnGuardarResultadoEstudio">
                                <i class="bi bi-save me-1"></i>
                                Guardar resultado
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- MODAL: VISUALIZAR ARCHIVOS -->
<div class="modal fade"
     id="modalVisorArchivo"
     tabindex="-1"
     aria-hidden="true">

    <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">

            <div class="modal-header">
                <h5 class="modal-title" id="tituloVisorArchivo">
                    Visualizar archivo
                </h5>

                <button type="button"
                        class="btn-close"
                        data-bs-dismiss="modal"
                        aria-label="Cerrar"></button>
            </div>

            <div class="modal-body">
                <div id="contenidoVisorArchivo"
                     class="bg-body-tertiary rounded p-3 text-center"
                     style="min-height: 60vh;">
                </div>
            </div>

            <div class="modal-footer">

                <a id="btnAbrirOriginalArchivo"
                   href="#"
                   target="_blank"
                   rel="noopener noreferrer"
                   class="btn btn-outline-primary">
                    <i class="bi bi-box-arrow-up-right me-1"></i>
                    Abrir en otra pestaña
                </a>

                <a id="btnDescargarArchivo"
                   href="#"
                   class="btn btn-success">
                    <i class="bi bi-download me-1"></i>
                    Descargar archivo
                </a>

                <button type="button"
                        class="btn btn-light"
                        data-bs-dismiss="modal">
                    Cerrar
                </button>

            </div>
        </div>
    </div>
</div>
    `;
}

// CARGAR MASCOTAS Y VETERINARIOS

async function cargarOpciones() {
    const selectorMascota =
        document.getElementById("filtroMascotaConsulta");

    try {
        const [datosMascotas, datosVeterinarios] = await Promise.all([
            apiRequest("/mascotas"),
            apiRequest("/veterinarios")
        ]);

        if (!Array.isArray(datosMascotas) ||
            !Array.isArray(datosVeterinarios)) {
            throw new Error(
                "La API devolvió datos con un formato inesperado."
            );
        }

        mascotas = datosMascotas;

        veterinarios = datosVeterinarios.filter(
            veterinario => veterinario.estado !== false
        );

        selectorMascota.innerHTML = `
            <option value="">Seleccioná una mascota</option>

            ${mascotas.map(mascota => `
                <option value="${escaparHTML(mascota.id)}">
                    ${escaparHTML(mascota.nombre)}
                    — ${escaparHTML(mascota.especie)}
                    — ${escaparHTML(mascota.nombreClienteCompleto || "")}
                </option>
            `).join("")}
        `;

        const selectorVeterinario =
            document.getElementById("consultaVeterinario");

        selectorVeterinario.innerHTML = `
            <option value="">Seleccioná un veterinario</option>

            ${veterinarios.map(veterinario => `
                <option value="${escaparHTML(veterinario.id)}">
                    ${escaparHTML(veterinario.nombre)}
                    ${escaparHTML(veterinario.apellido)}
                    — ${escaparHTML(veterinario.matricula)}
                </option>
            `).join("")}
        `;

    } catch (error) {
        selectorMascota.innerHTML = `
            <option value="">No se pudieron cargar las opciones</option>
        `;

        mostrarMensajeConsultas(error.message, "danger");
        console.error("Error al cargar opciones:", error);
    }
}

// CONSULTAR HISTORIAL DE LA MASCOTA ELEGIDA

async function cargarHistorial() {
    const selector =
        document.getElementById("filtroMascotaConsulta");

    const id = selector.value;
    const tabla = document.getElementById("tablaConsultas");
    const botonNueva = document.getElementById("btnNuevaConsulta");

    mascotaSeleccionadaId = null;
    consultas = [];
    botonNueva.disabled = true;

    if (!id) {
        document.getElementById("tituloHistorialConsultas").textContent =
            "Historial clínico";

        tabla.innerHTML = `
            <tr>
                <td colspan="9"
                    class="text-center text-secondary py-4">
                    Seleccioná una mascota para consultar su historial.
                </td>
            </tr>
        `;
        return;
    }

    mascotaSeleccionadaId = Number(id);

    const mascota = mascotas.find(
        item => String(item.id) === String(id)
    );

    document.getElementById("tituloHistorialConsultas").textContent =
        `Historial clínico de ${mascota?.nombre || "la mascota"}`;

    tabla.innerHTML = `
        <tr>
            <td colspan="9" class="text-center py-4">
                Cargando historial...
            </td>
        </tr>
    `;

    try {
        const datos = await apiRequest(
            `/consultas-medicas/mascotas/${encodeURIComponent(id)}`
        );

        if (!Array.isArray(datos)) {
            throw new Error(
                "La API no devolvió una lista de consultas."
            );
        }

       consultas = datos;
await renderizarConsultas();

botonNueva.disabled = false;

    } catch (error) {
        mascotaSeleccionadaId = null;

        tabla.innerHTML = `
            <tr>
                <td colspan="9"
                    class="text-center text-danger py-4">
                    ${escaparHTML(error.message)}
                </td>
            </tr>
        `;

        mostrarMensajeConsultas(error.message, "danger");
    }
}

function formatearFecha(fecha) {
    if (!fecha) return "—";

    const partes = fecha.split("-");

    return partes.length === 3
        ? `${partes[2]}/${partes[1]}/${partes[0]}`
        : escaparHTML(fecha);
}

// MOSTRAR LAS CONSULTAS EN LA TABLA

async function renderizarConsultas() {
    const tabla = document.getElementById("tablaConsultas");

    if (consultas.length === 0) {
        tabla.innerHTML = `
            <tr>
                <td colspan="9"
                    class="text-center text-secondary py-4">
                    Esta mascota todavía no tiene consultas registradas.
                </td>
            </tr>
        `;
        return;
    }

    tabla.innerHTML = `
        <tr>
            <td colspan="9" class="text-center py-4">
                <div class="spinner-border spinner-border-sm me-2"
                     role="status"></div>
                Verificando órdenes de estudios...
            </td>
        </tr>
    `;

    // Consultar los estudios asociados a cada consulta.
    const consultasVerificadas = await Promise.all(
        consultas.map(async consulta => {
            try {
                const estudios = await apiRequest(
                    `/estudios/${encodeURIComponent(consulta.id)}/consultaMedica`
                );

                return {
                    ...consulta,
                    tieneEstudios:
                        Array.isArray(estudios) && estudios.length > 0
                };

            } catch (error) {
                console.error(
                    `No se pudieron verificar los estudios de la consulta ${consulta.id}:`,
                    error
                );

                return {
                    ...consulta,
                    tieneEstudios: null
                };
            }
        })
    );

    tabla.innerHTML = consultasVerificadas.map(consulta => {
        let columnaEstudios = "—";

        if (consulta.tieneEstudios === true) {
            columnaEstudios = `
                <button type="button"
                        class="btn btn-sm btn-outline-primary"
                        data-accion="ver-estudios"
                        data-consulta-id="${escaparHTML(consulta.id)}">
                    <i class="bi bi-clipboard2-pulse me-1"></i>
                    Ver órdenes
                </button>
            `;

        } else if (consulta.tieneEstudios === null) {
            columnaEstudios = `
                <span class="text-secondary small"
                      title="No se pudieron verificar las órdenes">
                    No disponible
                </span>
            `;
        }

        return `
            <tr>
                <td>${formatearFecha(consulta.fecha)}</td>
                <td>${escaparHTML(consulta.motivo)}</td>

                <td>
                    ${consulta.peso == null
                        ? "—"
                        : `${escaparHTML(consulta.peso)} kg`}
                </td>

                <td>
                    ${consulta.temperatura == null
                        ? "—"
                        : `${escaparHTML(consulta.temperatura)} °C`}
                </td>

                <td>
                    ${consulta.frecuenciaCardiaca == null
                        ? "—"
                        : escaparHTML(consulta.frecuenciaCardiaca)}
                </td>

                <td>${escaparHTML(consulta.diagnostico || "—")}</td>

                <td>${escaparHTML(consulta.observaciones || "—")}</td>

                <td>${escaparHTML(consulta.nombreVeterinario || "—")}</td>

                <td>${columnaEstudios}</td>
            </tr>
        `;
    }).join("");
}

// REGISTRAR UNA CONSULTA

async function guardarConsulta(evento) {
    evento.preventDefault();

    const boton = document.getElementById("btnGuardarConsulta");

    const incluirEstudios =
        document.getElementById("incluirEstudios").checked;

    const ordenes = incluirEstudios
        ? obtenerOrdenesDelFormulario()
        : [];

    if (!mascotaSeleccionadaId) {
        mostrarErrorFormularioConsulta(
            "Seleccioná una mascota antes de registrar la consulta.",
            "warning"
        );
        return;
    }

    if (incluirEstudios && ordenes.length === 0) {
        mostrarErrorFormularioConsulta(
            "Agregá al menos una orden o desmarcá la opción de estudios.",
            "warning"
        );
        return;
    }

    if (ordenes.some(orden => !orden.tipoEstudio)) {
        mostrarErrorFormularioConsulta(
            "Completá el tipo de estudio de cada orden.",
            "warning"
        );
        return;
    }

    const veterinarioId =
        document.getElementById("consultaVeterinario").value;

    const peso = document.getElementById("consultaPeso").value;
    const temperatura =
        document.getElementById("consultaTemperatura").value;
    const frecuencia =
        document.getElementById("consultaFrecuencia").value;

    const consulta = {
        motivo: document.getElementById("consultaMotivo").value.trim(),

        peso: peso === "" ? null : Number(peso),

        temperatura: temperatura === ""
            ? null : Number(temperatura),

        frecuenciaCardiaca: frecuencia === ""
            ? null : Number(frecuencia),

        diagnostico:
            document.getElementById("consultaDiagnostico").value.trim()
            || null,

        observaciones:
            document.getElementById("consultaObservaciones").value.trim()
            || null,

        mascotaId: mascotaSeleccionadaId,
        veterinarioId: Number(veterinarioId)
    };

    if (!consulta.motivo || !veterinarioId) {
        mostrarErrorFormularioConsulta(
            "El motivo y el veterinario son obligatorios.",
            "warning"
        );
        return;
    }

    if (
        (consulta.peso !== null &&
            (!Number.isFinite(consulta.peso) || consulta.peso < 0)) ||
        (consulta.temperatura !== null &&
            (!Number.isFinite(consulta.temperatura) ||
                consulta.temperatura < 0)) ||
        (consulta.frecuenciaCardiaca !== null &&
            (!Number.isInteger(consulta.frecuenciaCardiaca) ||
                consulta.frecuenciaCardiaca < 0))
    ) {
        mostrarErrorFormularioConsulta(
            "Revisá los valores de peso, temperatura y frecuencia cardíaca.",
            "warning"
        );
        return;
    }

    boton.disabled = true;

    try {
        // Si existe una consulta con órdenes pendientes de reintento,
        // no volvemos a crear la consulta.
        if (ordenesFallidasPendientes) {
            await reintentarOrdenesFallidas();
            return;
        }

        // PRIMERO: crear la consulta médica.
        const consultaCreada = await apiRequest("/consultas-medicas", {
            method: "POST",
            body: JSON.stringify(consulta)
        });

        if (incluirEstudios && consultaCreada?.id == null) {
            bootstrap.Modal
                .getOrCreateInstance(
                    document.getElementById("modalNuevaConsulta")
                )
                .hide();

            await cargarHistorial();

            mostrarMensajeConsultas(
                "La consulta pudo haberse guardado, pero el backend no devolvió su ID. Verificá el historial antes de volver a enviarla. Las órdenes no fueron enviadas.",
                "warning"
            );

            return;
        }

        // Si no hay órdenes, terminamos normalmente.
        if (ordenes.length === 0) {
            bootstrap.Modal
                .getOrCreateInstance(
                    document.getElementById("modalNuevaConsulta")
                )
                .hide();

            document.getElementById("formConsulta").reset();

            await cargarHistorial();

            mostrarMensajeConsultas(
                "Consulta médica registrada correctamente."
            );

            return;
        }

        // Guardamos el ID real de la consulta y las órdenes que hay
        // que registrar. Todas compartirán este consultaId.
        ordenesFallidasPendientes = {
            consultaId: consultaCreada.id,
            totalOrdenes: ordenes.length,
            guardadas: 0,
            ordenes: ordenes.map(orden => ({ ...orden }))
        };

        // SEGUNDO: enviar las órdenes una por una.
        await procesarOrdenesPendientes();

    } catch (error) {
        mostrarErrorFormularioConsulta(error.message);
        console.error("Error al guardar consulta:", error);

    } finally {
        boton.disabled = false;
    }
}

async function procesarOrdenesPendientes() {
    if (!ordenesFallidasPendientes) return;

    const estado = ordenesFallidasPendientes;
    const fallidas = [];

    for (const orden of estado.ordenes) {
        try {
            await apiRequest("/estudios", {
                method: "POST",
                body: JSON.stringify({
                    tipoEstudio: orden.tipoEstudio,
                    descripcion: orden.descripcion || null,
                    consultaId: estado.consultaId
                })
            });

            estado.guardadas++;

        } catch (error) {
            fallidas.push({
                tipoEstudio: orden.tipoEstudio,
                descripcion: orden.descripcion,
                error: error.message
            });
        }
    }

    estado.ordenes = fallidas;

    if (fallidas.length === 0) {
        const mensaje =
            `Consulta médica registrada y ${estado.totalOrdenes} ` +
            `orden(es) de estudio creada(s) correctamente.`;

        ordenesFallidasPendientes = null;

        bootstrap.Modal
            .getOrCreateInstance(
                document.getElementById("modalNuevaConsulta")
            )
            .hide();

        document.getElementById("formConsulta").reset();

        await cargarHistorial();

        mostrarMensajeConsultas(mensaje);
        return;
    }

    // No reintentamos la consulta, solamente los estudios que fallaron.
    const mensaje =
        `La consulta #${estado.consultaId} y ${estado.guardadas} ` +
        `de ${estado.totalOrdenes} orden(es) se guardaron. ` +
        `Quedan ${fallidas.length} orden(es) pendientes. ` +
        `Podés reintentarlas desde este aviso; la consulta no se duplicará.`;

    bootstrap.Modal
        .getOrCreateInstance(
            document.getElementById("modalNuevaConsulta")
        )
        .hide();

    document.getElementById("formConsulta").reset();

    await cargarHistorial();

    mostrarMensajeOrdenesPendientes(mensaje);
}

async function reintentarOrdenesFallidas() {
    if (!ordenesFallidasPendientes) return;

    const boton = document.getElementById("btnReintentarOrdenes");
    if (boton) boton.disabled = true;

    try {
        await procesarOrdenesPendientes();

    } catch (error) {
        console.error("Error al reintentar órdenes:", error);

        mostrarMensajeConsultas(
            "No se pudieron completar todos los reintentos. Revisá el estado de las órdenes antes de volver a intentarlo.",
            "warning"
        );

    } finally {
        const nuevoBoton =
            document.getElementById("btnReintentarOrdenes");

        if (nuevoBoton) nuevoBoton.disabled = false;
    }
}

function mostrarMensajeOrdenesPendientes(mensaje) {
    const contenedor = document.getElementById("mensajeConsultas");

    if (!contenedor || !ordenesFallidasPendientes) return;

    const listaErrores = ordenesFallidasPendientes.ordenes.map(orden => `
        <li>
            <strong>${escaparHTML(orden.tipoEstudio)}</strong>:
            ${escaparHTML(orden.error)}
        </li>
    `).join("");

    contenedor.innerHTML = `
        <div class="alert alert-warning" role="alert">
            <p>${escaparHTML(mensaje)}</p>

            <p class="mb-1">Órdenes pendientes:</p>
            <ul>${listaErrores}</ul>

            <button type="button"
                    class="btn btn-sm btn-outline-dark"
                    id="btnReintentarOrdenes">
                Reintentar órdenes fallidas
            </button>
        </div>
    `;

    document.getElementById("btnReintentarOrdenes")
        .addEventListener("click", reintentarOrdenesFallidas);
}

function mostrarMensajeConsultas(mensaje, tipo = "success") {
    const contenedor = document.getElementById("mensajeConsultas");

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

// CONSULTAR Y MOSTRAR LAS ÓRDENES DE UNA CONSULTA

async function mostrarEstudiosConsulta(consultaId, mensajeExito = null) {
    if (!Number.isFinite(consultaId) || consultaId <= 0) {
        mostrarMensajeConsultas(
            "No se encontró un ID de consulta válido.",
            "warning"
        );
        return;
    }

    consultaEstudiosActivaId = consultaId;

    document.getElementById("mensajeEstudiosConsulta").replaceChildren();

    document.getElementById("tituloEstudiosConsulta").textContent =
        `Órdenes de estudios de la consulta #${consultaId}`;

    document.getElementById("listaEstudiosConsulta").innerHTML = `
        <div class="text-center text-secondary py-4">
            <div class="spinner-border spinner-border-sm me-2" role="status"></div>
            Cargando órdenes de estudios...
        </div>
    `;

    bootstrap.Modal
        .getOrCreateInstance(
            document.getElementById("modalEstudiosConsulta")
        )
        .show();

    try {
        const estudios = await apiRequest(
            `/estudios/${encodeURIComponent(consultaId)}/consultaMedica`
        );

        if (!Array.isArray(estudios)) {
            throw new Error(
                "La API no devolvió una lista de estudios."
            );
        }

        renderizarEstudiosConsulta(estudios);

        if (mensajeExito) {
            document.getElementById("mensajeEstudiosConsulta").innerHTML = `
                <div class="alert alert-success" role="status">
                    ${escaparHTML(mensajeExito)}
                </div>
            `;
        }

    } catch (error) {
        document.getElementById("listaEstudiosConsulta").innerHTML = `
            <div class="alert alert-danger" role="alert">
                ${escaparHTML(error.message || "No se pudieron cargar las órdenes.")}
            </div>
        `;

        console.error("Error al cargar órdenes de estudios:", error);
    }
}

function renderizarEstudiosConsulta(estudios) {
    const contenedor = document.getElementById("listaEstudiosConsulta");

    if (estudios.length === 0) {
        contenedor.innerHTML = `
            <div class="text-center text-secondary py-4">
                <i class="bi bi-clipboard2-x fs-2 d-block mb-2"></i>
                Esta consulta no tiene órdenes de estudios complementarios.
            </div>
        `;
        return;
    }

    contenedor.innerHTML = estudios.map(estudio => {

        const estado = String(
            estudio.estadoEstudio || "PENDIENTE"
        ).toUpperCase();

        const claseEstado = estado === "REALIZADO"
            ? "success"
            : estado === "CANCELADO"
                ? "secondary"
                : "warning";

        const fechaSolicitud = formatearFecha(estudio.fechaSolicitud);
        const fechaRealizacion = formatearFecha(estudio.fechaRealizacion);

        const enlaceArchivo =
            construirEnlaceArchivo(estudio.urlArchivo);

        const nombreArchivo = enlaceArchivo
            ? obtenerNombreArchivo(enlaceArchivo)
            : "";

        let acciones = "";

        if (estado === "PENDIENTE") {

            acciones = `
                <button type="button"
                        class="btn btn-sm btn-success mt-3"
                        data-accion="cargar-resultado"
                        data-estudio-id="${escaparHTML(estudio.id)}"
                        data-tipo-estudio="${escaparHTML(estudio.tipoEstudio || "Estudio complementario")}">

                    <i class="bi bi-file-earmark-check me-1"></i>
                    Cargar resultado
                </button>
                <button type="button"
                    class="btn btn-sm btn-outline-danger"
                    data-accion="cancelar-estudio"
                    data-estudio-id="${escaparHTML(estudio.id)}">

                <i class="bi bi-x-circle me-1"></i>
                Cancelar orden

            </button>
            `;

        } else if (estado === "REALIZADO") {

            acciones = `
                <div class="mt-3">

                    <div class="fw-semibold small mb-1">
                        Resultado / informe
                    </div>

                    <p class="mb-2 text-break">
                        ${escaparHTML(
                            estudio.resultadoInforme || "No se recibió un informe."
                        )}
                    </p>

                    <div class="small text-secondary">
                        Fecha de realización: ${fechaRealizacion}
                    </div>

                    ${
                        enlaceArchivo
                            ? `
                                <div class="border rounded p-3 mt-3">

                                    <div class="d-flex align-items-center gap-2">

                                        <i class="bi bi-file-earmark fs-3 text-secondary"></i>

                                        <div class="flex-grow-1 overflow-hidden">

                                            <div class="fw-medium text-break">
                                                ${escaparHTML(nombreArchivo)}
                                            </div>

                                            <div class="small text-secondary">
                                                Archivo adjunto
                                            </div>

                                        </div>
                                    </div>

                                    <div class="d-flex flex-wrap gap-2 mt-3">

                                        <button
                                            type="button"
                                            class="btn btn-sm btn-outline-primary"
                                            data-accion="ver-archivo"
                                            data-url-archivo="${escaparHTML(enlaceArchivo)}"
                                            data-nombre-archivo="${escaparHTML(nombreArchivo)}">

                                            <i class="bi bi-eye me-1"></i>
                                            Ver / abrir archivo
                                        </button>

                                        <a
                                            href="${escaparHTML(construirUrlDescarga(enlaceArchivo))}"
                                            class="btn btn-sm btn-outline-success"
                                            target="_blank"
                                            rel="noopener noreferrer">

                                            <i class="bi bi-download me-1"></i>
                                            Descargar
                                        </a>

                                    </div>
                                </div>
                              `
                            : `
                                <div class="small text-secondary mt-2">
                                    Sin archivo adjunto.
                                </div>
                              `
                    }

                </div>
            `;
        }

        return `
            <article class="border rounded-3 p-3 mb-3">

                <div class="d-flex flex-wrap justify-content-between align-items-start gap-2">

                    <div>
                        <h3 class="h6 mb-1">
                            ${escaparHTML(estudio.tipoEstudio || "Estudio sin tipo")}
                        </h3>

                        <div class="small text-secondary">
                            Solicitado: ${fechaSolicitud}
                        </div>
                    </div>

                    <span class="badge text-bg-${claseEstado}">
                        ${escaparHTML(estado)}
                    </span>

                </div>

                ${
                    estudio.descripcion
                        ? `
                            <p class="mt-3 mb-0 text-break">
                                ${escaparHTML(estudio.descripcion)}
                            </p>
                          `
                        : ""
                }

                ${acciones}

            </article>
        `;

    }).join("");
}

function construirEnlaceArchivo(urlArchivo) {
    if (typeof urlArchivo !== "string" || !urlArchivo.trim()) {
        return null;
    }

    const url = urlArchivo.trim();

    // Solo permitimos enlaces HTTP(S) o rutas absolutas del mismo sitio.
    if (/^https?:\/\//i.test(url) || url.startsWith("/")) {
        return url;
    }

    return null;
}

// OBTENER EL NOMBRE DEL ARCHIVO DESDE LA URL

function obtenerNombreArchivo(urlArchivo) {
    try {
        const url = new URL(urlArchivo, window.location.origin);

        const segmentos = url.pathname.split("/");
        const ultimoSegmento = segmentos.pop();

        return decodeURIComponent(ultimoSegmento) || "archivo-adjunto";

    } catch (error) {
        return "archivo-adjunto";
    }
}


// IDENTIFICAR LA EXTENSIÓN

function obtenerExtensionArchivo(nombreArchivo) {
    const partes = nombreArchivo.split(".");

    if (partes.length < 2) {
        return "";
    }

    return partes.pop().toLowerCase();
}


// CONSTRUIR URL PARA DESCARGAR DESDE CLOUDINARY

function construirUrlDescarga(urlArchivo) {

    // Cloudinary permite forzar la descarga mediante fl_attachment.
    if (
        urlArchivo.includes("res.cloudinary.com") &&
        urlArchivo.includes("/upload/")
    ) {
        return urlArchivo.replace(
            "/upload/",
            "/upload/fl_attachment/"
        );
    }

    return urlArchivo;
}


// ABRIR EL VISOR DE ARCHIVOS

function abrirVisorArchivo(urlArchivo, nombreArchivo) {

    const url = construirEnlaceArchivo(urlArchivo);

    if (!url) {
        mostrarMensajeConsultas(
            "La dirección del archivo no es válida.",
            "warning"
        );
        return;
    }

    const extension = obtenerExtensionArchivo(nombreArchivo);

    const contenido = document.getElementById(
        "contenidoVisorArchivo"
    );

    contenido.replaceChildren();

    document.getElementById("tituloVisorArchivo").textContent =
        nombreArchivo;

    // Configurar botones del modal.
    const botonAbrir = document.getElementById(
        "btnAbrirOriginalArchivo"
    );

    const botonDescargar = document.getElementById(
        "btnDescargarArchivo"
    );

    botonAbrir.href = url;

    botonDescargar.href = construirUrlDescarga(url);
    botonDescargar.setAttribute("download", nombreArchivo);

    let visor = null;

    // 1. DOCUMENTOS PDF
    if (extension === "pdf") {

        visor = document.createElement("iframe");

        visor.src = url;
        visor.title = nombreArchivo;
        visor.loading = "lazy";
        visor.referrerPolicy = "no-referrer";

        visor.style.width = "100%";
        visor.style.height = "70vh";
        visor.style.border = "0";

    }

    // 2. IMÁGENES
    else if ([
        "jpg",
        "jpeg",
        "png",
        "gif",
        "webp",
        "bmp",
        "avif",
        "svg"
    ].includes(extension)) {

        visor = document.createElement("img");

        visor.src = url;
        visor.alt = nombreArchivo;

        visor.style.maxWidth = "100%";
        visor.style.maxHeight = "70vh";
        visor.style.objectFit = "contain";
        visor.style.borderRadius = "8px";

    }

    // 3. VIDEOS
    else if ([
        "mp4",
        "webm",
        "ogv",
        "m4v"
    ].includes(extension)) {

        visor = document.createElement("video");

        visor.src = url;
        visor.controls = true;
        visor.preload = "metadata";
        visor.playsInline = true;

        visor.style.maxWidth = "100%";
        visor.style.maxHeight = "70vh";

    }

    // 4. AUDIO
    else if ([
        "mp3",
        "wav",
        "ogg",
        "oga",
        "m4a",
        "aac",
        "opus"
    ].includes(extension)) {

        visor = document.createElement("audio");

        visor.src = url;
        visor.controls = true;
        visor.preload = "metadata";

        visor.style.width = "100%";

    }

    // 5. FORMATOS SIN VISOR NATIVO
    else {

        const mensaje = document.createElement("div");

        mensaje.className = "py-5";

        const icono = document.createElement("i");

        icono.className = "bi bi-file-earmark-zip fs-1 text-secondary";

        const titulo = document.createElement("h5");

        titulo.className = "mt-3";
        titulo.textContent = "Archivo disponible";

        const descripcion = document.createElement("p");

        descripcion.className = "text-secondary";

        descripcion.textContent =
            "Este formato no tiene vista previa integrada en el navegador. " +
            "Podés abrirlo en otra pestaña o descargarlo para utilizarlo " +
            "con un programa compatible.";

        mensaje.append(icono, titulo, descripcion);

        contenido.appendChild(mensaje);

        bootstrap.Modal
            .getOrCreateInstance(
                document.getElementById("modalVisorArchivo")
            )
            .show();

        return;
    }

    // Agregar el elemento visual al contenedor.
    contenido.appendChild(visor);

    // Mostrar el modal.
    bootstrap.Modal
        .getOrCreateInstance(
            document.getElementById("modalVisorArchivo")
        )
        .show();
}

// ABRIR EL FORMULARIO PARA COMPLETAR UNA ORDEN

function abrirFormularioResultadoEstudio(estudioId, tipoEstudio) {
    if (!Number.isFinite(estudioId) || estudioId <= 0) {
        mostrarMensajeConsultas(
            "No se encontró un ID de estudio válido.",
            "warning"
        );
        return;
    }

    estudioSeleccionadoId = estudioId;

    document.getElementById("formResultadoEstudio").reset();

    document.getElementById("mensajeFormResultadoEstudio")
        .replaceChildren();

    document.getElementById("tituloResultadoEstudio").textContent =
        `Completar estudio: ${tipoEstudio}`;

    document.getElementById("detalleEstudioResultado").textContent =
        `Estudio #${estudioId}. El informe describe el resultado del estudio realizado.`;

    const modalOrdenesElemento =
        document.getElementById("modalEstudiosConsulta");

    const mostrarFormulario = () => {
        bootstrap.Modal
            .getOrCreateInstance(
                document.getElementById("modalResultadoEstudio")
            )
            .show();
    };

    // Cerramos primero el modal de órdenes para evitar dos modales abiertos.
    modalOrdenesElemento.addEventListener(
        "hidden.bs.modal",
        mostrarFormulario,
        { once: true }
    );

    bootstrap.Modal
        .getOrCreateInstance(modalOrdenesElemento)
        .hide();
}

// GUARDAR EL RESULTADO, LA FECHA Y EL ARCHIVO

async function guardarResultadoEstudio(evento) {
    evento.preventDefault();

    const boton =
        document.getElementById("btnGuardarResultadoEstudio");

    const mensaje =
        document.getElementById("mensajeFormResultadoEstudio");

    const resultadoInforme =
        document.getElementById("resultadoInforme").value.trim();

    const fechaRealizacion =
        document.getElementById("fechaRealizacionEstudio").value;

    const archivo =
        document.getElementById("archivoResultadoEstudio").files[0];

    mensaje.replaceChildren();

    if (!estudioSeleccionadoId) {
        mostrarErrorResultadoEstudio(
            "No se seleccionó una orden de estudio.",
            "warning"
        );
        return;
    }

    if (!resultadoInforme || !fechaRealizacion) {
        mostrarErrorResultadoEstudio(
            "Completá el resultado y la fecha de realización.",
            "warning"
        );
        return;
    }

    const formData = new FormData();

    formData.append("resultadoInforme", resultadoInforme);
    formData.append("fechaRealizacion", fechaRealizacion);

    if (archivo) {
        formData.append("archivo", archivo);
    }

    boton.disabled = true;

    boton.innerHTML = `
        <span class="spinner-border spinner-border-sm me-2" role="status"></span>
        Guardando...
    `;

    try {
        await apiRequest(
            `/estudios/${encodeURIComponent(estudioSeleccionadoId)}/resultado`,
            {
                method: "PATCH",
                body: formData
            }
        );

        const modalResultadoElemento =
            document.getElementById("modalResultadoEstudio");

        modalResultadoElemento.addEventListener(
            "hidden.bs.modal",
            async () => {
                if (consultaEstudiosActivaId) {
                    await mostrarEstudiosConsulta(
                        consultaEstudiosActivaId,
                        "Resultado del estudio guardado correctamente."
                    );
                }
            },
            { once: true }
        );

        bootstrap.Modal
            .getOrCreateInstance(modalResultadoElemento)
            .hide();

    } catch (error) {
        mostrarErrorResultadoEstudio(
            error.message ||
            "No se pudo guardar el resultado del estudio."
        );

        console.error(
            "Error al guardar resultado de estudio:",
            error
        );

    } finally {
        boton.disabled = false;

        boton.innerHTML = `
            <i class="bi bi-save me-1"></i>
            Guardar resultado
        `;
    }
}

function mostrarErrorResultadoEstudio(mensaje, tipo = "danger") {
    const contenedor =
        document.getElementById("mensajeFormResultadoEstudio");

    contenedor.innerHTML = `
        <div class="alert alert-${tipo}" role="alert">
            ${escaparHTML(mensaje)}
        </div>
    `;
}

// INICIALIZAR EL MÓDULO

export function inicializarConsultasMedicas() {
    document.getElementById("filtroMascotaConsulta")
        .addEventListener("change", cargarHistorial);

    document.getElementById("formConsulta")
        .addEventListener("submit", guardarConsulta);

    document.getElementById("tablaConsultas")
        .addEventListener("click", async evento => {
            const origen = evento.target;

            if (!(origen instanceof Element)) {
                return;
            }

            const boton = origen.closest(
                '[data-accion="ver-estudios"]'
            );

            if (!boton) {
                return;
            }

            await mostrarEstudiosConsulta(
                Number(boton.dataset.consultaId)
            );
        });

    document.getElementById("listaEstudiosConsulta")
    .addEventListener("click", evento => {

        const origen = evento.target;

        if (!(origen instanceof Element)) {
            return;
        }

        // CARGAR RESULTADO
        const botonResultado = origen.closest(
            '[data-accion="cargar-resultado"]'
        );

        if (botonResultado) {

            abrirFormularioResultadoEstudio(
                Number(botonResultado.dataset.estudioId),
                botonResultado.dataset.tipoEstudio || "Estudio complementario"
            );

            return;
        }

        // VISUALIZAR ARCHIVO
        const botonArchivo = origen.closest(
            '[data-accion="ver-archivo"]'
        );

        const botonCancelar = origen.closest(
    '[data-accion="cancelar-estudio"]'
);

if (botonCancelar) {

    cancelarOrdenDesdeConsulta(
        Number(botonCancelar.dataset.estudioId)
    );

    return;
}

        if (botonArchivo) {

            abrirVisorArchivo(
                botonArchivo.dataset.urlArchivo,
                botonArchivo.dataset.nombreArchivo || "Archivo adjunto"
            );
        }
    });

    document.getElementById("formResultadoEstudio")
        .addEventListener("submit", guardarResultadoEstudio);

    document.getElementById("btnNuevaConsulta")
        .addEventListener("click", () => {
            const mascota = mascotas.find(
                item => String(item.id) === String(mascotaSeleccionadaId)
            );

            if (!mascota) {
                return;
            }

            document.getElementById("formConsulta").reset();

            // Reiniciar el bloque dinámico de estudios.
            document.getElementById("incluirEstudios").checked = false;

            document.getElementById("contenedorOrdenesEstudio").hidden = true;

            document.getElementById("listaOrdenesEstudio")
                .replaceChildren();

            contadorOrdenesEstudio = 0;

            document.getElementById("mensajeFormConsulta")
                .replaceChildren();

            document.getElementById("mascotaConsultaSeleccionada")
                .textContent =
                    `Mascota: ${mascota.nombre} — ${mascota.especie}`;

            bootstrap.Modal
                .getOrCreateInstance(
                    document.getElementById("modalNuevaConsulta")
                )
                .show();
        });

    cargarOpciones();

    configurarOrdenesDinamicas();

    if (ordenesFallidasPendientes) {
        mostrarMensajeOrdenesPendientes(
            `La consulta #${ordenesFallidasPendientes.consultaId} quedó guardada, pero todavía hay órdenes pendientes.`
        );
    }
}

// AGREGAR ÓRDENES DINÁMICAS

function agregarOrdenEstudio() {
    const lista = document.getElementById("listaOrdenesEstudio");
    const numero = ++contadorOrdenesEstudio;

    const tarjeta = document.createElement("div");

    tarjeta.className = "orden-estudio border rounded p-3";
    tarjeta.dataset.ordenId = numero;

    tarjeta.innerHTML = `
        <div class="d-flex align-items-center justify-content-between mb-3">
            <h3 class="h6 mb-0">
                Orden de estudio ${numero}
            </h3>

            <button type="button"
                    class="btn btn-sm btn-outline-danger"
                    data-accion="quitar-orden"
                    title="Quitar orden">
                <i class="bi bi-trash"></i>
            </button>
        </div>

        <div class="mb-3">
            <label class="form-label" for="tipoEstudio${numero}">
                Tipo de estudio *
            </label>

            <input type="text"
                   id="tipoEstudio${numero}"
                   class="form-control"
                   data-campo="tipoEstudio"
                   placeholder="Ej. Radiografía"
                   required>
        </div>

        <div>
            <label class="form-label"
                   for="descripcionEstudio${numero}">
                Descripción
            </label>

            <textarea id="descripcionEstudio${numero}"
                      class="form-control"
                      data-campo="descripcion"
                      rows="2"
                      placeholder="Indicaciones para el estudio"></textarea>
        </div>
    `;

    lista.appendChild(tarjeta);
}

function configurarOrdenesDinamicas() {
    const checkbox = document.getElementById("incluirEstudios");

    const contenedor =
        document.getElementById("contenedorOrdenesEstudio");

    const lista =
        document.getElementById("listaOrdenesEstudio");

    const botonAgregar =
        document.getElementById("btnAgregarOrden");

    if (!checkbox || !contenedor || !lista || !botonAgregar) {
        console.error(
            "No se encontraron los elementos HTML de órdenes de estudios. " +
            "Verificá el bloque de estudios dentro de mostrarConsultasMedicas()."
        );
        return;
    }

    checkbox.addEventListener("change", () => {
        contenedor.hidden = !checkbox.checked;

        if (checkbox.checked && lista.children.length === 0) {
            agregarOrdenEstudio();
        }

        if (!checkbox.checked) {
            lista.replaceChildren();
            contadorOrdenesEstudio = 0;
        }
    });

    botonAgregar.addEventListener(
        "click",
        agregarOrdenEstudio
    );

    lista.addEventListener("click", evento => {
        const objetivo = evento.target;

        if (!(objetivo instanceof Element)) {
            return;
        }

        const boton = objetivo.closest(
            '[data-accion="quitar-orden"]'
        );

        if (!boton) {
            return;
        }

        boton.closest(".orden-estudio")?.remove();
    });
}

function obtenerOrdenesDelFormulario() {
    return Array.from(
        document.querySelectorAll(
            "#listaOrdenesEstudio .orden-estudio"
        )
    ).map(tarjeta => ({
        tipoEstudio: tarjeta
            .querySelector('[data-campo="tipoEstudio"]')
            .value.trim(),

        descripcion: tarjeta
            .querySelector('[data-campo="descripcion"]')
            .value.trim()
    }));
}

function mostrarErrorFormularioConsulta(
    mensaje,
    tipo = "danger"
) {
    const contenedor =
        document.getElementById("mensajeFormConsulta");

    contenedor.innerHTML = `
        <div class="alert alert-${tipo}" role="alert">
            ${escaparHTML(mensaje)}
        </div>
    `;
}

async function cancelarOrdenDesdeConsulta(idEstudio) {

    const confirmar = confirm(
        "¿Deseás cancelar esta orden de estudio?"
    );

    if (!confirmar) {
        return;
    }

    try {

        await apiRequest(
            `/estudios/${encodeURIComponent(idEstudio)}`,
            {
                method: "PATCH"
            }
        );

        // Volvemos a consultar las órdenes para actualizar sus estados.
        await mostrarEstudiosConsulta(
            consultaEstudiosActivaId,
            "La orden fue cancelada correctamente."
        );

    } catch (error) {

        document.getElementById("mensajeEstudiosConsulta").innerHTML = `
            <div class="alert alert-danger">
                ${escaparHTML(error.message)}
            </div>
        `;

        console.error("Error al cancelar orden:", error);
    }
}