import { apiRequest, escaparHTML } from "../api.js";

let mascotas = [];
let estudios = [];
let mascotaSeleccionadaId = null;

// ==========================================
// MOSTRAR PANTALLA
// ==========================================

export function mostrarEstudios() {
    return `
        <div class="page-heading">
            <div>
                <h1>Estudios complementarios</h1>
                <p class="page-subtitle">
                    Consultá los estudios solicitados y sus resultados.
                </p>
            </div>
        </div>

        <div id="mensajeEstudios"></div>

        <!-- SELECCIONAR MASCOTA -->
        <div class="content-card mb-4">
            <div class="content-card-header">

                <label for="filtroMascotaEstudios" class="form-label">
                    Seleccioná una mascota
                </label>

                <select id="filtroMascotaEstudios"
                        class="form-select">

                    <option value="">
                        Cargando mascotas...
                    </option>

                </select>

                <div class="form-text">
                    Se mostrarán todos los estudios vinculados
                    a la mascota seleccionada.
                </div>

            </div>
        </div>

        <!-- RESUMEN DE ESTADOS -->
        <div class="row g-3 mb-4">

            <div class="col-md-4">
                <div class="content-card p-3">
                    <div class="text-secondary small">
                        Pendientes
                    </div>

                    <div class="fs-3 fw-bold text-warning"
                         id="cantidadPendientes">
                        0
                    </div>
                </div>
            </div>

            <div class="col-md-4">
                <div class="content-card p-3">
                    <div class="text-secondary small">
                        Realizados
                    </div>

                    <div class="fs-3 fw-bold text-success"
                         id="cantidadRealizados">
                        0
                    </div>
                </div>
            </div>

            <div class="col-md-4">
                <div class="content-card p-3">
                    <div class="text-secondary small">
                        Cancelados
                    </div>

                    <div class="fs-3 fw-bold text-secondary"
                         id="cantidadCancelados">
                        0
                    </div>
                </div>
            </div>

        </div>

        <!-- FILTROS -->
        <div class="content-card mb-4">

            <div class="content-card-header">

                <div class="row g-3">

                    <div class="col-md-5">
                        <label for="filtroEstadoEstudios"
                               class="form-label">
                            Filtrar por estado
                        </label>

                        <select id="filtroEstadoEstudios"
                                class="form-select">

                            <option value="TODOS">
                                Todos los estudios
                            </option>

                            <option value="PENDIENTE">
                                Pendientes
                            </option>

                            <option value="REALIZADO">
                                Realizados
                            </option>

                            <option value="CANCELADO">
                                Cancelados
                            </option>

                        </select>
                    </div>

                    <div class="col-md-7">
                        <label for="buscarEstudios"
                               class="form-label">
                            Buscar estudio
                        </label>

                        <input type="text"
                               id="buscarEstudios"
                               class="form-control"
                               placeholder="Buscar por tipo, descripción o resultado...">
                    </div>

                </div>

            </div>

        </div>

        <!-- LISTADO -->
        <div class="content-card">

            <div class="content-card-header">

                <h2 class="h5 mb-0">
                    Historial de estudios
                </h2>

            </div>

            <div id="listaEstudiosMascota"
                 class="p-3">

                <div class="text-center text-secondary py-4">
                    Seleccioná una mascota para consultar sus estudios.
                </div>

            </div>

        </div>


        <!-- MODAL PARA CARGAR RESULTADO -->
        <div class="modal fade"
             id="modalResultadoEstudioGeneral"
             tabindex="-1"
             aria-hidden="true">

            <div class="modal-dialog modal-lg modal-dialog-centered">

                <div class="modal-content">

                    <div class="modal-header">

                        <h5 class="modal-title"
                            id="tituloResultadoGeneral">

                            Completar estudio

                        </h5>

                        <button type="button"
                                class="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Cerrar">
                        </button>

                    </div>

                    <form id="formResultadoEstudioGeneral">

                        <div class="modal-body">

                            <div class="alert alert-light"
                                 id="detalleResultadoGeneral">
                            </div>

                            <div class="mb-3">

                                <label for="resultadoInformeGeneral"
                                       class="form-label">
                                    Resultado / informe *
                                </label>

                                <textarea
                                    id="resultadoInformeGeneral"
                                    class="form-control"
                                    rows="5"
                                    required
                                    placeholder="Describí los resultados del estudio...">
                                </textarea>

                            </div>

                            <div class="mb-3">

                                <label for="fechaRealizacionGeneral"
                                       class="form-label">
                                    Fecha de realización *
                                </label>

                                <input
                                    type="date"
                                    id="fechaRealizacionGeneral"
                                    class="form-control"
                                    required>

                            </div>

                            <div class="mb-3">

                                <label for="archivoResultadoGeneral"
                                       class="form-label">
                                    Archivo adjunto (opcional)
                                </label>

                                <input
                                    type="file"
                                    id="archivoResultadoGeneral"
                                    class="form-control">

                            </div>

                            <div id="mensajeResultadoGeneral"></div>

                        </div>

                        <div class="modal-footer">

                            <button type="button"
                                    class="btn btn-light"
                                    data-bs-dismiss="modal">
                                Cancelar
                            </button>

                            <button type="submit"
                                    class="btn btn-success"
                                    id="btnGuardarResultadoGeneral">
                                Guardar resultado
                            </button>

                        </div>

                    </form>

                </div>

            </div>

        </div>


        <!-- MODAL PARA VISUALIZAR ARCHIVOS -->
        <div class="modal fade"
             id="modalVisorEstudios"
             tabindex="-1"
             aria-hidden="true">

            <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">

                <div class="modal-content">

                    <div class="modal-header">

                        <h5 class="modal-title"
                            id="tituloVisorEstudios">
                            Archivo adjunto
                        </h5>

                        <button type="button"
                                class="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Cerrar">
                        </button>

                    </div>

                    <div class="modal-body">

                        <div id="contenidoVisorEstudios"
                             class="text-center bg-body-tertiary rounded p-3"
                             style="min-height: 60vh;">
                        </div>

                    </div>

                    <div class="modal-footer">

                        <a id="btnAbrirEstudioOriginal"
                           class="btn btn-outline-primary"
                           target="_blank"
                           rel="noopener noreferrer">

                            <i class="bi bi-box-arrow-up-right me-1"></i>
                            Abrir original

                        </a>

                        <a id="btnDescargarEstudio"
                           class="btn btn-success"
                           target="_blank"
                           rel="noopener noreferrer">

                            <i class="bi bi-download me-1"></i>
                            Descargar

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


// ==========================================
// INICIALIZAR MÓDULO
// ==========================================

export function inicializarEstudios() {

    document.getElementById("filtroMascotaEstudios")
        .addEventListener("change", cargarEstudiosMascota);

    document.getElementById("filtroEstadoEstudios")
        .addEventListener("change", renderizarEstudios);

    document.getElementById("buscarEstudios")
        .addEventListener("input", renderizarEstudios);

    document.getElementById("listaEstudiosMascota")
        .addEventListener("click", manejarAccionesEstudios);

    document.getElementById("formResultadoEstudioGeneral")
        .addEventListener("submit", guardarResultadoGeneral);

    cargarMascotas();
}


// ==========================================
// CARGAR MASCOTAS
// ==========================================

async function cargarMascotas() {

    const selector =
        document.getElementById("filtroMascotaEstudios");

    try {

        const datos = await apiRequest("/mascotas");

        if (!Array.isArray(datos)) {
            throw new Error("La API devolvió una lista inválida.");
        }

        mascotas = datos;

        selector.innerHTML = `
            <option value="">
                Seleccioná una mascota
            </option>

            ${mascotas.map(mascota => `
                <option value="${escaparHTML(mascota.id)}">
                    ${escaparHTML(mascota.nombre)}
                    — ${escaparHTML(mascota.especie)}
                    — ${escaparHTML(mascota.nombreClienteCompleto || "")}
                </option>
            `).join("")}
        `;

    } catch (error) {

        selector.innerHTML = `
            <option value="">
                No se pudieron cargar las mascotas
            </option>
        `;

        mostrarMensajeEstudios(error.message, "danger");

        console.error(error);
    }
}


// ==========================================
// CARGAR ESTUDIOS DE LA MASCOTA
// ==========================================

async function cargarEstudiosMascota() {

    const selector =
        document.getElementById("filtroMascotaEstudios");

    const id = selector.value;

    const contenedor =
        document.getElementById("listaEstudiosMascota");

    mascotaSeleccionadaId = null;
    estudios = [];

    actualizarResumen();

    if (!id) {

        contenedor.innerHTML = `
            <div class="text-center text-secondary py-4">
                Seleccioná una mascota para consultar sus estudios.
            </div>
        `;

        return;
    }

    mascotaSeleccionadaId = Number(id);

    contenedor.innerHTML = `
        <div class="text-center py-4">
            <div class="spinner-border text-primary" role="status"></div>

            <p class="text-secondary mt-2 mb-0">
                Cargando estudios...
            </p>
        </div>
    `;

    try {

        const datos = await apiRequest(
            `/estudios/${encodeURIComponent(id)}/mascotas`
        );

        if (!Array.isArray(datos)) {
            throw new Error(
                "La API no devolvió una lista de estudios."
            );
        }

        estudios = datos;

        actualizarResumen();

        renderizarEstudios();

    } catch (error) {

        contenedor.innerHTML = `
            <div class="alert alert-danger">
                ${escaparHTML(error.message)}
            </div>
        `;

        console.error("Error al cargar estudios:", error);
    }
}


// ==========================================
// ACTUALIZAR CANTIDADES
// ==========================================

function actualizarResumen() {

    document.getElementById("cantidadPendientes").textContent =
        estudios.filter(e =>
            String(e.estadoEstudio).toUpperCase() === "PENDIENTE"
        ).length;

    document.getElementById("cantidadRealizados").textContent =
        estudios.filter(e =>
            String(e.estadoEstudio).toUpperCase() === "REALIZADO"
        ).length;

    document.getElementById("cantidadCancelados").textContent =
        estudios.filter(e =>
            String(e.estadoEstudio).toUpperCase() === "CANCELADO"
        ).length;
}


// ==========================================
// RENDERIZAR ESTUDIOS
// ==========================================

function renderizarEstudios() {

    const contenedor =
        document.getElementById("listaEstudiosMascota");

    if (!mascotaSeleccionadaId) {
        return;
    }

    const filtroEstado =
        document.getElementById("filtroEstadoEstudios").value;

    const busqueda =
        document.getElementById("buscarEstudios")
            .value.trim().toLowerCase();

    const filtrados = estudios.filter(estudio => {

        const estado = String(
            estudio.estadoEstudio || ""
        ).toUpperCase();

        const coincideEstado =
            filtroEstado === "TODOS" || estado === filtroEstado;

        const texto = [
            estudio.tipoEstudio,
            estudio.descripcion,
            estudio.resultadoInforme,
            estudio.consultaId
        ].join(" ").toLowerCase();

        const coincideBusqueda = texto.includes(busqueda);

        return coincideEstado && coincideBusqueda;
    });

    if (filtrados.length === 0) {

        contenedor.innerHTML = `
            <div class="text-center text-secondary py-5">

                <i class="bi bi-clipboard2-x fs-1 d-block mb-2"></i>

                <h5>No se encontraron estudios</h5>

                <p class="mb-0">
                    No hay estudios que coincidan con los filtros seleccionados.
                </p>

            </div>
        `;

        return;
    }

    // Ordenar desde el más reciente.
    filtrados.sort((a, b) =>
        String(b.fechaSolicitud || "")
            .localeCompare(String(a.fechaSolicitud || ""))
    );

    contenedor.innerHTML = filtrados.map(estudio => {

        const estado = String(
            estudio.estadoEstudio || "PENDIENTE"
        ).toUpperCase();

        const clase = estado === "REALIZADO"
            ? "success"
            : estado === "CANCELADO"
                ? "secondary"
                : "warning";

        const fechaSolicitud =
            formatearFechaEstudio(estudio.fechaSolicitud);

        const fechaRealizacion =
            formatearFechaEstudio(estudio.fechaRealizacion);

        const nombreArchivo =
            estudio.nombreArchivo ||
            obtenerNombreArchivo(estudio.urlArchivo);

        let acciones = "";

        // ESTUDIO PENDIENTE
       if (estado === "PENDIENTE") {

    acciones = `
        <div class="d-flex flex-wrap gap-2">

            <button type="button"
                    class="btn btn-sm btn-success"
                    data-accion="completar"
                    data-id="${escaparHTML(estudio.id)}"
                    data-tipo="${escaparHTML(estudio.tipoEstudio || "")}">

                <i class="bi bi-file-earmark-check me-1"></i>
                Completar estudio

            </button>

            <button type="button"
                    class="btn btn-sm btn-outline-danger"
                    data-accion="cancelar-estudio"
                    data-id="${escaparHTML(estudio.id)}">

                <i class="bi bi-x-circle me-1"></i>
                Cancelar orden

            </button>

        </div>
    `;
}

        // ESTUDIO REALIZADO
        else if (estado === "REALIZADO") {

            acciones = `
                <div class="mt-3">

                    <div class="fw-semibold small mb-1">
                        Resultado / informe
                    </div>

                    <p class="text-break">
                        ${escaparHTML(estudio.resultadoInforme || "Sin informe.")}
                    </p>

                    <div class="small text-secondary mb-3">
                        Fecha de realización: ${fechaRealizacion}
                    </div>

                    ${
                        estudio.urlArchivo
                            ? `
                                <div class="border rounded p-3">

                                    <div class="d-flex align-items-center gap-2 mb-3">

                                        <i class="bi bi-file-earmark fs-3"></i>

                                        <div class="flex-grow-1 overflow-hidden">

                                            <div class="fw-medium text-break">
                                                ${escaparHTML(nombreArchivo)}
                                            </div>

                                            <div class="small text-secondary">
                                                ${escaparHTML(estudio.tipoContenido || "Archivo adjunto")}
                                            </div>

                                        </div>

                                    </div>

                                    <button type="button"
                                            class="btn btn-sm btn-outline-primary"
                                            data-accion="ver-archivo"
                                            data-url="${escaparHTML(estudio.urlArchivo)}"
                                            data-nombre="${escaparHTML(nombreArchivo)}"
                                            data-tipo="${escaparHTML(estudio.tipoContenido || "")}">

                                        <i class="bi bi-eye me-1"></i>
                                        Ver / abrir archivo

                                    </button>

                                    <a href="${escaparHTML(construirUrlDescarga(estudio.urlArchivo))}"
                                       target="_blank"
                                       rel="noopener noreferrer"
                                       class="btn btn-sm btn-outline-success">

                                        <i class="bi bi-download me-1"></i>
                                        Descargar

                                    </a>

                                </div>
                              `
                            : `
                                <div class="small text-secondary">
                                    Este estudio no tiene archivo adjunto.
                                </div>
                              `
                    }

                </div>
            `;
        }

        return `
            <article class="border rounded-3 p-3 mb-3">

                <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">

                    <div>

                        <h5 class="h6 mb-1">
                            ${escaparHTML(estudio.tipoEstudio || "Estudio complementario")}
                        </h5>

                        <div class="small text-secondary">
                            Solicitado: ${fechaSolicitud}
                        </div>

                        <div class="small text-secondary">
                            Consulta médica #${escaparHTML(estudio.consultaId)}
                        </div>

                    </div>

                    <span class="badge text-bg-${clase}">
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

                <div class="mt-3">
                    ${acciones}
                </div>

            </article>
        `;

    }).join("");
}


// ==========================================
// MANEJAR BOTONES DEL LISTADO
// ==========================================

function manejarAccionesEstudios(evento) {

    const origen = evento.target;

    if (!(origen instanceof Element)) {
        return;
    }

    const botonCompletar = origen.closest(
        '[data-accion="completar"]'
    );

    if (botonCompletar) {

        abrirFormularioResultado(
            Number(botonCompletar.dataset.id),
            botonCompletar.dataset.tipo
        );

        return;
    }
    // CANCELAR ORDEN
const botonCancelar = origen.closest(
    '[data-accion="cancelar-estudio"]'
);

if (botonCancelar) {

    cancelarOrdenEstudio(
        Number(botonCancelar.dataset.id)
    );

    return;
}

    const botonArchivo = origen.closest(
        '[data-accion="ver-archivo"]'
    );

    if (botonArchivo) {

        abrirVisorArchivo(
            botonArchivo.dataset.url,
            botonArchivo.dataset.nombre,
            botonArchivo.dataset.tipo
        );
    }
}


// ==========================================
// COMPLETAR ESTUDIO
// ==========================================

let estudioSeleccionadoId = null;

function abrirFormularioResultado(id, tipo) {

    estudioSeleccionadoId = id;

    document.getElementById("formResultadoEstudioGeneral").reset();

    document.getElementById("mensajeResultadoGeneral")
        .replaceChildren();

    document.getElementById("tituloResultadoGeneral").textContent =
        `Completar estudio: ${tipo}`;

    document.getElementById("detalleResultadoGeneral").textContent =
        `Estudio #${id}. Ingresá el informe correspondiente.`;

    bootstrap.Modal
        .getOrCreateInstance(
            document.getElementById("modalResultadoEstudioGeneral")
        )
        .show();
}


async function guardarResultadoGeneral(evento) {

    evento.preventDefault();

    const boton =
        document.getElementById("btnGuardarResultadoGeneral");

    const resultado =
        document.getElementById("resultadoInformeGeneral")
            .value.trim();

    const fecha =
        document.getElementById("fechaRealizacionGeneral").value;

    const archivo =
        document.getElementById("archivoResultadoGeneral").files[0];

    if (!estudioSeleccionadoId) {
        mostrarErrorResultado(
            "No se seleccionó un estudio."
        );
        return;
    }

    if (!resultado || !fecha) {
        mostrarErrorResultado(
            "Completá el resultado y la fecha de realización.",
            "warning"
        );
        return;
    }

    const formData = new FormData();

    formData.append("resultadoInforme", resultado);
    formData.append("fechaRealizacion", fecha);

    if (archivo) {
        formData.append("archivo", archivo);
    }

    boton.disabled = true;

    try {

        await apiRequest(
            `/estudios/${encodeURIComponent(estudioSeleccionadoId)}/resultado`,
            {
                method: "PATCH",
                body: formData
            }
        );

        bootstrap.Modal
            .getOrCreateInstance(
                document.getElementById("modalResultadoEstudioGeneral")
            )
            .hide();

        mostrarMensajeEstudios(
            "El resultado del estudio se guardó correctamente."
        );

        await cargarEstudiosMascota();

    } catch (error) {

        mostrarErrorResultado(
            error.message || "No se pudo guardar el resultado."
        );

        console.error(error);

    } finally {

        boton.disabled = false;
    }
}


// ==========================================
// VISUALIZAR ARCHIVOS
// ==========================================

function obtenerNombreArchivo(url) {

    if (!url) return "Archivo adjunto";

    try {

        const direccion = new URL(url);

        const partes = direccion.pathname.split("/");
        const nombre = partes.pop();

        return decodeURIComponent(nombre || "Archivo adjunto");

    } catch {

        return "Archivo adjunto";
    }
}


function obtenerExtension(nombre) {

    if (!nombre || !nombre.includes(".")) {
        return "";
    }

    return nombre.split(".").pop().toLowerCase();
}


function construirUrlDescarga(url) {

    if (
        typeof url === "string" &&
        /^https:\/\/res\.cloudinary\.com\//i.test(url) &&
        url.includes("/upload/")
    ) {

        return url.replace(
            "/upload/",
            "/upload/fl_attachment/"
        );
    }

    return url;
}


function abrirVisorArchivo(url, nombre, tipoContenido = "") {

    if (
        typeof url !== "string" ||
        !/^https?:\/\//i.test(url)
    ) {

        mostrarMensajeEstudios(
            "La URL del archivo no es válida.",
            "warning"
        );

        return;
    }

    const extension = obtenerExtension(nombre);

    const tipo = tipoContenido.toLowerCase();

    const contenedor =
        document.getElementById("contenidoVisorEstudios");

    contenedor.replaceChildren();

    document.getElementById("tituloVisorEstudios").textContent =
        nombre;

    document.getElementById("btnAbrirEstudioOriginal").href = url;

    document.getElementById("btnDescargarEstudio").href =
        construirUrlDescarga(url);

    // PDF
    if (tipo === "application/pdf" || extension === "pdf") {

        const iframe = document.createElement("iframe");

        iframe.src = url;
        iframe.title = nombre;

        iframe.style.width = "100%";
        iframe.style.height = "70vh";
        iframe.style.border = "0";

        contenedor.appendChild(iframe);
    }

    // IMÁGENES
    else if (
        tipo.startsWith("image/") ||
        ["jpg", "jpeg", "png", "gif", "webp", "bmp", "avif", "svg"]
            .includes(extension)
    ) {

        const imagen = document.createElement("img");

        imagen.src = url;
        imagen.alt = nombre;

        imagen.style.maxWidth = "100%";
        imagen.style.maxHeight = "70vh";
        imagen.style.objectFit = "contain";

        contenedor.appendChild(imagen);
    }

    // VIDEOS
    else if (
        tipo.startsWith("video/") ||
        ["mp4", "webm", "ogv", "m4v"].includes(extension)
    ) {

        const video = document.createElement("video");

        video.src = url;
        video.controls = true;
        video.preload = "metadata";

        video.style.maxWidth = "100%";
        video.style.maxHeight = "70vh";

        contenedor.appendChild(video);
    }

    // AUDIO
    else if (
        tipo.startsWith("audio/") ||
        ["mp3", "wav", "ogg", "m4a", "aac", "opus"].includes(extension)
    ) {

        const audio = document.createElement("audio");

        audio.src = url;
        audio.controls = true;

        audio.style.width = "100%";

        contenedor.appendChild(audio);
    }

    // OTROS FORMATOS
    else {

        const mensaje = document.createElement("div");

        mensaje.className = "py-5";

        mensaje.innerHTML = `
            <i class="bi bi-file-earmark fs-1 text-secondary"></i>

            <h5 class="mt-3">
                Archivo disponible
            </h5>

            <p class="text-secondary">
                Este formato no tiene una vista previa compatible
                con el navegador.
            </p>

            <p class="small text-secondary">
                Podés abrirlo en otra pestaña o descargarlo
                para utilizar el programa correspondiente.
            </p>
        `;

        contenedor.appendChild(mensaje);
    }

    bootstrap.Modal
        .getOrCreateInstance(
            document.getElementById("modalVisorEstudios")
        )
        .show();
}


// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

function formatearFechaEstudio(fecha) {

    if (!fecha) {
        return "—";
    }

    const partes = String(fecha).split("-");

    if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }

    return escaparHTML(fecha);
}


function mostrarMensajeEstudios(mensaje, tipo = "success") {

    const contenedor =
        document.getElementById("mensajeEstudios");

    contenedor.innerHTML = `
        <div class="alert alert-${tipo} alert-dismissible fade show"
             role="alert">

            ${escaparHTML(mensaje)}

            <button type="button"
                    class="btn-close"
                    data-bs-dismiss="alert">
            </button>

        </div>
    `;
}


function mostrarErrorResultado(mensaje, tipo = "danger") {

    document.getElementById("mensajeResultadoGeneral").innerHTML = `
        <div class="alert alert-${tipo}" role="alert">
            ${escaparHTML(mensaje)}
        </div>
    `;
}

// ==========================================
// CANCELAR ORDEN DE ESTUDIO
// ==========================================

async function cancelarOrdenEstudio(idEstudio) {

    if (!idEstudio || !Number.isFinite(idEstudio)) {
        mostrarMensajeEstudios(
            "No se encontró una orden válida.",
            "warning"
        );
        return;
    }

    const confirmar = confirm(
        "¿Estás seguro de que deseas cancelar esta orden de estudio?\n\n" +
        "Esta acción cambiará su estado a CANCELADO."
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

        mostrarMensajeEstudios(
            "La orden de estudio fue cancelada correctamente."
        );

        // Actualizamos el historial de la mascota.
        await cargarEstudiosMascota();

    } catch (error) {

        mostrarMensajeEstudios(
            error.message || "No se pudo cancelar la orden.",
            "danger"
        );

        console.error("Error al cancelar estudio:", error);
    }
}