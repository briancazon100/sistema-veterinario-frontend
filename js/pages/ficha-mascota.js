import { apiRequest, escaparHTML } from "../api.js";

let veterinariosDisponibles = [];
let vacunasActuales = [];
let desparasitacionesActuales = [];
let mascotaActual = null;
let seccionActual = "vacunas";
let onMascotaActualizadaCallback = null;

const FORMATOS_IMAGEN_PERMITIDOS = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/avif"
];

function fechaActualLocal() {
    const ahora = new Date();
    ahora.setMinutes(
        ahora.getMinutes() - ahora.getTimezoneOffset()
    );
    return ahora.toISOString().slice(0, 10);
}

function construirUrlFotoValida(fotoUrl) {
    if (typeof fotoUrl !== "string" || !fotoUrl.trim()) {
        return null;
    }

    const url = fotoUrl.trim();
    if (/^https?:\/\//i.test(url) || url.startsWith("/")) {
        return url;
    }

    return null;
}

function calcularEdadTexto(fechaNacimiento) {
    if (!fechaNacimiento) return null;

    const partes = String(fechaNacimiento).split("-");
    if (partes.length !== 3) return null;

    const nacimiento = new Date(
        Number(partes[0]),
        Number(partes[1]) - 1,
        Number(partes[2])
    );

    if (Number.isNaN(nacimiento.getTime())) return null;

    const hoy = new Date();
    let anios = hoy.getFullYear() - nacimiento.getFullYear();
    let meses = hoy.getMonth() - nacimiento.getMonth();

    if (hoy.getDate() < nacimiento.getDate()) {
        meses--;
    }

    if (meses < 0) {
        anios--;
        meses += 12;
    }

    if (anios < 0) return null;
    if (anios === 0 && meses === 0) return "Recién nacido";
    if (anios === 0) return `${meses} ${meses === 1 ? "mes" : "meses"}`;
    if (meses === 0) return `${anios} ${anios === 1 ? "año" : "años"}`;

    return `${anios} ${anios === 1 ? "año" : "años"}, ${meses} ${meses === 1 ? "mes" : "meses"}`;
}

function renderizarAvatarMascota(mascota) {
    const urlFoto = construirUrlFotoValida(mascota?.fotoUrl);
    const nombreSeguro = escaparHTML(mascota?.nombre || "Mascota");

    if (urlFoto) {
        return `
            <button type="button"
                    class="mascota-avatar-wrapper mascota-avatar-clickable p-0"
                    id="btnVerFotoMascota"
                    title="Ampliar foto de ${nombreSeguro}">
                <img
                    src="${escaparHTML(urlFoto)}"
                    alt="Foto de ${nombreSeguro}"
                    class="mascota-avatar-img"
                    id="imgFotoMascota"
                >
                <span class="mascota-avatar-zoom" aria-hidden="true">
                    <i class="bi bi-arrows-fullscreen"></i>
                </span>
            </button>
        `;
    }

    return `
        <div class="mascota-avatar-wrapper mascota-avatar-placeholder"
             id="imgFotoMascota"
             aria-label="Sin foto de ${nombreSeguro}">
            <div class="mascota-avatar-placeholder-icon">
                <i class="bi bi-heart-pulse"></i>
            </div>
            <span>Sin foto</span>
        </div>
    `;
}
function formatearSexoFicha(sexo) {
    if (!sexo) return "No informado";
    const normalizado = String(sexo).toUpperCase();
    if (normalizado === "MACHO") return "Macho";
    if (normalizado === "HEMBRA") return "Hembra";
    return sexo;
}

function renderizarCabeceraMascota(mascota) {
    const urlFoto = construirUrlFotoValida(mascota.fotoUrl);
    const nombre = escaparHTML(mascota.nombre);
    const especie = escaparHTML(mascota.especie || "Sin especie");
    const raza = escaparHTML(mascota.raza || "Sin raza");
    const propietario = escaparHTML(
        mascota.nombreClienteCompleto || "No informado"
    );
    const edadTexto = calcularEdadTexto(mascota.fechaNacimiento);
    const tieneAlergias = Boolean(mascota.alergiasConocidas?.trim());
    const tieneCondiciones = Boolean(mascota.condicionesCronicas?.trim());

    return `
        <div class="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-4">
            ${renderizarAvatarMascota(mascota)}

            <div class="flex-grow-1 min-w-0">
                <div class="d-flex flex-wrap align-items-center gap-2 mb-1">
                    <h1 class="mb-0">${nombre}</h1>
                    <span class="badge ${mascota.estado !== false ? "text-bg-success" : "text-bg-secondary"}">
                        ${mascota.estado !== false ? "Activo" : "Inactivo"}
                    </span>
                </div>

                <div class="d-flex flex-wrap align-items-center gap-2 text-secondary small mb-3">
                    <span class="badge bg-primary-subtle text-primary-emphasis border border-primary-subtle">
                        ${especie}
                    </span>
                    <span class="badge bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle">
                        ${raza}
                    </span>
                    <span class="badge bg-info-subtle text-info-emphasis border border-info-subtle">
                        ${escaparHTML(formatearSexoFicha(mascota.sexo))}
                    </span>
                    <span class="badge ${mascota.esterilizado ? "bg-success-subtle text-success-emphasis border border-success-subtle" : "bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle"}">
                        ${mascota.esterilizado ? "Esterilizado" : "No esterilizado"}
                    </span>
                    ${
                        edadTexto
                            ? `<span><i class="bi bi-cake2 me-1"></i>${escaparHTML(edadTexto)}</span>`
                            : ""
                    }
                    <span>
                        <i class="bi bi-person me-1"></i>
                        Propietario: <strong class="text-dark">${propietario}</strong>
                    </span>
                </div>

                <div class="d-flex flex-wrap align-items-center gap-2">
                    <button type="button"
                            class="btn btn-sm btn-outline-teal"
                            id="btnSeleccionarFotoMascota">
                        <i class="bi bi-camera-fill me-1"></i>
                        ${urlFoto ? "Cambiar foto" : "Subir foto"}
                    </button>

                    <span class="small text-secondary" id="nombreArchivoFotoSeleccionado">
                        JPG, PNG, WEBP o GIF
                    </span>
                </div>

                <input type="file"
                       id="inputFotoMascota"
                       accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                       class="d-none">

                <div class="row g-2 mt-3">
                    <div class="col-12 col-sm-6">
                        <div class="p-3 rounded-3 border ${tieneAlergias ? "border-warning-subtle bg-warning-subtle" : "bg-body-tertiary"}">
                            <div class="small fw-semibold ${tieneAlergias ? "text-warning-emphasis" : "text-secondary"} mb-1">
                                <i class="bi bi-exclamation-triangle-fill me-1"></i>
                                Alergias conocidas
                            </div>
                            <div class="small text-break">
                                ${escaparHTML(mascota.alergiasConocidas?.trim() || "Ninguna alergia registrada")}
                            </div>
                        </div>
                    </div>

                    <div class="col-12 col-sm-6">
                        <div class="p-3 rounded-3 border ${tieneCondiciones ? "border-info-subtle bg-info-subtle" : "bg-body-tertiary"}">
                            <div class="small fw-semibold ${tieneCondiciones ? "text-info-emphasis" : "text-secondary"} mb-1">
                                <i class="bi bi-heart-pulse me-1"></i>
                                Condiciones crónicas / enfermedades
                            </div>
                            <div class="small text-break">
                                ${escaparHTML(mascota.condicionesCronicas?.trim() || "Sin condiciones crónicas registradas")}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}
export function mostrarFichaMascota(mascota) {
    return `
        <div class="page-heading">
            <div class="w-100">
                <button id="btnVolverMascotas"
                        type="button"
                        class="btn btn-sm btn-outline-secondary mb-3">
                    <i class="bi bi-arrow-left me-1"></i>
                    Volver a mascotas
                </button>

                <div class="content-card p-4" id="cabeceraFichaMascota">
                    ${renderizarCabeceraMascota(mascota)}
                </div>
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

        <!-- MODAL: AMPLIAR FOTO DE MASCOTA -->
        <div class="modal fade"
             id="modalFotoMascotaAmpliada"
             tabindex="-1"
             aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="tituloModalFotoMascota">
                            Foto de la mascota
                        </h5>
                        <button type="button"
                                class="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Cerrar"></button>
                    </div>
                    <div class="modal-body text-center bg-body-tertiary p-3">
                        <img id="imgModalFotoMascota"
                             src=""
                             alt="Foto ampliada"
                             class="img-fluid rounded"
                             style="max-height: 70vh; object-fit: contain;">
                    </div>
                </div>
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

        <!-- MODAL: EDITAR VACUNA (SOLO NOMBRE Y FECHAS) -->
        <div class="modal fade"
             id="modalEditarVacuna"
             tabindex="-1"
             aria-hidden="true">

            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">

                    <div class="modal-header">
                        <h5 class="modal-title">Editar vacuna</h5>

                        <button type="button"
                                class="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Cerrar"></button>
                    </div>

                    <form id="formEditarVacuna">
                        <div class="modal-body">

                            <input type="hidden" id="editarVacunaId">

                            <div class="mb-3">
                                <label for="editarNombreVacuna"
                                       class="form-label">
                                    Nombre de la vacuna *
                                </label>

                                <input type="text"
                                       id="editarNombreVacuna"
                                       class="form-control"
                                       required>
                            </div>

                            <div class="mb-3">
                                <label for="editarFechaAplicacionVacuna"
                                       class="form-label">
                                    Fecha de aplicación *
                                </label>

                                <input type="date"
                                       id="editarFechaAplicacionVacuna"
                                       class="form-control"
                                       required>
                            </div>

                            <div class="mb-3">
                                <label for="editarProximaDosisVacuna"
                                       class="form-label">
                                    Próxima dosis *
                                </label>

                                <input type="date"
                                       id="editarProximaDosisVacuna"
                                       class="form-control"
                                       required>
                            </div>

                            <div class="form-text">
                                Solo podés corregir el nombre y las fechas de este registro.
                            </div>

                            <div id="mensajeEditarVacuna" class="mt-3"></div>

                        </div>

                        <div class="modal-footer">
                            <button type="button"
                                    class="btn btn-light"
                                    data-bs-dismiss="modal">
                                Cancelar
                            </button>

                            <button type="submit"
                                    id="btnGuardarEdicionVacuna"
                                    class="btn btn-primary">
                                Guardar cambios
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

                            <div class="mb-3">
                                <label for="veterinarioDesparasitacion"
                                       class="form-label">
                                    Veterinario *
                                </label>

                                <select id="veterinarioDesparasitacion"
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
                                    id="btnGuardarDesparasitacion"
                                    class="btn btn-success">
                                Guardar desparasitación
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- MODAL: EDITAR DESPARASITACIÓN (SOLO PRODUCTO Y FECHAS) -->
        <div class="modal fade"
             id="modalEditarDesparasitacion"
             tabindex="-1"
             aria-hidden="true">

            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">

                    <div class="modal-header">
                        <h5 class="modal-title">Editar desparasitación</h5>

                        <button type="button"
                                class="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Cerrar"></button>
                    </div>

                    <form id="formEditarDesparasitacion">
                        <div class="modal-body">

                            <input type="hidden" id="editarDesparasitacionId">

                            <div class="mb-3">
                                <label for="editarProductoUsado"
                                       class="form-label">
                                    Producto utilizado *
                                </label>

                                <input type="text"
                                       id="editarProductoUsado"
                                       class="form-control"
                                       required>
                            </div>

                            <div class="mb-3">
                                <label for="editarFechaAplicacionDesparasitacion"
                                       class="form-label">
                                    Fecha de aplicación *
                                </label>

                                <input type="date"
                                       id="editarFechaAplicacionDesparasitacion"
                                       class="form-control"
                                       required>
                            </div>

                            <div class="mb-3">
                                <label for="editarProximaDosisDesparasitacion"
                                       class="form-label">
                                    Próxima dosis *
                                </label>

                                <input type="date"
                                       id="editarProximaDosisDesparasitacion"
                                       class="form-control"
                                       required>
                            </div>

                            <div class="form-text">
                                Solo podés corregir el producto utilizado y las fechas de este registro.
                            </div>

                            <div id="mensajeEditarDesparasitacion" class="mt-3"></div>

                        </div>

                        <div class="modal-footer">
                            <button type="button"
                                    class="btn btn-light"
                                    data-bs-dismiss="modal">
                                Cancelar
                            </button>

                            <button type="submit"
                                    id="btnGuardarEdicionDesparasitacion"
                                    class="btn btn-primary">
                                Guardar cambios
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
}

// ==========================================
// SUBIR Y VISUALIZAR FOTO DE MASCOTA
// ==========================================

function configurarControlesFoto() {
    const btnSeleccionar = document.getElementById("btnSeleccionarFotoMascota");
    const inputArchivo = document.getElementById("inputFotoMascota");
    const etiquetaArchivo = document.getElementById("nombreArchivoFotoSeleccionado");
    const btnVerFoto = document.getElementById("btnVerFotoMascota");
    const imgFoto = document.getElementById("imgFotoMascota");

    if (imgFoto && imgFoto.tagName === "IMG") {
        imgFoto.addEventListener("error", () => {
            const cabecera = document.getElementById("cabeceraFichaMascota");
            if (cabecera) {
                cabecera.innerHTML = renderizarCabeceraMascota({
                    ...mascotaActual,
                    fotoUrl: null
                });
                configurarControlesFoto();
            }
        }, { once: true });
    }

    if (btnVerFoto) {
        btnVerFoto.addEventListener("click", () => {
            const url = construirUrlFotoValida(mascotaActual?.fotoUrl);
            if (!url) return;

            document.getElementById("tituloModalFotoMascota").textContent =
                `Foto de ${mascotaActual.nombre || "la mascota"}`;

            const imgModal = document.getElementById("imgModalFotoMascota");
            imgModal.src = url;
            imgModal.alt = `Foto de ${mascotaActual.nombre || "la mascota"}`;

            bootstrap.Modal
                .getOrCreateInstance(
                    document.getElementById("modalFotoMascotaAmpliada")
                )
                .show();
        });
    }

    if (!btnSeleccionar || !inputArchivo) return;

    btnSeleccionar.addEventListener("click", () => {
        inputArchivo.click();
    });

    inputArchivo.addEventListener("change", async () => {
        const archivo = inputArchivo.files?.[0];
        if (!archivo) return;

        if (!FORMATOS_IMAGEN_PERMITIDOS.includes(archivo.type)) {
            mostrarMensajeFicha(
                "Seleccioná una imagen válida (JPG, PNG, WEBP, GIF o AVIF).",
                "warning"
            );
            inputArchivo.value = "";
            return;
        }

        if (etiquetaArchivo) {
            etiquetaArchivo.textContent = archivo.name;
        }

        btnSeleccionar.disabled = true;
        const textoOriginalBtn = btnSeleccionar.innerHTML;
        btnSeleccionar.innerHTML = `
            <span class="spinner-border spinner-border-sm me-1"></span>
            Subiendo foto...
        `;

        try {
            const formData = new FormData();
            formData.append("archivo", archivo);

            const mascotaActualizada = await apiRequest(
                `/mascotas/${encodeURIComponent(mascotaActual.id)}/foto`,
                {
                    method: "POST",
                    body: formData
                }
            );

            if (mascotaActualizada && typeof mascotaActualizada === "object") {
                mascotaActual = {
                    ...mascotaActual,
                    ...mascotaActualizada
                };
            }

            const cabecera = document.getElementById("cabeceraFichaMascota");
            if (cabecera) {
                cabecera.innerHTML = renderizarCabeceraMascota(mascotaActual);
                configurarControlesFoto();
            }

            if (typeof onMascotaActualizadaCallback === "function") {
                onMascotaActualizadaCallback(mascotaActual);
            }

            mostrarMensajeFicha("Foto de la mascota actualizada correctamente.");
        } catch (error) {
            console.error("Error al subir foto de la mascota:", error);
            mostrarMensajeFicha(
                error.message || "No se pudo subir la foto de la mascota.",
                "danger"
            );
            btnSeleccionar.disabled = false;
            btnSeleccionar.innerHTML = textoOriginalBtn;
        } finally {
            inputArchivo.value = "";
        }
    });
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

function mostrarErrorEditarVacuna(mensaje, tipo = "danger") {
    const contenedor = document.getElementById("mensajeEditarVacuna");
    if (!contenedor) return;

    contenedor.innerHTML = `
        <div class="alert alert-${tipo} mb-0" role="alert">
            ${escaparHTML(mensaje)}
        </div>
    `;
}

function mostrarErrorEditarDesparasitacion(mensaje, tipo = "danger") {
    const contenedor = document.getElementById("mensajeEditarDesparasitacion");
    if (!contenedor) return;

    contenedor.innerHTML = `
        <div class="alert alert-${tipo} mb-0" role="alert">
            ${escaparHTML(mensaje)}
        </div>
    `;
}

// CARGAR VETERINARIOS PARA VACUNAS Y DESPARASITACIONES

async function cargarVeterinarios() {
    const selectores = [
        document.getElementById("veterinarioVacuna"),
        document.getElementById("veterinarioDesparasitacion")
    ].filter(Boolean);

    try {
        const datos = await apiRequest("/veterinarios");

        if (!Array.isArray(datos)) {
            throw new Error("La API no devolvió una lista de veterinarios.");
        }

        veterinariosDisponibles = datos.filter(
            veterinario => veterinario.estado !== false
        );

        const opcionesHtml = `
            <option value="">Seleccioná un veterinario</option>

            ${veterinariosDisponibles.map(veterinario => `
                <option value="${escaparHTML(veterinario.id)}">
                    ${escaparHTML(veterinario.nombre)}
                    ${escaparHTML(veterinario.apellido)}
                    — ${escaparHTML(veterinario.matricula)}
                </option>
            `).join("")}
        `;

        selectores.forEach(selector => {
            selector.innerHTML = veterinariosDisponibles.length === 0
                ? `<option value="">No hay veterinarios activos</option>`
                : opcionesHtml;
        });

    } catch (error) {
        selectores.forEach(selector => {
            selector.innerHTML = `
                <option value="">No se pudieron cargar los veterinarios</option>
            `;
        });

        console.error("Error al cargar veterinarios:", error);

        mostrarMensajeFicha(
            `No se pudieron cargar los veterinarios: ${error.message}`,
            "danger"
        );
    }
}

// ABRIR MODAL DE EDICIÓN DE VACUNA

function abrirModalEditarVacuna(vacunaId) {
    const vacuna = vacunasActuales.find(
        item => String(item.id) === String(vacunaId)
    );

    if (!vacuna) {
        mostrarMensajeFicha(
            "No se encontró el registro de vacuna seleccionado.",
            "warning"
        );
        return;
    }

    document.getElementById("formEditarVacuna").reset();
    document.getElementById("mensajeEditarVacuna").replaceChildren();

    document.getElementById("editarVacunaId").value = vacuna.id;
    document.getElementById("editarNombreVacuna").value =
        vacuna.nombreVacuna ?? "";
    document.getElementById("editarFechaAplicacionVacuna").value =
        vacuna.fechaAplicacion ?? "";
    document.getElementById("editarFechaAplicacionVacuna").max =
        fechaActualLocal();
    document.getElementById("editarProximaDosisVacuna").value =
        vacuna.fechaProximaDosis ?? "";

    bootstrap.Modal
        .getOrCreateInstance(document.getElementById("modalEditarVacuna"))
        .show();
}

// GUARDAR EDICIÓN DE VACUNA (PATCH /vacunas/{id}/edit)

async function guardarEdicionVacuna(evento) {
    evento.preventDefault();

    document.getElementById("mensajeEditarVacuna").replaceChildren();

    const vacunaId = document.getElementById("editarVacunaId").value;
    const nombreVacuna = document
        .getElementById("editarNombreVacuna")
        .value.trim();
    const fechaAplicacion = document
        .getElementById("editarFechaAplicacionVacuna")
        .value;
    const fechaProximaDosis = document
        .getElementById("editarProximaDosisVacuna")
        .value;

    if (!vacunaId) {
        mostrarErrorEditarVacuna(
            "No se identificó la vacuna a editar.",
            "warning"
        );
        return;
    }

    if (!nombreVacuna || !fechaAplicacion || !fechaProximaDosis) {
        mostrarErrorEditarVacuna(
            "Completá el nombre de la vacuna, la fecha de aplicación y la próxima dosis.",
            "warning"
        );
        return;
    }

    if (fechaAplicacion > fechaActualLocal()) {
        mostrarErrorEditarVacuna(
            "La fecha de aplicación no debe ser posterior a hoy.",
            "warning"
        );
        return;
    }

    if (fechaProximaDosis < fechaAplicacion) {
        mostrarErrorEditarVacuna(
            "La fecha de la próxima dosis no debe ser anterior a la fecha de aplicación.",
            "warning"
        );
        return;
    }

    const boton = document.getElementById("btnGuardarEdicionVacuna");
    boton.disabled = true;

    try {
        await apiRequest(
            `/vacunas/${encodeURIComponent(vacunaId)}/edit`,
            {
                method: "PATCH",
                body: JSON.stringify({
                    nombreVacuna,
                    fechaAplicacion,
                    fechaProximaDosis
                })
            }
        );

        bootstrap.Modal
            .getOrCreateInstance(document.getElementById("modalEditarVacuna"))
            .hide();

        mostrarMensajeFicha("Vacuna actualizada correctamente.");

        await cargarHistorial("vacunas");
    } catch (error) {
        console.error("Error al editar vacuna:", error);
        mostrarErrorEditarVacuna(
            error.message || "No se pudo actualizar la vacuna."
        );
    } finally {
        boton.disabled = false;
    }
}

// ABRIR MODAL DE EDICIÓN DE DESPARASITACIÓN

function abrirModalEditarDesparasitacion(desparasitacionId) {
    const registro = desparasitacionesActuales.find(
        item => String(item.id) === String(desparasitacionId)
    );

    if (!registro) {
        mostrarMensajeFicha(
            "No se encontró el registro de desparasitación seleccionado.",
            "warning"
        );
        return;
    }

    document.getElementById("formEditarDesparasitacion").reset();
    document.getElementById("mensajeEditarDesparasitacion").replaceChildren();

    document.getElementById("editarDesparasitacionId").value = registro.id;
    document.getElementById("editarProductoUsado").value =
        registro.productoUsado ?? "";
    document.getElementById("editarFechaAplicacionDesparasitacion").value =
        registro.fechaAplicacion ?? "";
    document.getElementById("editarFechaAplicacionDesparasitacion").max =
        fechaActualLocal();
    document.getElementById("editarProximaDosisDesparasitacion").value =
        registro.fechaProximaDosis ?? "";

    bootstrap.Modal
        .getOrCreateInstance(
            document.getElementById("modalEditarDesparasitacion")
        )
        .show();
}

// GUARDAR EDICIÓN DE DESPARASITACIÓN (PATCH /desparasitaciones/{id}/edit)

async function guardarEdicionDesparasitacion(evento) {
    evento.preventDefault();

    document.getElementById("mensajeEditarDesparasitacion").replaceChildren();

    const desparasitacionId = document.getElementById(
        "editarDesparasitacionId"
    ).value;
    const productoUsado = document
        .getElementById("editarProductoUsado")
        .value.trim();
    const fechaAplicacion = document
        .getElementById("editarFechaAplicacionDesparasitacion")
        .value;
    const fechaProximaDosis = document
        .getElementById("editarProximaDosisDesparasitacion")
        .value;

    if (!desparasitacionId) {
        mostrarErrorEditarDesparasitacion(
            "No se identificó la desparasitación a editar.",
            "warning"
        );
        return;
    }

    if (!productoUsado || !fechaAplicacion || !fechaProximaDosis) {
        mostrarErrorEditarDesparasitacion(
            "Completá el producto utilizado, la fecha de aplicación y la próxima dosis.",
            "warning"
        );
        return;
    }

    if (fechaAplicacion > fechaActualLocal()) {
        mostrarErrorEditarDesparasitacion(
            "La fecha de aplicación no debe ser posterior a hoy.",
            "warning"
        );
        return;
    }

    if (fechaProximaDosis < fechaAplicacion) {
        mostrarErrorEditarDesparasitacion(
            "La fecha de la próxima dosis no debe ser anterior a la fecha de aplicación.",
            "warning"
        );
        return;
    }

    const boton = document.getElementById("btnGuardarEdicionDesparasitacion");
    boton.disabled = true;

    try {
        await apiRequest(
            `/desparasitaciones/${encodeURIComponent(desparasitacionId)}/edit`,
            {
                method: "PATCH",
                body: JSON.stringify({
                    productoUsado,
                    fechaAplicacion,
                    fechaProximaDosis
                })
            }
        );

        bootstrap.Modal
            .getOrCreateInstance(
                document.getElementById("modalEditarDesparasitacion")
            )
            .hide();

        mostrarMensajeFicha("Desparasitación actualizada correctamente.");

        await cargarHistorial("desparasitaciones");
    } catch (error) {
        console.error("Error al editar desparasitación:", error);
        mostrarErrorEditarDesparasitacion(
            error.message || "No se pudo actualizar la desparasitación."
        );
    } finally {
        boton.disabled = false;
    }
}

// MOSTRAR UNA TABLA DE HISTORIAL

function renderizarTabla(registros, tipo) {
    const contenido =
        document.getElementById("contenidoHistorialMascota");

    const esVacuna = tipo === "vacunas";

    const titulo = esVacuna
        ? "Historial de vacunas"
        : "Historial de desparasitaciones";

    const columnas = esVacuna
        ? ["Vacuna", "Aplicación", "Próxima dosis", "Veterinario", "Acciones"]
        : ["Producto utilizado", "Aplicación", "Próxima dosis", "Veterinario", "Acciones"];

    const encabezados = columnas.map((columna, indice) => {
        const claseAlineacion = indice === columnas.length - 1
            ? ' class="text-end"'
            : "";
        return `<th${claseAlineacion}>${columna}</th>`;
    }).join("");

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
            const vetId = registro.veterinarioId ?? registro.veterinario?.id;
            const vetTexto = registro.nombreVeterinario
                || obtenerNombreVeterinario(vetId);

            const celdas = esVacuna
                ? `
                    <td>${escaparHTML(registro.nombreVacuna)}</td>
                    <td>${formatearFecha(registro.fechaAplicacion)}</td>
                    <td>${formatearFecha(registro.fechaProximaDosis)}</td>
                    <td>${escaparHTML(vetTexto)}</td>
                    <td class="text-end text-nowrap">
                        <button type="button"
                                class="btn btn-sm btn-outline-primary"
                                data-accion="editar-vacuna"
                                data-vacuna-id="${escaparHTML(registro.id)}"
                                title="Editar vacuna">
                            <i class="bi bi-pencil"></i>
                        </button>
                    </td>
                `
                : `
                    <td>${escaparHTML(registro.productoUsado)}</td>
                    <td>${formatearFecha(registro.fechaAplicacion)}</td>
                    <td>${formatearFecha(registro.fechaProximaDosis)}</td>
                    <td>${escaparHTML(vetTexto)}</td>
                    <td class="text-end text-nowrap">
                        <button type="button"
                                class="btn btn-sm btn-outline-primary"
                                data-accion="editar-desparasitacion"
                                data-desparasitacion-id="${escaparHTML(registro.id)}"
                                title="Editar desparasitación">
                            <i class="bi bi-pencil"></i>
                        </button>
                    </td>
                `;

            return `<tr>${celdas}</tr>`;
        }).join("");

    contenido.innerHTML = `
        <div class="page-heading">
            <div>
                <h2 class="h5 mb-1">${titulo}</h2>
            </div>

            <button class="btn btn-success"
                    type="button"
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

            const campoFechaAplicacion = document.getElementById(
                esVacuna
                    ? "fechaAplicacionVacuna"
                    : "fechaAplicacionDesparasitacion"
            );

            if (campoFechaAplicacion) {
                campoFechaAplicacion.max = fechaActualLocal();
            }

            bootstrap.Modal
                .getOrCreateInstance(document.getElementById(idModal))
                .show();
        });

    contenido.querySelector("tbody")
        .addEventListener("click", evento => {
            if (esVacuna) {
                const boton = evento.target.closest(
                    'button[data-accion="editar-vacuna"]'
                );
                if (!boton) return;
                abrirModalEditarVacuna(boton.dataset.vacunaId);
                return;
            }

            const botonDesp = evento.target.closest(
                'button[data-accion="editar-desparasitacion"]'
            );
            if (!botonDesp) return;
            abrirModalEditarDesparasitacion(botonDesp.dataset.desparasitacionId);
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

        if (tipo === "vacunas") {
            vacunasActuales = datos;
            desparasitacionesActuales = [];
        } else {
            desparasitacionesActuales = datos;
            vacunasActuales = [];
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

// GUARDAR DESPARASITACIÓN (CON VETERINARIO OBLIGATORIO)

async function guardarDesparasitacion(evento) {
    evento.preventDefault();

    const veterinarioId = document.getElementById(
        "veterinarioDesparasitacion"
    ).value;

    const desparasitacion = {
        productoUsado:
            document.getElementById("productoUsado").value.trim(),
        fechaAplicacion:
            document.getElementById("fechaAplicacionDesparasitacion").value,
        fechaProximaDosis:
            document.getElementById("proximaDosisDesparasitacion").value,
        mascotaId: mascotaActual.id,
        veterinarioId: Number(veterinarioId)
    };

    if (
        !desparasitacion.productoUsado ||
        !desparasitacion.fechaAplicacion ||
        !desparasitacion.fechaProximaDosis ||
        !veterinarioId
    ) {
        mostrarMensajeFicha(
            "Completá todos los campos obligatorios, incluyendo el veterinario.",
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

export function inicializarFichaMascota(
    mascota,
    volverAListado,
    onMascotaActualizada = null
) {
    mascotaActual = mascota;
    onMascotaActualizadaCallback = onMascotaActualizada;

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

    document.getElementById("formEditarVacuna")
        .addEventListener("submit", guardarEdicionVacuna);

    document.getElementById("formDesparasitacion")
        .addEventListener("submit", guardarDesparasitacion);

    document.getElementById("formEditarDesparasitacion")
        .addEventListener("submit", guardarEdicionDesparasitacion);

    configurarControlesFoto();
    cargarVeterinarios();
    cargarHistorial("vacunas");
}