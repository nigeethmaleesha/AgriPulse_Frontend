import { Route, Routes } from 'react-router-dom'
import { NetworkProvider } from './context/NetworkContext'
import { SpoilageProvider } from './context/SpoilageContext'
import { SchedulingProvider } from './context/SchedulingContext'
import { AllocationProvider } from './context/AllocationContext'
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
import LiveDispatchPage from './pages/dispatch/LiveDispatchPage'
import RouteCalculatorPage from './pages/dispatch/RouteCalculatorPage'
import RoadControlPage from './pages/dispatch/RoadControlPage'
import FactorySchedulingPage from './pages/scheduling/FactorySchedulingPage'
import FertilizerAllocationPage from './pages/allocation/FertilizerAllocationPage'
import PumpAllocationPage from './pages/allocation/PumpAllocationPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <NetworkProvider>
      <SpoilageProvider>
        <SchedulingProvider>
          <AllocationProvider>
            <AppShell>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/dispatch" element={<LiveDispatchPage />} />
                <Route path="/dispatch/calculator" element={<RouteCalculatorPage />} />
                <Route path="/dispatch/roads" element={<RoadControlPage />} />
                <Route path="/fertilizer" element={<FertilizerAllocationPage />} />
                <Route path="/pumps" element={<PumpAllocationPage />} />
                <Route path="/network" element={<FlowAnalysisPage />} />
                <Route path="/network/bottlenecks" element={<BottlenecksPage />} />
                <Route path="/network/scenarios" element={<ScenarioLabPage />} />
                <Route path="/network/graph" element={<GraphManagerPage />} />
                <Route path="/network/benchmarks" element={<BenchmarksPage />} />
                <Route path="/spoilage" element={<RiskRankingPage />} />
                <Route path="/spoilage/priority" element={<PriorityQueuePage />} />
                <Route path="/spoilage/benchmarks" element={<SpoilageBenchmarksPage />} />
                <Route path="/scheduling" element={<FactorySchedulingPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </AppShell>
          </AllocationProvider>
        </SchedulingProvider>
      </SpoilageProvider>
    </NetworkProvider>
  )
}
