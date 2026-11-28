import { apiRequest, escaparHTML } from "../api.js";
import {
    mostrarFichaMascota,
    inicializarFichaMascota
} from "./ficha-mascota.js";

let mascotas = [];
let clientesDisponibles = [];

let paginaActualMascotas = 0;
let totalPaginasMascotas = 0;
const tamanoPaginaMascotas = 10;
let temporizadorBusquedaMascotas = null;

const REGEX_SOLO_LETRAS = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/;

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
                    <div class="col-12 col-md-4">
                        <input
                            type="search"
                            id="buscarMascotaNombre"
                            class="form-control"
                            placeholder="Buscar por nombre...">
                    </div>

                    <div class="col-12 col-sm-6 col-md-2">
                        <input
                            type="search"
                            id="buscarMascotaEspecie"
                            class="form-control"
                            placeholder="Especie...">
                    </div>

                    <div class="col-12 col-sm-6 col-md-2">
                        <input
                            type="search"
                            id="buscarMascotaRaza"
                            class="form-control"
                            placeholder="Raza...">
                    </div>

                    <div class="col-12 col-md-3">
                        <select
                            id="filtroMascotaCliente"
                            class="form-select">
                            <option value="">Todos los propietarios</option>
                        </select>
                    </div>

                    <div class="col-12 col-md-1 d-grid">
                        <button
                            type="button"
                            class="btn btn-outline-secondary"
                            id="btnLimpiarFiltrosMascotas"
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
                            <th>Especie</th>
                            <th>Raza</th>
                            <th>Sexo / Esterilizado</th>
                            <th>Propietario</th>
                            <th class="text-end">Acciones</th>
                        </tr>
                    </thead>

                    <tbody id="tablaMascotas">
                        <tr>
                            <td colspan="6"
                                class="text-center text-secondary py-4">
                                Cargando mascotas...
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="content-card-body border-top d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                <small id="infoPaginacionMascotas" class="text-secondary">
                    Cargando información...
                </small>

                <div class="d-flex gap-2">
                    <button
                        type="button"
                        class="btn btn-outline-primary btn-sm"
                        id="btnPaginaAnteriorMascotas"
                        disabled
                    >
                        <i class="bi bi-chevron-left me-1"></i>
                        Anterior
                    </button>

                    <button
                        type="button"
                        class="btn btn-outline-primary btn-sm"
                        id="btnPaginaSiguienteMascotas"
                        disabled
                    >
                        Siguiente
                        <i class="bi bi-chevron-right ms-1"></i>
                    </button>
                </div>
            </div>
        </div>

        <!-- FORMULARIO DE ALTA Y EDICIÓN -->
        <div class="modal fade"
             id="mascotaModal"
             tabindex="-1"
             aria-labelledby="mascotaModalTitulo"
             aria-hidden="true">

            <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
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

                            <div class="row g-3 mt-1">
                                <div class="col-md-6">
                                    <label for="mascotaFechaNacimiento"
                                           class="form-label">
                                        Fecha de nacimiento *
                                    </label>

                                    <input type="date"
                                           id="mascotaFechaNacimiento"
                                           class="form-control"
                                           required>
                                </div>

                                <div class="col-md-6">
                                    <label for="mascotaSexo"
                                           class="form-label">
                                        Sexo *
                                    </label>

                                    <select id="mascotaSexo"
                                            class="form-select"
                                            required>
                                        <option value="">Seleccioná el sexo</option>
                                        <option value="MACHO">Macho</option>
                                        <option value="HEMBRA">Hembra</option>
                                    </select>
                                </div>
                            </div>

                            <div class="row g-3 mt-1">
                                <div class="col-md-6">
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

                                <div class="col-md-6 d-flex align-items-center">
                                    <div class="form-check mt-3">
                                        <input type="checkbox"
                                               id="mascotaEsterilizado"
                                               class="form-check-input">
                                        <label for="mascotaEsterilizado"
                                               class="form-check-label fw-medium">
                                            Esterilizado / castrado
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <hr class="my-4">

                            <h6 class="fw-semibold mb-3">
                                <i class="bi bi-clipboard2-heart me-1 text-danger"></i>
                                Antecedentes clínicos (opcionales)
                            </h6>

                            <div class="mb-3">
                                <label for="mascotaAlergias"
                                       class="form-label">
                                    Alergias conocidas
                                </label>

                                <textarea id="mascotaAlergias"
                                          class="form-control"
                                          rows="2"
                                          placeholder="Ej. Alergia a pulgas, penicilina, pollo..."></textarea>
                            </div>

                            <div>
                                <label for="mascotaCondiciones"
                                       class="form-label">
                                    Condiciones crónicas / enfermedades
                                </label>

                                <textarea id="mascotaCondiciones"
                                          class="form-control"
                                          rows="2"
                                          placeholder="Ej. Insuficiencia renal, epilepsia, displasia..."></textarea>
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

function formatearSexo(sexo) {
    if (!sexo) return "—";
    const normalizado = String(sexo).toUpperCase();
    if (normalizado === "MACHO") return "Macho";
    if (normalizado === "HEMBRA") return "Hembra";
    return sexo;
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

function renderizarMiniaturaMascota(mascota) {
    const url = construirUrlFotoValida(mascota.fotoUrl);

    if (url) {
        return `
            <img src="${escaparHTML(url)}"
                 alt="${escaparHTML(mascota.nombre)}"
                 class="mascota-tabla-thumb"
                 onerror="this.outerHTML='<span class=\\'mascota-tabla-thumb-placeholder\\'><i class=\\'bi bi-heart-pulse\\'></i></span>'">
        `;
    }

    return `
        <span class="mascota-tabla-thumb-placeholder" aria-hidden="true">
            <i class="bi bi-heart-pulse"></i>
        </span>
    `;
}

// CARGAR PROPIETARIOS DESDE LA API DE CLIENTES

async function cargarClientesDisponibles() {
    const selectorForm = document.getElementById("mascotaCliente");
    const selectorFiltro = document.getElementById("filtroMascotaCliente");

    try {
        const datos = await apiRequest("/clientes");

        if (!Array.isArray(datos)) {
            throw new Error("La API de clientes no devolvió una lista.");
        }

        clientesDisponibles = datos;

        const opcionesClientes = clientesDisponibles.map(cliente => `
            <option value="${escaparHTML(cliente.id)}">
                ${escaparHTML(cliente.nombre)}
                ${escaparHTML(cliente.apellido)}
                — ${escaparHTML(cliente.telefono)}
            </option>
        `).join("");

        if (selectorForm) {
            selectorForm.innerHTML = clientesDisponibles.length === 0
                ? `<option value="">Primero registrá un cliente</option>`
                : `<option value="">Seleccioná un propietario</option>${opcionesClientes}`;
        }

        if (selectorFiltro) {
            const valorActual = selectorFiltro.value;
            selectorFiltro.innerHTML = `
                <option value="">Todos los propietarios</option>
                ${opcionesClientes}
            `;
            selectorFiltro.value = valorActual;
        }

    } catch (error) {
        if (selectorForm) {
            selectorForm.innerHTML = `
                <option value="">No se pudieron cargar los clientes</option>
            `;
        }

        mostrarMensaje(
            `Error al cargar propietarios: ${error.message}`,
            "danger"
        );

        console.error("Error al cargar propietarios:", error);
    }
}

// OBTENER PARÁMETROS DE BÚSQUEDA Y FILTRO

function obtenerParametrosBusquedaMascotas(pagina = paginaActualMascotas) {
    const parametros = new URLSearchParams({
        page: String(pagina),
        size: String(tamanoPaginaMascotas)
    });

    const nombre = document.getElementById("buscarMascotaNombre")?.value.trim();
    const especie = document.getElementById("buscarMascotaEspecie")?.value.trim();
    const raza = document.getElementById("buscarMascotaRaza")?.value.trim();
    const clienteId = document.getElementById("filtroMascotaCliente")?.value;

    if (nombre) parametros.set("nombre", nombre);
    if (especie) parametros.set("especie", especie);
    if (raza) parametros.set("raza", raza);
    if (clienteId) parametros.set("clienteId", clienteId);

    return parametros;
}

// BUSCAR Y LISTAR MASCOTAS PAGINADAS DESDE EL BACKEND

async function cargarMascotas(pagina = paginaActualMascotas) {
    const tabla = document.getElementById("tablaMascotas");

    tabla.innerHTML = `
        <tr>
            <td colspan="6" class="text-center text-secondary py-4">
                <span class="spinner-border spinner-border-sm me-2"></span>
                Buscando mascotas...
            </td>
        </tr>
    `;

    try {
        const parametros = obtenerParametrosBusquedaMascotas(pagina);

        const resultado = await apiRequest(
            `/mascotas/buscar?${parametros.toString()}`
        );

        if (!resultado || !Array.isArray(resultado.content)) {
            throw new Error(
                "La API no devolvió una página válida de mascotas."
            );
        }

        paginaActualMascotas = resultado.number ?? pagina;
        totalPaginasMascotas = resultado.totalPages ?? 0;
        mascotas = resultado.content;

        renderizarMascotas();
        actualizarControlesPaginacionMascotas(resultado);

    } catch (error) {
        tabla.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-danger py-4">
                    ${escaparHTML(error.message)}
                </td>
            </tr>
        `;

        document.getElementById("infoPaginacionMascotas").textContent =
            "No se pudo cargar la paginación.";
        document.getElementById("btnPaginaAnteriorMascotas").disabled = true;
        document.getElementById("btnPaginaSiguienteMascotas").disabled = true;

        console.error("Error al buscar mascotas:", error);
    }
}

function programarBusquedaMascotas() {
    clearTimeout(temporizadorBusquedaMascotas);
    temporizadorBusquedaMascotas = setTimeout(() => {
        cargarMascotas(0);
    }, 350);
}

function configurarFiltrosMascotas() {
    const inputNombre = document.getElementById("buscarMascotaNombre");
    const inputEspecie = document.getElementById("buscarMascotaEspecie");
    const inputRaza = document.getElementById("buscarMascotaRaza");
    const selectCliente = document.getElementById("filtroMascotaCliente");
    const btnLimpiar = document.getElementById("btnLimpiarFiltrosMascotas");

    [inputNombre, inputEspecie, inputRaza].forEach(input => {
        input?.addEventListener("input", programarBusquedaMascotas);
    });

    selectCliente?.addEventListener("change", () => {
        clearTimeout(temporizadorBusquedaMascotas);
        cargarMascotas(0);
    });

    btnLimpiar?.addEventListener("click", () => {
        clearTimeout(temporizadorBusquedaMascotas);
        if (inputNombre) inputNombre.value = "";
        if (inputEspecie) inputEspecie.value = "";
        if (inputRaza) inputRaza.value = "";
        if (selectCliente) selectCliente.value = "";
        cargarMascotas(0);
    });
}

function actualizarControlesPaginacionMascotas(resultado) {
    const botonAnterior = document.getElementById("btnPaginaAnteriorMascotas");
    const botonSiguiente = document.getElementById("btnPaginaSiguienteMascotas");
    const informacion = document.getElementById("infoPaginacionMascotas");

    const totalElementos = resultado.totalElements ?? 0;
    const numeroPagina = resultado.number ?? 0;
    const tamanio = resultado.size ?? tamanoPaginaMascotas;

    const desde = totalElementos === 0
        ? 0
        : numeroPagina * tamanio + 1;

    const hasta = Math.min(
        (numeroPagina + 1) * tamanio,
        totalElementos
    );

    informacion.textContent =
        `Mostrando ${desde} a ${hasta} de ${totalElementos} mascotas`;

    botonAnterior.disabled = resultado.first ?? numeroPagina === 0;
    botonSiguiente.disabled =
        resultado.last ?? numeroPagina >= totalPaginasMascotas - 1;
}

function configurarPaginacionMascotas() {
    const botonAnterior = document.getElementById("btnPaginaAnteriorMascotas");
    const botonSiguiente = document.getElementById("btnPaginaSiguienteMascotas");

    botonAnterior.addEventListener("click", async () => {
        if (paginaActualMascotas > 0) {
            await cargarMascotas(paginaActualMascotas - 1);
        }
    });

    botonSiguiente.addEventListener("click", async () => {
        if (paginaActualMascotas < totalPaginasMascotas - 1) {
            await cargarMascotas(paginaActualMascotas + 1);
        }
    });
}

// CONSTRUIR LAS FILAS DE LA PÁGINA DEVUELTA POR EL BACKEND

function renderizarMascotas() {
    const tabla = document.getElementById("tablaMascotas");

    if (mascotas.length === 0) {
        tabla.innerHTML = `
            <tr>
                <td colspan="6"
                    class="text-center text-secondary py-4">
                    No se encontraron mascotas con esos criterios.
                </td>
            </tr>
        `;
        return;
    }

    tabla.innerHTML = mascotas.map(mascota => {
        const cliente = clientesDisponibles.find(
            item => String(item.id) === String(mascota.clienteId)
        );

        const propietario = mascota.nombreClienteCompleto ||
            (cliente
                ? `${cliente.nombre} ${cliente.apellido}`
                : `Cliente #${mascota.clienteId}`);

        const tieneAlerta = Boolean(
            mascota.alergiasConocidas?.trim() || mascota.condicionesCronicas?.trim()
        );

        return `
            <tr>
                <td>
                    <div class="d-flex align-items-center gap-2">
                        ${renderizarMiniaturaMascota(mascota)}
                        <div>
                            <div class="fw-medium">
                                ${escaparHTML(mascota.nombre)}
                                ${
                                    tieneAlerta
                                        ? `<span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle ms-1" title="Tiene antecedentes clínicos">
                                               <i class="bi bi-exclamation-circle"></i>
                                           </span>`
                                        : ""
                                }
                            </div>
                        </div>
                    </div>
                </td>

                <td>${escaparHTML(mascota.especie)}</td>
                <td>${escaparHTML(mascota.raza)}</td>

                <td>
                    <span class="small">${escaparHTML(formatearSexo(mascota.sexo))}</span>
                    <span class="badge ${mascota.esterilizado ? "bg-info-subtle text-info-emphasis" : "bg-secondary-subtle text-secondary-emphasis"} ms-1">
                        ${mascota.esterilizado ? "Esterilizado" : "Sin esterilizar"}
                    </span>
                </td>

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

    document.getElementById("mascotaSexo").value =
        mascota?.sexo ?? "";

    document.getElementById("mascotaEsterilizado").checked =
        Boolean(mascota?.esterilizado);

    document.getElementById("mascotaAlergias").value =
        mascota?.alergiasConocidas ?? "";

    document.getElementById("mascotaCondiciones").value =
        mascota?.condicionesCronicas ?? "";

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
    const sexo =
        document.getElementById("mascotaSexo").value;
    const alergiasTexto =
        document.getElementById("mascotaAlergias").value.trim();
    const condicionesTexto =
        document.getElementById("mascotaCondiciones").value.trim();

    const mascotaExistente = id
        ? mascotas.find(item => String(item.id) === String(id))
        : null;

    const mascota = {
        nombre: document.getElementById("mascotaNombre").value.trim(),
        especie: document.getElementById("mascotaEspecie").value.trim(),
        raza: document.getElementById("mascotaRaza").value.trim(),
        fechaNacimiento:
            document.getElementById("mascotaFechaNacimiento").value,
        clienteId: Number(clienteId),
        fotoUrl: mascotaExistente?.fotoUrl ?? null,
        sexo,
        esterilizado: Boolean(
            document.getElementById("mascotaEsterilizado").checked
        ),
        alergiasConocidas: alergiasTexto || null,
        condicionesCronicas: condicionesTexto || null
    };

    if (
        !mascota.nombre ||
        !mascota.especie ||
        !mascota.raza ||
        !mascota.fechaNacimiento ||
        !mascota.sexo ||
        !clienteId
    ) {
        mostrarMensaje(
            "Completá todos los campos obligatorios.",
            "warning"
        );
        return;
    }

    if (
        !REGEX_SOLO_LETRAS.test(mascota.nombre) ||
        !REGEX_SOLO_LETRAS.test(mascota.especie) ||
        !REGEX_SOLO_LETRAS.test(mascota.raza)
    ) {
        mostrarMensaje(
            "El nombre, la especie y la raza solo pueden contener letras y espacios.",
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

        await cargarMascotas(id ? paginaActualMascotas : 0);

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

        await cargarMascotas(paginaActualMascotas);

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

    function abrirFicha(mascota) {
        const appContent = document.getElementById("app-content");

        appContent.innerHTML = mostrarFichaMascota(mascota);

        inicializarFichaMascota(
            mascota,
            () => {
                appContent.innerHTML = mostrarMascotas();
                inicializarMascotas();
            },
            mascotaActualizada => {
                const indice = mascotas.findIndex(
                    item => String(item.id) === String(mascotaActualizada.id)
                );
                if (indice !== -1) {
                    mascotas[indice] = {
                        ...mascotas[indice],
                        ...mascotaActualizada
                    };
                }
            }
        );
    }

    configurarFiltrosMascotas();
    configurarPaginacionMascotas();
    cargarClientesDisponibles();
    cargarMascotas(0);
}