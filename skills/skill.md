Tablero web: red IoT de sensores de metano para minas subterráneas
Contexto del proyecto
Proyecto de hackatón. El repositorio contiene en /reto-minero una app React + Vite: el tablero web de la solución "Red de sensores fijos de metano IoT de bajo costo".

La solución real funciona así:

Nodos fijos ubicados en frentes de explotación y retornos de aire de una mina subterránea de carbón en Colombia.
Componentes de cada nodo: sensor de metano (MQ-4 en el prototipo; infrarrojo NDIR certificado para atmósferas explosivas en la implementación), sensor de temperatura y humedad, y microcontrolador ESP32.
Medición automática y continua. Nadie digita lecturas.
Transmisión por LoRa hasta un gateway en la bocamina, que entrega los datos al tablero web.
Alarma local en cada nodo: sonora y luminosa (sirena y baliza), que el nodo activa POR SÍ MISMO cuando supera el límite, sin depender del tablero ni de LoRa.
Alertas por SMS o app al supervisor, enviadas desde el tablero.
Cuando generes o modifiques código de este proyecto, respeta todo lo que sigue.

Alcance del prototipo
No hay hardware conectado. Los datos vienen de un set FIJO que se reproduce AUTOMÁTICAMENTE en el tiempo, como si llegara en vivo desde el gateway. Todo lo simulado vive en src/demo/ y se rotula "simulado" en la interfaz cuando aplique.
El tablero se actualiza solo. No requiere ninguna acción del usuario para mostrar lecturas nuevas, cambiar estados o disparar alertas.
Variables por nodo: CH₄ (% vol), temperatura (°C), humedad relativa (%), batería (%), señal LoRa (RSSI en dBm) y hora de la última transmisión. No se usa velocidad del aire.
Funciona 100% sin internet, porque la bocamina no tiene señal. Es una PWA instalable.
No inventar funciones que la app no tiene. Nada de "corte eléctrico automático", "bitácora inmutable" o certificaciones falsas. Si algo es simulado, hay que decirlo.
Flujo de datos
[demo/simulador.js]  ── paquete por nodo cada N s ──▶  [hooks/useNodos]
  (hace de gateway LoRa)                                     │
                                                             ├─▶ core/evaluador → nivel del nodo
                                                             ├─▶ data/ → IndexedDB (origen 'nodo')
                                                             └─▶ context/AlertasContext → sonido + modal + SMS (simulado)
Paquete simulado: { nodoId, ch4, temperatura, humedad, bateria, rssi, fecha, alarmaLocalActiva }. Es la misma forma que tendría el JSON real del gateway, para que el día de mañana solo se cambie la fuente: demo/simulador.js por data/gatewayLoRa.js.
Intervalo: el simulador emite cada nodo cada 5 s, configurable en config/constantes.js.
Escenarios automáticos del set fijo, que se pueden lanzar con el botón "Simular evento" (rotulado simulado):
"Falla de ventilador en frente": el CH₄ sube 0,1% por paquete hasta 2,3%.
"Nodo pierde señal": el nodo deja de transmitir.
"Volver a normal".
Alarma local del nodo: la activa el propio nodo (en el simulador, cuando su CH₄ alcanza el límite de su sitio). El tablero solo la MUESTRA.
Historial: demo/historialEjemplo.js genera 24 h de lecturas fijas (una cada 10 min) y se carga una sola vez en IndexedDB.
Verificación manual (función secundaria)
Es opcional. Sirve para contrastar la lectura del nodo con un detector portátil certificado, porque el MQ-4 no es de precisión.

Registra CH₄, temperatura y humedad.
Se guarda con origen 'manual' y muestra la diferencia con la última lectura del nodo.
La app debe funcionar completa sin usarla. Nunca es la forma principal de obtener datos.
Estructura de carpetas
reto-minero/
├── index.html
├── package.json
├── vite.config.js       ← Vite + vite-plugin-pwa (service worker y manifest)
├── public/              ← íconos de la PWA (192 y 512 px) e imágenes
├── docs/                ← diagramas, normativa, manual
└── src/
    ├── config/          ← limites.js (Decreto 1886), tiposSitio.js, constantes.js
    ├── core/            ← evaluador, cálculos, predicción (JS puro, sin DOM ni React)
    ├── data/            ← IndexedDB y repositorios; respaldo JSON/CSV
    ├── alertas/         ← sonido (Web Audio), voz, vibración
    ├── hooks/           ← useNodos, useAlertas, useConexion, useMina
    ├── context/         ← MinaContext, AlertasContext
    ├── layout/          ← Sidebar, Header, FooterBar
    ├── pages/           ← Tablero, Historial, Alertas, Configuracion
    ├── components/      ← NodoCard, MineMap, KpiSummary, modales, Toast
    ├── demo/            ← nodos de ejemplo, historial fijo, simulador (hace de gateway)
    ├── utils/           ← fechas, formatos
    └── styles/          ← estilos globales
Reglas de arquitectura
Nada desde CDN. Tailwind se instala con npm (tailwindcss + @tailwindcss/vite). Las fuentes e íconos también: @fontsource/inter, @fontsource/jetbrains-mono y material-symbols. Sin <link> ni <script> externos en index.html.
El service worker y el manifest los genera vite-plugin-pwa en vite.config.js, con registerType: 'autoUpdate' y precache de js, css, html, svg y woff2. No escribir un sw.js a mano. El registro se hace con virtual:pwa-register.
Variables de entorno con import.meta.env, nunca con process.env.
core/ no toca el DOM ni importa React. Recibe datos y devuelve resultados.
Solo data/ habla con IndexedDB. Pantallas y hooks usan los repositorios.
Los límites viven solo en config/limites.js, cada uno con su artículo. Ningún otro archivo escribe umbrales a mano, incluidos los de precaución y sin señal.
El estado de un nodo siempre lo calcula el evaluador a partir de su última lectura y su tipo de sitio. Nunca se guarda a mano en los datos. EVACUACION es un nivel propio.
La fuente de datos está aislada. Los componentes no saben si los datos vienen del simulador o del gateway real. Solo lo saben useNodos y demo/.
Nada de efectos secundarios dentro de funciones de setState. Por ejemplo, guardar en IndexedDB: con StrictMode se ejecutan dos veces.
Limpiar los intervalos del simulador al desmontar el componente.
Nada de window.alert(). Usar el componente Toast o los modales.
Prueba del modo sin conexión: npm run build && npm run preview. Con npm run dev el service worker no se activa.
Todo texto de interfaz en español.
Modelo de datos de un nodo
```js

{
  id, nombre, ubicacion,
  tipoSitio,            // solo frentes y retornos, ver config/tiposSitio.js
  nivel,                // 'N-1' (-310 m) | 'N-2' (-420 m) | 'N-3' (-540 m)
  mapCoords,            // posición en el mapa del nivel
  lectura: { ch4, temperatura, humedad, bateria, rssi, fecha },
  alarmaLocalActiva     // sirena + baliza del nodo, la activa el nodo
}
El mapa, los KPI y las tarjetas se dibujan desde estos datos y cambian solos con cada paquete. Nunca se usan valores escritos en el JSX.

Los botones de nivel (N-1, N-2, N-3) filtran el mapa y muestran el color del peor estado de cada nivel. Las cotas son metros bajo la bocamina.

Límites normativos (Decreto 1886 de 2015)
Aplican a los nodos
Metano por tipo de sitio (Art. 53):
Frentes de explotación o avance: 1,0% (20% LEL).
Retornos principales de aire: 1,0% (20% LEL).
Retorno de aire de tajos: 1,5% (30% LEL).
Retorno de frentes de preparación y desarrollo: 1,5% (30% LEL).
Por encima de 2% solo entra personal de salvamento.
No se puede volar con 0,5% o más (Art. 162).
El aire de retorno con ventilación auxiliar no puede llevarse a otros frentes si trae más de 0,5%.
Temperatura: límite POR VALIDAR con el integrante de Ingeniería de Minas. No inventar un valor: dejarlo configurable en limites.js y mostrarlo como "por validar".
Humedad: sin límite normativo. Solo se muestra.
Categoría de mina (Art. 58):
I: 0% de metano.
II: hasta 0,3%.
III: más de 0,3%. El Art. 47 exige para ella monitoreo PERMANENTE de metano, y el Art. 60 medición continua. Este es el argumento normativo de la red de sensores.
Referencia, no los miden los nodos
Se dejan en limites.js por si se agregan sensores:

Oxígeno (Art. 38): apto solo entre 19,5% y 23,5% en volumen.
Gases tóxicos (Art. 39), en ppm:
CO₂: TWA 5000, STEL 30000.
CO: TWA 25.
H₂S: TWA 1, STEL 5.
SO₂: STEL 0,25.
NO: TWA 25.
NO₂: TWA 0,2.
Con jornada mayor a 8 h, corregir el TWA con Brief & Scala: Fc = (8/hd) × (24 − hd)/16 y VLPc = Fc × VLP.
Caudal mínimo (Art. 54): 3 m³/min por trabajador hasta 1.500 msnm; 6 m³/min por encima. Para pasar de cota a altitud: altitud = altitud de bocamina + cota.
Niveles de alerta
Se calculan automáticamente con cada paquete, según el tipo de sitio del nodo:

NORMAL (verde): por debajo del 50% del límite del sitio.
PRECAUCION (amarillo): entre el 50% y el 100% del límite, o tendencia creciente que llegaría al límite (ver core/prediccion.js).
ALARMA (naranja): límite del sitio alcanzado. Suspender la labor y ventilar. La alarma local del nodo está activa.
EVACUACION (rojo): CH₄ > 2%. Solo personal de salvamento.
SIN_SEÑAL (gris): el nodo no transmite hace más de 5 minutos (valor configurable en limites.js). Indicar que la alarma local del nodo sigue protegiendo el sitio aunque el tablero no reciba datos.
Cada alerta muestra el valor frente al límite, la acción recomendada y el artículo que la respalda. El color siempre va acompañado de ícono y texto.

Al crearse una alerta de ALARMA o EVACUACION se registra "SMS enviado a supervisor (simulado)", con el texto del mensaje.

Sonido de alertas en el tablero (alertas/)
El ritmo indica la gravedad:
Precaución: 1 pitido.
Alarma: 3 pitidos rápidos, que se repiten cada 5 s hasta que alguien la reconozca.
Evacuación: sirena continua hasta que alguien la reconozca, con modal rojo a pantalla completa.
El tono indica el gas: CH₄ 440 Hz, O₂ 523 Hz, CO 659 Hz, H₂S 784 Hz, otros 880 Hz.
Voz y vibración: la voz (speechSynthesis) dice gas, valor y nodo. La vibración (navigator.vibrate) es opcional.
Varias alertas a la vez: suena solo la más grave.
No repetir mientras siga activa: una alerta ya reconocida no vuelve a sonar mientras el nodo siga en el mismo nivel. Solo suena de nuevo si empeora o si vuelve a normal y luego recae.
Toda alarma que suena se puede apagar. Al dispararse se abre el modal con los datos reales, y "Reconocer alarma" llama a silenciar() y registra quién la reconoció y a qué hora.
Activación del audio: requiere un botón "Iniciar turno / activar sonido" visible hasta que se active, porque el navegador bloquea el audio sin interacción.
Botón "Probar alarmas" para la demostración.
Forma de trabajo
Trabaja solo en la fase o tarea pedida. No adelantes otras.
Antes de editar, muestra un plan breve con los archivos que vas a tocar.
No agregues librerías distintas a las indicadas. Para gráficos usa recharts.
Al terminar, ejecuta npm run build y npm run lint dentro de /reto-minero, corrige los errores y da un resumen corto de lo que cambiaste y cómo probarlo.