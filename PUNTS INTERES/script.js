document.getElementById('csvFile').addEventListener('change', handleFile);
document.getElementById('filterType').addEventListener('change', filterList);
document.getElementById('orderType').addEventListener('change', sortList);
document.getElementById('search').addEventListener('input', filterList);

let data = [];
let map = L.map('map').setView([41.3879, 2.16992], 6); // España
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

function handleFile(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const rows = e.target.result.split("\n").slice(1); // Omitimos encabezado
        data = rows.map(row => {
            const [name, city, champions, laliga, copadelrey, lat, lon] = row.split(",");
            return { 
                name, 
                city, 
                champions: parseInt(champions), 
                laliga: parseInt(laliga), 
                copadelrey: parseInt(copadelrey), 
                lat: parseFloat(lat), 
                lon: parseFloat(lon) 
            };
        });
        renderList(data);
    };

    reader.readAsText(file);
}

function renderList(filteredData) {
    const list = document.getElementById("list");
    list.innerHTML = "";

    filteredData.forEach(team => {
        const li = document.createElement("li");
        li.textContent = `${team.name} - ${team.city}`;
        li.addEventListener("click", () => showOnMap(team));
        list.appendChild(li);
    });
}

function filterList() {
    const filterType = document.getElementById("filterType").value;
    const search = document.getElementById("search").value.toLowerCase();

    let filtered = data;

    if (filterType === "champions") {
        filtered = data.filter(team => team.champions > 0);
    } else if (filterType === "laliga") {
        filtered = data.filter(team => team.laliga > 0 && team.champions === 0);
    } else if (filterType === "copadelrey") {
        filtered = data.filter(team => team.copadelrey > 0 && team.champions === 0);
    }

    filtered = filtered.filter(team => team.name.toLowerCase().includes(search));
    
    renderList(filtered);
}

function sortList() {
    const order = document.getElementById("orderType").value;
    data.sort((a, b) => order === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
    renderList(data);
}

function showOnMap(team) {
    map.setView([team.lat, team.lon], 10);
    L.marker([team.lat, team.lon]).addTo(map)
        .bindPopup(`<b>${team.name}</b><br>${team.city}`)
        .openPopup();
}

document.getElementById('clearButton').addEventListener('click', clearAll);

function clearAll() {
    document.getElementById("list").innerHTML = ""; // Borra la lista
    document.getElementById("filterType").value = "all"; // Reinicia el filtro
    document.getElementById("orderType").value = "asc"; // Reinicia la ordenación
    document.getElementById("search").value = ""; // Borra el campo de búsqueda
}

