---
name: Underground Atmospheric Telemetry & Life Safety
colors:
  surface: '#111316'
  surface-dim: '#111316'
  surface-bright: '#37393d'
  surface-container-lowest: '#0c0e11'
  surface-container-low: '#1a1c1f'
  surface-container: '#1e2023'
  surface-container-high: '#282a2d'
  surface-container-highest: '#333538'
  on-surface: '#e2e2e6'
  on-surface-variant: '#d7c3ae'
  inverse-surface: '#e2e2e6'
  inverse-on-surface: '#2f3034'
  outline: '#9f8e7a'
  outline-variant: '#524534'
  surface-tint: '#ffb955'
  primary: '#ffc880'
  on-primary: '#452b00'
  primary-container: '#f5a623'
  on-primary-container: '#644000'
  inverse-primary: '#835500'
  secondary: '#c2c6d3'
  on-secondary: '#2b303b'
  secondary-container: '#444954'
  on-secondary-container: '#b4b8c5'
  tertiary: '#d0d2d8'
  on-tertiary: '#2e3036'
  tertiary-container: '#b4b6bd'
  on-tertiary-container: '#45474d'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffddb4'
  primary-fixed-dim: '#ffb955'
  on-primary-fixed: '#291800'
  on-primary-fixed-variant: '#633f00'
  secondary-fixed: '#dee2f0'
  secondary-fixed-dim: '#c2c6d3'
  on-secondary-fixed: '#171c25'
  on-secondary-fixed-variant: '#424751'
  tertiary-fixed: '#e1e2e9'
  tertiary-fixed-dim: '#c4c6cd'
  on-tertiary-fixed: '#191c21'
  on-tertiary-fixed-variant: '#44474c'
  background: '#111316'
  on-background: '#e2e2e6'
  surface-variant: '#333538'
typography:
  display-critical:
    fontFamily: JetBrains Mono
    fontSize: 64px
    fontWeight: '700'
    lineHeight: 72px
    letterSpacing: -0.02em
  headline-xl:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 44px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 30px
  telemetry-value-lg:
    fontFamily: JetBrains Mono
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 52px
  telemetry-value-md:
    fontFamily: JetBrains Mono
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 38px
  telemetry-unit:
    fontFamily: JetBrains Mono
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 26px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  action-label:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '700'
    lineHeight: 20px
    letterSpacing: 0.05em
  code-badge:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system establishes an intrinsically safe, mission-critical digital interface for underground coal mining operations. Operating within extreme subterranean environments characterized by zero ambient light, airborne coal dust, high humidity, acoustic noise, and physical vibration, the interface prioritizes immediate situational awareness and rapid decision-making under stress.

The aesthetic philosophy is **Rugged Industrial Utilitarianism**. Drawing directly from specialized safety instrumentation, avionics, and rugged telemetry consoles, the design discards decorative flourishes, ambient soft shadows, and subtle gradations. Visual architecture relies on sharp contrast boundaries, structural framing, high-density data panels, and clear spatial separation. Every touch target accommodates heavy industrial nitrile or leather mining gloves, requiring decisive, tactile-like micro-interactions with immediate acoustic/visual verification. The emotional goal is absolute operator trust, calm legibility during routine operation, and unignorable urgency during hazardous gas accumulation.

## Colors

The palette operates in strict dark mode to preserve dark adaptation for miners relying on cap lamps, minimize glare, and extend battery longevity on intrinsically safe tablets. Contrast ratios adhere strictly to WCAG 2.1 AAA standards across all active states.

### Core Foundation
- **Background Base (`#121417`)**: Deep anthracite carbon. Eliminates screen wash-out in unlit galleries.
- **Surface Elevation 1 (`#1C1F24`)**: Shielded modular panel background. Provides structural separation from the canvas.
- **Surface Elevation 2 (`#242930`)**: Elevated interactive containers, toolbars, and modal backgrounds.
- **Structural Outlines (`#2B303A`)**: Cold-rolled steel delineation token for boundaries, dividers, and module edges.
- **High-Contrast Text Primary (`#FFFFFF`)**: Full-illumination white for critical values and primary indicators.
- **Text Secondary (`#B0B7C3`)**: High-legibility light silver for labels, units, and secondary operational metrics.

### Mining Accent
- **Amber Miner (`#F5A623`)**: High-visibility safety amber used exclusively for active system controls, active tabs, telemetry sync status, and structural focus rings.

### Life-Safety Semaphore Matrix
Status colors must never be presented solely through chromatic indicators. Every status tier couples its color token with a mandatory alphanumeric code, standard symbol, and operational action directive:
1. **Normal (`#2E9E5B`)**: Atmospheric readings within statutory regulatory thresholds. Standard operational state.
2. **Precaución (`#E5B400`)**: Low-level toxic/combustible accumulation or declining airflow. Requires active supervisor acknowledgment.
3. **Alarma (`#E8590C`)**: Immediate operational threshold breach ($CH_4 \ge 1.0\%$, $CO \ge 50\text{ ppm}$, $O_2 \le 19.0\%$). Directive: **SUSPENDER LABOR**.
4. **Evacuación (`#D62828`)**: Critical explosion or asphyxiation risk ($CH_4 \ge 2.0\%$, $CO \ge 100\text{ ppm}$, $H_2S \ge 10\text{ ppm}$). Directive: **EVACUAR SECTOR**.

## Typography

The typographic hierarchy implements a bifurcated dual-engine model: **Inter** handles narrative structure, labels, prompts, and interface navigation; **JetBrains Mono** governs all numerical readings, sensor metrics, timestamps, and industrial code designations.

### Structural Considerations
- **Zero Ambiguity**: JetBrains Mono provides unambiguous glyph differentiation ($0$ with a clear dot/slash versus $O$; $1$, $I$, and $l$ clearly distinct). This prevents reading errors in dense atmospheres or through scratched tablet screen protectors.
- **Tabular Alignment**: Monospaced rendering ensures numerical decimal places remain locked in spatial position during live telemetry streaming, avoiding eye strain caused by shifting digits.
- **Distance Legibility**: Primary telemetry readings use `display-critical` (64px) and `telemetry-value-lg` (48px), remaining readable from a 2-meter distance when tablets are mounted on shaft bulkheads or continuous miners.
- **Casing and Weight**: Status directives and urgent alerts must always be rendered in full uppercase with bold weights (`fontWeight: 700` or `800`) to maximize word-shape recognition in emergency scenarios.

## Layout & Spacing

The layout is engineered for fixed landscape tablets with a native canvas of **1280x800 px** (WXGA 16:10), standard for explosion-proof intrinsically safe mining computers. 

### Spatial Mechanics
- **Grid Layout**: A deterministic 12-column rigid grid with a constant `16px` (`1rem`) gutter and `16px` outer margin. This maximizes usable screen real estate while reserving a permanent 64px physical top-bar for telemetry heartbeat and emergency broadcasting.
- **Touch Perimeter Enforcement**: Every interactive target (buttons, toggles, selectors) enforces a strict physical bounding box of **at least 56x56 px** (exceeding the standard 48px baseline) with an absolute minimum edge-to-edge separation of `8px` (`space-sm`) to prevent accidental adjacent activation by gloved hands.
- **Ergonomic Thumb Zones**: High-frequency operational toggles (ventilation fans, telemetry silencing, muster triggers) are anchored along the bottom-right and bottom-left lateral clusters for direct thumb access while two-hand holding a rugged tablet enclosure.
- **Adaptive Reflow**: If screen orientation unexpectedly pivots or scales down to rugged 8-inch auxiliary monitors (1024x600), the layout reflows into a single-scroll 6-column matrix with zero loss in font size or target hit area.

## Elevation & Depth

Subterranean rugged environments render soft shadows, skeuomorphic gradients, and blur filters counterproductive. Under heavy ambient dust and direct LED cap-lamp beams, drop shadows create muddy edges and lower contrast.

### Pure Technical Contours
- **Zero Diffusion Shadows**: Blur-based CSS shadows (`box-shadow: 0 4px 12px rgba(...)`) are strictly prohibited across baseline containers.
- **Boundary Precision**: Elevation is communicated via high-contrast technical outlines (`2px` solid `#2B303A`) layered on surface color shifts (`#121417` base $\rightarrow$ `#1C1F24` panel $\rightarrow$ `#242930` active dialog).
- **Hard Safety Elevation (State Alerts)**: When a gas sensor breaches statutory limits, the container adopts a `3px` solid stroke of the associated alert color (`#D62828` for Evacuation, `#E8590C` for Alarm), supplemented by an optional 0px-blur solid 4px hard offset border to create immediate visual dominance.
- **Modal Layering**: Critical interrupt modals utilize a full-canvas opaque overlay (`#121417` at 92% opacity) bounded by a high-visibility amber or red perimeter, isolating the mine operator from non-urgent secondary data.

## Shapes

The interface embraces a low-radius, structured shape language (`roundedness: 1` — base `0.25rem` / 4px border radius). 

### Geometry Rationale
- **Structural Integrity**: A 4px radius preserves the crisp, industrial look of hardware instrumentation consoles and maximize pixel usage in dense grid arrangements. Rounded pill designs and circular floating buttons are avoided, as they decrease effective touch target area at the corners.
- **Modular Tile Nesting**: Minimal rounding permits tight adjacency between sensor tiles, ventilation diagrams, and strip charts without awkward empty gaps.
- **Status Badges & Chips**: Strict rectangular geometry with 2px corner beveling or subtle 4px radius. Actionable buttons and cards use uniform 4px outer profiles, maintaining a sharp visual rhythm across the dashboard.

## Components

### 1. Telemetry Gas Sensor Card (Core Unit)
- **Container**: Surface `#1C1F24`, 2px solid border in `#2B303A`. Minimum height 180px.
- **Header**: Gas chemical formula ($CH_4$, $CO$, $O_2$, $H_2S$, $CO_2$) in `headline-md` Inter accompanied by sensor ID and gallery sector tag in `code-badge`.
- **Value Field**: Current measurement rendered in `display-critical` (64px) JetBrains Mono, aligned with unit identifier (`% Vol`, `ppm`) in `telemetry-unit`.
- **Status Indicator**: Right-aligned vertical status stripe (8px wide) paired with an explicit icon (e.g., Triangle Exclamation, Octagon Hazard, Shield Check) and all-caps text label: `NORMAL`, `PRECAUCIÓN`, `ALARMA`, `EVACUACIÓN`.
- **Alarm State Override**: On `ALARMA` or `EVACUACIÓN`, card border shifts from `#2B303A` to 3px solid `#E8590C` or `#D62828`, with an optional rhythmic 1Hz perimeter pulse.

### 2. Glove-Optimized Industrial Buttons
- **Touch Surface**: Minimum dimensions 64px width $\times$ 56px height. Centered icon (minimum 28px) plus uppercase `action-label`.
- **Primary / Action**: Solid `#F5A623` background with solid `#121417` text and icon. Active press state shifts to `#D48B14` with a 2px inner black border.
- **Critical Action (Evacuate / Muster)**: Solid `#D62828` background with `#FFFFFF` text. Focus state features a 4px white offset stroke.
- **Secondary / Toggle**: Surface `#242930` with 2px stroke `#2B303A`. Text `#FFFFFF`. Active state highlighted by a 2px Amber Miner outline.

### 3. Semaphore Status Chips & Badges
- **Structure**: High-contrast, non-translucent pill-box with 4px radius. 
- **Content Requirement**: Must always include:
  1. High-contrast icon (Check, Warning Triangle, Siren, Skull/Crossed Exclamation).
  2. Severity Code (`N1`, `W2`, `A3`, `E4`).
  3. Action Directive string (`NORMAL`, `PRECAUCIÓN`, `SUSPENDER LABOR`, `EVACUAR`).
- **Colors**: Solid fill corresponding to the semaphore token; high-contrast text overlay (`#FFFFFF` for Red, Green, and Orange; `#121417` for Amber Yellow).

### 4. Direct Numerical Input & Calibration Steppers
- Standard free-text keyboard inputs are prohibited in the telemetry view to avoid frustrating typing with gloves.
- Values are manipulated via massive stepped touch triggers: `[-]` and `[+]` paddle buttons (minimum 64x64 px) flanking a central JetBrains Mono readout tile.

### 5. Strip Charts & Trend Vectors
- Simple 60-second and 15-minute historical sparklines rendered with a 3px stroke vector (no smooth bezier curves; clear stepped points). Threshold limit lines drawn with dashed high-visibility markers in yellow or red.

### 6. Emergency Broadcast Bar
- Anchored to the persistent top canvas (height: 64px). Houses battery level indicator with numerical percentage, intrinsic Wi-Fi/mesh signal strength, Colombian mining authority sync status, and the master sector evacuation trigger.