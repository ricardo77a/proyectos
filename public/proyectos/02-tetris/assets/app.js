// Variables principales
const canvas = document.querySelector("canvas"); // Selecciona el elemento 'canvas' del DOM
const ctx = canvas.getContext("2d"); // Obtiene el contexto de renderizado 2D para dibujar en el canvas
const musica = document.getElementById("musica"); // Obtiene el elemento de audio 'musica' del DOM

// Configuración del juego
const DIMENSION_BLOQUE = 20; // Tamaño de cada bloque (píxeles)
const COLUMNAS = 14; // Número de columnas del tablero
const FILAS = 30; // Número de filas del tablero

// Ajusta el tamaño del canvas basado en el tamaño de los bloques y las filas/columnas
canvas.width = DIMENSION_BLOQUE * COLUMNAS;
canvas.height = DIMENSION_BLOQUE * FILAS;

// Escala el contexto para que los gráficos se dibujen en función del tamaño del bloque
ctx.scale(DIMENSION_BLOQUE, DIMENSION_BLOQUE);

// Crea un tablero vacío (matriz de 20x40), donde cada celda tiene un valor de 0 (vacío)
const tablero = Array.from({ length: FILAS }, () => Array(COLUMNAS).fill(0));

// Definición de las piezas (formas posibles en el juego)
const piezas = [
    [[1, 1, 1, 1]], // Pieza en forma de línea
    [
        [1, 1, 1],
        [0, 1, 0],
    ], // Pieza en forma de "T"
    [
        [1, 1, 1],
        [1, 0, 0],
    ], // Pieza en forma de "L"
    [
        [1, 1, 1],
        [0, 0, 1],
    ], // Pieza en forma de "L" invertida
    [
        [1, 1],
        [1, 1],
    ], // Pieza en forma de cuadrado
    [
        [1, 1, 0],
        [0, 1, 1],
    ], // Pieza en forma de "Z"
    [
        [0, 1, 1],
        [1, 1, 0],
    ], // Pieza en forma de "Z" invertida
];

// Colores de las piezas
const COLORES = ["#FF6F61", "#6B5B95", "#88B04B", "#F7CAC9", "#92A8D1", "#955251", "#B565A7", "#009B77", "#DD4124", "#45B8AC", "#D65076", "#EFC050"];


// Crea una nueva pieza aleatoria en la parte superior del tablero
const pieza = {
    pos: { x: Math.floor(COLUMNAS / 2) - 1, y: 0 }, // Posición inicial de la pieza (centrada)
    tipo: piezas[Math.floor(Math.random() * piezas.length)], // Selecciona aleatoriamente una pieza del array
    color: COLORES[Math.floor(Math.random() * COLORES.length)], // Selecciona aleatoriamente un color del array
};

// Función para dibujar tanto el tablero como la pieza actual
function dibujar() {
    ctx.fillStyle = "black"; // Fondo del canvas en color negro
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Dibuja el fondo

    // Dibuja las piezas que ya están en el tablero (valor 1)
    tablero.forEach((fila, y) => {
        fila.forEach((valor, x) => {
            if (valor !== 0) {
                ctx.fillStyle = valor; // Color azul para piezas fijas
                ctx.fillRect(x, y, 1, 1); // Dibuja un bloque azul en la posición correspondiente
                ctx.strokeStyle = "black"; // Color del borde
                ctx.lineWidth = 0.05; // Grosor del borde
                ctx.strokeRect(x, y, 1, 1); // Dibuja el borde
            }else{
                ctx.strokeStyle = "white"; //
                ctx.lineWidth = 0.003; // Grosor del borde
                ctx.strokeRect(x, y, 1, 1); // Dibuja el borde
            }
        });
    });

    // Dibuja la pieza que está cayendo
    pieza.tipo.forEach((fila, y) => {
        fila.forEach((valor, x) => {
            if (valor === 1) {
                ctx.fillStyle = pieza.color; // Color de la pieza
                ctx.fillRect(pieza.pos.x + x, pieza.pos.y + y, 1, 1); // Dibuja un bloque rojo en la posición correspondiente
                ctx.strokeStyle = "black"; // Color del borde
                ctx.lineWidth = 0.05; // Grosor del borde
                ctx.strokeRect(pieza.pos.x + x, pieza.pos.y + y, 1, 1); // Dibuja el borde
            }
        });
    });

    // Agrega Score y Nivel
    ctx.fillStyle = "white";
    ctx.font = "0.7px Arial";
    ctx.fillText("Score: " + score, 1, 1);
    ctx.fillText("Nivel: " + obtenerNivel(), 10, 1);
}

// Variables de control del juego
let score = 0; // Puntuación del jugador
let ultimoTiempo = 0; // Tiempo de la última actualización del juego
let contadorCaida = 0; // Contador para controlar la velocidad de caída de las piezas
let velocidadCaida = 1000; // Velocidad inicial de caída (1000 ms = 1 segundo)
let tiempoAcumulado = 0; // Tiempo acumulado para el score
let segundosTranscurridos = 0; // Segundos transcurridos en el juego

// Función principal de actualización del juego
function actualizar(tiempo = 0) {
    const deltaTiempo = tiempo - ultimoTiempo; // Calcula el tiempo transcurrido desde la última actualización
    ultimoTiempo = tiempo;

    contadorCaida += deltaTiempo; // Aumenta el contador de tiempo de caída
    tiempoAcumulado += deltaTiempo; // Aumenta el tiempo acumulado

    // Aumenta el score cada segundo y contar los segundos transcurridos
    if (tiempoAcumulado > 1000) {
        score += 1; // Aumenta el score en 10 puntos
        tiempoAcumulado = 0; // Reinicia el tiempo acumulado
        segundosTranscurridos++; // Aumenta el contador de segundos transcurridos

        // Aumenta la velocidad de caída cada 5 segundos y la velocidad de la música
        if (segundosTranscurridos % 60 === 0) { // Cada 60 segundos (1 minuto)
            velocidadCaida = Math.max(0, velocidadCaida - 25); // Aumenta la velocidad de caída
            // Aumenta la velocidad de la musica
            musica.playbackRate += 0.02; // Aumenta la velocidad de la música
        }
    }

    // Controla la velocidad de caída de las piezas
    if (contadorCaida > velocidadCaida) {
        // Si ha pasado más de un segundo, baja la pieza una fila
        pieza.pos.y++; // Incrementa la posición en Y (la pieza cae)
        contadorCaida = 0; // Reinicia el contador


        if (verificarColision()) {
            // Verifica si hay una colisión
            pieza.pos.y--; // Si hay colisión, retrocede la pieza
            solidificarPieza(); // Solidifica la pieza en el tablero
            eliminarFilas(); // Verifica si se han completado filas y las elimina
        }
    }

    dibujar(); // Redibuja el tablero y la pieza
    requestAnimationFrame(actualizar); // Pide la próxima actualización
}

// Función que escucha los eventos de teclado para mover la pieza
document.addEventListener("keydown", (evento) => {
    if (evento.key === "ArrowLeft") {
        // Mover a la izquierda
        pieza.pos.x--; // Desplaza la pieza a la izquierda
        if (verificarColision()) {
            pieza.pos.x++; // Si hay colisión, cancela el movimiento
        }
    }
    if (evento.key === "ArrowRight") {
        // Mover a la derecha
        pieza.pos.x++; // Desplaza la pieza a la derecha
        if (verificarColision()) {
            pieza.pos.x--; // Si hay colisión, cancela el movimiento
        }
    }
    if (evento.key === "ArrowDown") {
        // Mover hacia abajo
        pieza.pos.y++; // Desplaza la pieza hacia abajo
        if (verificarColision()) {
            pieza.pos.y--; // Si hay colisión, retrocede la pieza
            solidificarPieza(); // Solidifica la pieza en el tablero
            eliminarFilas(); // Verifica si se completaron filas
        }
    }
    if(evento.key === "ArrowUp"){
        // Rotar la pieza
        intentarRotar(); // Intenta rotar la pieza
    }

    if(evento.key === "m"){
        // M para pausar o despausar la música
        if(musica.paused){
            iniciarMusica(); // Reproduce la música de fondo
        }else{
            detenerMusica(); // Pausa la música de fondo
        }
    }
});
// Funciones de los botones
let presionandoIzquierda = false;
let presionandoDerecha = false;
let presionandoAbajo = false;

let intervaloMovimiento;

// Función para empezar a mover la pieza repetidamente
function iniciarMovimiento(direccion) {
    if (direccion === "izquierda") {
        presionandoIzquierda = true;
        moverIzquierda();
        intervaloMovimiento = setInterval(moverIzquierda, 100); // Mueve cada 100ms
    } else if (direccion === "derecha") {
        presionandoDerecha = true;
        moverDerecha();
        intervaloMovimiento = setInterval(moverDerecha, 100);
    } else if (direccion === "abajo") {
        presionandoAbajo = true;
        moverAbajo();
        intervaloMovimiento = setInterval(moverAbajo, 100);
    }
}

// Función para detener el movimiento
function detenerMovimiento() {
    clearInterval(intervaloMovimiento);
    presionandoIzquierda = false;
    presionandoDerecha = false;
    presionandoAbajo = false;
}

// Funciones de movimiento específicas
function moverIzquierda() {
    pieza.pos.x--;
    if (verificarColision()) pieza.pos.x++; // Si colisiona, revertir el movimiento
}

function moverDerecha() {
    pieza.pos.x++;
    if (verificarColision()) pieza.pos.x--;
}

function moverAbajo() {
    pieza.pos.y++;
    if (verificarColision()) {
        pieza.pos.y--;
        solidificarPieza();
        eliminarFilas();
    }
}

document.getElementById("rotar").addEventListener("click", () => {
    intentarRotar(); // Rotar la pieza
});

document.getElementById("izquierda").addEventListener("mousedown", () => {
    iniciarMovimiento("izquierda");
});

document.getElementById("derecha").addEventListener("mousedown", () => {
    iniciarMovimiento("derecha");
});

document.getElementById("abajo").addEventListener("mousedown", () => {
    iniciarMovimiento("abajo");
});

document.getElementById("izquierda").addEventListener("mouseup", detenerMovimiento);
document.getElementById("derecha").addEventListener("mouseup", detenerMovimiento);
document.getElementById("abajo").addEventListener("mouseup", detenerMovimiento);

// También detener si el mouse sale del botón sin soltar el clic
document.getElementById("izquierda").addEventListener("mouseleave", detenerMovimiento);
document.getElementById("derecha").addEventListener("mouseleave", detenerMovimiento);
document.getElementById("abajo").addEventListener("mouseleave", detenerMovimiento);

document.getElementById("izquierda").addEventListener("touchstart", () => {
    iniciarMovimiento("izquierda");
});
document.getElementById("derecha").addEventListener("touchstart", () => {
    iniciarMovimiento("derecha");
});
document.getElementById("abajo").addEventListener("touchstart", () => {
    iniciarMovimiento("abajo");
});

document.getElementById("izquierda").addEventListener("touchend", detenerMovimiento);
document.getElementById("derecha").addEventListener("touchend", detenerMovimiento);
document.getElementById("abajo").addEventListener("touchend", detenerMovimiento);



// Verifica si la pieza colisiona con otras piezas o los bordes del tablero
function verificarColision() {
    return pieza.tipo.some((fila, y) => {
        // Recorre cada fila de la pieza
        return fila.some((valor, x) => {
            // Recorre cada bloque de la fila
            return (
                valor !== 0 && // Si el bloque no es vacío
                (tablero[y + pieza.pos.y]?.[x + pieza.pos.x] !== 0 || // Verifica si colisiona con otra pieza en el tablero
                    y + pieza.pos.y >= FILAS || // O si colisiona con el fondo del tablero
                    x + pieza.pos.x < 0 || // O si colisiona con el borde izquierdo
                    x + pieza.pos.x >= COLUMNAS) // O si colisiona con el borde derecho
            );
        });
    });
}

// Función que solidifica la pieza en el tablero (la fija en su posición actual)
function solidificarPieza() {
    pieza.tipo.forEach((fila, y) => {
        // Recorre cada fila de la pieza
        fila.forEach((valor, x) => {
            // Recorre cada bloque de la fila
            if (valor !== 0) {
                // Si el bloque no es vacío
                const tableroY = y + pieza.pos.y;
                const tableroX = x + pieza.pos.x;
                if (
                    tableroY >= 0 &&
                    tableroY < FILAS &&
                    tableroX >= 0 &&
                    tableroX < COLUMNAS
                ) {
                    // Si la posición está dentro de los límites del tablero
                    tablero[tableroY][tableroX] = pieza.color; // Fija la pieza en el tablero
                }
            }
        });
    });
    score += 10; // Aumenta el score en 10 puntos por cada pieza fijada
    reiniciarPieza(); // Reinicia la pieza (genera una nueva)
}

// Elimina las filas completadas del tablero
function eliminarFilas() {
    const filasAEliminar = []; // Array que almacenará las filas completas

    tablero.forEach((fila, y) => {
        if (fila.every((celda) => celda !== 0)) {
            // Verifica si toda la fila está llena (valor 1)
            filasAEliminar.push(y); // Añade la fila a eliminar
        }
    });

    if (filasAEliminar.length > 0) {
        // Si hay filas completas para eliminar
        filasAEliminar.forEach((y) => {
            // Recorre las filas a eliminar
            tablero.splice(y, 1); // Elimina la fila
            const nuevaFila = Array(COLUMNAS).fill(0); // Añade una nueva fila vacía en la parte superior
            tablero.unshift(nuevaFila); // Añade la nueva fila al principio del tablero
            score += 100; // Aumenta el score en 100 puntos por cada fila eliminada
        });
    }
}

// Reinicia la pieza, generando una nueva aleatoria en la parte superior del tablero
function reiniciarPieza() {
    pieza.pos.y = 0; // Restablece la posición Y
    pieza.pos.x = Math.floor(COLUMNAS / 2) - 1; // Centra la nueva pieza
    pieza.tipo = piezas[Math.floor(Math.random() * piezas.length)]; // Selecciona una nueva pieza aleatoria
    pieza.color = COLORES[Math.floor(Math.random() * COLORES.length)]; // Selecciona un nuevo color aleatorio

    if (verificarColision()) {
        // Si la nueva pieza colisiona inmediatamente, el juego ha terminado
        alert("Game Over"); // Muestra un mensaje de "Game Over"
        tablero.forEach((fila) => fila.fill(0)); // Limpia el tablero
        pausarMusica(); // Pausa la música de fondo
    }
}

// Función para rotar la pieza actual
function rotarPieza(){
    // convertir filas en columnas
    const nuevaPieza = pieza.tipo[0].map((_, index) =>
        pieza.tipo.map(row => row[index]) //Recorre las filas y las convierte en columnas

    );

    //Invertir el orden de las filas
    nuevaPieza.forEach(row => row.reverse());
    return nuevaPieza;
}

// Función para intentar rotar la pieza actual
function intentarRotar(){
    const piezaRotada = rotarPieza(); //Obtiene la pieza rotada
    const posicionActual = pieza.pos; //Guarda la posición actual

    pieza.tipo = piezaRotada; //Actualiza la pieza actual

    // Verifica si hay colisión con la nueva rotación
    if(verificarColision()){
        // Ajusta la posición para evitar que salga del tablero
        if(pieza.pos.x < 0){
            pieza.pos.x = 0; // Ajusta la posición a la izquierda
        }else if(pieza.pos.x + pieza.tipo[0].length > COLUMNAS){
            pieza.pos.x = COLUMNAS - pieza.tipo[0].length; // Ajusta la posición a la derecha
        }

        // Después de ajustar la posición verifica si hay colisión
        if(verificarColision()){
            pieza.pos = posicionActual; // Si hay colisión, restaura la posición original
        }
    }
}

// Obtener nivel segun velocidad de caida
function obtenerNivel(){
    nivel = Math.floor((1000 - velocidadCaida) / 25) + 1; // Calcula el nivel en función de la velocidad de caída
    return nivel; // Devuelve el nivel calculado
}

// Inicia la música de fondo
function iniciarMusica(){
    musica.play(); // Reproduce la música de fondo
}

// Pausa la música de fondo
function detenerMusica(){
    musica.pause(); // Pausa la música de fondo
    musica.currentTime = 0; // Reinicia la música al principio
}

actualizar(); // Inicia el ciclo de actualización del juego
iniciarMusica(); // Inicia la música de fondo