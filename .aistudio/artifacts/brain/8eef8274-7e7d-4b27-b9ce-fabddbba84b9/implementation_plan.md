# Implementation Plan: HazePulse Clean Light Scientific Redesign & Real-Time Dynamic Data

Transform HazePulse from a generic dark AI-themed interface into a crisp, human-designed scientific environmental decision-support system. This plan addresses the sticky sidebar layout bug, replaces the artificial color palette with a professional Clean Light theme, and replaces static template numbers with live, factual Open-Meteo atmospheric telemetry per exact GPS coordinate.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **Confirmed Choices from Phase 1:**
> - **Visual Direction**: **Clean Light Theme** — Crisp paper-white (`#ffffff`) and slate-50 (`#f8fafc`) background, dark graphite typography (`#0f172a`), subtle slate borders (`#e2e8f0`), and natural meteorological accents (green `#16a34a`, amber `#d97706`, rose `#e11d48`) without any generic AI neon glow.
> - **Data Strategy**: **Live Open-Meteo per exact GPS coordinates** — Real-time fetching of actual PM2.5, PM10, NO₂, CO, temperature, and wind vectors with dynamic calculations of exposure scores and peak windows so values differ genuinely across locations.
> - **Layout Fix**: Viewport-locked sidebar (`h-screen sticky top-0 overflow-y-auto`) with independent scrolling main content area (`flex-1 h-screen overflow-y-auto`).

---

## 1. Overview & Core Concept

HazePulse is an environmental intelligence system designed to answer: *"What will the air quality be in the next 24–48 hours, what is causing it, what is my personal exposure, and what proactive actions should I take?"*

This update eliminates the "AI template" impression by providing:
1. **Authentic Data Grounding**: Actual live measurements from Open-Meteo CAMS Ensemble and weather stations for any coordinate in Indonesia or worldwide.
2. **Scientific Clarity**: Legible, calm, research-grade UI designed for researchers, athletes, and campus administrators.
3. **Flawless Layout Ergonomics**: Fixed desktop sidebar navigation with smooth independent content scrolling.

---

## 2. User Experience & Visual Design

### Visual Identity: Clean Light Scientific
- **Palette**:
  - Main Background: `#f8fafc` (slate-50)
  - Card Surfaces: `#ffffff` (pure white) with `#e2e8f0` (slate-200) borders and soft natural elevations (`shadow-sm`)
  - Typography: Slate-900 (`#0f172a`) for primary headers; Slate-600 (`#475569`) for labels and metadata; Slate-400 (`#94a3b8`) for secondary time-stamps
  - Environmental Status Tones:
    - *Good (0–12 µg/m³)*: `#15803d` (natural emerald)
    - *Moderate (12.1–35.4 µg/m³)*: `#b45309` (warm amber)
    - *Unhealthy for Sensitive Groups (35.5–55.4 µg/m³)*: `#ea580c` (terracotta orange)
    - *Unhealthy (55.5+ µg/m³)*: `#e11d48` (rose red)
- **Zero-Pill Discipline**:
  - Replace static pill capsules with clean unboxed text and typographic bullet separators (`·`, `/`).
  - Active interactive filters remain distinct button groups with clean borders.
- **Fixed Sidebar Architecture**:
  - Layout container: `flex h-screen w-full overflow-hidden bg-slate-50 text-slate-900`
  - Sidebar: `h-screen sticky top-0 overflow-y-auto w-72 shrink-0 border-r border-slate-200 bg-white`
  - Main Viewport: `flex-1 h-screen overflow-y-auto flex flex-col`

---

## 3. Real-Time Data Pipeline & Dynamic State

```text
┌────────────────────────────────────────────────────────┐
│               USER GPS / SELECTED CITY                 │
│         Exact Coordinates (Lat, Lon, Elevation)        │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│             OPEN-METEO DUAL LIVE API CLIENT            │
│  1. Air Quality API: PM2.5, PM10, NO2, CO, US AQI      │
│  2. Weather API: Wind Speed/Dir, Temp, Humidity        │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│            DYNAMIC HAZEPULSE ENGINE (NO MOCKS)         │
│  - Current PM2.5 / PM10 / NO2 / Wind dynamically read  │
│  - Indicative Score = f(PM2.5, NO2, Stagnation)        │
│  - 24-48h Hourly Curve = actual Open-Meteo forecast   │
│  - Peak Window & Best Window = algorithmic min/max     │
│  - Personal Exposure = dynamically recalculated       │
└────────────────────────────────────────────────────────┘
```

1. **No More Hardcoded 44.5 / 22.5**:
   - The app dynamically parses the current hour's real reading from Open-Meteo.
   - If the user switches from Jember to Jakarta or Surabaya, or enables their real browser GPS, the values update to reflect the actual live atmosphere at that exact spot.
2. **Dynamic Indicative Score**:
   - Calculated as: $\text{Score} = \min(100, \text{round}((\text{PM2.5} / 75) \times 70 + (\text{WindFactor} \times 15) + (\text{NO2} \times 0.5)))$.
3. **Dynamic Projection Trend**:
   - Calculates the delta between current PM2.5 and PM2.5 at $t+6$ hours:
   - If $\Delta \ge +3$: *"naik dalam 6 jam"*
   - If $\Delta \le -3$: *"turun dalam 6 jam"*
   - Otherwise: *"stabil dalam 6 jam"*

---

## 4. Component Refactoring & Implementation Steps

1. **Global Styling & Theme (`src/index.css`)**:
   - Set up Clean Light CSS variables, clean light scrollbars, and slate contrast typography.
2. **Layout Structure (`src/App.tsx`)**:
   - Fix viewport height `h-screen overflow-hidden` on parent container.
   - Keep `<Sidebar />` static and `<main>` independently scrolling.
3. **Sidebar Refactoring (`src/components/Sidebar.tsx`)**:
   - Restyle into white background, slate-200 borders, clean typography, and emerald active states.
4. **Navbar Refactoring (`src/components/Navbar.tsx`)**:
   - Clean light header with border-b border-slate-200, crisp date format, and unboxed status indicators.
5. **Real-Time Data Service (`src/services/airQualityService.ts` & `server.ts`)**:
   - Enhance API proxy to fetch combined hourly air quality + live meteorological weather (wind & temp).
   - Compute real minimum/maximum hour intervals for recommendations.
6. **Views Refactoring (`SummaryView`, `ForecastView`, `PersonalExposureView`, `SimulatorView`, `CompareView`, `RouteView`, `CommunityView`, `BenchmarkView`, `TanyaHazeDrawer`)**:
   - Convert all card backgrounds from dark forest green to clean slate/white cards.
   - Update all charts and SVG graphs to use crisp clean light slate grids and emerald/amber curves.
   - Ensure all data displays bind directly to the live dynamic state.

---

## 5. Verification Plan & Completion Status

- [x] **Layout Test**: Sidebar stays firmly locked at 100vh with smooth independent scrolling in the main content area.
- [x] **Location Switch Test**: Verified live atmospheric telemetry across Indonesian and global cities (Jakarta, Surabaya, Bandung, Medan, Yogyakarta, Denpasar, Jember) and browser GPS with genuine varying sensor readings.
- [x] **Visual Quality**: Clean Light scientific interface applied across all tabs (`SummaryView`, `ForecastView`, `PersonalExposureView`, `SimulatorView`, `CompareView`, `RouteView`, `CommunityView`, `BenchmarkView`).
- [x] **Expansive Google-like AI ("Tanya Haze")**: Powered by Gemini (`gemini-3.5-flash-lite` / `gemini-3.1-flash-lite`) paired with multi-turn context memory, live air quality awareness, and Wikipedia knowledge retrieval for broad topics (science, health, geography, history, general encyclopedic inquiries).
- [x] **Fluid Drawer Animations**: Added smooth slide-in (`animate-drawer-in`), backdrop blur transition (`animate-fade-in-overlay`), and pulse CTA ring to the drawer.
- [x] **Build & Lint**: Verified `compile_applet` and `lint_applet` with zero errors.
