Estructura del frontend: PWA de monitoreo de atmósferas mineras
Proyecto de hackatón: aplicación web progresiva (PWA) que funciona sin conexión para registrar, monitorear y alertar sobre condiciones atmosféricas en sectores de una mina subterránea (carbón, Colombia). Tecnología: HTML, CSS y JavaScript sin framework, con módulos ES (import/export). Datos en IndexedDB.

Cuando generes o modifiques código de este proyecto, respeta esta estructura y estas reglas.

Estructura de carpetas
atmosfera-mina/
├── public/              ← íconos e imágenes de la PWA
├── docs/                ← diagramas, normativa, manual
└── src/
    ├── config/          ← límites del Decreto 1886, tipos de sitio
    ├── core/            ← evaluación, cálculos, predicción
    ├── data/            ← base de datos local (IndexedDB)
    ├── alertas/         ← sonido, voz, vibración
    ├── hooks/           ← conexión entre pantallas y datos
    ├── context/         ← estado global (mina, turno, alertas activas)
    ├── layout/          ← barra lateral, barra superior
    ├── pages/           ← pantallas
    ├── components/      ← piezas reutilizables
    ├── demo/            ← simulador y datos de ejemplo
    ├── utils/           ← fechas, formatos
    └── styles/          ← estilos globales


Reglas de arquitectura
sw.js siempre en la raíz. Un service worker solo controla su carpeta hacia abajo.
Cada archivo nuevo se agrega a la lista de caché de sw.js y se sube la versión de la caché (atmosfera-v1 → atmosfera-v2). Si no, no carga sin conexión.
Nada desde CDN. Toda librería va descargada en vendor/.
core/ no toca el DOM. Recibe datos y devuelve resultados, para poder probarlo en la consola y reusarlo en el simulador y el registro manual.
Solo data/ habla con IndexedDB. Las pantallas usan los repositorios (mediciones.repo.js, sectores.repo.js, mina.repo.js).
Los límites normativos viven solo en config/limites.js, cada uno con su artículo del decreto. Ningún otro archivo escribe límites a mano.
No se abre con doble clic. Siempre con servidor (npx serve) o GitHub Pages, porque los módulos ES y el service worker lo requieren.
Todo texto de interfaz en español.
Límites normativos (Decreto 1886 de 2015)
Oxígeno (Art. 38): apto solo entre 19,5% y 23,5% en volumen.
Gases tóxicos (Art. 39), en ppm:
CO₂: TWA 5000, STEL 30000.
CO: TWA 25.
H₂S: TWA 1, STEL 5.
SO₂: STEL 0,25.
NO: TWA 25.
NO₂: TWA 0,2.
Si la jornada pasa de 8 h, corregir el TWA con Brief & Scala: Fc = (8/hd) × (24 − hd)/16 y VLPc = Fc × VLP.
Metano por tipo de sitio (Art. 53):
Frentes de explotación o avance: 1,0% (20% LEL).
Retornos principales de aire: 1,0% (20% LEL).
Retorno de aire de tajos: 1,5% (30% LEL).
Retorno de frentes de preparación y desarrollo: 1,5% (30% LEL).
Por encima de 2% solo entra personal de salvamento.
No se puede volar con 0,5% o más (Art. 162).
El aire de retorno con ventilación auxiliar no puede llevarse a otros frentes si trae más de 0,5%.
Categoría de mina (Art. 58) y frecuencia de medición (Art. 60):
I: 0% de metano. Medir al iniciar cada turno y antes de cada voladura.
II: hasta 0,3%. Medir al iniciar el turno, antes de voladuras y por lo menos cada 2 h.
III: más de 0,3%. Medir antes de cada turno y de forma continua.
Velocidad mínima del aire (Art. 56):
Vías con trolley: 1 m/s.
Galerías de explotación: 0,5 m/s.
Ventilación auxiliar: 0,3 m/s en vías en carbón, 0,5 m/s en tambores hacia arriba, 0,2 m/s en bajadas y vías en roca.
Máximo 6 m/s en vías de tránsito y 4,5 m/s en tajos.
Caudal mínimo (Art. 54):
3 m³/min por trabajador hasta 1.500 m sobre el nivel del mar; 6 m³/min por encima.
Diésel: 6 m³/min por HP si el CO del exosto es ≤ 0,12%; 4 m³/min por HP si es ≤ 0,08%.
Temperatura: límite pendiente de validar con el integrante de Ingeniería de Minas. No inventar un valor; dejarlo configurable y marcado como "por validar".
Niveles de alerta
El nivel se calcula según el tipo de sitio del sector:

Normal (verde): por debajo del 50% del límite.
Precaución (amarillo): entre 50% y 80% del límite, o tendencia en aumento.
Alarma (naranja): límite alcanzado. Suspender la labor y ventilar.
Evacuación (rojo): CH₄ > 2%, O₂ < 19,5% o falla de ventilación.
Cada alerta muestra la acción recomendada y el artículo que la respalda. El color siempre va acompañado de ícono y texto.

Sonido de alertas (alertas/)
El ritmo indica la gravedad:
Precaución: 1 pitido.
Alarma: 3 pitidos rápidos, que se repiten cada 5 s hasta que alguien confirme.
Evacuación: sirena continua hasta que alguien confirme.
El tono indica el gas: CH₄ 440 Hz, O₂ 523 Hz, CO 659 Hz, H₂S 784 Hz, otros 880 Hz.
Voz y vibración: la voz (speechSynthesis) dice gas, valor y sector. La vibración (navigator.vibrate) es opcional.
Varios gases a la vez: suena solo el más grave.
Activación del audio: requiere un botón "Iniciar turno / activar sonido", porque el navegador bloquea el audio hasta que el usuario toque la pantalla.