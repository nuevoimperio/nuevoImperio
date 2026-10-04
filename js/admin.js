const SUPABASE_URL = "https://btbnhkrvyjpmxinimkuw.supabase.co";

const SUPABASE_KEY = "sb_publishable_U1drktxOUQHK9Y_Yc9byaA_hZ_m6aIW";

const supabaseAdmin = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

async function cargarListaProyectos() {

  const { data, error } = await supabaseAdmin
    .from("proyectos")
    .select("*")
    .order("orden", { ascending: true });

  if (error) {
    console.error("Error al cargar proyectos:", error);
    return;
  }

  console.log("Proyectos en administrador:", data);
  const listaProyectos = document.getElementById("listaProyectos");

if (!data || data.length === 0) {
  listaProyectos.innerHTML = `
    <p class="proyectos-vacio">Todavía no hay proyectos cargados.</p>
  `;
  return;
}

listaProyectos.innerHTML = data.map(proyecto => `
  <div class="proyecto-admin">

   <img
  src="${proyecto.imagen}"
  alt="${proyecto.titulo}"
  
>

    <div class="proyecto-admin-info">
      <h3>${proyecto.titulo}</h3>
      <span>${proyecto.categoria}</span>
      <p>${proyecto.descripcion || ""}</p>
    </div>

  </div>
`).join("");
}

cargarListaProyectos();
const formLogin = document.getElementById("formLogin");
const loginPanel = document.getElementById("loginPanel");
const panelProyecto = document.getElementById("panelProyecto");
const panelLista = document.getElementById("panelLista");
const loginMensaje = document.getElementById("loginMensaje");

formLogin.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  const { data, error } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    loginMensaje.textContent = "Email o contraseña incorrectos.";
    return;
  }

  loginPanel.style.display = "none";
  panelProyecto.style.display = "block";
  panelLista.style.display = "block";
  cargarListaProyectos();

  console.log("Administrador conectado:", data.user.email);
});