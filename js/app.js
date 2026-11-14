
import {
    mostrarInicio,
    inicializarInicio
} from "./pages/inicio.js";

import { mostrarTurnos, inicializarTurnos } from "./pages/turnos.js";

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
import { inicializarPanelUsuario } from "./pages/usuario.js";





function iniciarApp() {
    const appContent = document.getElementById("app-content");
    const sidebar = document.getElementById("sidebar");

    if (!appContent || !sidebar) {
        console.error("No se encontró la estructura principal del dashboard.");
        return;
    }

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
}
    };

    function navegarA(nombrePagina) {

      
        
        const pagina = paginas[nombrePagina];

        if (!pagina) return;

        appContent.innerHTML = pagina.mostrar();

        document.querySelectorAll(".nav-link-custom").forEach(enlace => {
            enlace.classList.toggle(
                "active",
                enlace.dataset.page === nombrePagina
            );
        });

        if (pagina.inicializar) {
            pagina.inicializar();
        }

        sidebar.classList.remove("show");
    }

    document.querySelectorAll(".nav-link-custom").forEach(enlace => {
        enlace.addEventListener("click", evento => {
            evento.preventDefault();
            navegarA(enlace.dataset.page);
        });
    });

    document.getElementById("sidebarToggle")?.addEventListener("click", () => {
        if (window.innerWidth <= 768) {
            sidebar.classList.toggle("show");
        } else {
            document.body.classList.toggle("sidebar-collapsed");
        }
    });

    document.getElementById("btnCerrarSesion")?.addEventListener("click", () => {
        localStorage.removeItem("token");
        window.location.replace("/login.html");
    });

    inicializarPanelUsuario();
navegarA("inicio");
}

// Comprobamos el token antes de inicializar el dashboard.
if (!localStorage.getItem("token")) {
    window.location.replace("/login.html");
} else {
    iniciarApp();
}
