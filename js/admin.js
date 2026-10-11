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

      <div class="acciones-proyecto">
        <button
          type="button"
          class="btn-editar"
          data-id="${proyecto.id}"
        >
          ✏️ Editar
        </button>

        <button
          type="button"
          class="btn-eliminar"
          data-id="${proyecto.id}"
        >
          🗑️ Eliminar
        </button>
      </div>
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

// Mostrar administración de ofertas
document.getElementById("administrarOfertas").style.display = "block";

cargarListaProyectos();

  console.log("Administrador conectado:", data.user.email);
});
const formProyecto = document.getElementById("formProyecto");

formProyecto.addEventListener("submit", async (e) => {
  e.preventDefault();

  const titulo = document.getElementById("titulo").value;
  const categoria = document.getElementById("categoria").value;
  const descripcion = document.getElementById("descripcion").value;
  const imagen = document.getElementById("imagen").files[0];
  const idEditando = document.getElementById("proyectoEditando").value;

if (idEditando) {
  const cambios = {
    titulo: titulo.trim(),
    categoria: categoria,
    descripcion: descripcion
  };
  if (imagen) {
    console.log("Nueva imagen seleccionada:", imagen.name);
  const nombreArchivo = `${crypto.randomUUID()}-${imagen.name}`;

  const { error: errorImagen } = await supabaseAdmin.storage
    .from("proyectos")
    .upload(nombreArchivo, imagen);

  if (errorImagen) {
    alert("Error al subir la nueva imagen: " + errorImagen.message);
    return;
  }

  const { data: imagenPublica } = supabaseAdmin.storage
    .from("proyectos")
    .getPublicUrl(nombreArchivo);

  cambios.imagen = imagenPublica.publicUrl;
}

  const { error } = await supabaseAdmin
    .from("proyectos")
    .update(cambios)
    .eq("id", idEditando);

  if (error) {
    alert("Error al actualizar el proyecto: " + error.message);
    return;
  }

  alert("¡Proyecto actualizado correctamente!");

  document.getElementById("proyectoEditando").value = "";
  formProyecto.reset();
  await cargarListaProyectos();
  return;
}
  if (!titulo || !categoria || !imagen) {
  alert("Completá el título, la categoría y seleccioná una imagen.");
  return;
}

const nombreArchivo = `${crypto.randomUUID()}-${imagen.name}`;

const { error: errorImagen } = await supabaseAdmin.storage
  .from("proyectos")
  .upload(nombreArchivo, imagen);

if (errorImagen) {
  console.error("Error al subir imagen:", errorImagen);
  alert("No se pudo subir la imagen: " + errorImagen.message);
  return;
}

const { data: imagenPublica } = supabaseAdmin.storage
  .from("proyectos")
  .getPublicUrl(nombreArchivo);

console.log("Imagen subida correctamente:", imagenPublica.publicUrl);
const { error: errorProyecto } = await supabaseAdmin
  .from("proyectos")
  .insert({
    titulo: titulo,
    categoria: categoria,
    descripcion: descripcion,
    imagen: imagenPublica.publicUrl,
    visible: true,
    orden: 0
  });

if (errorProyecto) {
  console.error("Error al guardar proyecto:", errorProyecto);
  alert("La imagen se subió, pero no se pudo guardar el proyecto: " + errorProyecto.message);
  return;
}

alert("¡Proyecto publicado correctamente!");

formProyecto.reset();
await cargarListaProyectos();

  console.log("Datos del proyecto:", {
    titulo,
    categoria,
    descripcion,
    imagen
  });
});
document.getElementById("listaProyectos").addEventListener("click", async (e) => {
  const boton = e.target.closest(".btn-eliminar");
  if (!boton) return;

  const id = boton.dataset.id;

  if (!confirm("¿Seguro que querés eliminar este proyecto?")) return;

  const { error } = await supabaseAdmin
    .from("proyectos")
    .delete()
    .eq("id", id);

  if (error) {
    alert("Error al eliminar: " + error.message);
    return;
  }

  alert("Proyecto eliminado correctamente.");
  await cargarListaProyectos();
});
document.getElementById("listaProyectos").addEventListener("click", async (e) => {
  const boton = e.target.closest(".btn-editar");
  if (!boton) return;
  console.log("Botón EDITAR detectado. ID:", boton.dataset.id);

  const id = boton.dataset.id;

  const { data: proyecto, error } = await supabaseAdmin
    .from("proyectos")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !proyecto) {
    alert("No se pudo cargar el proyecto.");
    return;
  }

 document.getElementById("proyectoEditando").value = proyecto.id;
document.getElementById("titulo").value = proyecto.titulo;
document.getElementById("categoria").value = proyecto.categoria;
document.getElementById("descripcion").value = proyecto.descripcion || "";

document.getElementById("formProyecto").scrollIntoView({
  behavior: "smooth",
  block: "start"
});

alert("Proyecto cargado para editar. Ya podés modificar sus datos.");
});
const formOferta = document.getElementById("formOferta");

formOferta.addEventListener("submit", async (e) => {
  e.preventDefault();

  const titulo = document.getElementById("ofertaTitulo").value.trim();
  const descripcion = document.getElementById("ofertaDescripcion").value.trim();
  const imagen = document.getElementById("ofertaImagen").files[0];
  const vencimiento = document.getElementById("ofertaVencimiento").value;

  if (!titulo || !descripcion || !imagen || !vencimiento) {
    alert("Completá todos los campos.");
    return;
  }

  const nombreArchivo = `${crypto.randomUUID()}-${imagen.name}`;

  const { error: errorImagen } = await supabaseAdmin.storage
    .from("proyectos")
    .upload(nombreArchivo, imagen);

  if (errorImagen) {
    alert("Error al subir la imagen: " + errorImagen.message);
    return;
  }

  const { data: imagenPublica } = supabaseAdmin.storage
    .from("proyectos")
    .getPublicUrl(nombreArchivo);

  const { error } = await supabaseAdmin
    .from("ofertas")
    .insert({
      titulo,
      descripcion,
      imagen: imagenPublica.publicUrl,
      fecha_vencimiento: vencimiento,
      visible: true
    });

  if (error) {
    alert("Error al publicar la oferta: " + error.message);
    return;
  }

  alert("¡Oferta publicada correctamente!");
  formOferta.reset();
});