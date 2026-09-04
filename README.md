# 🌿 AgriPulse Frontend – Integrated Intelligent Decision Support System

AgriPulse is the unified frontend for a five-module Programming, Data Structures and Algorithms (PDSA) coursework project focused on tea supply-chain operations and factory decision support.

The application combines resource allocation, route optimization, supply-network analysis, spoilage-risk decision support, and factory scheduling within one React + Vite web interface.

---

## 1. Integrated Module Architecture

| Coursework Module | Frontend Area | Backend Port | Frontend Proxy | Main Algorithms / Capabilities |
|---|---|---:|---|---|
| **Module 1 – Intelligent Route Optimization** | Collection & Dispatch | `8082` | `/module1-api` | Dijkstra shortest path, priority-based dispatch, road-condition handling |
| **Module 2 – Intelligent Resource Allocation** | Resource Planning | `8083` | `/module2-api` | 0/1 Knapsack, Fractional Knapsack, Greedy allocation, pump-allocation evaluation |
| **Module 3 – Network Analysis** | Supply Network | `8080` | `/module3-api` | Ford-Fulkerson maximum flow, bottleneck/critical-link analysis, scenario planning, benchmarks |
| **Module 4 – Intelligent Decision** | Quality Protection | `8081` | `/module4-api` | Spoilage-risk scoring, Merge/Insertion/Bubble sorting, Max-Heap priority queue |
| **Module 5 – Optimization** | Factory Operations | `8084` | `/module5-api` | Genetic Algorithm, Simulated Annealing, schedule comparison and benchmarking |
| **Frontend** | Unified Operations Platform | `5173` | — | React dashboard, navigation, charts, forms, network visualisation |

---

## 2. Technology Stack

- **React 18**
- **Vite 7**
- **React Router**
- **Axios**
- **Tailwind CSS**
- **Recharts**
- **Leaflet / React-Leaflet**
- **Lucide React Icons**
- Five Spring Boot backend services
- PostgreSQL databases

---

## 3. Prerequisites

Before running the frontend, make sure the following are available:

1. **Node.js 20+** and **npm**
2. PostgreSQL / Docker database environment running
3. All required backend services running on their assigned ports
4. A modern web browser such as Chrome, Edge, or Firefox

---

## 4. Frontend Environment Configuration

Create a `.env` file in the frontend project root with the following values:

```env
VITE_MODULE1_API_BASE_URL=/module1-api
VITE_MODULE2_API_BASE_URL=/module2-api
VITE_MODULE3_API_BASE_URL=/module3-api
VITE_MODULE4_API_BASE_URL=/module4-api
VITE_MODULE5_API_BASE_URL=/module5-api
```

The Vite development server proxies these paths to the five backend services:

```text
/module1-api  → http://localhost:8082
/module2-api  → http://localhost:8083
/module3-api  → http://localhost:8080
/module4-api  → http://localhost:8081
/module5-api  → http://localhost:8084
```

The proxy configuration is defined in `vite.config.js`.

---

## 5. Quick Start

### Step 1 – Start the Database Environment

Start the PostgreSQL environment used by the backend services. If the group project uses Docker Compose, run the relevant compose file from the backend/database directory.

Example:

```bash
docker compose up -d
```

### Step 2 – Start the Five Backend Modules

Run the Spring Boot backend services so that the following ports are available:

```text
Module 3 – Network Analysis       : 8080
Module 4 – Intelligent Decision   : 8081
Module 1 – Route Optimization     : 8082
Module 2 – Resource Allocation    : 8083
Module 5 – Optimization           : 8084
```

### Step 3 – Install Frontend Dependencies

Open a terminal inside the `AgriPulse_Frontend` directory:

```bash
npm install
```

### Step 4 – Run the Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

---

## 6. Application Pages

### Operations Overview

| Route | Page |
|---|---|
| `/` | Operations Overview |

The dashboard provides a unified entry point to the five operational modules.

### Module 2 – Resource Planning

| Route | Page |
|---|---|
| `/fertilizer` | Fertilizer Planning |
| `/pumps` | Irrigation Planning |

Main capabilities include farm/resource input, fertilizer-allocation analysis, comparison of allocation strategies, and pump-allocation performance testing.

### Module 1 – Collection & Dispatch

| Route | Page |
|---|---|
| `/dispatch` | Dispatch Control |
| `/dispatch/calculator` | Route Planning |
| `/dispatch/roads` | Road Conditions |

The dispatch module supports priority-based collection decisions, Dijkstra shortest-path calculations, and road-condition updates such as closures and monsoon conditions.

### Module 3 – Supply Network Analysis

| Route | Page |
|---|---|
| `/network` | Flow Monitoring |
| `/network/bottlenecks` | Critical Connections |
| `/network/scenarios` | Scenario Planning |
| `/network/graph` | Network Configuration |
| `/network/benchmarks` | Performance Insights |

Module 3 allows users to manually configure the operational network by adding locations and transport connections. The saved network is then analysed using maximum-flow and bottleneck-analysis techniques.

Key functions include:

- Add, edit, and delete supply-network locations
- Add, edit, and delete directed transport connections
- Configure daily carrying capacities
- Run Ford-Fulkerson maximum-flow analysis
- Identify saturated and critical connections
- Rank connection risks
- Test temporary what-if scenarios without changing the saved network
- Run small, medium, and large benchmark networks to evaluate execution time, memory use, and scalability

### Module 4 – Quality Protection

| Route | Page |
|---|---|
| `/spoilage` | Batch Risk Monitor |
| `/spoilage/priority` | Urgent Batch Queue |
| `/spoilage/benchmarks` | Quality Performance |

This module evaluates spoilage risk and supports priority handling through sorting algorithms and a Max-Heap-based priority queue.

### Module 5 – Factory Operations

| Route | Page |
|---|---|
| `/scheduling` | Shift Planning |
| `/scheduling/benchmarks` | Scheduling Insights |

This module compares optimization approaches for factory scheduling, including Genetic Algorithm and Simulated Annealing solutions.

---

## 7. Module 3 Workflow Example

The Network Analysis module follows this operational flow:

```text
Network Configuration
        ↓
Add Locations and Connections
        ↓
Save Network Data
        ↓
Flow Monitoring
        ↓
Ford-Fulkerson Maximum Flow
        ↓
Critical Connection Analysis
        ↓
Scenario Planning
        ↓
Performance Benchmarking
```

A location represents a graph **vertex/node**, while a transport connection represents a directed graph **edge**. The daily carrying limit of a connection is used as its **capacity**.

---

## 8. Useful Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Create production build
npm run build

# Preview production build
npm run preview
```

The production build is generated in the `dist/` directory.

---

## 9. Source-Code Submission Notes

For the **Complete Source Code** submission, the following generated folders should normally be excluded from the frontend ZIP:

```text
node_modules/
dist/
.vite/
```

Keep the following files and folders:

```text
src/
index.html
package.json
package-lock.json
vite.config.js
postcss.config.js
tailwind.config.js
.gitignore
README.md
.env.example (recommended)
```

If the `.env` file contains only the local proxy paths shown above, it does not contain credentials. For a cleaner submission, it can still be copied to `.env.example` and the local `.env` file can be excluded.

---

## 10. Troubleshooting

### Frontend starts but API requests fail

Check that all five backend services are running on the expected ports and that the `.env` proxy paths match `vite.config.js`.

### `npm install` reports a Vite dependency conflict

Use the dependency versions defined in the submitted `package.json` and `package-lock.json`. Do not manually upgrade Vite or the React plugin during coursework submission preparation.

### Port 5173 is already in use

Stop the existing Vite process before starting another development server.

### Changes to `.env` are not detected

Stop and restart the Vite development server after changing environment variables.

---

## 11. Project Purpose

AgriPulse was developed as an integrated Intelligent Decision Support System for the PDSA coursework. Its main purpose is not only to provide a working application, but also to demonstrate appropriate algorithm selection, data-structure design, computational analysis, and experimental performance evaluation across five computational problems.

---

**AgriPulse Integrated Operations Platform**  
Built with React, Vite, Spring Boot, PostgreSQL, and algorithmic decision-support techniques.
