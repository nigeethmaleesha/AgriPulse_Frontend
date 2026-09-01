import {
  Activity,
  BarChart3,
  Boxes,
  CalendarClock,
  ClipboardCheck,
  Droplets,
  GitBranch,
  LayoutDashboard,
  ListOrdered,
  Network,
  Route,
  ShieldAlert,
  Sprout,
  ThermometerSun,
  Truck,
} from 'lucide-react'

export const navigationGroups = [
  { label: 'Workspace', items: [
    { to: '/', label: 'Operations Overview', shortLabel: 'Overview', icon: LayoutDashboard },
  ] },
  { label: 'Resource Planning', items: [
    { to: '/fertilizer', label: 'Fertilizer Planning', shortLabel: 'Fertilizer', icon: Sprout },
    { to: '/pumps', label: 'Irrigation Planning', shortLabel: 'Irrigation', icon: Droplets },
  ] },
  { label: 'Collection & Dispatch', items: [
    { to: '/dispatch', label: 'Dispatch Control', shortLabel: 'Dispatch', icon: Truck },
    { to: '/dispatch/calculator', label: 'Route Planning', shortLabel: 'Routes', icon: Route },
    { to: '/dispatch/roads', label: 'Road Conditions', shortLabel: 'Roads', icon: ShieldAlert },
  ] },
  { label: 'Supply Network', items: [
    { to: '/network', label: 'Flow Monitoring', shortLabel: 'Flow', icon: Network },
    { to: '/network/bottlenecks', label: 'Critical Connections', shortLabel: 'Risks', icon: Activity },
    { to: '/network/scenarios', label: 'Scenario Planning', shortLabel: 'Scenarios', icon: GitBranch },
    { to: '/network/graph', label: 'Network Configuration', shortLabel: 'Setup', icon: Boxes },
    { to: '/network/benchmarks', label: 'Performance Insights', shortLabel: 'Insights', icon: BarChart3 },
  ] },
  { label: 'Quality Protection', items: [
    { to: '/spoilage', label: 'Batch Risk Monitor', shortLabel: 'Risk', icon: ThermometerSun },
    { to: '/spoilage/priority', label: 'Urgent Batch Queue', shortLabel: 'Queue', icon: ListOrdered },
    { to: '/spoilage/benchmarks', label: 'Quality Performance', shortLabel: 'Quality', icon: ClipboardCheck },
  ] },
  { label: 'Factory Operations', items: [
    { to: '/scheduling', label: 'Shift Planning', shortLabel: 'Shifts', icon: CalendarClock },
    { to: '/scheduling/benchmarks', label: 'Scheduling Insights', shortLabel: 'Insights', icon: BarChart3 },
  ] },
]

export const routeMeta = {
  '/': { title: 'Operations Overview', section: 'Executive workspace' },
  '/fertilizer': { title: 'Fertilizer Planning', section: 'Resource planning' },
  '/pumps': { title: 'Irrigation Planning', section: 'Resource planning' },
  '/dispatch': { title: 'Dispatch Control', section: 'Collection & dispatch' },
  '/dispatch/calculator': { title: 'Route Planning', section: 'Collection & dispatch' },
  '/dispatch/roads': { title: 'Road Conditions', section: 'Collection & dispatch' },
  '/network': { title: 'Flow Monitoring', section: 'Supply network' },
  '/network/bottlenecks': { title: 'Critical Connections', section: 'Supply network' },
  '/network/scenarios': { title: 'Scenario Planning', section: 'Supply network' },
  '/network/graph': { title: 'Network Configuration', section: 'Supply network' },
  '/network/benchmarks': { title: 'Performance Insights', section: 'Supply network' },
  '/spoilage': { title: 'Batch Risk Monitor', section: 'Quality protection' },
  '/spoilage/priority': { title: 'Urgent Batch Queue', section: 'Quality protection' },
  '/spoilage/benchmarks': { title: 'Quality Performance', section: 'Quality protection' },
  '/scheduling': { title: 'Shift Planning', section: 'Factory operations' },
  '/scheduling/benchmarks': { title: 'Scheduling Insights', section: 'Factory operations' },
}
