document.addEventListener('DOMContentLoaded', () => {
    // Selectores de elementos
    const teamANameInput = document.getElementById('teamAName');
    const teamBNameInput = document.getElementById('teamBName');
    const teamALabelGoals = document.getElementById('teamALabelGoals');
    const teamBLabelGoals = document.getElementById('teamBLabelGoals');
    const possessionTeamA = document.getElementById('possessionTeamA');
    const possessionTeamB = document.getElementById('possessionTeamB');
    const resetAllBtn = document.getElementById('resetAll');

    // Counters y temporizadores
    const teamAGoals = document.getElementById('teamAGoals');
    const teamBGoals = document.getElementById('teamBGoals');

    let matchTimerInterval;
    let matchTime = 0; // en segundos
    const matchTimerDisplay = document.getElementById('matchTimer');
    const toggleMatchTimerBtn = document.getElementById('toggleMatchTimer');
    const resetMatchTimerBtn = document.getElementById('resetMatchTimer');

    let possessionTimerAInterval;
    let possessionTimerBInterval;
    let possessionTimeA = 0; // en segundos
    let possessionTimeB = 0; // en segundos
    const possessionTimerADisplay = document.getElementById('possessionTimerA');
    const possessionTimerBDisplay = document.getElementById('possessionTimerB');
    const togglePossessionABtn = document.getElementById('togglePossessionA');
    const togglePossessionBBtn = document.getElementById('togglePossessionB');
    const resetPossessionBtn = document.getElementById('resetPossession');
    const possessionBarA = document.getElementById('possessionBarA');
    const possessionPercentA = document.getElementById('possessionPercentA');
    const possessionPercentB = document.getElementById('possessionPercentB');
    const timerGroupA = possessionTimerADisplay.closest('.timer-group');
    const timerGroupB = possessionTimerBDisplay.closest('.timer-group');

    // Estadísticas personalizadas
    const newStatNameInput = document.getElementById('newStatName');
    const addStatBtn = document.getElementById('addStatBtn');
    const generalStatsContainer = document.getElementById('generalStatsContainer');

    // Cargar datos de localStorage
    const loadData = () => {
        teamANameInput.value = localStorage.getItem('teamAName') || 'Tarragona';
        teamBNameInput.value = localStorage.getItem('teamBName') || 'Camp Clar';

        // Actualizar etiquetas visuales con los nombres cargados
        teamALabelGoals.textContent = teamANameInput.value;
        teamBLabelGoals.textContent = teamBNameInput.value;
        possessionTeamA.textContent = teamANameInput.value;
        possessionTeamB.textContent = teamBNameInput.value;

        teamAGoals.textContent = localStorage.getItem('teamAGoals') || '0';
        teamBGoals.textContent = localStorage.getItem('teamBGoals') || '0';

        matchTime = parseInt(localStorage.getItem('matchTime')) || 0;
        updateTimerDisplay(matchTimerDisplay, matchTime);

        possessionTimeA = parseInt(localStorage.getItem('possessionTimeA')) || 0;
        possessionTimeB = parseInt(localStorage.getItem('possessionTimeB')) || 0;
        updateTimerDisplay(possessionTimerADisplay, possessionTimeA);
        updateTimerDisplay(possessionTimerBDisplay, possessionTimeB);
        updatePossessionBar();

        loadCustomStats();
    };

    // Guardar datos en localStorage
    const saveData = () => {
        localStorage.setItem('teamAName', teamANameInput.value);
        localStorage.setItem('teamBName', teamBNameInput.value);
        localStorage.setItem('teamAGoals', teamAGoals.textContent);
        localStorage.setItem('teamBGoals', teamBGoals.textContent);
        localStorage.setItem('matchTime', matchTime);
        localStorage.setItem('possessionTimeA', possessionTimeA);
        localStorage.setItem('possessionTimeB', possessionTimeB);
    };

    // Manejo de nombres de equipo
    teamANameInput.addEventListener('input', () => {
        teamALabelGoals.textContent = teamANameInput.value;
        possessionTeamA.textContent = teamANameInput.value;
        saveData();
    });

    teamBNameInput.addEventListener('input', () => {
        teamBLabelGoals.textContent = teamBNameInput.value;
        possessionTeamB.textContent = teamBNameInput.value;
        saveData();
    });

    // Función para formatear el tiempo
    const formatTime = (seconds) => {
        const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
        const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
        const s = String(seconds % 60).padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    // Función para actualizar la visualización del temporizador
    const updateTimerDisplay = (displayElement, seconds) => {
        displayElement.textContent = formatTime(seconds);
    };

    // Control de marcadores (goles/puntos)
    document.querySelectorAll('.controls button').forEach(button => {
        button.addEventListener('click', (e) => {
            const targetId = e.currentTarget.dataset.target;
            const targetElement = document.getElementById(targetId);
            let value = parseInt(targetElement.textContent);

            if (e.currentTarget.classList.contains('plus-btn')) {
                value++;
            } else if (e.currentTarget.classList.contains('minus-btn')) {
                value = Math.max(0, value - 1);
            } else if (e.currentTarget.classList.contains('reset-btn')) {
                value = 0;
            }
            targetElement.textContent = value;
            saveData();
        });
    });

    // --- Control del Temporizador de Partido ---
    toggleMatchTimerBtn.addEventListener('click', () => {
        if (matchTimerInterval) {
            clearInterval(matchTimerInterval);
            matchTimerInterval = null;
            toggleMatchTimerBtn.textContent = '▶️ Iniciar';
            toggleMatchTimerBtn.classList.remove('active');
        } else {
            matchTimerInterval = setInterval(() => {
                matchTime++;
                updateTimerDisplay(matchTimerDisplay, matchTime);
                saveData();
            }, 1000);
            toggleMatchTimerBtn.textContent = '⏸️ Pausar';
            toggleMatchTimerBtn.classList.add('active');
        }
    });

    resetMatchTimerBtn.addEventListener('click', () => {
        clearInterval(matchTimerInterval);
        matchTimerInterval = null;
        matchTime = 0;
        updateTimerDisplay(matchTimerDisplay, matchTime);
        toggleMatchTimerBtn.textContent = '▶️ Iniciar';
        toggleMatchTimerBtn.classList.remove('active');
        saveData();
    });

    // --- Control de Posesión de Balón ---
    const stopPossessionTimers = () => {
        clearInterval(possessionTimerAInterval);
        clearInterval(possessionTimerBInterval);
        possessionTimerAInterval = null;
        possessionTimerBInterval = null;
        togglePossessionABtn.classList.remove('active');
        togglePossessionBBtn.classList.remove('active');
        timerGroupA.classList.remove('active');
        timerGroupB.classList.remove('active');
    };

    const startPossessionTimer = (team) => {
        stopPossessionTimers(); // Detiene cualquier temporizador activo

        if (team === 'A') {
            possessionTimerAInterval = setInterval(() => {
                possessionTimeA++;
                updateTimerDisplay(possessionTimerADisplay, possessionTimeA);
                updatePossessionBar();
                saveData();
            }, 1000);
            togglePossessionABtn.classList.add('active');
            timerGroupA.classList.add('active');
            togglePossessionBBtn.classList.remove('active'); // Asegura que el otro botón no esté activo
            timerGroupB.classList.remove('active');
        } else { // team === 'B'
            possessionTimerBInterval = setInterval(() => {
                possessionTimeB++;
                updateTimerDisplay(possessionTimerBDisplay, possessionTimeB);
                updatePossessionBar();
                saveData();
            }, 1000);
            togglePossessionBBtn.classList.add('active');
            timerGroupB.classList.add('active');
            togglePossessionABtn.classList.remove('active'); // Asegura que el otro botón no esté activo
            timerGroupA.classList.remove('active');
        }
    };

    togglePossessionABtn.addEventListener('click', () => startPossessionTimer('A'));
    togglePossessionBBtn.addEventListener('click', () => startPossessionTimer('B'));

    resetPossessionBtn.addEventListener('click', () => {
        stopPossessionTimers();
        possessionTimeA = 0;
        possessionTimeB = 0;
        updateTimerDisplay(possessionTimerADisplay, possessionTimeA);
        updateTimerDisplay(possessionTimerBDisplay, possessionTimeB);
        updatePossessionBar();
        saveData();
    });

    // Actualizar barra de posesión
    const updatePossessionBar = () => {
        const totalTime = possessionTimeA + possessionTimeB;
        if (totalTime === 0) {
            possessionBarA.style.width = '50%'; // Muestra 50/50 cuando no hay tiempo
            possessionPercentA.textContent = '0%';
            possessionPercentB.textContent = '0%';
            possessionPercentA.classList.add('hidden-zero');
            possessionPercentB.classList.add('hidden-zero');
            return;
        }

        const percentA = (possessionTimeA / totalTime) * 100;
        const percentB = (possessionTimeB / totalTime) * 100;

        possessionBarA.style.width = `${percentA}%`;
        possessionPercentA.textContent = `${Math.round(percentA)}%`;
        possessionPercentB.textContent = `${Math.round(percentB)}%`;

        possessionPercentA.classList.remove('hidden-zero');
        possessionPercentB.classList.remove('hidden-zero');

        // Ajuste visual para el texto si los porcentajes son muy pequeños
        if (percentA < 15 && percentA > 0) { // Si A es muy pequeño, mueve su porcentaje a la derecha
            possessionPercentA.style.left = 'auto';
            possessionPercentA.style.right = `${100 - percentA - 5}%`; /* ajusta el 5% */
            possessionPercentA.style.color = 'var(--dark-text)'; // Cambia color para que sea visible en fondo claro
        } else {
            possessionPercentA.style.left = '10px';
            possessionPercentA.style.right = 'auto';
            possessionPercentA.style.color = 'white';
        }
        if (percentB < 15 && percentB > 0) { // Si B es muy pequeño, mueve su porcentaje a la izquierda
            possessionPercentB.style.right = 'auto';
            possessionPercentB.style.left = `${percentA + 5}%`; /* ajusta el 5% */
            possessionPercentB.style.color = 'var(--dark-text)'; // Cambia color para que sea visible en fondo claro
        } else {
            possessionPercentB.style.right = '10px';
            possessionPercentB.style.left = 'auto';
            possessionPercentB.style.color = 'white';
        }
    };


    // --- Estadísticas Personalizadas ---
    let customStats = JSON.parse(localStorage.getItem('customStats')) || {};

    const saveCustomStats = () => {
        localStorage.setItem('customStats', JSON.stringify(customStats));
    };

    const loadCustomStats = () => {
        generalStatsContainer.innerHTML = '';
        for (const statId in customStats) {
            if (customStats.hasOwnProperty(statId)) {
                createStatElement(statId, customStats[statId].name, customStats[statId].valueA, customStats[statId].valueB);
            }
        }
        // Actualizar nombres de equipo en estadísticas existentes si han cambiado
        document.querySelectorAll('.stat-team-label.teamA').forEach(label => label.textContent = teamANameInput.value);
        document.querySelectorAll('.stat-team-label.teamB').forEach(label => label.textContent = teamBNameInput.value);
    };

    const createStatElement = (id, name, valueA, valueB) => {
        const statRow = document.createElement('div');
        statRow.classList.add('stat-row');
        statRow.dataset.statId = id; // Almacenar el ID para referencia futura

        statRow.innerHTML = `
            <div class="stat-name">
                <span class="stat-name-text">${name}</span>
                <div class="name-actions">
                    <button class="edit-stat-name-btn">✏️</button>
                    <button class="delete-stat-btn">🗑️</button>
                </div>
            </div>
            <div class="stat-team-container">
                <span class="stat-team-label teamA">${teamANameInput.value}</span>
                <span id="${id}-teamA" class="counter">${valueA}</span>
                <div class="controls compact-controls">
                    <button class="minus-btn" data-target="${id}-teamA">-</button>
                    <button class="plus-btn" data-target="${id}-teamA">+</button>
                </div>
            </div>
            <div class="stat-team-container">
                <span class="stat-team-label teamB">${teamBNameInput.value}</span>
                <span id="${id}-teamB" class="counter">${valueB}</span>
                <div class="controls compact-controls">
                    <button class="minus-btn" data-target="${id}-teamB">-</button>
                    <button class="plus-btn" data-target="${id}-teamB">+</button>
                </div>
            </div>
        `;

        generalStatsContainer.appendChild(statRow);
    };

    addStatBtn.addEventListener('click', () => {
        const statName = newStatNameInput.value.trim();
        if (statName) {
            const statId = 'stat-' + Date.now(); // Genera un ID único
            customStats[statId] = { name: statName, valueA: 0, valueB: 0 };
            createStatElement(statId, statName, 0, 0);
            saveCustomStats();
            newStatNameInput.value = '';
        } else {
            alert('Por favor, ingresa un nombre para la estadística.');
        }
    });

    // Delegación de eventos para botones de estadísticas personalizadas
    generalStatsContainer.addEventListener('click', (e) => {
        const targetBtn = e.target;
        const statRow = targetBtn.closest('.stat-row');
        if (!statRow) return;

        const statId = statRow.dataset.statId;

        if (targetBtn.classList.contains('plus-btn')) {
            const targetCounterId = targetBtn.dataset.target;
            const team = targetCounterId.endsWith('teamA') ? 'valueA' : 'valueB';
            customStats[statId][team]++;
            document.getElementById(targetCounterId).textContent = customStats[statId][team];
            saveCustomStats();
        } else if (targetBtn.classList.contains('minus-btn')) {
            const targetCounterId = targetBtn.dataset.target;
            const team = targetCounterId.endsWith('teamA') ? 'valueA' : 'valueB';
            customStats[statId][team] = Math.max(0, customStats[statId][team] - 1);
            document.getElementById(targetCounterId).textContent = customStats[statId][team];
            saveCustomStats();
        } else if (targetBtn.classList.contains('delete-stat-btn')) {
            if (confirm('¿Estás seguro de que quieres eliminar esta estadística?')) {
                delete customStats[statId];
                statRow.remove();
                saveCustomStats();
            }
        } else if (targetBtn.classList.contains('edit-stat-name-btn')) {
            const statNameTextSpan = statRow.querySelector('.stat-name-text');
            const currentName = statNameTextSpan.textContent;

            const input = document.createElement('input');
            input.type = 'text';
            input.value = currentName;
            input.classList.add('stat-name-input'); // Añadir clase para estilos

            statNameTextSpan.replaceWith(input);
            input.focus();

            const saveEdit = () => {
                const newName = input.value.trim();
                if (newName && newName !== currentName) {
                    statNameTextSpan.textContent = newName;
                    customStats[statId].name = newName;
                    saveCustomStats();
                } else {
                    statNameTextSpan.textContent = currentName; // Revertir si vacío o sin cambios
                }
                input.replaceWith(statNameTextSpan);
            };

            input.addEventListener('blur', saveEdit); // Guarda al perder el foco
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    saveEdit();
                }
            });
        }
    });

    // --- Reiniciar Todas las Estadísticas ---
    resetAllBtn.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que quieres reiniciar TODAS las estadísticas del partido?')) {
            // Reiniciar goles
            teamAGoals.textContent = '0';
            teamBGoals.textContent = '0';

            // Reiniciar temporizador de partido
            clearInterval(matchTimerInterval);
            matchTimerInterval = null;
            matchTime = 0;
            updateTimerDisplay(matchTimerDisplay, matchTime);
            toggleMatchTimerBtn.textContent = '▶️ Iniciar';
            toggleMatchTimerBtn.classList.remove('active');

            // Reiniciar posesión
            stopPossessionTimers();
            possessionTimeA = 0;
            possessionTimeB = 0;
            updateTimerDisplay(possessionTimerADisplay, possessionTimeA);
            updateTimerDisplay(possessionTimerBDisplay, possessionTimeB);
            updatePossessionBar();

            // Reiniciar estadísticas personalizadas
            customStats = {};
            generalStatsContainer.innerHTML = ''; // Eliminar todos los elementos del DOM

            // Reiniciar nombres de equipo a los valores predeterminados (o dejarlos como están si el usuario no quiere borrarlos)
            // teamANameInput.value = 'Tarragona';
            // teamBNameInput.value = 'Camp Clar';
            // teamALabelGoals.textContent = teamANameInput.value;
            // teamBLabelGoals.textContent = teamBNameInput.value;
            // possessionTeamA.textContent = teamANameInput.value;
            // possessionTeamB.textContent = teamBNameInput.value;

            localStorage.clear(); // Limpia todo localStorage
            loadData(); // Vuelve a cargar para asegurar valores por defecto y re-renderizar nombres si se borraron
            alert('Todas las estadísticas han sido reiniciadas.');
        }
    });


    // Inicializar la aplicación
    loadData();

    // --- REGISTRO DEL SERVICE WORKER (¡NUEVO!) ---
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                .then(registration => {
                    console.log('Service Worker registrado con éxito:', registration.scope);
                })
                .catch(error => {
                    console.error('Fallo en el registro del Service Worker:', error);
                });
        });
    }
});