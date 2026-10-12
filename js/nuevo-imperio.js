const SUPABASE_URL = "https://btbnhkrvyjpmxinimkuw.supabase.co";

const SUPABASE_KEY = "sb_publishable_U1drktxOUQHK9Y_Yc9byaA_hZ_m6aIW";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

console.log("Supabase conectado correctamente");
async function cargarProyectos() {
  const { data, error } = await supabaseClient
    .from("proyectos")
    .select("*")
    .eq("visible", true)
    .order("orden", { ascending: true });

  if (error) {
    console.error("Error al cargar proyectos:", error);
    return;
  }

  const contenedor = document.getElementById("projectsGrid");

  contenedor.innerHTML = "";
  // Filtrar proyectos por categoría
const botonesFiltro = document.querySelectorAll(".project-filters .filter");

botonesFiltro.forEach(boton => {
  boton.addEventListener("click", () => {
    // Marcar el botón seleccionado
    botonesFiltro.forEach(b => b.classList.remove("active"));
    boton.classList.add("active");

    const categoriaSeleccionada = boton.textContent.trim();

    // Mostrar u ocultar fotografías
    document.querySelectorAll("#projectsGrid .project-card").forEach(tarjeta => {
      const categoriaProyecto = tarjeta.dataset.categoria;

      tarjeta.style.display =
        categoriaSeleccionada === "Todos" ||
        categoriaProyecto === categoriaSeleccionada
          ? ""
          : "none";
    });
  });
});

  data.forEach(proyecto => {
    contenedor.innerHTML += `
     <article class="project-card" data-categoria="${proyecto.categoria}">
        <img src="${proyecto.imagen}" alt="${proyecto.titulo}">

       <div class="project-overlay">
  <span>${proyecto.categoria}</span>
  <h3>${proyecto.titulo}</h3>

  <p class="project-description">
    ${proyecto.descripcion || ""}
  </p>
</div>
      </article>
    `;
  });
}

cargarProyectos();
// Menú de navegación para dispositivos móviles
const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");

if (menuBtn && navLinks) {
  menuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("open");
    menuBtn.textContent = navLinks.classList.contains("open") ? "×" : "☰";
  });

  navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      menuBtn.textContent = "☰";
    });
  });
}
async function cargarOfertas() {
  const contenedor = document.getElementById("ofertasGrid");
  if (!contenedor) return;

  const { data, error } = await supabaseClient
    .from("ofertas")
    .select("*")
    .eq("visible", true)
    .order("creado_en", { ascending: false });

  if (error) {
    console.error("Error al cargar ofertas:", error);
    return;
  }

  contenedor.innerHTML = "";

  if (!data || data.length === 0) {
    contenedor.textContent = "Próximamente nuevas ofertas.";
    return;
  }

  data.forEach(oferta => {
    const tarjeta = document.createElement("article");
    tarjeta.className = "project-card";

    if (oferta.imagen) {
      const imagen = document.createElement("img");
      imagen.src = oferta.imagen;
      imagen.alt = oferta.titulo;
      tarjeta.appendChild(imagen);
    }

    const contenido = document.createElement("div");
    contenido.className = "project-overlay";

    const titulo = document.createElement("h3");
    titulo.textContent = oferta.titulo;
    contenido.appendChild(titulo);

    if (oferta.descripcion) {
      const descripcion = document.createElement("p");
      descripcion.textContent = oferta.descripcion;
      contenido.appendChild(descripcion);
    }

    tarjeta.appendChild(contenido);
    contenedor.appendChild(tarjeta);
  });
}

cargarOfertas();
async function cargarNovedades() {
  const contenedor = document.getElementById("novedadesGrid");
  if (!contenedor) return;

  const { data, error } = await supabaseClient
    .from("novedades")
    .select("*")
    .eq("visible", true)
    .order("creado_en", { ascending: false });

  if (error) {
    console.error("Error al cargar novedades:", error);
    return;
  }

  contenedor.innerHTML = "";

  if (!data || data.length === 0) {
    contenedor.textContent = "Próximamente nuevas novedades.";
    return;
  }

  data.forEach(novedad => {
    const tarjeta = document.createElement("article");
    tarjeta.className = "novedad-card";

    if (novedad.imagen) {
      const imagen = document.createElement("img");
      imagen.src = novedad.imagen;
      imagen.alt = novedad.titulo;
      imagen.className = "novedad-imagen";
      tarjeta.appendChild(imagen);
    }

    const cuerpo = document.createElement("div");
    cuerpo.className = "novedad-cuerpo";

    const fecha = document.createElement("span");
    fecha.className = "novedad-fecha";
    fecha.textContent = new Date(novedad.creado_en).toLocaleDateString(
      "es-AR",
      { day: "numeric", month: "long", year: "numeric" }
    );
    cuerpo.appendChild(fecha);

    const titulo = document.createElement("h3");
    titulo.textContent = novedad.titulo;
    cuerpo.appendChild(titulo);

    const descripcion = document.createElement("p");
    descripcion.className = "novedad-texto";
    descripcion.textContent = novedad.contenido || "";
    cuerpo.appendChild(descripcion);

    if ((novedad.contenido || "").length > 220) {
      descripcion.classList.add("resumido");

      const boton = document.createElement("button");
      boton.className = "novedad-leer-mas";
      boton.type = "button";
      boton.textContent = "Leer más →";
      boton.setAttribute("aria-expanded", "false");

      boton.addEventListener("click", () => {
        const expandido = descripcion.classList.toggle("expandido");
        boton.textContent = expandido ? "Leer menos ↑" : "Leer más →";
        boton.setAttribute("aria-expanded", String(expandido));
      });

      cuerpo.appendChild(boton);
    }

    tarjeta.appendChild(cuerpo);
    contenedor.appendChild(tarjeta);
  });
}

cargarNovedades();
// Cargar presentación de Nosotros desde Supabase
async function cargarNosotros() {
  const elemento = document.getElementById("nosotrosTexto");

  if (!elemento) return;

  const { data, error } = await supabaseClient
    .from("contenido_nosotros")
    .select("texto")
    .eq("id", 1)
    .single();

  if (error) {
    console.error("Error al cargar Nosotros:", error);
    return;
  }

  elemento.textContent = data.texto;
}

// Mostrar la presentación al cargar la página
cargarNosotros();