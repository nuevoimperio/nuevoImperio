
(() => {
const db=typeof supabaseAdmin !== 'undefined' ? supabaseAdmin : null;
if(!db){console.error('Cargar js/admin-modulares.js después de js/admin.js');return}
const section=document.createElement('section');section.className='admin-card';section.id='adminModulares';section.style.display='none';
section.innerHTML=`<h2>Administrar Viviendas Modulares</h2>
<form id="modForm"><input type="hidden" id="modId">
<div class="form-grid">
<div class="campo"><label>Título<input id="modTitulo" required></label></div>
<div class="campo"><label>Superficie (m²)<input id="modSuperficie" type="number" min="0.01" step="0.01"></label></div>
<div class="campo"><label>Ambientes<input id="modAmbientes"></label></div>
<div class="campo"><label>Dimensiones<input id="modDimensiones"></label></div>
<div class="campo campo-completo"><label>Descripción<textarea id="modDescripcion"></textarea></label></div>
<div class="campo"><label>Sistema constructivo<textarea id="modSistema"></textarea></label></div>
<div class="campo"><label>Materiales<textarea id="modMateriales"></textarea></label></div>
<div class="campo"><label>Instalaciones<textarea id="modInstalaciones"></textarea></label></div>
<div class="campo"><label>Terminaciones<textarea id="modTerminaciones"></textarea></label></div>
<div class="campo campo-completo"><label>Observaciones<textarea id="modObservaciones"></textarea></label></div>
<div class="campo"><label>Foto de portada<input type="file" id="modPortada" accept="image/*"></label></div>
<div class="campo"><label>Fotos adicionales (múltiples)<input type="file" id="modFotos" accept="image/*" multiple></label></div>
<div class="campo"><label>Planos (imágenes, múltiples)<input type="file" id="modPlanos" accept="image/*" multiple></label></div>
<div class="campo"><label>Orden<input type="number" id="modOrden" value="0"></label></div>
<div class="campo"><label><input type="checkbox" id="modPublicado"> Publicado</label></div></div>
<button class="btn-guardar" type="submit">Guardar vivienda</button> <button type="button" id="modCancelar">Cancelar edición</button></form>
<p id="modMensaje" role="status"></p><h3>Viviendas cargadas</h3><div id="modLista"></div>`;
document.querySelector('.admin-container').append(section);
const $=id=>document.getElementById(id), fields={titulo:'modTitulo',descripcion:'modDescripcion',superficie_m2:'modSuperficie',ambientes:'modAmbientes',dimensiones:'modDimensiones',sistema_constructivo:'modSistema',materiales:'modMateriales',instalaciones:'modInstalaciones',terminaciones:'modTerminaciones',observaciones:'modObservaciones',orden:'modOrden'};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
async function upload(file){const name=`modulares/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`;const {error}=await db.storage.from('proyectos').upload(name,file,{contentType:file.type});if(error)throw error;return db.storage.from('proyectos').getPublicUrl(name).data.publicUrl}
async function listar(){
const {data,error}=await db.from('viviendas_modulares').select('*').order('orden');
if(error){$('modMensaje').textContent=error.message;return}
$('modLista').innerHTML=data.length?data.map(v=>`<div class="proyecto-admin"><div class="proyecto-admin-info"><h3>${esc(v.titulo)}</h3><p>${v.publicado?'Publicado':'Borrador'} · ${esc(v.superficie_m2||'')} m²</p><button type="button" data-edit="${esc(v.id)}">Editar</button> <button type="button" data-delete="${esc(v.id)}">Eliminar</button></div></div>`).join(''):'<p>No hay viviendas cargadas.</p>';
}
async function reset(){ $('modForm').reset();$('modId').value='';$('modMensaje').textContent=''; }
$('modCancelar').onclick=reset;
$('modForm').addEventListener('submit',async e=>{
e.preventDefault();const btn=e.submitter;btn.disabled=true;
try{
const v={};for(const [col,id] of Object.entries(fields))v[col]=$(id).value.trim()||null;
v.superficie_m2=v.superficie_m2?Number(v.superficie_m2):null;v.orden=Number(v.orden||0);v.publicado=$('modPublicado').checked;
if($('modPortada').files[0])v.imagen_portada=await upload($('modPortada').files[0]);
const id=$('modId').value;let saved;
if(id){const r=await db.from('viviendas_modulares').update(v).eq('id',id).select('id').single();if(r.error)throw r.error;saved=r.data}
else{const r=await db.from('viviendas_modulares').insert(v).select('id').single();if(r.error)throw r.error;saved=r.data}
for(const [input,tipo] of [['modFotos','foto'],['modPlanos','plano']]){
for(const file of $(input).files){const url=await upload(file);const r=await db.from('viviendas_modulares_imagenes').insert({vivienda_id:saved.id,url,tipo,epigrafe:file.name});if(r.error)throw r.error}
}
await reset();$('modMensaje').textContent='Vivienda guardada correctamente';await listar();
}catch(err){$('modMensaje').textContent='Error: '+err.message}finally{btn.disabled=false}
});
$('modLista').addEventListener('click',async e=>{
const edit=e.target.closest('[data-edit]'),del=e.target.closest('[data-delete]');
if(edit){const {data,error}=await db.from('viviendas_modulares').select('*').eq('id',edit.dataset.edit).single();if(error)return alert(error.message);$('modId').value=data.id;for(const [col,id] of Object.entries(fields))$(id).value=data[col]??'';$('modPublicado').checked=data.publicado;$('modPortada').value='';$('modFotos').value='';$('modPlanos').value='';section.scrollIntoView({behavior:'smooth'});}
if(del&&confirm('¿Eliminar esta vivienda y sus registros de imágenes?')){const {error}=await db.from('viviendas_modulares').delete().eq('id',del.dataset.delete);if(error)alert(error.message);else listar();}
});
db.auth.onAuthStateChange((event,session)=>{if(session){section.style.display='block';setTimeout(listar,0)}else section.style.display='none'});
db.auth.getSession().then(({data})=>{if(data.session){section.style.display='block';listar()}});
})();
