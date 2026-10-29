# ATMO-MONITOR: PWA de Monitoreo Atmosférico Minero

Aplicación Web Progresiva (PWA) para registrar, monitorear y alertar sobre condiciones atmosféricas en sectores de una mina subterránea de carbón en Colombia, en estricto cumplimiento del **Decreto 1886 de 2015**.

Estructura de carpetas y arquitectura técnica alineadas al 100% con las directrices de [`skill.md`](file:///c:/Software/NetBeans-25/Proyectos/hackaton-2026/skills/skill.md).

---

## 📐 Estructura de Carpetas

```
reto-minero/
├── public/                 ← Íconos e imágenes de la PWA (favicon, icons)
├── docs/                   ← Documentación técnica y normativa (Decreto 1886)
├── sw.js                   ← Service Worker en la raíz (versión 'atmosfera-v1')
└── src/
    ├── config/             ← Límites normativos oficiales (limites.js con artículos)
    ├── core/               ← Evaluación de riesgos y cálculos puros (sin tocar el DOM)
    ├── data/               ← Base de datos local IndexedDB y repositorios (mediciones, sectores, mina)
    ├── alertas/            ← Audio Web Audio API (frecuencias exactas), voz y vibración
    ├── hooks/              ← Conexión entre la vista y repositorios (useAtmosphericData, useAlertas)
    ├── context/            ← Estado global de mina, turno y alertas (MinaContext)
    ├── layout/             ← Barra lateral de navegación, barra superior y pie táctil
    ├── pages/              ← Pantallas de la aplicación (TableroPage)
    ├── components/         ← Componentes reutilizables (MineMap, SectorCard, SectorList, Kpis, Modales)
    ├── demo/               ← Datos de ejemplo iniciales y simulador de gases
    ├── utils/              ← Formateadores de fecha, hora y telemetría
    └── styles/             ← Estilos globales (global.css)
```

---

## ⚖️ Reglas de Arquitectura Cumplidas

1. **`sw.js` en la raíz**: Controla el ciclo de vida de la PWA offline con caché `'atmosfera-v1'`.
2. **`core/` no toca el DOM**: [`src/core/evaluador.js`](file:///C:/Software/NetBeans-25/Proyectos/hackaton-2026/reto-minero/src/core/evaluador.js) y [`src/core/calculos.js`](file:///C:/Software/NetBeans-25/Proyectos/hackaton-2026/reto-minero/src/core/calculos.js) son funciones puras testeables en consola.
3. **Solo `data/` habla con IndexedDB**: Acceso encapsulado mediante [`mediciones.repo.js`](file:///C:/Software/NetBeans-25/Proyectos/hackaton-2026/reto-minero/src/data/mediciones.repo.js), [`sectores.repo.js`](file:///C:/Software/NetBeans-25/Proyectos/hackaton-2026/reto-minero/src/data/sectores.repo.js) y [`mina.repo.js`](file:///C:/Software/NetBeans-25/Proyectos/hackaton-2026/reto-minero/src/data/mina.repo.js).
4. **Límites normativos centralizados**: Viven exclusivamente en [`src/config/limites.js`](file:///C:/Software/NetBeans-25/Proyectos/hackaton-2026/reto-minero/src/config/limites.js) con sus artículos de ley (Oxígeno Art. 38, Gases Art. 39 con Brief & Scala, Metano Art. 53, etc.).
5. **Sistema de alertas acústicas y voz**:
   - Tonos por gas: CH₄ (440 Hz), O₂ (523 Hz), CO (659 Hz), H₂S (784 Hz), otros (880 Hz).
   - Ritmos: Precaución (1 pitido), Alarma (3 pitidos cada 5s), Evacuación (sirena continua).
   - Síntesis de voz (`SpeechSynthesis`) y vibración (`navigator.vibrate`).
6. **Interfaz táctil optimizada para guantes e idioma 100% en español**.

---

## 🚀 Comandos

```bash
# Servidor de desarrollo
npm run dev

# Validar calidad de código (0 warnings, 0 errors)
npm run lint

# Compilar para producción PWA
npm run build
```
