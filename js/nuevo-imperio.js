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

  data.forEach(proyecto => {
    contenedor.innerHTML += `
      <article class="project-card">
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
    tarjeta.className = "project-card";

    if (novedad.imagen) {
      const imagen = document.createElement("img");
      imagen.src = novedad.imagen;
      imagen.alt = novedad.titulo;
      tarjeta.appendChild(imagen);
    }

    const contenido = document.createElement("div");
    contenido.className = "project-overlay";

    const titulo = document.createElement("h3");
    titulo.textContent = novedad.titulo;
    contenido.appendChild(titulo);

    if (novedad.contenido) {
      const descripcion = document.createElement("p");
      descripcion.textContent = novedad.contenido;
      contenido.appendChild(descripcion);
    }

    tarjeta.appendChild(contenido);
    contenedor.appendChild(tarjeta);
  });
}

cargarNovedades();