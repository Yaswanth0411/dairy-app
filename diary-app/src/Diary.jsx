import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

const MOODS = ['😊 Happy', '😢 Sad', '😐 Neutral', '😡 Angry', '😴 Tired', '🥰 Loved']

function Diary({ user }) {
  const [entries, setEntries] = useState([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [mood, setMood] = useState(MOODS[0])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchEntries()
  }, [])

  async function fetchEntries() {
    const { data, error } = await supabase
      .from('diary_entries')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) console.error(error)
    else setEntries(data)
  }

  async function addEntry() {
    if (!title.trim() || !content.trim()) {
      setMessage('⚠️ Please fill in both title and content!')
      return
    }
    setLoading(true)
    const { error } = await supabase.from('diary_entries').insert([{
      title,
      content,
      mood,
      user_id: user.id,
    }])

    if (error) {
      setMessage('❌ Error: ' + error.message)
    } else {
      setTitle('')
      setContent('')
      setMood(MOODS[0])
      setMessage('✅ Entry saved!')
      fetchEntries()
    }
    setLoading(false)
  }

  async function deleteEntry(id) {
    const { error } = await supabase.from('diary_entries').delete().eq('id', id)
    if (!error) fetchEntries()
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>📔 My Diary</h2>

      {/* Write New Entry */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Write Today's Entry</h3>
        <input
          style={styles.input}
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <select
          style={styles.input}
          value={mood}
          onChange={e => setMood(e.target.value)}
        >
          {MOODS.map(m => <option key={m}>{m}</option>)}
        </select>
        <textarea
          style={styles.textarea}
          placeholder="Write your thoughts..."
          value={content}
          onChange={e => setContent(e.target.value)}
        />
        <button style={styles.button} onClick={addEntry} disabled={loading}>
          {loading ? 'Saving...' : '💾 Save Entry'}
        </button>
        {message && <p style={styles.message}>{message}</p>}
      </div>

      {/* Past Entries */}
      <h3 style={styles.heading}>📖 Past Entries</h3>
      {entries.length === 0 && <p style={styles.empty}>No entries yet. Start writing!</p>}
      {entries.map(entry => (
        <div key={entry.id} style={styles.entryCard}>
          <div style={styles.entryHeader}>
            <span style={styles.entryTitle}>{entry.title}</span>
            <span style={styles.entryMood}>{entry.mood}</span>
          </div>
          <p style={styles.entryDate}>
            {new Date(entry.created_at).toLocaleDateString('en-IN', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            })}
          </p>
          <p style={styles.entryContent}>{entry.content}</p>
          <button style={styles.deleteBtn} onClick={() => deleteEntry(entry.id)}>
            🗑️ Delete
          </button>
        </div>
      ))}
    </div>
  )
}

const styles = {
  container: { maxWidth: '700px', margin: '0 auto', padding: '1.5rem' },
  heading: { color: '#5c3d2e', marginBottom: '1rem' },
  card: {
    backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: '2rem',
    display: 'flex', flexDirection: 'column', gap: '0.75rem'
  },
  cardTitle: { margin: 0, color: '#5c3d2e' },
  input: {
    padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd',
    fontSize: '1rem', outline: 'none'
  },
  textarea: {
    padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd',
    fontSize: '1rem', minHeight: '120px', resize: 'vertical', outline: 'none'
  },
  button: {
    padding: '0.75rem', backgroundColor: '#5c3d2e', color: 'white',
    border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer'
  },
  message: { textAlign: 'center', fontSize: '0.9rem' },
  empty: { color: '#999', textAlign: 'center' },
  entryCard: {
    backgroundColor: 'white', padding: '1.25rem', borderRadius: '12px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: '1rem'
  },
  entryHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  entryTitle: { fontWeight: 'bold', fontSize: '1.1rem', color: '#5c3d2e' },
  entryMood: { fontSize: '1.2rem' },
  entryDate: { color: '#999', fontSize: '0.85rem', margin: '0.25rem 0' },
  entryContent: { color: '#444', lineHeight: '1.6' },
  deleteBtn: {
    marginTop: '0.5rem', padding: '0.4rem 0.75rem', backgroundColor: '#fff0f0',
    color: '#cc0000', border: '1px solid #ffcccc', borderRadius: '6px', cursor: 'pointer'
  },
}

export default Diary