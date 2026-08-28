import { Route, Routes } from 'react-router-dom'
import { NetworkProvider } from './context/NetworkContext'
import { SpoilageProvider } from './context/SpoilageContext'
import { AppShell } from './components/layout/AppShell'
import DashboardPage from './pages/DashboardPage'
import FlowAnalysisPage from './pages/network/FlowAnalysisPage'
import BottlenecksPage from './pages/network/BottlenecksPage'
import ScenarioLabPage from './pages/network/ScenarioLabPage'
import GraphManagerPage from './pages/network/GraphManagerPage'
import BenchmarksPage from './pages/network/BenchmarksPage'
import RiskRankingPage from './pages/spoilage/RiskRankingPage'
import PriorityQueuePage from './pages/spoilage/PriorityQueuePage'
import SpoilageBenchmarksPage from './pages/spoilage/SpoilageBenchmarksPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <NetworkProvider>
      <SpoilageProvider>
        <AppShell>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/network" element={<FlowAnalysisPage />} />
            <Route path="/network/bottlenecks" element={<BottlenecksPage />} />
            <Route path="/network/scenarios" element={<ScenarioLabPage />} />
            <Route path="/network/graph" element={<GraphManagerPage />} />
            <Route path="/network/benchmarks" element={<BenchmarksPage />} />
            <Route path="/spoilage" element={<RiskRankingPage />} />
            <Route path="/spoilage/priority" element={<PriorityQueuePage />} />
            <Route path="/spoilage/benchmarks" element={<SpoilageBenchmarksPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AppShell>
      </SpoilageProvider>
    </NetworkProvider>
  )
}
