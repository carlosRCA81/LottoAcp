const SUPABASE_URL = 'https://tfhbetulmcvlunklzypt.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmaGJldHVsbWN2bHVua2x6eXB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzODUyMzIsImV4cCI6MjA1NTk2MTIzMn0.WOniG3Gv-9iCAsfQ-jS9X2Z2S7m0f-8u9vWvG1-pE_k'; 
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const animals = { "00": "Ballena", "0": "Delfín", "1": "Carnero", "2": "Toro", "3": "Ciempiés", "4": "Alacrán", "5": "León", "6": "Rana", "7": "Perico", "8": "Ratón", "9": "Águila", "10": "Tigre", "11": "Gato", "12": "Caballo", "13": "Mono", "14": "Paloma", "15": "Zorro", "16": "Oso", "17": "Pavo", "18": "Burro", "19": "Chivo", "20": "Cochino", "21": "Gallo", "22": "Camello", "23": "Cebra", "24": "Iguana", "25": "Gallina", "26": "Vaca", "27": "Perro", "28": "Zamuro", "29": "Elefante", "30": "Caimán", "31": "Lapa", "32": "Ardilla", "33": "Pescado", "34": "Venado", "35": "Jirafa", "36": "Culebra" };

const hours = ["8AM", "9AM", "10AM", "11AM", "12PM", "1PM", "2PM", "3PM", "4PM", "5PM", "6PM", "7PM"];
let selectedDate = new Date().toISOString().split('T')[0];

function initApp() {
    document.getElementById('date-picker').value = selectedDate;
    updateTable();
}

function updateTable() {
    const tableBody = document.getElementById('main-table');
    tableBody.innerHTML = "";
    hours.forEach((h, r) => {
        const row = document.createElement('tr');
        let html = `<td class="hour-cell">${h}</td>`;
        for (let c = 0; c < 7; c++) {
            html += `<td>
                <input type="text" class="cell-input" maxlength="2" id="r${r}c${c}" oninput="handleInput(this)" placeholder="-">
                <div class="animal-display" id="animal-r${r}c${c}"></div>
            </td>`;
        }
        row.innerHTML = html;
        tableBody.appendChild(row);
    });
    loadFromSupabase();
}

function handleInput(input) {
    const val = input.value.trim();
    const animalDiv = document.getElementById('animal-' + input.id);
    if (animals[val]) {
        animalDiv.innerText = animals[val];
        autoSave(input.id, val);
    } else if (val === "") {
        animalDiv.innerText = "";
        autoSave(input.id, "");
    }
    highlightDuplicates();
}

async function autoSave(id, value) {
    const status = document.getElementById('save-status');
    status.innerText = "Sincronizando...";
    await _supabase.from('resultados').upsert({ celda_id: selectedDate + "_" + id, valor: value });
    status.innerText = "✓ Datos en la Nube";
}

async function openMonthModal() {
    const modal = document.getElementById('monthModal');
    const dataContainer = document.getElementById('month-data');
    const statsContainer = document.getElementById('month-stats');
    const currentMonth = selectedDate.substring(0, 7); 

    modal.style.display = "block";
    dataContainer.innerHTML = "Consultando...";

    const { data } = await _supabase.from('resultados').select('*').like('celda_id', `${currentMonth}%`);

    if (data) {
        dataContainer.innerHTML = "";
        let counts = {};
        data.sort((a, b) => a.celda_id.localeCompare(b.celda_id));

        data.forEach(item => {
            if (item.valor !== "") {
                const parts = item.celda_id.split('_');
                const fecha = parts[0];
                const hIdx = parseInt(parts[1].substring(1));
                const name = animals[item.valor] || "??";
                counts[name] = (counts[name] || 0) + 1;

                dataContainer.innerHTML += `<tr><td>${fecha.split('-')[2]}</td><td style="color:var(--neon-green)">${name}</td><td>${hours[hIdx]}</td></tr>`;
            }
        });

        const top = Object.entries(counts).sort((a,b) => b[1] - a[1])[0];
        statsContainer.innerHTML = top ? `🎯 Favorito del mes: <b>${top[0]}</b> (${top[1]} veces)` : "Sin datos.";
    }
}

function closeMonthModal() { document.getElementById('monthModal').style.display = "none"; }

function highlightDuplicates() {
    const inputs = document.querySelectorAll('.cell-input');
    const counts = {};
    inputs.forEach(input => {
        const v = input.value.trim();
        if (v !== "" && animals[v]) counts[v] = (counts[v] || 0) + 1;
    });
    inputs.forEach(input => {
        const v = input.value.trim();
        const div = document.getElementById('animal-' + input.id);
        if (counts[v] > 1) {
            input.style.borderColor = "var(--neon-yellow)";
            if (div) div.style.color = "var(--neon-yellow)";
        } else {
            input.style.borderColor = v === "" ? "#444" : "var(--neon-green)";
            if (div) div.style.color = "var(--neon-green)";
        }
    });
}

async function loadFromSupabase() {
    const { data } = await _supabase.from('resultados').select('*').like('celda_id', `${selectedDate}%`);
    if (data) {
        data.forEach(item => {
            const rid = item.celda_id.split('_')[1];
            const el = document.getElementById(rid);
            if (el) {
                el.value = item.valor;
                const div = document.getElementById('animal-' + rid);
                if (animals[item.valor]) div.innerText = animals[item.valor];
            }
        });
        highlightDuplicates();
    }
}

function changeDate() { selectedDate = document.getElementById('date-picker').value; updateTable(); }
function resetWeek() { if(confirm("¿Limpiar pantalla?")) updateTable(); }
window.onload = initApp;
