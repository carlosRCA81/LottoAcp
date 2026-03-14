const SUPABASE_URL = 'https://nwivobbeorubrotxgalr.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_SDWDL5sRPlktWzF9ghQOZA_obNCXDsJ'; 
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
    } else if (val === "") {
        animalDiv.innerText = "";
    }
    // IMPORTANTE: Al escribir, recalculamos todos los colores
    highlightRepeated();
}

async function saveAllToSupabase() {
    const status = document.getElementById('save-status');
    const inputs = document.querySelectorAll('.cell-input');
    const dataToSave = [];

    status.innerText = "⏳ Subiendo...";
    
    inputs.forEach(input => {
        const val = input.value.trim();
        if (val !== "") {
            dataToSave.push({ celda_id: selectedDate + "_" + input.id, valor: val });
        }
    });

    if (dataToSave.length === 0) {
        alert("No hay datos nuevos para guardar.");
        return;
    }

    const { error } = await _supabase.from('resultados').upsert(dataToSave);

    if (error) {
        alert("Error de Supabase: " + error.message);
    } else {
        status.innerText = "✅ ¡TODO EN LA NUBE!";
        setTimeout(() => status.innerText = "Sincronizado", 2000);
        // Recalculamos colores después de guardar por seguridad
        highlightRepeated();
    }
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
        // IMPORTANTE: Al cargar los datos, calculamos los colores de la semana
        highlightRepeated();
    }
}

// --- NUEVA LÓGICA DE RESALTADO INTELIGENTE ---
function highlightRepeated() {
    const inputs = document.querySelectorAll('.cell-input');
    const counts = {};

    // 1. Contar cuántas veces aparece cada número en toda la tabla visible
    inputs.forEach(input => {
        const val = input.value.trim();
        if (val !== "") {
            counts[val] = (counts[val] || 0) + 1;
        }
    });

    // 2. Aplicar el color según el conteo
    inputs.forEach(input => {
        const val = input.value.trim();
        
        if (val === "") {
            // Sin número: Fondo negro, texto verde suave
            input.style.color = "#39ff14";
            input.style.backgroundColor = "#111";
            input.style.boxShadow = "none";
        } else if (counts[val] === 1) {
            // Salió 1 vez: Texto verde brillante (normal)
            input.style.color = "#39ff14";
            input.style.backgroundColor = "#111";
            input.style.boxShadow = "none";
        } else if (counts[val] === 2) {
            // Salió 2 veces: Texto Oro con brillo amarillo
            input.style.color = "#fdd835"; // Oro
            input.style.backgroundColor = "#222"; // Un poco más claro
            input.style.boxShadow = "0 0 10px #fdd835";
        } else if (counts[val] >= 3) {
            // Salió 3+ veces: Texto Rojo Brillante con brillo rojo
            input.style.color = "#ff4444"; // Rojo brillante
            input.style.backgroundColor = "#300"; // Fondo rojizo oscuro
            input.style.boxShadow = "0 0 15px #ff4444";
        }
    });
}

async function searchByMonth() {
    const month = prompt("Año-Mes (Ej: 2026-03)");
    if (!month) return;
    const { data } = await _supabase.from('resultados').select('*').like('celda_id', `${month}%`);
    alert(data ? `Datos en el mes: ${data.length}` : "Sin datos");
}

function changeDate() { selectedDate = document.getElementById('date-picker').value; updateTable(); }
function resetWeek() { if(confirm("¿Limpiar vista?")) updateTable(); }
window.onload = initApp;
    
