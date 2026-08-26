import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Panel } from '../components/ui/Panel'
import { Button } from '../components/ui/Button'

export default function NotFoundPage() {
  return <Panel className="mx-auto max-w-2xl p-10 text-center"><div className="font-mono text-5xl font-black text-tea-950">404</div><h2 className="mt-4 text-2xl font-extrabold">That AgriPulse screen does not exist.</h2><p className="mt-2 text-sm leading-6 text-muted">This frontend intentionally includes working routes only for the Decision Center and Module 3.</p><Link to="/" className="mt-6 inline-block"><Button><ArrowLeft size={16} /> Back to Decision Center</Button></Link></Panel>
}
