# 🌿 AgriPulse Frontend - Integrated Operations Platform

AgriPulse is a comprehensive, multi-module decision-support system designed for tea supply chain logistics and factory operations. The frontend unifies three specialized backend modules into a single, high-performance React + Vite web dashboard.

> 📖 **Full System Documentation**: For a complete, step-by-step operational guide and page-by-page technical breakdown, see [**FRONTEND_DOCUMENTATION.md**](file:///d:/NIBM/3rd%20year/PDSA%20-%202/System/sys/AgriPulse_Frontend/FRONTEND_DOCUMENTATION.md).

---


## 🚀 System Architecture & Service Ports

| Module | Backend Engine | Service Port | Frontend Proxy Path | Primary Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Module 3** | Tea Supply Network Engine | `http://localhost:8080` | Direct (`VITE_API_BASE_URL`) | Daily throughput max flow (Ford-Fulkerson), critical connection bottlenecks, what-if planning. |
| **Module 4** | Spoilage Intelligence | `http://localhost:8081` | `/module4-api` | Risk scoring, Merge/Insertion/Bubble ranking, custom Max-Heap priority queues & benchmarks. |
| **Dispatch Engine** | Urgent Collection & Route Engine | `http://localhost:8082` | `/dispatch-api` | Dijkstra shortest path, Max-Heap priority target selection, live DB road status & monsoon control. |
| **Frontend** | React 18 + Vite | `http://localhost:5173` | N/A | Unified operations shell, interactive network graphs, live command center. |

---

## 🛠️ Requirements & Quick Start Guide

### Prerequisites
1. **Node.js** (v18 or higher recommended) & **npm**
2. **PostgreSQL** running on port `5432` (`agripulse_postgres` container via `docker compose up -d`)
3. **Java JDK 17+ / JDK 24** & **Apache Maven** for backend services

---

### Step 1: Start Databases (PostgreSQL)

Navigate to `AgriPulse_Backend` directory and start Docker:
```bash
cd sys/AgriPulse_Backend
docker compose up -d
```

---

### Step 2: Start Backend Services

Start each Spring Boot backend service on its designated port:

- **Dispatch & Route Engine (Port 8082)**:
  ```bash
  cd sys/AgriPulse_Backend
  mvn spring-boot:run
  ```
  *(Note: Port `8082` is configured in `src/main/resources/application.properties`)*

- **Module 3 Backend (Port 8080)** (if running full suite):
  ```bash
  mvn spring-boot:run -Dspring-boot.run.arguments="--server.port=8080"
  ```

- **Module 4 Backend (Port 8081)** (if running full suite):
  ```bash
  mvn spring-boot:run -Dspring-boot.run.arguments="--server.port=8081"
  ```

---

### Step 3: Configure Frontend & Environment

Navigate to the `AgriPulse_Frontend` folder:
```bash
cd sys/AgriPulse_Frontend
```

Verify or create your `.env` file (copied from `.env.example`):
```env
# Module 3 Backend
VITE_API_BASE_URL=http://localhost:8080

# Module 4 Backend Proxy
VITE_MODULE4_API_BASE_URL=/module4-api

# Dispatch & Route Engine Proxy (Port 8082)
VITE_DISPATCH_API_BASE_URL=/dispatch-api
```

---

### Step 4: Install Dependencies & Run Development Server

```bash
npm install
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## 🗺️ Module & Page Map

### 🚚 Dispatch & Route Engine (Port 8082)
- **`/dispatch` — Live Dispatch Center**:
  - Interactively select dispatch truck starting node (C1 to C6).
  - Compute optimal route using Max-Heap priority target selection and Dijkstra shortest-path calculations.
  - Interactive path visualization displaying target collection points, distance costs, and node sequences.
  - One-click **"Mark Batch as Collected"** to collect tea batches and trigger automatic route recalculation.
  - One-click **"Reset / Seed Database"** (`POST /api/v1/dispatch/seed-data`) to populate initial nodes C1-C6, roads, and ready batches B-102 and B-091.
- **`/dispatch/calculator` — Route Playground**:
  - Test custom harvest batch priority scores and custom road graph edge weights in-memory via `POST /api/v1/dispatch/calculate-route`.
- **`/dispatch/roads` — Road Hazard Control**:
  - Live table of PostgreSQL road segments (C1-C2, C2-C3, C4-C6, etc.).
  - Dynamic toggles to open/close roads or activate monsoon weather penalties (`PUT /api/v1/dispatch/roads/{id}/status`) with instant dynamic route recalculation.

### 🌐 Tea Supply Network (Module 3 - Port 8080)
- **`/` — Operations Overview**: Executive dashboard summarizing active locations, system connectivity, and daily throughput metrics.
- **`/network` — Daily Throughput**: Maximum flow throughput checks using Ford-Fulkerson.
- **`/network/bottlenecks` — Critical Connections**: Vulnerability analysis on key transport links.
- **`/network/scenarios` — What-If Planning**: Scenario laboratory for testing road upgrades or closures.
- **`/network/graph` — Network Setup**: Interactive network topology editor.
- **`/network/benchmarks` — System Performance**: Execution time benchmarks.

### 🍂 Spoilage Intelligence (Module 4 - Port 8081)
- **`/spoilage` — Risk Ranking**: Batch risk scoring using Merge Sort, Insertion Sort, and Bubble Sort algorithms.
- **`/spoilage/priority` — Live Priority Queue**: Live Max-Heap queue operations (Enqueue, Peek Top, Pop, Refresh).
- **`/spoilage/benchmarks` — Algorithm Comparison**: Performance profiling across synthetic batch sizes.

---

## ⚡ Dispatch Engine (Port 8082) API Contract

The frontend connects to the following endpoints on port `8082` (proxied via `/dispatch-api`):

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/dispatch/seed-data` | Seeds initial DB nodes (C1-C6), 7 roads, and ready batches (B-102, B-091). |
| `GET` | `/api/v1/dispatch/next-route?truckNode=C1` | Calculates optimal Dijkstra route targeting the highest priority Max-Heap ready batch. |
| `POST` | `/api/v1/dispatch/calculate-route` | In-memory route calculation using custom request payload. |
| `PUT` | `/api/v1/dispatch/roads/{id}/status` | Updates open/closed status or monsoon hazard flag for a road segment in PostgreSQL. |
| `PUT` | `/api/v1/dispatch/batches/{id}/collect?truckNode=C1` | Marks harvest batch as `COLLECTED` in DB and returns recalculated next route. |

---

## 🛠️ Useful Commands

```bash
# Start frontend development server
npm run dev

# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

---

*AgriPulse Operations Shell · Built with React, Vite, Tailwind CSS, Lucide Icons, and Spring Boot.*