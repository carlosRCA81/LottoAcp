const SUPABASE_URL = 'https://nwivobbeorubrotxgalr.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_SDWDL5sRPlktWzF9ghQOZA_obNCXDsJ'; 
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const animals = { "00": "Ballena", "0": "Delfín", "1": "Carnero", "2": "Toro", "3": "Ciempiés", "4": "Alacrán", "5": "León", "6": "Rana", "7": "Perico", "8": "Ratón", "9": "Águila", "10": "Tigre", "11": "Gato", "12": "Caballo", "13": "Mono", "14": "Paloma", "15": "Zorro", "16": "Oso", "17": "Pavo", "18": "Burro", "19": "Chivo", "20": "Cochino", "21": "Gallo", "22": "Camello", "23": "Cebra", "24": "Iguana", "25": "Gallina", "26": "Vaca", "27": "Perro", "28": "Zamuro", "29": "Elefante", "30": "Caimán", "31": "Lapa", "32": "Ardilla", "33": "Pescado", "34": "Venado", "35": "Jirafa", "36": "Culebra" };

const hours = ["8AM", "9AM", "10AM", "11AM", "12PM", "1PM", "2PM", "3PM", "4PM", "5PM", "6PM", "7PM"];
const dayLabels = ["L", "M", "M", "J", "V", "S", "D"];
let currentWeekDays = [];

function initApp() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date-picker').value = today;
    calculateWeek(today);
}

// Calcula los 7 días (Lunes a Domingo) de la fecha seleccionada
function calculateWeek(dateStr) {
    const date = new Date(dateStr + "T12:00:00");
    const dayOfWeek = date.getDay(); 
    const diff = date.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
    
    currentWeekDays = [];
    const headerRow = document.getElementById('header-days');
    let headerHtml = '<th>HORA</th>';

    for (let i = 0; i < 7; i++) {
        const d = new Date(date);
        d.setDate(diff + i);
        const dayString = d.toISOString().split('T')[0];
        currentWeekDays.push(dayString);
        
        const dayNum = d.getDate().toString().padStart(2, '0');
        headerHtml += `<th>${dayLabels[i]}<br><small>${dayNum}</small></th>`;
    }
    headerRow.innerHTML = headerHtml;
    updateTable();
}

function updateTable() {
    const tableBody = document.getElementById('main-table');
    tableBody.innerHTML = "";
    hours.forEach((h, r) => {
        const row = document.createElement('tr');
        let html = `<td class="hour-cell">${h}</td>`;
        for (let c = 0; c < 7; c++) {
            // El ID guarda la fecha exacta: ej. "2026-03-09_r0c0"
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

async function loadWeekFromSupabase() {
    let idsToSearch = [];
    currentWeekDays.forEach(day => {
        for(let r=0; r<hours.length; r++) {
            for(let c=0; c<7; c++) idsToSearch.push(`${day}_r${r}c${c}`);
        }
    });

    const { data } = await _supabase.from('resultados').select('*').in('celda_id', idsToSearch);
    if (data) {
        data.forEach(item => {
            const el = document.getElementById(item.celda_id);
            if (el) {
                el.value = item.valor;
                const div = document.getElementById('animal-' + item.celda_id);
                if (animals[item.valor]) div.innerText = animals[item.valor];
            }
        });
        highlightRepeated();
    }
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
    status.innerText = "⏳ Guardando...";
    
    inputs.forEach(input => {
        const val = input.value.trim();
        if (val !== "") dataToSave.push({ celda_id: input.id, valor: val });
    });

    const { error } = await _supabase.from('resultados').upsert(dataToSave);
    if (!error) {
        status.innerText = "✅ SEMANA GUARDADA";
        highlightRepeated();
    }
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
        if (val === "" || counts[val] === 1) {
            input.style.color = "#39ff14";
            input.style.boxShadow = "none";
        } else if (counts[val] === 2) {
            input.style.color = "#fdd835";
            input.style.boxShadow = "0 0 8px #fdd835";
        } else if (counts[val] >= 3) {
            input.style.color = "#ff4444";
            input.style.boxShadow = "0 0 12px #ff4444";
        }
    });
}

function changeDate() { calculateWeek(document.getElementById('date-picker').value); }
function resetView() { if(confirm("¿Limpiar vista?")) updateTable(); }
window.onload = initApp;
