// CONFIGURACIÓN SUPABASE
const SUPABASE_URL = 'https://nwivobbeorubrotxgalr.supabase.co'; 
const SUPABASE_KEY = 'Sb_publishable_SDWDL5sRPlktWzF9ghQOZA_obNCXDsJ'; 
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
    highlightRepeated(); // Ejecuta el resaltado cada vez que escribes
}

async function autoSave(id, value) {
    const status = document.getElementById('save-status');
    status.innerText = "Sincronizando...";
    await _supabase.from('resultados').upsert({ celda_id: selectedDate + "_" + id, valor: value });
    status.innerText = "✓ En la Nube";
    highlightRepeated();
}

async function loadFromSupabase() {
    const { data } = await _supabase.from('resultados').select('*');
    if (data) {
        data.forEach(item => {
            if(item.celda_id.startsWith(selectedDate)) {
                const rid = item.celda_id.split('_')[1];
                const el = document.getElementById(rid);
                if (el) {
                    el.value = item.valor;
                    const div = document.getElementById('animal-' + rid);
                    if (animals[item.valor]) div.innerText = animals[item.valor];
                }
            }
        });
        highlightRepeated();
    }
}

// NUEVA FUNCIÓN: RESALTAR NÚMEROS REPETIDOS
function highlightRepeated() {
    const inputs = document.querySelectorAll('.cell-input');
    const counts = {};
    
    // Contar cuántas veces sale cada número
    inputs.forEach(input => {
        const val = input.value.trim();
        if (val !== "") counts[val] = (counts[val] || 0) + 1;
    });

    // Cambiar color si se repite (más de 1 vez)
    inputs.forEach(input => {
        const val = input.value.trim();
        if (counts[val] > 1) {
            input.style.backgroundColor = "rgba(253, 216, 53, 0.3)"; // Fondo amarillento
            input.style.color = "#fdd835"; // Texto oro
            input.style.boxShadow = "0 0 10px #fdd835";
        } else {
            input.style.backgroundColor = "#111";
            input.style.color = "#39ff14";
            input.style.boxShadow = "none";
        }
    });
}

// NUEVA FUNCIÓN: BUSCAR POR MES
async function searchByMonth() {
    const month = prompt("Ingresa el mes y año (Ejemplo: 2026-03)");
    if (!month) return;

    const { data, error } = await _supabase.from('resultados').select('*').like('celda_id', `${month}%`);
    if (data && data.length > 0) {
        alert(`Se encontraron ${data.length} resultados en el mes ${month}. Mira la consola para el detalle o usa el calendario para navegar.`);
        console.table(data); // Esto te muestra una tabla profesional en las herramientas de Google
    } else {
        alert("No hay datos para ese mes.");
    }
}

function changeDate() { selectedDate = document.getElementById('date-picker').value; updateTable(); }
function resetWeek() { if(confirm("¿Limpiar pantalla?")) updateTable(); }
window.onload = initApp;
