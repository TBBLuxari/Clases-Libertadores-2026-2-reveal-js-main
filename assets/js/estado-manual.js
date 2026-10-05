// Índice principal: arma las dos pantallas (materias -> clases) a partir de
// los <section>/<a> de index.html y pinta el estado manual de cada clase
// (vista, preparada, dada, etc.). Independiente del progreso.js automático
// (que vive dentro de cada presentación).
//
// El estado se guarda en assets/datos/estado-clases.json (a través del
// endpoint /api/estado que agrega bs-config.cjs al dev server), no en
// localStorage: así el archivo viaja con git y llega igual con un
// simple pull en cualquier máquina. Por eso editar solo funciona
// corriendo el dev server (bun run dev) — con file:// no hay forma de
// que el navegador escriba en el proyecto. Navegar sí funciona siempre.
(function () {
  const ESTADOS = {
    "no-vista": { etiqueta: "No vista", icono: "⚪", color: "#bdbdbd" },
    "preparada": { etiqueta: "Preparada", icono: "🟠", color: "#ffb347" },
    "dada": { etiqueta: "Dada", icono: "✅", color: "#6bd968" },
    "pausada": { etiqueta: "Pausada", icono: "⏸️", color: "#5aa9f0" },
  };
  const SIN_SELLO = "no-vista";

  let estadoGlobal = null; // se llena con GET /api/estado
  let editable = false;
  const materias = []; // { id, nombre, icono, color, clases: [{href, numero, clave}] }

  const $ = (id) => document.getElementById(id);

  function crear(tag, clase, texto) {
    const el = document.createElement(tag);
    if (clase) el.className = clase;
    if (texto !== undefined) el.textContent = texto;
    return el;
  }

  function leerMaterias() {
    document.querySelectorAll("#datos section").forEach((s) => {
      const id = s.dataset.id;
      const clases = [...s.querySelectorAll("a")].map((a) => {
        const numero = Number(a.getAttribute("href").match(/clase-(\d+)/)[1]);
        return { href: a.getAttribute("href"), numero, clave: `${id}:clase-${String(numero).padStart(2, "0")}` };
      });
      materias.push({ id, nombre: s.dataset.nombre, icono: s.dataset.icono, color: s.dataset.color, clases });
    });
  }

  async function cargarEstado() {
    try {
      const resp = await fetch("/api/estado");
      if (!resp.ok) throw new Error("respuesta no OK");
      return await resp.json();
    } catch (e) {
      console.warn("No se pudo leer assets/datos/estado-clases.json (¿está corriendo `bun run dev`?)", e);
      return null;
    }
  }

  async function guardarEstado() {
    try {
      await fetch("/api/estado", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(estadoGlobal, null, 2),
      });
    } catch (e) {
      console.warn("No se pudo guardar el estado en assets/datos/estado-clases.json", e);
    }
  }

  function datosDe(clave) {
    return (estadoGlobal && estadoGlobal[clave]) || { estado: "no-vista", color: "", nota: "" };
  }

  // ---------- Pantalla 1: tarjetas de materias ----------
  function pintarMaterias() {
    const cont = $("materias");
    cont.replaceChildren();
    materias.forEach((m) => {
      const dadas = m.clases.filter((c) => datosDe(c.clave).estado === "dada").length;
      const tarjeta = crear("a", "materia");
      tarjeta.href = "#" + m.id;
      tarjeta.style.setProperty("--c", m.color);
      const insignia = crear("span", "insignia", m.icono);
      tarjeta.append(insignia, crear("span", "nombre", m.nombre));
      const barra = crear("span", "avance");
      const relleno = document.createElement("i");
      relleno.style.width = (m.clases.length ? (dadas / m.clases.length) * 100 : 0) + "%";
      barra.appendChild(relleno);
      tarjeta.append(barra, crear("span", "conteo", `${dadas} de ${m.clases.length} dadas`));
      cont.appendChild(tarjeta);
    });
  }

  // ---------- Pantalla 2: botones de clases ----------
  function pintarClase(m, c) {
    const datos = datosDe(c.clave);
    const estado = ESTADOS[datos.estado] ? datos.estado : "no-vista";
    const wrap = crear("div", "clase-wrap");
    wrap.style.setProperty("--c", datos.color || ESTADOS[estado].color);

    const a = crear("a");
    a.href = c.href;
    a.append(crear("span", "etiqueta", "Clase"), crear("span", "numero", String(c.numero)));
    if (datos.nota) a.appendChild(crear("span", "nota", datos.nota));
    a.title = ESTADOS[estado].etiqueta + (datos.nota ? " — " + datos.nota : "");
    wrap.appendChild(a);

    if (estado !== SIN_SELLO) wrap.appendChild(crear("span", "sello insignia", ESTADOS[estado].icono));

    if (editable) {
      const lapiz = crear("button", "editar", "✏️");
      lapiz.type = "button";
      lapiz.title = "Editar estado";
      lapiz.addEventListener("click", () => abrirEditor(m, c));
      wrap.appendChild(lapiz);
    }
    return wrap;
  }

  function pintarClases(m) {
    $("detalle-titulo").textContent = `${m.icono} ${m.nombre}`;
    const cont = $("clases");
    cont.replaceChildren(...m.clases.map((c) => pintarClase(m, c)));
  }

  // ---------- Navegación entre pantallas (hash = id de materia) ----------
  function mostrarVista() {
    const m = materias.find((x) => x.id === location.hash.slice(1));
    $("inicio").hidden = !!m;
    $("detalle").hidden = !m;
    if (m) pintarClases(m);
    else pintarMaterias();
    window.scrollTo(0, 0);
  }

  // ---------- Editor ----------
  let editando = null; // { clave, m, c }

  function guardarDesdeEditor(cambios) {
    const actual = datosDe(editando.clave);
    estadoGlobal[editando.clave] = { ...actual, ...cambios };
    guardarEstado();
    pintarClases(editando.m);
  }

  function abrirEditor(m, c) {
    editando = { clave: c.clave, m, c };
    const datos = datosDe(c.clave);
    const estado = ESTADOS[datos.estado] ? datos.estado : "no-vista";
    $("editor-titulo").textContent = `${m.icono} Clase ${c.numero}`;
    $("editor-color").value = datos.color || ESTADOS[estado].color;
    $("editor-nota").value = datos.nota || "";

    const caja = $("editor-estados");
    caja.replaceChildren();
    Object.entries(ESTADOS).forEach(([valor, info]) => {
      const b = crear("button");
      b.type = "button";
      b.className = valor === estado ? "activo" : "";
      b.append(crear("span", "", info.icono), info.etiqueta);
      b.addEventListener("click", () => {
        $("editor-color").value = info.color;
        guardarDesdeEditor({ estado: valor, color: info.color });
        caja.querySelectorAll("button").forEach((x) => x.classList.toggle("activo", x === b));
      });
      caja.appendChild(b);
    });
    $("editor").showModal();
  }

  function iniciarEditor() {
    $("editor-color").addEventListener("input", (e) => guardarDesdeEditor({ color: e.target.value }));
    $("editor-nota").addEventListener("change", (e) => guardarDesdeEditor({ nota: e.target.value }));
    $("editor").addEventListener("click", (e) => {
      if (e.target === $("editor")) $("editor").close(); // clic fuera = cerrar
    });
  }

  function mostrarAvisoSinServidor() {
    const aviso = crear(
      "p",
      "aviso",
      'Sin servidor: no se ve ni se edita el estado de las clases. Corré "bun run dev" para activarlo.'
    );
    document.querySelector("main").prepend(aviso);
  }

  function iniciarTema() {
    const boton = $("tema");
    const pintar = () => {
      const oscuro = document.documentElement.dataset.tema === "oscuro";
      boton.textContent = oscuro ? "☀️" : "🌙";
      boton.title = oscuro ? "Modo claro" : "Modo oscuro";
    };
    boton.addEventListener("click", () => {
      const nuevo = document.documentElement.dataset.tema === "oscuro" ? "claro" : "oscuro";
      document.documentElement.dataset.tema = nuevo;
      try { localStorage.setItem("tema", nuevo); } catch (e) {}
      pintar();
    });
    pintar();
  }

  document.addEventListener("DOMContentLoaded", async () => {
    iniciarTema();
    leerMaterias();
    $("volver").addEventListener("click", () => {
      location.hash = "";
    });
    window.addEventListener("hashchange", mostrarVista);
    iniciarEditor();

    estadoGlobal = await cargarEstado();
    editable = estadoGlobal !== null;
    if (!editable) mostrarAvisoSinServidor();
    mostrarVista();
  });
})();
