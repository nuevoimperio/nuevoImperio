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
cargarListaOfertas();
cargarListaNovedades();
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
document.getElementById("administrarNovedades").style.display = "block";
document.getElementById("administrarNosotros").style.display = "block";
cargarNosotrosAdmin();

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
  const idEditando = document.getElementById("ofertaEditando").value;

if (idEditando) {
  const cambios = {
    titulo,
    descripcion,
    fecha_vencimiento: vencimiento
  };

  // Si se seleccionó otra fotografía, reemplazarla
  if (imagen) {
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

    cambios.imagen = imagenPublica.publicUrl;
  }

  const { data: actualizada, error } = await supabaseAdmin
    .from("ofertas")
    .update(cambios)
    .eq("id", idEditando)
    .select("id");

  if (error || !actualizada?.length) {
    alert("No se pudo actualizar la oferta: " + (error?.message || "Sin permisos o registro inexistente"));
    return;
  }

  alert("¡Oferta actualizada correctamente!");

  formOferta.reset();
  document.getElementById("ofertaEditando").value = "";
  document.getElementById("btnGuardarOferta").textContent = "Publicar oferta";

  cargarListaOfertas();
  return;
}

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
  cargarListaOfertas();
});
async function cargarListaOfertas() {
  const { data, error } = await supabaseAdmin
    .from("ofertas")
    .select("*")
    .order("creado_en", { ascending: false });

  if (error) {
    console.error("Error al cargar ofertas:", error);
    return;
  }

  const lista = document.getElementById("listaOfertas");

  lista.innerHTML = data.length
    ? data.map(oferta => `
        <div class="proyecto-admin">
          <img src="${oferta.imagen}" alt="${oferta.titulo}">
          <div class="proyecto-admin-info">
            <h3>${oferta.titulo}</h3>
            <p>${oferta.descripcion || ""}</p>
            <p><strong>Vence:</strong> ${oferta.fecha_vencimiento || "Sin fecha"}</p>
            <div class="acciones-proyecto">
  <button type="button" class="btn-editar-oferta" data-id="${oferta.id}">
    ✏️ Editar
  </button>

  <button type="button" class="btn-eliminar-oferta" data-id="${oferta.id}">
    🗑️ Eliminar
  </button>
</div>
          </div>
        </div>
      `).join("")
    : "<p>Todavía no hay ofertas publicadas.</p>";
}
document.getElementById("listaOfertas").addEventListener("click", async (e) => {
  const boton = e.target.closest(".btn-eliminar-oferta");

  if (!boton) return;

  const id = boton.dataset.id;

  if (!confirm("¿Seguro que querés eliminar esta oferta?")) {
    return;
  }

  const { error } = await supabaseAdmin
    .from("ofertas")
    .delete()
    .eq("id", id);

  if (error) {
    alert("Error al eliminar la oferta: " + error.message);
    return;
  }

  alert("Oferta eliminada correctamente.");
  cargarListaOfertas();
});
document.getElementById("listaOfertas").addEventListener("click", async (e) => {
  const boton = e.target.closest(".btn-editar-oferta");

  if (!boton) return;

  const id = boton.dataset.id;

  const { data: oferta, error } = await supabaseAdmin
    .from("ofertas")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    alert("Error al cargar la oferta: " + error.message);
    return;
  }

  document.getElementById("ofertaEditando").value = oferta.id;
  document.getElementById("ofertaTitulo").value = oferta.titulo;
  document.getElementById("ofertaDescripcion").value = oferta.descripcion || "";
  document.getElementById("ofertaVencimiento").value = oferta.fecha_vencimiento || "";

  document.getElementById("btnGuardarOferta").textContent = "Guardar cambios";

  document.getElementById("formOferta").scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
});
const formNovedad = document.getElementById("formNovedad");

formNovedad.addEventListener("submit", async (e) => {
  e.preventDefault();

  const titulo = document.getElementById("novedadTitulo").value.trim();
  const contenido = document.getElementById("novedadContenido").value.trim();
  const imagen = document.getElementById("novedadImagen").files[0];
  const idEditando = document.getElementById("novedadEditando").value;

if (idEditando) {
  if (!titulo || !contenido) {
    alert("Completá el título y el contenido.");
    return;
  }

  const boton = document.getElementById("btnGuardarNovedad");
  boton.disabled = true;

  try {
    const cambios = {
      titulo,
      contenido
    };

    // Reemplazar la fotografía solamente si se selecciona otra
    if (imagen) {
      const nombreArchivo = `${crypto.randomUUID()}-${imagen.name}`;

      const { error: errorImagen } = await supabaseAdmin.storage
        .from("proyectos")
        .upload(nombreArchivo, imagen);

      if (errorImagen) throw errorImagen;

      const { data: imagenPublica } = supabaseAdmin.storage
        .from("proyectos")
        .getPublicUrl(nombreArchivo);

      cambios.imagen = imagenPublica.publicUrl;
    }

    const { data, error } = await supabaseAdmin
      .from("novedades")
      .update(cambios)
      .eq("id", idEditando)
      .select("id");

    if (error) throw error;

    if (!data?.length) {
      throw new Error("No se pudo actualizar la novedad. Verificá los permisos.");
    }

    alert("¡Novedad actualizada correctamente!");

    formNovedad.reset();
    document.getElementById("novedadEditando").value = "";
    document.getElementById("btnGuardarNovedad").textContent = "Publicar novedad";

    cargarListaNovedades();

  } catch (error) {
    alert("Error al actualizar la novedad: " + error.message);
  } finally {
    boton.disabled = false;
  }

  return;
}

  if (!titulo || !contenido) {
    alert("Completá el título y el contenido.");
    return;
  }

  const boton = document.getElementById("btnGuardarNovedad");
  boton.disabled = true;

  try {
    let urlImagen = null;

    // La fotografía es opcional
    if (imagen) {
      const nombreArchivo = `${crypto.randomUUID()}-${imagen.name}`;

      const { error: errorImagen } = await supabaseAdmin.storage
        .from("proyectos")
        .upload(nombreArchivo, imagen);

      if (errorImagen) throw errorImagen;

      const { data } = supabaseAdmin.storage
        .from("proyectos")
        .getPublicUrl(nombreArchivo);

      urlImagen = data.publicUrl;
    }

    const { error } = await supabaseAdmin
      .from("novedades")
      .insert({
        titulo,
        contenido,
        imagen: urlImagen,
        visible: true
      });

    if (error) throw error;

    alert("¡Novedad publicada correctamente!");
    formNovedad.reset();
    cargarListaNovedades();

  } catch (error) {
    alert("Error al publicar la novedad: " + error.message);
  } finally {
    boton.disabled = false;
  }
});
async function cargarListaNovedades() {
  const { data, error } = await supabaseAdmin
    .from("novedades")
    .select("*")
    .order("creado_en", { ascending: false });

  if (error) {
    console.error("Error al cargar novedades:", error);
    return;
  }

  const lista = document.getElementById("listaNovedades");

  lista.innerHTML = data.length
    ? data.map(novedad => `
        <div class="proyecto-admin">
          ${novedad.imagen
            ? `<img src="${novedad.imagen}" alt="Imagen de novedad">`
            : ""}

          <div class="proyecto-admin-info">
            <h3>${novedad.titulo}</h3>
            <p>${novedad.contenido || ""}</p>

            <div class="acciones-proyecto">
              <button
                type="button"
                class="btn-editar-novedad"
                data-id="${novedad.id}">
                ✏️ Editar
              </button>

              <button
                type="button"
                class="btn-eliminar-novedad"
                data-id="${novedad.id}">
                🗑️ Eliminar
              </button>
            </div>
          </div>
        </div>
      `).join("")
    : "<p>Todavía no hay novedades publicadas.</p>";
}
document.getElementById("listaNovedades").addEventListener("click", async (e) => {
  const boton = e.target.closest(".btn-eliminar-novedad");

  if (!boton) return;

  const id = boton.dataset.id;

  if (!confirm("¿Seguro que querés eliminar esta novedad?")) {
    return;
  }

  boton.disabled = true;

  const { data, error } = await supabaseAdmin
    .from("novedades")
    .delete()
    .eq("id", id)
    .select("id");

  if (error || !data?.length) {
    alert("No se pudo eliminar la novedad: " + (error?.message || "Verificá los permisos."));
    boton.disabled = false;
    return;
  }

  alert("¡Novedad eliminada correctamente!");
  cargarListaNovedades();
});
document.getElementById("listaNovedades").addEventListener("click", async (e) => {
  const boton = e.target.closest(".btn-editar-novedad");

  if (!boton) return;

  const id = boton.dataset.id;

  const { data: novedad, error } = await supabaseAdmin
    .from("novedades")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    alert("Error al cargar la novedad: " + error.message);
    return;
  }

  document.getElementById("novedadEditando").value = novedad.id;
  document.getElementById("novedadTitulo").value = novedad.titulo;
  document.getElementById("novedadContenido").value = novedad.contenido || "";

  // Limpiar la selección de imagen anterior
  document.getElementById("novedadImagen").value = "";

  // Cambiar el texto del botón
  document.getElementById("btnGuardarNovedad").textContent = "Guardar cambios";

  // Llevar al administrador hasta el formulario
  document.getElementById("formNovedad").scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
});
// Cargar la presentación actual
async function cargarNosotrosAdmin() {
  const { data, error } = await supabaseAdmin
    .from("contenido_nosotros")
    .select("texto")
    .eq("id", 1)
    .single();

  if (error) {
    console.error("Error al cargar Nosotros:", error);
    return;
  }

  document.getElementById("nosotrosEditor").value = data.texto;
}

// Guardar los cambios
document.getElementById("formNosotros").addEventListener("submit", async (e) => {
  e.preventDefault();

  const texto = document.getElementById("nosotrosEditor").value.trim();
  const boton = document.getElementById("btnGuardarNosotros");

  if (!texto) {
    alert("Escribí una presentación.");
    return;
  }

  boton.disabled = true;

  const { data, error } = await supabaseAdmin
    .from("contenido_nosotros")
    .update({
      texto,
      actualizado_en: new Date().toISOString()
    })
    .eq("id", 1)
    .select("id");

  boton.disabled = false;

  if (error || !data?.length) {
    alert("No se pudo guardar: " + (error?.message || "Verificá los permisos."));
    return;
  }

  alert("¡Presentación actualizada correctamente!");
});