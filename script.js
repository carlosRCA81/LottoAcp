const SUPABASE_URL = 'https://nwivobbeorubrotxgalr.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_SDWDL5sRPlktWzF9ghQOZA_obNCXDsJ'; 
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const animals = { "00": "Ballena", "0": "Delfín", "1": "Carnero", "2": "Toro", "3": "Ciempiés", "4": "Alacrán", "5": "León", "6": "Rana", "7": "Perico", "8": "Ratón", "9": "Águila", "10": "Tigre", "11": "Gato", "12": "Caballo", "13": "Mono", "14": "Paloma", "15": "Zorro", "16": "Oso", "17": "Pavo", "18": "Burro", "19": "Chivo", "20": "Cochino", "21": "Gallo", "22": "Camello", "23": "Cebra", "24": "Iguana", "25": "Gallina", "26": "Vaca", "27": "Perro", "28": "Zamuro", "29": "Elefante", "30": "Caimán", "31": "Lapa", "32": "Ardilla", "33": "Pescado", "34": "Venado", "35": "Jirafa", "36": "Culebra" };

const hours = ["8AM", "9AM", "10AM", "11AM", "12PM", "1PM", "2PM", "3PM", "4PM", "5PM", "6PM", "7PM"];
let currentWeekDays = [];

function initApp() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date-picker').value = today;
    calculateWeek(today);
}

// Función para calcular los 7 días de la semana según la fecha elegida
function calculateWeek(dateStr) {
    const date = new Date(dateStr + "T12:00:00");
    const dayOfWeek = date.getDay(); // 0 (Dom) a 6 (Sab)
    const diff = date.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1); // Ajustar para que lunes sea el inicio
    
    currentWeekDays = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(date);
        d.setDate(diff + i);
        currentWeekDays.push(d.toISOString().split('T')[0]);
    }
    updateTableHeaders();
    updateTable();
}

function updateTableHeaders() {
    const headers = document.getElementById('header-days').children;
    const names = ["L", "M", "M", "J", "V", "S", "D"];
    for (let i = 0; i < 7; i++) {
        const dayNum = currentWeekDays[i].split('-')[2];
        headers[i+1].innerHTML = `${names[i]}<br><small style="font-size:0.5rem; color:#fdd835">${dayNum}</small>`;
    }
}

function updateTable() {
    const tableBody = document.getElementById('main-table');
    tableBody.innerHTML = "";
    hours.forEach((h, r) => {
        const row = document.createElement('tr');
        let html = `<td class="hour-cell">${h}</td>`;
        for (let c = 0; c < 7; c++) {
            // Cada input tiene un ID único basado en su fecha real
            const uniqueId = `${currentWeekDays[c]}_r${r}c${c}`;
            html += `<td>
                <input type="text" class="cell-input" maxlength="2" id="${uniqueId}" oninput="handleInput(this)" placeholder="-">
                <div class="animal-display" id="animal-${uniqueId}"></div>
            </td>`;
        }
        row.innerHTML = html;
        tableBody.appendChild(row);
    });
    loadWeekFromSupabase();
}

function handleInput(input) {
    const val = input.value.trim();
    const animalDiv = document.getElementById('animal-' + input.id);
    animalDiv.innerText = animals[val] || "";
    highlightRepeated();
}

async function saveAllToSupabase() {
    const status = document.getElementById('save-status');
    const inputs = document.querySelectorAll('.cell-input');
    const dataToSave = [];

    status.innerText = "⏳ Sincronizando semana...";
    
    inputs.forEach(input => {
        const val = input.value.trim();
        if (val !== "") {
            dataToSave.push({ celda_id: input.id, valor: val });
        }
    });

    if (dataToSave.length === 0) {
        alert("No hay datos nuevos para guardar.");
        return;
    }

    const { error } = await _supabase.from('resultados').upsert(dataToSave);

    if (error) {
        alert("Error: " + error.message);
    } else {
        status.innerText = "✅ SEMANA GUARDADA";
        setTimeout(() => status.innerText = "Modo Semanario Activo", 3000);
    }
}

async function loadWeekFromSupabase() {
    // Buscamos todos los datos que coincidan con los días de esta semana
    for (const day of currentWeekDays) {
        const { data } = await _supabase.from('resultados').select('*').like('celda_id', `${day}%`);
        if (data) {
            data.forEach(item => {
                const el = document.getElementById(item.celda_id);
                if (el) {
                    el.value = item.valor;
                    const div = document.getElementById('animal-' + item.celda_id);
                    if (animals[item.valor]) div.innerText = animals[item.valor];
                }
            });
        }
    }
    highlightRepeated();
}

function highlightRepeated() {
    const inputs = document.querySelectorAll('.cell-input');
    const counts = {};
    inputs.forEach(input => {
        const val = input.value.trim();
        if (val !== "") counts[val] = (counts[val] || 0) + 1;
    });
    inputs.forEach(input => {
        const val = input.value.trim();
        input.style.color = (counts[val] > 1) ? "#fdd835" : "#39ff14";
        input.style.boxShadow = (counts[val] > 1) ? "0 0 5px #fdd835" : "none";
    });
}

function changeDate() {
    const newDate = document.getElementById('date-picker').value;
    calculateWeek(newDate);
}

function resetWeek() { if(confirm("¿Limpiar vista actual?")) updateTable(); }
window.onload = initApp;
