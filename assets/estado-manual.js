// Marcado manual del estado de cada clase (vista, preparada, dada, etc.)
// Independiente del progreso.js automático (que vive dentro de cada
// presentación). Esto es solo para el índice, para llevar el control
// a mano sin depender de que Reveal detecte bien el avance.
//
// El estado se guarda en assets/estado-clases.json (a través del
// endpoint /api/estado que agrega bs-config.cjs al dev server), no en
// localStorage: así el archivo viaja con git y llega igual con un
// simple pull en cualquier máquina. Por eso esto solo funciona
// corriendo el dev server (bun run dev) — con file:// no hay forma de
// que el navegador escriba en el proyecto.
(function () {
  const ESTADOS = {
    "no-vista": { etiqueta: "No vista", color: "#555555" },
    "preparada": { etiqueta: "Preparada, no dada", color: "#e0a030" },
    "dada": { etiqueta: "Dada", color: "#4caf50" },
    "pausada": { etiqueta: "Pausada / interrumpida", color: "#3a8fd0" },
  };

  let estadoGlobal = null; // se llena con GET /api/estado antes de construir la UI

  function claveDe(materia, clase) {
    return `${materia}:clase-${clase}`;
  }

  async function cargarEstado() {
    try {
      const resp = await fetch("/api/estado");
      if (!resp.ok) throw new Error("respuesta no OK");
      return await resp.json();
    } catch (e) {
      console.warn(
        "No se pudo leer assets/estado-clases.json (¿está corriendo `bun run dev`?)",
        e
      );
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
      console.warn("No se pudo guardar el estado en assets/estado-clases.json", e);
    }
  }

  function aplicarEstilo(a, datos) {
    const estado = datos.estado || "no-vista";
    Object.keys(ESTADOS).forEach((k) => a.classList.remove("estado-" + k));
    a.classList.add("estado-" + estado);
    a.style.borderLeftColor = datos.color || ESTADOS[estado].color;
  }

  function mostrarNotaEnLink(a, nota) {
    let span = a.querySelector(".nota-inline");
    if (!nota) {
      if (span) span.remove();
      return;
    }
    if (!span) {
      span = document.createElement("span");
      span.className = "nota-inline";
      a.appendChild(span);
    }
    span.textContent = ` — ${nota}`;
  }

  function crearFila(a) {
    const match = a.getAttribute("href").match(/materias\/([^/]+)\/clase-(\d+)\.html/);
    if (!match) return;
    const [, materia, clase] = match;
    const clave = claveDe(materia, clase);

    const fila = document.createElement("div");
    fila.className = "clase-row";
    a.replaceWith(fila);
    fila.appendChild(a);

    const boton = document.createElement("button");
    boton.className = "editar-btn";
    boton.type = "button";
    boton.title = "Editar estado";
    boton.textContent = "✎";
    fila.appendChild(boton);

    const panel = document.createElement("div");
    panel.className = "editar-panel";

    const selectEstado = document.createElement("select");
    Object.entries(ESTADOS).forEach(([valor, info]) => {
      const opt = document.createElement("option");
      opt.value = valor;
      opt.textContent = info.etiqueta;
      selectEstado.appendChild(opt);
    });

    const inputColor = document.createElement("input");
    inputColor.type = "color";

    const inputNota = document.createElement("input");
    inputNota.type = "text";
    inputNota.placeholder = "Nota (ej: hasta la diapositiva 10, pendiente por...)";

    const labelEstado = document.createElement("label");
    labelEstado.textContent = "Estado";
    labelEstado.appendChild(selectEstado);

    const labelColor = document.createElement("label");
    labelColor.textContent = "Color (opcional, sobrescribe el del estado)";
    labelColor.appendChild(inputColor);

    const labelNota = document.createElement("label");
    labelNota.textContent = "Nota / hasta dónde va";
    labelNota.appendChild(inputNota);

    panel.appendChild(labelEstado);
    panel.appendChild(labelColor);
    panel.appendChild(labelNota);

    fila.insertAdjacentElement("afterend", panel);

    const datos = estadoGlobal[clave] || { estado: "no-vista", color: "", nota: "" };
    selectEstado.value = datos.estado || "no-vista";
    inputColor.value = datos.color || ESTADOS[selectEstado.value].color;
    inputNota.value = datos.nota || "";
    aplicarEstilo(a, datos);
    mostrarNotaEnLink(a, datos.nota);

    function actualizar() {
      const nuevo = {
        estado: selectEstado.value,
        color: inputColor.value,
        nota: inputNota.value,
      };
      estadoGlobal[clave] = nuevo;
      aplicarEstilo(a, nuevo);
      mostrarNotaEnLink(a, nuevo.nota);
      guardarEstado();
    }

    selectEstado.addEventListener("change", () => {
      inputColor.value = ESTADOS[selectEstado.value].color;
      actualizar();
    });
    inputColor.addEventListener("input", actualizar);
    inputNota.addEventListener("change", actualizar);

    boton.addEventListener("click", () => {
      panel.classList.toggle("abierto");
    });
  }

  function mostrarAvisoSinServidor() {
    const aviso = document.createElement("p");
    aviso.style.cssText = "color:#e0a030;font-size:0.85rem;text-align:center;";
    aviso.textContent =
      "No se pudo conectar con assets/estado-clases.json. Corré \"bun run dev\" para poder editar el estado de las clases.";
    document.body.insertBefore(aviso, document.body.firstChild);
  }

  document.addEventListener("DOMContentLoaded", async () => {
    estadoGlobal = await cargarEstado();
    if (estadoGlobal === null) {
      mostrarAvisoSinServidor();
      return;
    }
    document.querySelectorAll('a[href*="/clase-"]').forEach(crearFila);
  });
})();
