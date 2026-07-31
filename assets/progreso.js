// Barra de progreso + retomar donde quedamos, por clase.
// Se apoya en localStorage, no requiere servidor ni backend.
(function () 
{
  const match = location.pathname.match(/materias\/([^/]+)\/clase-(\d+)(?:\.html)?/);
  if (!match) return;
  const [, materia, clase] = match;
  const key = `progreso:${materia}:clase-${clase}`;

  function leer() 
  {
    try {
      return JSON.parse(localStorage.getItem(key) || "null") || { maxIndex: -1, total: 0, completado: false };
    } catch {
      return { maxIndex: -1, total: 0, completado: false };
    }
  }

  function guardar(estado) {localStorage.setItem(key, JSON.stringify(estado)); }

  function crearBarra() 
  {
    const contenedor = document.createElement("div");
    contenedor.style.cssText ="position:fixed;left:0;bottom:0;width:100%;height:6px;background:rgba(255,255,255,0.1);z-index:1000;";
    const relleno = document.createElement("div");
    relleno.style.cssText = "height:100%;width:0%;background:#4caf50;transition:width .2s;";
    contenedor.appendChild(relleno);
    document.body.appendChild(contenedor);
    return relleno;
  }

  function actualizarBarra(relleno, estado) 
  {
    const pct = estado.total ? Math.round(((estado.maxIndex + 1) / estado.total) * 100) : 0;
    relleno.style.width = pct + "%";
    relleno.title = `${estado.maxIndex + 1} / ${estado.total} diapositivas vistas`;
  }

  if (typeof Reveal === "undefined") return;
  const relleno = crearBarra();

  function iniciar() 
  {
    const total = Reveal.getTotalSlides();
    const estado = leer();
    estado.total = total;

    if (estado.maxIndex >= 0 && estado.maxIndex < total) 
    {
      Reveal.slide(estado.maxIndex);
    }

    actualizarBarra(relleno, estado);

    Reveal.on("slidechanged", (evento) => {
      estado.maxIndex = Math.max(estado.maxIndex, evento.indexh);
      if (estado.maxIndex >= total - 1) estado.completado = true;
      guardar(estado);
      actualizarBarra(relleno, estado);
    });
  }

  // "ready" puede haber disparado ya antes de que este script cargue
  // (llega al final del body), así que no dependemos solo del evento.
  if (Reveal.isReady && Reveal.isReady()) 
  {
    iniciar();
  } else 
  {
    Reveal.on("ready", iniciar);
  }
})();
