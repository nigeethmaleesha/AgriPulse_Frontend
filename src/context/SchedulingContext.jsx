import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { schedulingApi } from '../api/schedulingApi'
import { apiErrorMessage } from '../api/client'

const SchedulingContext = createContext(null)

function sampleTasks() {
  return [
    { taskId: 'T1', taskName: 'Withering - Batch A', processingTimeHours: 3, priority: 5 },
    { taskId: 'T2', taskName: 'Rolling - Batch A', processingTimeHours: 2, priority: 8 },
    { taskId: 'T3', taskName: 'Drying - Batch B', processingTimeHours: 4, priority: 3 },
    { taskId: 'T4', taskName: 'Sorting - Batch C', processingTimeHours: 2, priority: 9 },
    { taskId: 'T5', taskName: 'Packing - Batch A', processingTimeHours: 1, priority: 6 },
    { taskId: 'T6', taskName: 'Withering - Batch D', processingTimeHours: 2, priority: 4 },
  ]
}

function sampleWorkers() {
  return [
    { workerId: 'W1', workerName: 'K. Perera', shift: 'Morning', maxWorkingHours: 8 },
    { workerId: 'W2', workerName: 'S. Fernando', shift: 'Morning', maxWorkingHours: 8 },
    { workerId: 'W3', workerName: 'N. Silva', shift: 'Evening', maxWorkingHours: 6 },
  ]
}

function sampleMachines() {
  return [
    { machineId: 'M1', machineName: 'Rolling Machine 1', available: true },
    { machineId: 'M2', machineName: 'Dryer 1', available: true },
  ]
}

function sampleOutages() {
  return [{ outageId: 'O1', startHour: 12, endHour: 14 }]
}

function toApiPayload({ tasks, workers, machines, outages }) {
  return {
    tasks: tasks.map(({ taskId, taskName, processingTimeHours, priority }) => ({
      taskId, taskName, processingTimeHours: Number(processingTimeHours), priority: Number(priority),
    })),
    workers: workers.map(({ workerId, workerName, shift, maxWorkingHours }) => ({
      workerId, workerName, shift, maxWorkingHours: Number(maxWorkingHours),
    })),
    machines: machines.map(({ machineId, machineName, available }) => ({
      machineId, machineName, available: Boolean(available),
    })),
    outages: outages.map(({ outageId, startHour, endHour }) => ({
      outageId, startHour: Number(startHour), endHour: Number(endHour),
    })),
  }
}

function makeListActions(setList, keyField) {
  return {
    add: (item) => setList((list) => [...list, item]),
    update: (key, item) => setList((list) => list.map((x) => (x[keyField] === key ? item : x))),
    remove: (key) => setList((list) => list.filter((x) => x[keyField] !== key)),
  }
}

export function SchedulingProvider({ children }) {
  const [tasks, setTasks] = useState(sampleTasks)
  const [workers, setWorkers] = useState(sampleWorkers)
  const [machines, setMachines] = useState(sampleMachines)
  const [outages, setOutages] = useState(sampleOutages)

  const [result, setResult] = useState(null)
  const [running, setRunning] = useState(false)
  const [runError, setRunError] = useState('')

  const taskActions = useMemo(() => makeListActions(setTasks, 'taskId'), [])
  const workerActions = useMemo(() => makeListActions(setWorkers, 'workerId'), [])
  const machineActions = useMemo(() => makeListActions(setMachines, 'machineId'), [])
  const outageActions = useMemo(() => makeListActions(setOutages, 'outageId'), [])

  const clearAll = useCallback(() => {
    setTasks([]); setWorkers([]); setMachines([]); setOutages([])
    setResult(null); setRunError('')
  }, [])

  const runSchedule = useCallback(async () => {
    setRunning(true); setRunError('')
    try {
      const data = await schedulingApi.compareSchedules(toApiPayload({ tasks, workers, machines, outages }))
      setResult(data)
      return data
    } catch (err) {
      setRunError(apiErrorMessage(err))
      throw err
    } finally {
      setRunning(false)
    }
  }, [tasks, workers, machines, outages])

  const value = useMemo(() => ({
    tasks, workers, machines, outages,
    taskActions, workerActions, machineActions, outageActions,
    clearAll,
    result, running, runError, runSchedule,
  }), [tasks, workers, machines, outages, taskActions, workerActions, machineActions, outageActions,
      clearAll, result, running, runError, runSchedule])

  return <SchedulingContext.Provider value={value}>{children}</SchedulingContext.Provider>
}

export function useScheduling() {
  const value = useContext(SchedulingContext)
  if (!value) throw new Error('useScheduling must be used inside SchedulingProvider')
  return value
}
