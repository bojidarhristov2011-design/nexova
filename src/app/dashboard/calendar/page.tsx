'use client'

import { useState, useEffect, useCallback } from 'react'

type Task = { id: string; title: string; description?: string; dueDate: string; dueTime?: string; completed: boolean; category: string }

const CATEGORIES = [
  { id: 'task', label: 'Task', color: '#7c3aed' },
  { id: 'meeting', label: 'Meeting', color: '#2563eb' },
  { id: 'deadline', label: 'Deadline', color: '#dc2626' },
  { id: 'reminder', label: 'Reminder', color: '#d97706' },
  { id: 'call', label: 'Call', color: '#059669' },
]

const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem' }

function getCategoryColor(cat: string) { return CATEGORIES.find(c => c.id === cat)?.color ?? '#7c3aed' }

export default function CalendarPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [today] = useState(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState(today.toISOString().slice(0, 10))
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', dueTime: '', category: 'task' })
  const [loading, setLoading] = useState(false)

  const fetchTasks = useCallback(async () => {
    const res = await fetch('/api/tasks')
    const data = await res.json()
    if (Array.isArray(data)) setTasks(data)
  }, [])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })

  const tasksForDate = (date: string) => tasks.filter(t => t.dueDate === date)
  const selectedTasks = tasksForDate(selectedDate)

  async function addTask() {
    if (!form.title) return
    setLoading(true)
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, dueDate: selectedDate }),
    })
    setForm({ title: '', description: '', dueTime: '', category: 'task' })
    setShowForm(false)
    setLoading(false)
    fetchTasks()
  }

  async function toggleTask(id: string, completed: boolean) {
    await fetch(`/api/tasks/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ completed: !completed }) })
    fetchTasks()
  }

  async function deleteTask(id: string) {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    fetchTasks()
  }

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1))

  const todayStr = today.toISOString().slice(0, 10)

  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 4 }}>Calendar</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: 0 }}>Schedule tasks, meetings, deadlines, and reminders</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>
        {/* Calendar grid */}
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <button onClick={prevMonth} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: 8, padding: '0.375rem 0.75rem', cursor: 'pointer', fontFamily: 'inherit' }}>‹</button>
            <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: '1rem' }}>{monthName}</span>
            <button onClick={nextMonth} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: 8, padding: '0.375rem 0.75rem', cursor: 'pointer', fontFamily: 'inherit' }}>›</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: 'var(--dim)', padding: '0.25rem 0' }}>{d}</div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const dayTasks = tasksForDate(dateStr)
              const isToday = dateStr === todayStr
              const isSelected = dateStr === selectedDate

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDate(dateStr)}
                  style={{
                    borderRadius: 10, padding: '0.375rem', cursor: 'pointer', minHeight: 52,
                    background: isSelected ? 'rgba(124,58,237,0.15)' : isToday ? 'rgba(124,58,237,0.06)' : 'var(--bg2)',
                    border: `1px solid ${isSelected ? 'rgba(124,58,237,0.4)' : isToday ? 'rgba(124,58,237,0.2)' : 'var(--border)'}`,
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ fontSize: '0.8125rem', fontWeight: isToday ? 700 : 500, color: isSelected || isToday ? '#c4b5fd' : 'var(--text)', marginBottom: 4 }}>{day}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {dayTasks.slice(0, 3).map(t => (
                      <div key={t.id} style={{ width: 6, height: 6, borderRadius: '50%', background: getCategoryColor(t.category), opacity: t.completed ? 0.4 : 1 }} />
                    ))}
                    {dayTasks.length > 3 && <div style={{ fontSize: '0.6rem', color: 'var(--dim)' }}>+{dayTasks.length - 3}</div>}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 12, marginTop: '1rem', flexWrap: 'wrap' }}>
            {CATEGORIES.map(c => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.color }} />
                <span style={{ fontSize: '0.7rem', color: 'var(--dim)' }}>{c.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Day panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--dim)', marginBottom: 2 }}>
                  {new Date(selectedDate + 'T12:00:00').toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)' }}>
                  {selectedTasks.length === 0 ? 'Nothing scheduled' : `${selectedTasks.length} item${selectedTasks.length > 1 ? 's' : ''}`}
                </div>
              </div>
              <button
                onClick={() => setShowForm(!showForm)}
                style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#fff', border: 'none', borderRadius: 8, padding: '0.5rem 1rem', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                + Add
              </button>
            </div>

            {showForm && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: '1rem', padding: '0.875rem', background: 'var(--bg2)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="What needs to be done?" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 8, padding: '0.5rem 0.75rem', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' }} />
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Notes (optional)" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 8, padding: '0.5rem 0.75rem', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <input type="time" value={form.dueTime} onChange={e => setForm(f => ({ ...f, dueTime: e.target.value }))} style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 8, padding: '0.5rem 0.75rem', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' }} />
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 8, padding: '0.5rem 0.75rem', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' }}>
                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={addTask} disabled={loading || !form.title} style={{ flex: 1, background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#fff', border: 'none', borderRadius: 8, padding: '0.5rem', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', opacity: !form.title ? 0.5 : 1 }}>
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                  <button onClick={() => setShowForm(false)} style={{ background: 'var(--bg2)', color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.5rem 0.75rem', fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                </div>
              </div>
            )}

            {selectedTasks.length === 0 && !showForm ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--dim)', fontSize: '0.875rem' }}>Click + Add to schedule something</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selectedTasks.sort((a, b) => (a.dueTime || '').localeCompare(b.dueTime || '')).map(task => (
                  <div key={task.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '0.625rem 0.75rem', background: 'var(--bg2)', borderRadius: 10, border: `1px solid ${task.completed ? 'var(--border)' : getCategoryColor(task.category) + '33'}`, borderLeft: `3px solid ${getCategoryColor(task.category)}` }}>
                    <input type="checkbox" checked={task.completed} onChange={() => toggleTask(task.id, task.completed)} style={{ marginTop: 3, cursor: 'pointer', accentColor: getCategoryColor(task.category) }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 500, color: task.completed ? 'var(--dim)' : 'var(--text)', textDecoration: task.completed ? 'line-through' : 'none' }}>{task.title}</div>
                      {task.description && <div style={{ fontSize: '0.75rem', color: 'var(--dim)', marginTop: 2 }}>{task.description}</div>}
                      {task.dueTime && <div style={{ fontSize: '0.7rem', color: 'var(--dim)', marginTop: 2 }}>🕐 {task.dueTime}</div>}
                    </div>
                    <button onClick={() => deleteTask(task.id)} style={{ background: 'none', border: 'none', color: 'var(--dim)', cursor: 'pointer', fontSize: '0.875rem', padding: 0, lineHeight: 1 }}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming */}
          <div style={card}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', margin: '0 0 0.75rem' }}>Upcoming (next 7 days)</h3>
            {tasks
              .filter(t => !t.completed && t.dueDate >= todayStr && t.dueDate <= new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10))
              .slice(0, 5)
              .map(t => (
                <div key={t.id} onClick={() => setSelectedDate(t.dueDate)} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: getCategoryColor(t.category), flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--dim)' }}>{new Date(t.dueDate + 'T12:00:00').toLocaleDateString('default', { month: 'short', day: 'numeric' })}{t.dueTime ? ` · ${t.dueTime}` : ''}</div>
                  </div>
                </div>
              ))}
            {tasks.filter(t => !t.completed && t.dueDate >= todayStr).length === 0 && (
              <p style={{ color: 'var(--dim)', fontSize: '0.8125rem', margin: 0 }}>No upcoming tasks</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
