// app.js
const charactersMap = new Map();

async function cargarPersonajes(nombre = "") {
  const gallery = document.getElementById("gallery");
  gallery.innerHTML = "<p class='col-span-full text-center'>Cargando personajes...</p>";

  try {
    const url = nombre
      ? `https://rickandmortyapi.com/api/character/?name=${encodeURIComponent(nombre)}`
      : "https://rickandmortyapi.com/api/character";

    const res = await fetch(url);
    if (!res.ok) {
      const msg = res.status === 404 ? 'No se encontraron personajes' : 'Error al consultar la API';
      gallery.innerHTML = `<p class="col-span-full text-center text-red-500">${msg}</p>`;
      return;
    }

    const data = await res.json();
    if (!data.results || data.results.length === 0) {
      gallery.innerHTML = `<p class="col-span-full text-center text-red-500">No hay personajes</p>`;
      return;
    }

    // genera html
    charactersMap.clear();
    data.results.forEach(p => charactersMap.set(String(p.id), p));

    gallery.innerHTML = data.results.map(p => `
      <div class="card bg-white rounded shadow p-2 text-center cursor-pointer" data-id="${p.id}">
        <img src="${p.image}" alt="${p.name}" class="w-full h-auto rounded mb-2 shadow" loading="lazy">
        <h2 class="font-bold">${p.name}</h2>
        <p class="text-sm text-gray-600">${p.status} - ${p.species}</p>
      </div>
    `).join('');

    // tarjetas 
    gallery.querySelectorAll('.card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        const personaje = charactersMap.get(String(id));
        if (personaje) mostrarModal(personaje);
      });
    });

  } catch (err) {
    console.error(err);
    gallery.innerHTML = `<p class="col-span-full text-center text-red-500">Error: ${err.message}</p>`;
  }
}

async function mostrarModal(p) {
  // Imagen y nombre
  document.getElementById("modalImg").src = p.image;
  document.getElementById("modalImg").alt = p.name;
  document.getElementById("modalNombre").textContent = p.name;

  // Datos de tarjeta
  let htmlInfo = `
    <strong>Status:</strong> ${p.status}<br>
    <strong>Especie:</strong> ${p.species}<br>
    <strong>Género:</strong> ${p.gender}<br>
    <strong>Origen:</strong> ${p.origin?.name || '—'}<br>
    <strong>Ubicación:</strong> ${p.location?.name || '—'}<br>
  `;

  // episodio de aparicion
  if (p.episode && p.episode.length > 0) {
    try {
      const res = await fetch(p.episode[0]); // URL del primer episodio
      const ep = await res.json();
      htmlInfo += `<strong>Primera aparición:</strong> ${ep.name} (Ep: ${ep.episode})`;
    } catch (err) {
      console.error("Error cargando episodio:", err);
      htmlInfo += `<strong>Primera aparición:</strong> No disponible`;
    }
  }


  document.getElementById("modalInfo").innerHTML = htmlInfo;

  document.getElementById("modal").classList.remove("hidden");
}


document.addEventListener("DOMContentLoaded", () => {

  cargarPersonajes();

  // boton buscar
  document.getElementById("btnBuscar").addEventListener("click", () => {
    const palabra = document.getElementById("searchInput").value.trim();
    cargarPersonajes(palabra);
  });

  // enter
  document.getElementById("searchInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      document.getElementById("btnBuscar").click();
    }
  });

  // Cerrar boton
  document.getElementById("cerrarModal").addEventListener("click", () => {
    document.getElementById("modal").classList.add("hidden");
  });

  // Cerrar clickeando afuera
  document.getElementById("modal").addEventListener("click", (e) => {
    if (e.target.id === 'modal') document.getElementById("modal").classList.add("hidden");
  });

  // Cerrar con esc
  document.addEventListener("keydown", (e) => {
    if (e.key === 'Escape') document.getElementById("modal").classList.add("hidden");
  });
});
