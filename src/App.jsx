import { useState, useEffect } from 'react'
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'

const COLORS = ['#60a5fa', '#34d399', '#f87171', '#fbbf24', '#a78bfa', '#fb923c']

const SCORE_LABELS = ['None', 'Aware', 'Basic', 'Competent', 'Advanced', 'Expert']

const SCORE_SELECTED_CLS = [
  'bg-gray-600 text-gray-200',   // 0 — None
  'bg-amber-500 text-white',     // 1 — Aware
  'bg-orange-500 text-white',    // 2 — Basic
  'bg-sky-600 text-white',       // 3 — Competent
  'bg-green-500 text-white',     // 4 — Advanced
  'bg-violet-600 text-white',    // 5 — Expert
]

const SKILL_SUGGESTIONS = [
  'Go Fundamentals', 'Concurrency', 'Testing', 'PostgreSQL',
  'REST API', 'Docker/DevOps', 'Profiling/pprof', 'Algorithms',
]

const today = new Date().toISOString().split('T')[0]

function IconEdit({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z" />
    </svg>
  )
}

function IconX({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
    </svg>
  )
}

function IconUp({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <path fillRule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708z" />
    </svg>
  )
}

function IconDown({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z" />
    </svg>
  )
}

function ScoreSelector({ value, onChange }) {
  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <div className="flex gap-0.5">
        {[0, 1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`w-9 h-8 rounded text-xs font-bold transition-colors ${
              value === n
                ? SCORE_SELECTED_CLS[n]
                : 'bg-gray-800 text-gray-500 hover:bg-gray-700 hover:text-gray-300'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <span className="text-xs text-gray-400 w-16 shrink-0">{SCORE_LABELS[value]}</span>
    </div>
  )
}

function FirstRunModal({ onComplete, onImport }) {
  const [snapshotName, setSnapshotName] = useState('Week 1')
  const [skills, setSkills] = useState([])
  const [scores, setScores] = useState({})
  const [customInput, setCustomInput] = useState('')
  const [nextId, setNextId] = useState(1)

  const addSkill = (skillName) => {
    const trimmed = skillName.trim()
    if (!trimmed || skills.find((s) => s.name === trimmed)) return
    const id = nextId
    setSkills((prev) => [...prev, { id, name: trimmed }])
    setScores((prev) => ({ ...prev, [id]: 2 }))
    setNextId((prev) => prev + 1)
  }

  const removeSkill = (id) => {
    setSkills((prev) => prev.filter((s) => s.id !== id))
    setScores((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  const suggestions = SKILL_SUGGESTIONS.filter((n) => !skills.find((s) => s.name === n))
  const canComplete = snapshotName.trim().length > 0 && skills.length > 0

  return (
    <div className="fixed inset-0 bg-gray-950 z-50 flex items-start justify-center pt-8 px-4 pb-4">
      <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-full">
        <div className="px-6 pt-6 pb-4 border-b border-gray-800 shrink-0">
          <h2 className="text-lg font-semibold text-gray-100">Set up your skill radar</h2>
          <p className="text-sm text-gray-500 mt-1">
            Add the skills you want to track, then rate your starting level for each.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 min-h-0">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
              Snapshot name
            </label>
            <input
              autoFocus
              className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-600"
              placeholder="e.g. Week 1"
              value={snapshotName}
              onChange={(e) => setSnapshotName(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                Skills
              </label>
              {skills.length > 0 && (
                <span className="text-xs text-gray-500">{skills.length} added</span>
              )}
            </div>

            {suggestions.length > 0 && (
              <div>
                <p className="text-xs text-gray-600 mb-2">Quick add:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((name) => (
                    <button
                      key={name}
                      onClick={() => addSkill(name)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-500 rounded-full text-sm transition-all group"
                    >
                      <span className="text-blue-400 text-xs font-bold group-hover:text-blue-300">+</span>
                      <span className="text-gray-300">{name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <input
                className="flex-1 bg-gray-800 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-600"
                placeholder="Or type a custom skill and press Enter…"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customInput.trim()) {
                    addSkill(customInput)
                    setCustomInput('')
                  }
                }}
              />
              <button
                onClick={() => {
                  if (customInput.trim()) {
                    addSkill(customInput)
                    setCustomInput('')
                  }
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors"
              >
                Add
              </button>
            </div>

            {skills.length > 0 ? (
              <div className="space-y-1.5">
                <p className="text-xs text-gray-600">Rate your current level:</p>
                {skills.map((skill) => (
                  <div key={skill.id} className="flex items-center gap-3">
                    <button
                      onClick={() => removeSkill(skill.id)}
                      className="p-0.5 text-gray-700 hover:text-red-400 transition-colors shrink-0"
                      title="Remove"
                    >
                      <IconX className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-sm text-gray-200 w-32 shrink-0 truncate" title={skill.name}>
                      {skill.name}
                    </span>
                    <ScoreSelector
                      value={scores[skill.id] ?? 2}
                      onChange={(v) => setScores((prev) => ({ ...prev, [skill.id]: v }))}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-gray-700 text-sm">
                ↑ Add skills above to get started
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-between shrink-0">
          <label className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors cursor-pointer">
            Import JSON
            <input type="file" accept=".json" className="hidden" onChange={onImport} />
          </label>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-600">
              {skills.length === 0
                ? 'Add at least one skill'
                : !snapshotName.trim()
                ? 'Enter a snapshot name'
                : ''}
            </span>
            <button
              onClick={() => canComplete && onComplete(snapshotName.trim(), skills, scores)}
              disabled={!canComplete}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
            >
              Get started →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function SnapshotModal({ skills, initialScores, onSave, onCancel }) {
  const [name, setName] = useState('')
  const [scores, setScores] = useState(() => {
    const s = {}
    skills.forEach((skill) => { s[skill.id] = initialScores?.[skill.id] ?? 2 })
    return s
  })

  const canSave = name.trim().length > 0

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
        <div className="px-6 pt-5 pb-4 border-b border-gray-800 shrink-0">
          <h2 className="text-base font-semibold text-gray-100">New snapshot</h2>
          <p className="text-sm text-gray-500 mt-1">
            Scores pre-filled from the previous snapshot — adjust as needed.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 min-h-0">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
              Name
            </label>
            <input
              autoFocus
              className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-600"
              placeholder="e.g. Month 2, Week 8…"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && canSave && onSave(name.trim(), scores)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
              Skill levels
            </label>
            <div className="space-y-2">
              {skills.map((skill) => (
                <div key={skill.id} className="flex items-center justify-between gap-3 py-0.5">
                  <span className="text-sm text-gray-300 w-32 shrink-0 truncate" title={skill.name}>
                    {skill.name}
                  </span>
                  <ScoreSelector
                    value={scores[skill.id] ?? 2}
                    onChange={(v) => setScores((prev) => ({ ...prev, [skill.id]: v }))}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-800 flex gap-2 justify-end shrink-0">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => canSave && onSave(name.trim(), scores)}
            disabled={!canSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
          >
            Create snapshot
          </button>
        </div>
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm shadow-xl">
      <p className="font-semibold text-gray-200 mb-1">{payload[0]?.payload?.subject}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name}: <strong>{entry.value}</strong>
          <span className="text-gray-400 font-normal"> — {SCORE_LABELS[entry.value]}</span>
        </p>
      ))}
    </div>
  )
}

export default function App() {
  const [skills, setSkills] = useState([])
  const [snapshots, setSnapshots] = useState([])
  const [visibleSnapshots, setVisibleSnapshots] = useState([])
  const [selectedSnapshot, setSelectedSnapshot] = useState(null)
  const [newSkillName, setNewSkillName] = useState('')
  const [editingSkill, setEditingSkill] = useState(null)
  const [editingSnapshot, setEditingSnapshot] = useState(null)
  const [nextSkillId, setNextSkillId] = useState(1)
  const [nextSnapshotId, setNextSnapshotId] = useState(1)
  const [importError, setImportError] = useState('')
  const [showModal, setShowModal] = useState('first')

  useEffect(() => {
    if (snapshots.length === 0) return
    const handler = (e) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [snapshots.length])

  // Always include all snapshots in radar data so toggling visibility
  // doesn't cause the axes/grid to re-render
  const radarData = skills.map((skill) => {
    const point = { subject: skill.name }
    snapshots.forEach((snap) => {
      point[`snap_${snap.id}`] = snap.scores[skill.id] ?? 0
    })
    return point
  })

  const addSkill = () => {
    const name = newSkillName.trim()
    if (!name) return
    const id = nextSkillId
    setSkills((prev) => [...prev, { id, name }])
    setSnapshots((prev) =>
      prev.map((s) => ({ ...s, scores: { ...s.scores, [id]: 2 } }))
    )
    setNextSkillId((n) => n + 1)
    setNewSkillName('')
  }

  const removeSkill = (id) => {
    setSkills((prev) => prev.filter((s) => s.id !== id))
    setSnapshots((prev) =>
      prev.map((s) => {
        const scores = { ...s.scores }
        delete scores[id]
        return { ...s, scores }
      })
    )
  }

  const saveSkillEdit = () => {
    if (!editingSkill?.name.trim()) return
    setSkills((prev) =>
      prev.map((s) => (s.id === editingSkill.id ? { ...s, name: editingSkill.name.trim() } : s))
    )
    setEditingSkill(null)
  }

  const moveSkill = (index, delta) => {
    const target = index + delta
    if (target < 0 || target >= skills.length) return
    const next = [...skills]
    ;[next[index], next[target]] = [next[target], next[index]]
    setSkills(next)
  }

  const commitFirst = (snapshotName, newSkills, scores) => {
    const maxId = newSkills.length > 0 ? Math.max(...newSkills.map((s) => s.id)) : 0
    setSkills(newSkills)
    setNextSkillId(maxId + 1)
    const snapId = 1
    setSnapshots([{ id: snapId, name: snapshotName, date: today, scores }])
    setVisibleSnapshots([snapId])
    setSelectedSnapshot(snapId)
    setNextSnapshotId(2)
    setShowModal(null)
  }

  const commitSnapshot = (name, scores) => {
    const id = nextSnapshotId
    setSnapshots((prev) => [...prev, { id, name, date: today, scores }])
    setVisibleSnapshots((prev) => [...prev, id])
    setSelectedSnapshot(id)
    setNextSnapshotId((n) => n + 1)
    setShowModal(null)
  }

  const removeSnapshot = (id) => {
    setSnapshots((prev) => prev.filter((s) => s.id !== id))
    setVisibleSnapshots((prev) => prev.filter((sid) => sid !== id))
    if (selectedSnapshot === id) {
      const remaining = snapshots.filter((s) => s.id !== id)
      setSelectedSnapshot(remaining.length > 0 ? remaining[0].id : null)
    }
  }

  const saveSnapshotEdit = () => {
    if (!editingSnapshot?.name.trim()) return
    setSnapshots((prev) =>
      prev.map((s) =>
        s.id === editingSnapshot.id ? { ...s, name: editingSnapshot.name.trim() } : s
      )
    )
    setEditingSnapshot(null)
  }

  const toggleSnapshotVisibility = (id) => {
    setVisibleSnapshots((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    )
  }

  const updateScore = (snapshotId, skillId, value) => {
    setSnapshots((prev) =>
      prev.map((s) =>
        s.id === snapshotId ? { ...s, scores: { ...s.scores, [skillId]: value } } : s
      )
    )
  }

  const lastSnapshotScores =
    snapshots.length > 0 ? snapshots[snapshots.length - 1].scores : null

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify({ skills, snapshots }, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'skill-radar.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        if (!Array.isArray(data.skills) || !Array.isArray(data.snapshots)) throw new Error()
        const maxSkillId = data.skills.reduce((m, s) => Math.max(m, s.id), 0)
        const maxSnapId = data.snapshots.reduce((m, s) => Math.max(m, s.id), 0)
        setSkills(data.skills)
        setSnapshots(data.snapshots)
        setNextSkillId(maxSkillId + 1)
        setNextSnapshotId(maxSnapId + 1)
        setVisibleSnapshots(data.snapshots.map((s) => s.id))
        setSelectedSnapshot(data.snapshots[0]?.id ?? null)
        setShowModal(null)
        setImportError('')
      } catch {
        setImportError('Invalid JSON — expected { skills, snapshots }')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const selectedSnap = snapshots.find((s) => s.id === selectedSnapshot) ?? null

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-gray-100 overflow-hidden">
      {showModal === 'first' && <FirstRunModal onComplete={commitFirst} onImport={handleImport} />}
      {showModal === 'new' && (
        <SnapshotModal
          skills={skills}
          initialScores={lastSnapshotScores}
          onSave={commitSnapshot}
          onCancel={() => setShowModal(null)}
        />
      )}

      <header className="shrink-0 border-b border-gray-800 px-5 py-3 flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold tracking-tight text-blue-400">Skill Radar</h1>
        <div className="flex items-center gap-3">
          {snapshots.length > 0 && (
            <span className="text-xs text-amber-600/80 hidden sm:block">
              ⚠ Data is not saved — export before closing
            </span>
          )}
          {importError && (
            <span className="text-red-400 text-xs bg-red-950/40 px-2 py-1 rounded">
              {importError}
            </span>
          )}
          <button
            onClick={exportJSON}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors"
          >
            Export JSON
          </button>
          <label className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors cursor-pointer">
            Import JSON
            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
          </label>
        </div>
      </header>

      <div className="flex-1 flex gap-3 p-3 min-h-0">
        <aside className="w-52 shrink-0 bg-gray-900 rounded-xl p-3 flex flex-col gap-2">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest shrink-0">
            Skills
          </h2>
          <ul className="flex-1 min-h-0 overflow-y-auto space-y-0.5 pr-0.5">
            {skills.map((skill, index) => (
              <li
                key={skill.id}
                className="group flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
              >
                {editingSkill?.id === skill.id ? (
                  <input
                    className="flex-1 min-w-0 bg-gray-700 rounded px-2 py-0.5 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                    value={editingSkill.name}
                    onChange={(e) => setEditingSkill({ ...editingSkill, name: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveSkillEdit()
                      if (e.key === 'Escape') setEditingSkill(null)
                    }}
                    onBlur={saveSkillEdit}
                    autoFocus
                  />
                ) : (
                  <span className="flex-1 min-w-0 text-sm truncate">{skill.name}</span>
                )}
                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={() => moveSkill(index, -1)}
                    disabled={index === 0}
                    className="p-0.5 text-gray-500 hover:text-gray-200 disabled:opacity-20"
                    title="Move up"
                  >
                    <IconUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => moveSkill(index, 1)}
                    disabled={index === skills.length - 1}
                    className="p-0.5 text-gray-500 hover:text-gray-200 disabled:opacity-20"
                    title="Move down"
                  >
                    <IconDown className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setEditingSkill({ id: skill.id, name: skill.name })}
                    className="p-0.5 text-blue-500 hover:text-blue-300"
                    title="Rename"
                  >
                    <IconEdit className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => removeSkill(skill.id)}
                    className="p-0.5 text-red-500 hover:text-red-300"
                    title="Remove"
                  >
                    <IconX className="w-3.5 h-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex gap-1.5 shrink-0">
            <input
              className="flex-1 min-w-0 bg-gray-800 rounded-lg px-3 py-1.5 text-sm placeholder-gray-600 outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="New skill…"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addSkill()}
            />
            <button
              onClick={addSkill}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-bold transition-colors shrink-0"
            >
              +
            </button>
          </div>
        </aside>

        <main className="flex-1 flex flex-col gap-3 min-w-0 min-h-0">
          <div className="flex-1 min-h-0 bg-gray-900 rounded-xl p-3">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} margin={{ top: 8, right: 28, bottom: 8, left: 28 }}>
                <PolarGrid stroke="#1f2937" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <PolarRadiusAxis
                  domain={[0, 5]}
                  tickCount={6}
                  tick={{ fill: '#4b5563', fontSize: 9 }}
                  axisLine={false}
                />
                {snapshots.map((snap, i) => (
                  <Radar
                    key={snap.id}
                    name={snap.name}
                    dataKey={`snap_${snap.id}`}
                    stroke={COLORS[i % COLORS.length]}
                    fill={COLORS[i % COLORS.length]}
                    fillOpacity={visibleSnapshots.includes(snap.id) ? 0.15 : 0}
                    strokeOpacity={visibleSnapshots.includes(snap.id) ? 1 : 0}
                    strokeWidth={2}
                  />
                ))}
                <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af', paddingTop: 4 }} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {selectedSnap && (
            <div className="shrink-0 bg-gray-900 rounded-xl p-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                Scores —{' '}
                <span className="text-blue-400 normal-case font-bold">{selectedSnap.name}</span>
              </h3>
              <div className="overflow-y-auto max-h-48 space-y-0.5">
                {skills.map((skill) => (
                  <div key={skill.id} className="flex items-center justify-between gap-3 py-0.5">
                    <span className="text-sm text-gray-300 flex-1 min-w-0" title={skill.name}>
                      {skill.name}
                    </span>
                    <ScoreSelector
                      value={selectedSnap.scores[skill.id] ?? 0}
                      onChange={(v) => updateScore(selectedSnap.id, skill.id, v)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        <aside className="w-64 shrink-0 bg-gray-900 rounded-xl p-3 flex flex-col gap-2">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest shrink-0">
            Snapshots
          </h2>
          <ul className="flex-1 min-h-0 overflow-y-auto space-y-1">
            {snapshots.map((snap, i) => {
              const isSelected = selectedSnapshot === snap.id
              const isVisible = visibleSnapshots.includes(snap.id)
              return (
                <li
                  key={snap.id}
                  onClick={() => setSelectedSnapshot(snap.id)}
                  className={`rounded-lg p-2 cursor-pointer transition-colors ${
                    isSelected ? 'bg-gray-700' : 'hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    <input
                      type="checkbox"
                      checked={isVisible}
                      onChange={() => toggleSnapshotVisibility(snap.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="accent-blue-500 cursor-pointer"
                      title="Show on chart"
                    />
                    {editingSnapshot?.id === snap.id ? (
                      <input
                        className="flex-1 min-w-0 bg-gray-600 rounded px-1.5 py-0.5 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                        value={editingSnapshot.name}
                        onChange={(e) =>
                          setEditingSnapshot({ ...editingSnapshot, name: e.target.value })
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveSnapshotEdit()
                          if (e.key === 'Escape') setEditingSnapshot(null)
                        }}
                        onBlur={saveSnapshotEdit}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                      />
                    ) : (
                      <span className="flex-1 min-w-0 text-sm font-medium truncate">
                        {snap.name}
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingSnapshot({ id: snap.id, name: snap.name })
                      }}
                      className="p-0.5 text-blue-500 hover:text-blue-300 shrink-0"
                      title="Rename"
                    >
                      <IconEdit className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeSnapshot(snap.id)
                      }}
                      className="p-0.5 text-red-500 hover:text-red-300 shrink-0"
                      title="Remove"
                    >
                      <IconX className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5 ml-[38px]">{snap.date}</p>
                </li>
              )
            })}
          </ul>
          <button
            onClick={() => setShowModal('new')}
            className="shrink-0 w-full py-2 bg-green-700 hover:bg-green-600 rounded-lg text-sm font-medium transition-colors"
          >
            + New snapshot
          </button>
        </aside>
      </div>
    </div>
  )
}
