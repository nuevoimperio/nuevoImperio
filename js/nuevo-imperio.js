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
        </div>
      </article>
    `;
  });
}

cargarProyectos();