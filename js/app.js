
import {
    mostrarInicio,
    inicializarInicio
} from "./pages/inicio.js";

import {
    mostrarTurnos,
    inicializarTurnos
} from "./pages/turnos.js";

import {
    mostrarClientes,
    inicializarClientes
} from "./pages/clientes.js";

import {
    mostrarMascotas,
    inicializarMascotas
} from "./pages/mascotas.js";

import {
    mostrarVeterinarios,
    inicializarVeterinarios
} from "./pages/veterinarios.js";

import {
    mostrarConsultasMedicas,
    inicializarConsultasMedicas
} from "./pages/consultas-medicas.js";

import {
    mostrarEstudios,
    inicializarEstudios
} from "./pages/estudios.js";

import {
    mostrarUsuario,
    inicializarUsuario
} from "./pages/usuario.js";


// ==========================================
// INICIAR APLICACIÓN
// ==========================================

function iniciarApp() {

    const appContent = document.getElementById("app-content");
    const sidebar = document.getElementById("sidebar");

    let paginaAnterior = "inicio";
    let paginaActual = null;

    if (!appContent || !sidebar) {
        console.error("No se encontró la estructura principal del dashboard.");
        return;
    }

    // ==========================================
    // REGISTRO DE PÁGINAS
    // ==========================================

    const paginas = {

        inicio: {
            mostrar: mostrarInicio,
            inicializar: inicializarInicio
        },

        clientes: {
            mostrar: mostrarClientes,
            inicializar: inicializarClientes
        },

        mascotas: {
            mostrar: mostrarMascotas,
            inicializar: inicializarMascotas
        },

        turnos: {
            mostrar: mostrarTurnos,
            inicializar: inicializarTurnos
        },

        "consultas-medicas": {
            mostrar: mostrarConsultasMedicas,
            inicializar: inicializarConsultasMedicas
        },

        veterinarios: {
            mostrar: mostrarVeterinarios,
            inicializar: inicializarVeterinarios
        },

        estudios: {
            mostrar: mostrarEstudios,
            inicializar: inicializarEstudios
        },

        // Pantalla de perfil y gestión de usuarios.
        // No aparece en el menú lateral.
        usuario: {
            mostrar: mostrarUsuario,

            inicializar: () => inicializarUsuario(() => {
                navegarA(paginaAnterior);
            })
        }

    };


    // ==========================================
    // NAVEGACIÓN ENTRE PÁGINAS
    // ==========================================

    function navegarA(nombrePagina) {

        const pagina = paginas[nombrePagina];

        if (!pagina) return;

        // Guardar la última página visitada antes de entrar al perfil.
        if (
            nombrePagina === "usuario" &&
            paginaActual !== null &&
            paginaActual !== "usuario"
        ) {
            paginaAnterior = paginaActual;
        }

        paginaActual = nombrePagina;

        // Renderizar pantalla.
        appContent.innerHTML = pagina.mostrar();

        // Actualizar menú lateral.
        document.querySelectorAll(".nav-link-custom").forEach(enlace => {

            enlace.classList.toggle(
                "active",
                enlace.dataset.page === nombrePagina
            );

        });

        // Inicializar el módulo correspondiente.
        if (pagina.inicializar) {
            pagina.inicializar();
        }

        sidebar.classList.remove("show");
    }


    // ==========================================
    // NAVEGACIÓN DEL SIDEBAR
    // ==========================================

    document.querySelectorAll(".nav-link-custom").forEach(enlace => {

        enlace.addEventListener("click", evento => {

            evento.preventDefault();

            navegarA(enlace.dataset.page);

        });

    });


    // ==========================================
    // BOTÓN DEL SIDEBAR
    // ==========================================

    document.getElementById("sidebarToggle")?.addEventListener("click", () => {

        if (window.innerWidth <= 768) {
            sidebar.classList.toggle("show");
        } else {
            document.body.classList.toggle("sidebar-collapsed");
        }

    });


    // ==========================================
    // PERFIL DE USUARIO
    // ==========================================

    document.getElementById("btnPerfilUsuario")?.addEventListener("click", () => {

        navegarA("usuario");

    });


    // ==========================================
    // CERRAR SESIÓN
    // ==========================================

    document.getElementById("btnCerrarSesion")?.addEventListener("click", () => {

        localStorage.removeItem("token");

        window.location.replace("/login.html");

    });


    // ==========================================
    // PANTALLA INICIAL
    // ==========================================

    navegarA("inicio");

}


// ==========================================
// COMPROBAR AUTENTICACIÓN
// ==========================================

if (!localStorage.getItem("token")) {

    window.location.replace("/login.html");

} else {

    iniciarApp();

}
