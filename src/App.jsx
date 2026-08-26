import { Route, Routes } from 'react-router-dom'
import { NetworkProvider } from './context/NetworkContext'
import { AppShell } from './components/layout/AppShell'
import DashboardPage from './pages/DashboardPage'
import FlowAnalysisPage from './pages/network/FlowAnalysisPage'
import BottlenecksPage from './pages/network/BottlenecksPage'
import ScenarioLabPage from './pages/network/ScenarioLabPage'
import GraphManagerPage from './pages/network/GraphManagerPage'
import BenchmarksPage from './pages/network/BenchmarksPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <NetworkProvider>
      <AppShell>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/network" element={<FlowAnalysisPage />} />
          <Route path="/network/bottlenecks" element={<BottlenecksPage />} />
          <Route path="/network/scenarios" element={<ScenarioLabPage />} />
          <Route path="/network/graph" element={<GraphManagerPage />} />
          <Route path="/network/benchmarks" element={<BenchmarksPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AppShell>
    </NetworkProvider>
  )
}
