class TeamApp {
    constructor() {
        this.data = [];
        this.map = L.map('map').setView([41.3879, 2.16992], 6);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);

        this.fileInput = document.getElementById('csvFile');
        this.filterType = document.getElementById('filterType');
        this.orderType = document.getElementById('orderType');
        this.searchInput = document.getElementById('search');
        this.clearButton = document.getElementById('clearButton');
        this.dropArea = document.getElementById('drop-area');
        this.list = document.getElementById("list");

        // Agregar eventos
        this.addEventListeners();
    }

    addEventListeners() {
        this.fileInput.addEventListener('change', (event) => this.handleFile(event));
        this.filterType.addEventListener('change', () => this.filterList());
        this.orderType.addEventListener('change', () => this.sortList());
        this.searchInput.addEventListener('input', () => this.filterList());
        this.clearButton.addEventListener('click', () => this.clearAll());

        // arrastrar y soltar droparea
        this.dropArea.addEventListener('dragover', (event) => this.handleDragOver(event));
        this.dropArea.addEventListener('dragleave', () => this.handleDragLeave());
        this.dropArea.addEventListener('drop', (event) => this.handleDrop(event));
    }

    handleFile(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const rows = e.target.result.split("\n").slice(1);
            this.data = rows.map(row => {
                const [name, city, champions, laliga, copadelrey, lat, lon] = row.split(",");
                return {
                    name,
                    city,
                    champions: parseInt(champions) || 0,
                    laliga: parseInt(laliga) || 0,
                    copadelrey: parseInt(copadelrey) || 0,
                    lat: parseFloat(lat) || 0,
                    lon: parseFloat(lon) || 0
                };
            });
            this.renderList(this.data);
        };
        reader.readAsText(file);
    }

    renderList(filteredData) {
        this.list.innerHTML = "";
        filteredData.forEach(team => {
            const li = document.createElement("li");
            li.textContent = `${team.name} - ${team.city}`;
            li.addEventListener("click", () => this.showOnMap(team));
            this.list.appendChild(li);
        });
    }

    filterList() {
        const filterType = this.filterType.value;
        const search = this.searchInput.value.toLowerCase();
        let filtered = this.data;

        if (filterType === "champions") {
            filtered = this.data.filter(team => team.champions > 0);
        } else if (filterType === "laliga") {
            filtered = this.data.filter(team => team.laliga > 0 && team.champions === 0);
        } else if (filterType === "copadelrey") {
            filtered = this.data.filter(team => team.copadelrey > 0 && team.champions === 0);
        }

        filtered = filtered.filter(team => team.name.toLowerCase().includes(search));
        this.renderList(filtered);
    }

    sortList() {
        const order = this.orderType.value;
        this.data.sort((a, b) => order === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
        this.renderList(this.data);
    }

    showOnMap(team) {
        this.map.setView([team.lat, team.lon], 10);
        L.marker([team.lat, team.lon]).addTo(this.map)
            .bindPopup(`<b>${team.name}</b><br>${team.city}`)
            .openPopup();
    }

    clearAll() {
        this.list.innerHTML = "";
        this.filterType.value = "all";
        this.orderType.value = "asc";
        this.searchInput.value = "";
    }

    handleDragOver(event) {
        event.preventDefault();
        this.dropArea.style.background = "#e3e3e3";
    }

    handleDragLeave() {
        this.dropArea.style.background = "";
    }

    handleDrop(event) {
        event.preventDefault();
        this.dropArea.style.background = "";

        const file = event.dataTransfer.files[0];

        if (file && file.type === "text/csv") {
            this.fileInput.files = event.dataTransfer.files;
            this.handleFile({ target: this.fileInput });
        } else {
            alert("Por favor, suelta un archivo CSV válido.");
        }
    }
}

document.addEventListener("DOMContentLoaded", () => new TeamApp());
