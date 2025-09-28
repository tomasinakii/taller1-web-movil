const cocktailList = document.getElementById('cocktailList');
const searchInput = document.getElementById('searchInput');
const filterSelect = document.getElementById('filterSelect'); 
const detailModal = document.getElementById('detailModal');
const cocktailDetail = document.getElementById('cocktailDetail');
const closeModal = document.getElementById('closeModal');

let currentDrinks = []; // guardado de la lista que se muestra

// busqueda tiempo real al buscar
searchInput.addEventListener('input', (e) => {
  const query = e.target.value.trim();
  if (query.length > 0) {
    fetchCocktails(query);
  } else {
    cocktailList.innerHTML = '';
  }
});

// filtro de busqueda 
filterSelect.addEventListener('change', () => {
  applyFilter();
});

// llamada a los cocteles de la API
function fetchCocktails(name) {
  if (!name) return;
  cocktailList.innerHTML = '<p class="text-gray-500 text-center col-span-full">Cargando...</p>';

  fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${encodeURIComponent(name)}`)
    .then(res => res.json())
    .then(data => {
      currentDrinks = data.drinks || []; // 🔹 guardar lista actual
      applyFilter(); // 🔹 aplicar filtro sobre la lista
    })
    .catch(err => {
      cocktailList.innerHTML = '<p class="text-red-500 text-center">Error al cargar cócteles</p>';
      console.error(err);
    });
}

// aplica filtros x2
function applyFilter() {
  let filtered = currentDrinks;
  const filterValue = filterSelect.value;
  if (filterValue) {
    filtered = currentDrinks.filter(drink => drink.strAlcoholic === filterValue);
  }
  renderCocktails(filtered);
}

// Muestra los cocteles en la pagina
function renderCocktails(drinks) {
  if (!drinks || drinks.length === 0) {
    cocktailList.innerHTML = '<p class="text-gray-500 text-center">No se encontraron cócteles</p>';
    return;
  }

  cocktailList.innerHTML = drinks.map(drink => `
    <div class="bg-white rounded shadow hover:shadow-lg cursor-pointer" onclick="showDetail('${drink.idDrink}')">
      <img src="${drink.strDrinkThumb}" alt="${drink.strDrink}" class="w-full h-48 object-cover rounded-t">
      <div class="p-2">
        <h2 class="font-semibold text-lg">${drink.strDrink}</h2>
        <p class="text-sm text-gray-600">${drink.strAlcoholic} - ${drink.strCategory}</p>
      </div>
    </div>
  `).join('');
}

// 🔹 Función global para ver detalle en modal
window.showDetail = function(id) {
  fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${id}`)
    .then(res => res.json())
    .then(data => {
      if (!data.drinks || data.drinks.length === 0) {
        cocktailDetail.innerHTML = '<p class="text-red-500">No se pudo cargar el detalle</p>';
        detailModal.classList.remove('hidden');
        return;
      }

      const drink = data.drinks[0];
      const ingredients = [];

      for (let i = 1; i <= 15; i++) {
        const ing = drink[`strIngredient${i}`];
        const measure = drink[`strMeasure${i}`];
        if (ing) ingredients.push(`${measure || ''} ${ing}`);
      }

      cocktailDetail.innerHTML = `
        <h2 class="text-xl font-bold mb-2">${drink.strDrink}</h2>
        <img src="${drink.strDrinkThumb}" alt="${drink.strDrink}" class="w-full h-48 object-cover rounded mb-2">
        <h3 class="font-semibold mb-1">Ingredientes:</h3>
        <ul class="list-disc list-inside mb-2">
          ${ingredients.map(i => `<li>${i}</li>`).join('')}
        </ul>
        <h3 class="font-semibold mb-1">Instrucciones:</h3>
        <p>${drink.strInstructions}</p>
      `;

      detailModal.classList.remove('hidden');
    })
    .catch(err => {
      console.error(err);
      cocktailDetail.innerHTML = '<p class="text-red-500">Error al cargar el detalle</p>';
      detailModal.classList.remove('hidden');
    });
};

// 🔹 cerrar modal
closeModal.addEventListener('click', () => {
  detailModal.classList.add('hidden');
});
detailModal.addEventListener('click', (e) => {
  if (e.target === detailModal) {
    detailModal.classList.add('hidden');
  }
});

