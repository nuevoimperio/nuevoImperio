const db = supabase.createClient('https://btbnhkrvyjpmxinimkuw.supabase.co', 'sb_publishable_U1drktxOUQHK9Y_Yc9byaA_hZ_m6aIW');
const grid = document.getElementById('modularGrid'), estado = document.getElementById('modularEstado');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const box = document.getElementById('modularLightbox'), lbImage = document.getElementById('lbImage'), lbCaption = document.getElementById('lbCaption');
let galeria = [], indice = 0, anterior = null;
function mostrar(i) { if (!galeria.length) return; indice = (i + galeria.length) % galeria.length; lbImage.src = galeria[indice].url; lbImage.alt = galeria[indice].nombre; lbCaption.textContent = `${galeria[indice].nombre} · ${indice + 1} de ${galeria.length}` }
function abrir(fotos, i) { galeria = fotos; anterior = document.activeElement; mostrar(i); box.hidden = false; document.body.style.overflow = 'hidden'; document.getElementById('lbClose').focus() }
function cerrar() { box.hidden = true; document.body.style.overflow = ''; lbImage.removeAttribute('src'); anterior?.focus() }
document.getElementById('lbClose').onclick = cerrar;
document.getElementById('lbPrev').onclick = () => mostrar(indice - 1);
document.getElementById('lbNext').onclick = () => mostrar(indice + 1);
box.addEventListener('click', e => { if (e.target === box) cerrar() });
document.addEventListener('keydown', e => { if (box.hidden) return; if (e.key === 'Escape') cerrar(); if (e.key === 'ArrowLeft') mostrar(indice - 1); if (e.key === 'ArrowRight') mostrar(indice + 1) });
async function cargar() {
  
    // ==========================================
    // 1. CARGAR VIVIENDAS DESDE SUPABASE
    // ==========================================

    const { data, error } = await db
        .from('viviendas_modulares')
        .select('*,viviendas_modulares_imagenes(*)')
        .eq('publicado', true)
        .order('orden');

    if (error) {
        estado.textContent = 'No se pudieron cargar las viviendas.';
        console.error(error);
        return;
    }

    if (!data?.length) {
        estado.textContent = 'Próximamente: nuevos desarrollos modulares.';
        return;
    }

    estado.hidden = true;

    // Si la URL tiene ?id=..., mostrar solo esa vivienda
    const viviendaId = new URLSearchParams(window.location.search).get('id');
    const viviendas = viviendaId
        ? data.filter(v => String(v.id) === viviendaId)
        : data;

    if (!viviendas.length) {
        estado.hidden = false;
        estado.textContent = 'No se encontró la vivienda solicitada.';
        return;
    }

    for (const v of viviendas) {

        // ==========================================
        // 2. ORGANIZAR FOTOGRAFÍAS Y PLANOS
        // ==========================================

        const fotos = (v.viviendas_modulares_imagenes || [])
            .filter(i => i.tipo === 'foto')
            .sort((a, b) => (a.orden || 0) - (b.orden || 0));

        const planos = (v.viviendas_modulares_imagenes || [])
            .filter(i => i.tipo === 'plano')
            .sort((a, b) => (a.orden || 0) - (b.orden || 0));

        const imagenes = [
            ...(v.imagen_portada
                ? [{ url: v.imagen_portada, nombre: 'Imagen principal' }]
                : []),

            ...fotos.map(i => ({
                url: i.url,
                nombre: i.epigrafe || 'Fotografía'
            })),

            ...planos.map(i => ({
                url: i.url,
                nombre: i.epigrafe || 'Plano'
            }))
        ];

        // ==========================================
        // 3. FICHA TÉCNICA
        // ==========================================

        const specs = [
            ['Superficie', v.superficie_m2 ? `${v.superficie_m2} m²` : null],
            ['Ambientes', v.ambientes],
            ['Dimensiones', v.dimensiones],
            ['Sistema constructivo', v.sistema_constructivo],
            ['Materiales', v.materiales],
            ['Instalaciones', v.instalaciones],
            ['Terminaciones', v.terminaciones],
            ['Observaciones', v.observaciones]
        ].filter(x => x[1]);

        // ==========================================
        // 4. CREAR TARJETA DE VIVIENDA
        // ==========================================

        const card = document.createElement('article');
        card.className = 'modular-card';

        card.innerHTML = `

            <!-- IMAGEN PRINCIPAL -->

            ${imagenes.length ? `
                <img
                    class="modular-cover"
                    src="${esc(imagenes[0].url)}"
                    alt="${esc(v.titulo)}"
                    loading="lazy"
                    tabindex="0"
                    role="button"
                    aria-label="Ampliar imagen principal"
                >
            ` : ''}

            <div class="modular-content">

                <!-- TÍTULO Y DESCRIPCIÓN -->

                <h2>${esc(v.titulo)}</h2>

                <p class="modular-description">
                    ${esc(v.descripcion)}
                </p>

                <!-- FICHA TÉCNICA -->

                ${specs.length ? `
                    <h3 class="modular-section-title">
                        Ficha técnica
                    </h3>

                    <div class="modular-specs">
                        ${specs.map(([k, val]) => `
                            <div class="modular-spec">
                                <strong>${esc(k)}</strong>
                                <span>${esc(val)}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                <!-- GALERÍA DE FOTOGRAFÍAS -->

                ${fotos.length ? `
                    <h3 class="modular-section-title">
                        Galería de fotografías
                    </h3>

                    <div class="modular-gallery" data-type="foto">
                        ${fotos.map((i, n) => `
                            <button
                                type="button"
                                class="modular-photo"
                                data-index="${(v.imagen_portada ? 1 : 0) + n}"
                                aria-label="Ampliar fotografía ${n + 1}"
                            >
                               <img src="${esc(i.url)}" alt="${esc(i.epigrafe||'Fotografía')}" loading="lazy">
                            </button>
                        `).join('')}
                    </div>
                ` : ''}

                <!-- PLANOS -->

                ${planos.length ? `
                    <h3 class="modular-section-title">
                        Planos
                    </h3>

                    <div class="modular-gallery" data-type="plano">
                        ${planos.map((i, n) => `
                            <button
                                type="button"
                                class="modular-photo"
                                data-index="${(v.imagen_portada ? 1 : 0) + fotos.length + n}"
                                aria-label="Ampliar plano ${n + 1}"
                            >
                               <img src="${esc(i.url)}" alt="${esc(i.epigrafe||'Plano')}" loading="lazy">
                            </button>
                        `).join('')}
                    </div>
                ` : ''}

                <!-- BOTÓN WHATSAPP -->

                <a
                    class="modular-whatsapp"
                    href="https://wa.me/5492241493976?text=${encodeURIComponent('Hola, quisiera consultar por ' + v.titulo)}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Consultar por WhatsApp
                </a>

            </div>
        `;

        // ==========================================
        // 5. ACTIVAR GALERÍA Y VISOR DE IMÁGENES
        // ==========================================

        card.querySelectorAll('[data-index]').forEach(btn => {
            btn.addEventListener('click', () => {
                abrir(imagenes, Number(btn.dataset.index));
            });
        });

        const cover = card.querySelector('.modular-cover');

        if (cover) {
            cover.addEventListener('click', () => abrir(imagenes, 0));

            cover.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    abrir(imagenes, 0);
                }
            });
        }

        grid.append(card);
    }
}

// ==========================================
// 6. MENÚ DE NAVEGACIÓN
// ==========================================

const menu = document.getElementById('menuBtn');
const links = document.getElementById('navLinks');

menu?.addEventListener('click', () => {
    const open = links.classList.toggle('open');

    menu.setAttribute('aria-expanded', String(open));
    menu.textContent = open ? '×' : '☰';
});

// ==========================================
// 7. INICIAR CARGA
// ==========================================

cargar();
