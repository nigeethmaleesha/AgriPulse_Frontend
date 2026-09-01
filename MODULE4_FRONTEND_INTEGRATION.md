# AgriPulse Frontend - Module 3 + Module 4

This frontend keeps the existing Module 3 network implementation intact and adds Module 4 spoilage intelligence.

## Services

- Module 3 backend: `http://localhost:8080`
- Module 4 backend: `http://localhost:8081`
- React/Vite frontend: `http://localhost:5173`

Module 3 continues to use `VITE_API_BASE_URL` directly. Module 4 uses `/module4-api` in development; Vite proxies that path to port `8081`, so the completed Module 4 backend does not need a CORS code change.

## Run

1. Start PostgreSQL/databases required by each backend.
2. Start the existing Module 3 Spring Boot backend on port 8080.
3. Start the supplied Module 4 Spring Boot backend on port 8081.
4. In this frontend folder run:

```bash
npm install
npm run dev
```

## Module 4 screens

- `/spoilage` - Member 7 risk scoring and Merge/Insertion/Bubble ranking
- `/spoilage/priority` - Member 8 custom max-heap live priority queue
- `/spoilage/benchmarks` - Member 7 and Member 8 experimental comparison

## Module 4 API contract

The frontend uses only endpoints present in the supplied Module 4 backend:

- `GET /api/spoilage/ranking?method=...`
- `POST /api/spoilage/batches`
- `POST /api/spoilage/benchmark?sizes=...`
- `POST /api/spoilage/priority/reload`
- `GET /api/spoilage/priority/top`
- `POST /api/spoilage/priority/pop`
- `POST /api/spoilage/priority/batches`
- `POST /api/spoilage/priority/enqueue/{batchId}`
- `PUT /api/spoilage/priority/refresh/{batchId}`
- `GET /api/spoilage/priority/heap`
- `GET /api/spoilage/priority/ordered`
- `GET /api/spoilage/priority/status`
- `DELETE /api/spoilage/priority/clear`
- `GET /api/spoilage/priority/benchmark/presets`
- `POST /api/spoilage/priority/benchmark`
- `GET /api/spoilage/priority/benchmark/results`

Risk score is never calculated by React. The backend remains the single source of algorithmic decisions.
