import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

function Calendar({ user }) {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [entries, setEntries] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedEntries, setSelectedEntries] = useState([])

  useEffect(() => {
    fetchEntries()
  }, [currentMonth, currentYear])

  async function fetchEntries() {
    const startDate = new Date(currentYear, currentMonth, 1).toISOString()
    const endDate = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59).toISOString()

    const { data, error } = await supabase
      .from('diary_entries')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate)

    if (error) console.error(error)
    else setEntries(data)
  }

  // Get all dates that have entries
  function getEntryDates() {
    return entries.map(e => new Date(e.created_at).getDate())
  }

  // Get entries for a specific date
  function getEntriesForDate(day) {
    return entries.filter(e => new Date(e.created_at).getDate() === day)
  }

  function handleDateClick(day) {
    const dayEntries = getEntriesForDate(day)
    setSelectedDate(day)
    setSelectedEntries(dayEntries)
  }

  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
    setSelectedDate(null)
    setSelectedEntries([])
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
    setSelectedDate(null)
    setSelectedEntries([])
  }

  // Build calendar grid
  const firstDay = new Date(currentYear, currentMonth, 1).getDay()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const entryDates = getEntryDates()

  const calendarCells = []
  for (let i = 0; i < firstDay; i++) calendarCells.push(null)
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d)

  const isToday = (day) =>
    day === today.getDate() &&
    currentMonth === today.getMonth() &&
    currentYear === today.getFullYear()

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>📅 Calendar View</h2>

      {/* Month Navigator */}
      <div style={styles.navigator}>
        <button style={styles.navBtn} onClick={prevMonth}>← Prev</button>
        <h3 style={styles.monthTitle}>
          {MONTHS[currentMonth]} {currentYear}
        </h3>
        <button style={styles.navBtn} onClick={nextMonth}>Next →</button>
      </div>

      {/* Legend */}
      <div style={styles.legend}>
        <span style={styles.legendItem}>
          <span style={{ ...styles.dot, backgroundColor: '#5c3d2e' }}></span>
          Has entries
        </span>
        <span style={styles.legendItem}>
          <span style={{ ...styles.dot, backgroundColor: '#e8a87c' }}></span>
          Today
        </span>
        <span style={styles.legendItem}>
          <span style={{ ...styles.dot, backgroundColor: '#d4e8c2' }}></span>
          Selected
        </span>
      </div>

      {/* Calendar Grid */}
      <div style={styles.calendarCard}>
        {/* Day Headers */}
        <div style={styles.grid}>
          {DAYS.map(day => (
            <div key={day} style={styles.dayHeader}>{day}</div>
          ))}
        </div>

        {/* Date Cells */}
        <div style={styles.grid}>
          {calendarCells.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} />

            const hasEntry = entryDates.includes(day)
            const isTodayDate = isToday(day)
            const isSelected = selectedDate === day

            let cellStyle = { ...styles.cell }
            if (isTodayDate) cellStyle = { ...cellStyle, ...styles.todayCell }
            if (hasEntry) cellStyle = { ...cellStyle, ...styles.entryCell }
            if (isSelected) cellStyle = { ...cellStyle, ...styles.selectedCell }

            return (
              <div
                key={day}
                style={cellStyle}
                onClick={() => handleDateClick(day)}
              >
                <span style={styles.dayNumber}>{day}</span>
                {hasEntry && (
                  <span style={styles.entryCount}>
                    {getEntriesForDate(day).length}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Selected Date Entries */}
      {selectedDate && (
        <div style={styles.entriesSection}>
          <h3 style={styles.entriesHeading}>
            📖 Entries for {MONTHS[currentMonth]} {selectedDate}, {currentYear}
          </h3>

          {selectedEntries.length === 0 ? (
            <div style={styles.emptyCard}>
              <p style={styles.emptyText}>No entries on this day.</p>
              <p style={styles.emptySubtext}>Go to the Diary tab to write one!</p>
            </div>
          ) : (
            selectedEntries.map(entry => (
              <div key={entry.id} style={styles.entryCard}>
                <div style={styles.entryHeader}>
                  <span style={styles.entryTitle}>{entry.title}</span>
                  <span style={styles.entryMood}>{entry.mood}</span>
                </div>
                <p style={styles.entryTime}>
                  🕐 {new Date(entry.created_at).toLocaleTimeString('en-IN', {
                    hour: '2-digit', minute: '2-digit'
                  })}
                </p>
                <p style={styles.entryContent}>{entry.content}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

const styles = {
  container: { maxWidth: '700px', margin: '0 auto', padding: '1.5rem' },
  heading: { color: '#5c3d2e', marginBottom: '1rem' },
  navigator: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: '1rem'
  },
  monthTitle: {
    color: '#5c3d2e', fontFamily: 'Playfair Display, serif', fontSize: '1.4rem'
  },
  navBtn: {
    padding: '0.5rem 1rem', backgroundColor: 'white', color: '#5c3d2e',
    border: '1.5px solid #5c3d2e', borderRadius: '8px', cursor: 'pointer',
    fontWeight: 'bold'
  },
  legend: {
    display: 'flex', gap: '1.5rem', marginBottom: '1rem', flexWrap: 'wrap'
  },
  legendItem: {
    display: 'flex', alignItems: 'center', gap: '0.4rem',
    fontSize: '0.85rem', color: '#666'
  },
  dot: {
    width: '12px', height: '12px', borderRadius: '50%', display: 'inline-block'
  },
  calendarCard: {
    backgroundColor: 'white', borderRadius: '16px',
    boxShadow: '0 2px 16px rgba(0,0,0,0.08)', padding: '1.25rem',
    marginBottom: '1.5rem'
  },
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px',
    marginBottom: '4px'
  },
  dayHeader: {
    textAlign: 'center', fontWeight: 'bold', color: '#5c3d2e',
    fontSize: '0.8rem', padding: '0.5rem 0'
  },
  cell: {
    aspectRatio: '1', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', borderRadius: '8px',
    cursor: 'pointer', position: 'relative', transition: 'all 0.2s',
    backgroundColor: '#faf8f5',
  },
  todayCell: {
    backgroundColor: '#e8a87c', color: 'white',
  },
  entryCell: {
    backgroundColor: '#5c3d2e', color: 'white',
  },
  selectedCell: {
    backgroundColor: '#d4e8c2', color: '#2d5a1b',
    border: '2px solid #5a9e3a'
  },
  dayNumber: { fontSize: '0.9rem', fontWeight: 'bold' },
  entryCount: {
    fontSize: '0.6rem', backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: '10px', padding: '0 4px', marginTop: '2px'
  },
  entriesSection: { marginTop: '0.5rem' },
  entriesHeading: { color: '#5c3d2e', marginBottom: '1rem' },
  emptyCard: {
    backgroundColor: 'white', padding: '2rem', borderRadius: '12px',
    textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
  },
  emptyText: { color: '#888', fontSize: '1rem' },
  emptySubtext: { color: '#bbb', fontSize: '0.85rem', marginTop: '0.4rem' },
  entryCard: {
    backgroundColor: 'white', padding: '1.25rem', borderRadius: '12px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: '1rem',
    borderLeft: '4px solid #5c3d2e'
  },
  entryHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '0.25rem'
  },
  entryTitle: { fontWeight: 'bold', fontSize: '1.05rem', color: '#5c3d2e' },
  entryMood: { fontSize: '1.2rem' },
  entryTime: { color: '#aaa', fontSize: '0.8rem', marginBottom: '0.5rem' },
  entryContent: { color: '#444', lineHeight: '1.6' },
}

export default Calendar