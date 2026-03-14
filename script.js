// ... (Tus constantes de URL y KEY se mantienen igual)

let currentWeekDays = [];

function initApp() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date-picker').value = today;
    calculateWeek(today); // Nueva función para organizar los 7 días
}

// Esta función calcula qué fechas corresponden a la semana del día elegido
function calculateWeek(dateStr) {
    const date = new Date(dateStr + "T12:00:00");
    const dayOfWeek = date.getDay(); // 0=Dom, 1=Lun...
    // Ajustamos para que la semana siempre empiece en Lunes (1)
    const diff = date.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
    
    currentWeekDays = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(date);
        d.setDate(diff + i);
        currentWeekDays.push(d.toISOString().split('T')[0]);
    }
    updateTable(); // Dibujamos la tabla con estas 7 fechas
}

function updateTable() {
    const tableBody = document.getElementById('main-table');
    tableBody.innerHTML = "";
    hours.forEach((h, r) => {
        const row = document.createElement('tr');
        let html = `<td class="hour-cell">${h}</td>`;
        for (let c = 0; c < 7; c++) {
            // CUIDADO AQUÍ: El ID ahora incluye la fecha real de ese día
            const uniqueId = `${currentWeekDays[c]}_r${r}c${c}`;
            html += `<td>
                <input type="text" class="cell-input" maxlength="2" id="${uniqueId}" oninput="handleInput(this)" placeholder="-">
                <div class="animal-display" id="animal-${uniqueId}"></div>
            </td>`;
        }
        row.innerHTML = html;
        tableBody.appendChild(row);
    });
    loadWeekFromSupabase(); // Cargamos los datos de los 7 días a la vez
}

async function loadWeekFromSupabase() {
    // Buscamos en Supabase cualquier registro que empiece con las fechas de esta semana
    const { data, error } = await _supabase
        .from('resultados')
        .select('*')
        .in('celda_id', generatePossibleIds()); // Buscamos todos los IDs de la semana

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

// Función auxiliar para generar la lista de IDs a buscar
function generatePossibleIds() {
    let ids = [];
    currentWeekDays.forEach(day => {
        for(let r=0; r<hours.length; r++) {
            for(let c=0; c<7; c++) {
                ids.push(`${day}_r${r}c${c}`);
            }
        }
    });
    return ids;
}

function changeDate() {
    const newDate = document.getElementById('date-picker').value;
    calculateWeek(newDate);
}

// ... (El resto de funciones como saveAllToSupabase se mantienen similares)
