import { apiRequest } from "../api.js";
export function mostrarInicio() {
    return `
        <div class="page-heading">
            <div>
                <h1>Bienvenido/a</h1>
                <p class="page-subtitle">
                    Resumen general de la veterinaria.
                </p>
            </div>
        </div>

       <div class="stats-grid mb-4">

    <div class="stat-card">
        <div class="stat-icon bg-primary-subtle text-primary">
            <i class="bi bi-heart"></i>
        </div>
        <div class="stat-info">
            <div class="stat-number" id="totalMascotasRegistradas">Cargando...</div>
            <div class="stat-label">Mascotas registradas</div>
        </div>
    </div>

    <div class="stat-card">
        <div class="stat-icon bg-success-subtle text-success">
            <i class="bi bi-people"></i>
        </div>
        <div class="stat-info">
            <div class="stat-number" id="totalClientesRegistrados">Cargando...</div>
            <div class="stat-label">Clientes registrados</div>
        </div>
    </div>

    <div class="stat-card">
        <div class="stat-icon bg-warning-subtle text-warning">
            <i class="bi bi-calendar-check"></i>
        </div>
        <div class="stat-info">
            <div class="stat-number" id="totalTurnosPendientes">Cargando...</div>
            <div class="stat-label">Turnos pendientes</div>
        </div>
    </div>

    <div class="stat-card">
        <div class="stat-icon bg-info-subtle text-info">
            <i class="bi bi-stethoscope"></i>
        </div>
        <div class="stat-info">
            <div class="stat-number" id="totalConsultasMes">Cargando...</div>
            <div class="stat-label">Consultas de este mes</div>
        </div>
    </div>

</div>

        <div class="content-card">
            <div class="content-card-header">
                <h5 class="mb-0">Actividad reciente</h5>
            </div>

            <div class="content-card-body">
                <p class="text-secondary mb-0">
                    Próximamente mostraremos la actividad reciente.
                </p>
            </div>
        </div>
    `;
}

// INICIALIZAR RESUMEN DEL INICIO

export function inicializarInicio() {
    cargarResumenInicio();
}


// CARGAR CLIENTES Y MASCOTAS REGISTRADAS

async function cargarResumenInicio() {

    const elementoClientes = document.getElementById(
        "totalClientesRegistrados"
    );

    const elementoMascotas = document.getElementById(
        "totalMascotasRegistradas"
    );

    const elementoConsultas = document.getElementById(
        "totalConsultasMes"
    );
    

    const [
    resultadoClientes,
    resultadoMascotas,
    resultadoConsultas,
    resultadoTurnos
] = await Promise.allSettled([

    apiRequest("/clientes/findAll"),
    apiRequest("/mascotas/findAll"),
    apiRequest("/consultas-medicas/mesActual"),
    apiRequest("/turnos/pendientes")

]);

// TURNOS PENDIENTES DE HOY

const elementoTurnos = document.getElementById(
    "totalTurnosPendientes"
);

if (
    resultadoTurnos.status === "fulfilled" &&
    Array.isArray(resultadoTurnos.value)
) {
    elementoTurnos.textContent =
        resultadoTurnos.value.length;

} else {
    elementoTurnos.textContent = "—";

    console.error(
        "Error al cargar turnos pendientes:",
        resultadoTurnos.reason
    );
}
        

    // CLIENTES REGISTRADOS

    if (
        resultadoClientes.status === "fulfilled" &&
        Array.isArray(resultadoClientes.value)
    ) {
        elementoClientes.textContent =
            resultadoClientes.value.length;

    } else {
        elementoClientes.textContent = "—";

        console.error(
            "Error al cargar clientes:",
            resultadoClientes.reason
        );
    }

    // MASCOTAS REGISTRADAS

    if (
        resultadoMascotas.status === "fulfilled" &&
        Array.isArray(resultadoMascotas.value)
    ) {
        elementoMascotas.textContent =
            resultadoMascotas.value.length;

    } else {
        elementoMascotas.textContent = "—";

        console.error(
            "Error al cargar mascotas:",
            resultadoMascotas.reason
        );
    }

    // CONSULTAS MÉDICAS DEL MES

    if (
        resultadoConsultas.status === "fulfilled" &&
        Array.isArray(resultadoConsultas.value)
    ) {
        elementoConsultas.textContent =
            resultadoConsultas.value.length;

    } else {
        elementoConsultas.textContent = "—";

        console.error(
            "Error al cargar consultas del mes:",
            resultadoConsultas.reason
        );
    }
}
