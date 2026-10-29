# Normativa Minera: Decreto 1886 de 2015 (Colombia)

Guía técnica y normativa implementada en la PWA de monitoreo atmosférico para labores mineras subterráneas de carbón.

---

## 1. Oxígeno ($O_2$) - Artículo 38
* **Concentración apta:** Exclusivamente entre **19.5% y 23.5% en volumen**.
* **Acción:** Si el oxígeno cae por debajo del 19.5%, se activa el protocolo de **Evacuación Inmediata** y uso de auto-rescatador.

---

## 2. Gases Tóxicos - Artículo 39
Límites permisibles en partes por millón (PPM):

| Gas | Nombre | TWA (8h) | STEL (15 min) |
| :--- | :--- | :--- | :--- |
| **$CO_2$** | Dióxido de carbono | 5.000 PPM | 30.000 PPM |
| **$CO$** | Monóxido de carbono | 25 PPM | — |
| **$H_2S$** | Ácido sulfhídrico | 1 PPM | 5 PPM |
| **$SO_2$** | Dióxido de azufre | — | 0.25 PPM |
| **$NO$** | Óxido nítrico | 25 PPM | — |
| **$NO_2$** | Dióxido de nitrógeno | — | 0.2 PPM |

### Corrección por Jornada Prolongada (Brief & Scala)
Para jornadas laborales ($hd$) mayores a 8 horas continuas:
$$F_c = \left(\frac{8}{hd}\right) \times \left(\frac{24 - hd}{16}\right)$$
$$VLP_c = F_c \times VLP$$

---

## 3. Metano ($CH_4$) - Artículos 53 y 162
* **Frentes de explotación o avance:** Máximo **1.0%** (20% LEL).
* **Retornos principales de aire:** Máximo **1.0%** (20% LEL).
* **Retorno de tajos y frentes de preparación:** Máximo **1.5%** (30% LEL).
* **Prohibición de voladura (Art. 162):** Queda prohibida cualquier detonación con **0.5% o más** de metano.
* **Evacuación:** Con más de **2.0%** solo se permite ingreso a cuadrillas de salvamento minero.

---

## 4. Frecuencia de Medición - Artículos 58 y 60
* **Categoría I (0% $CH_4$):** Inicio de cada turno y antes de cada voladura.
* **Categoría II (hasta 0.3% $CH_4$):** Inicio de turno, antes de voladuras y **máximo cada 2 horas**.
* **Categoría III (> 0.3% $CH_4$):** Antes de cada turno y de forma continua.

---

## 5. Ventilación: Velocidad y Caudal - Artículos 54 y 56
* **Velocidad mínima:**
  * Vías con trolley: $\ge 1.0\text{ m/s}$.
  * Galerías de explotación: $\ge 0.5\text{ m/s}$.
  * Ventilación auxiliar en carbón: $\ge 0.3\text{ m/s}$.
  * Tambores ascendentes: $\ge 0.5\text{ m/s}$.
* **Velocidad máxima:** $6.0\text{ m/s}$ en tránsito y $4.5\text{ m/s}$ en tajos.
* **Caudal por persona:**
  * Altitud $\le 1.500\text{ msnm}$: $3.0\text{ m}^3/\text{min}$ por trabajador.
  * Altitud $> 1.500\text{ msnm}$: $6.0\text{ m}^3/\text{min}$ por trabajador.

