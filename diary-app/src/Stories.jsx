import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

function Stories({ user }) {
  const [stories, setStories] = useState([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    fetchStories()
  }, [])

  async function fetchStories() {
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) console.error(error)
    else setStories(data)
  }

  async function saveStory() {
    if (!title.trim() || !content.trim()) {
      setMessage('⚠️ Please fill in both title and content!')
      return
    }
    setLoading(true)
    const { error } = await supabase.from('stories').insert([{
      title,
      content,
      user_id: user.id,
    }])

    if (error) {
      setMessage('❌ Error: ' + error.message)
    } else {
      setTitle('')
      setContent('')
      setMessage('✅ Story saved!')
      fetchStories()
    }
    setLoading(false)
  }

  async function deleteStory(id) {
    const { error } = await supabase.from('stories').delete().eq('id', id)
    if (!error) {
      setSelected(null)
      fetchStories()
    }
  }

  // Full story view
  if (selected) {
    return (
      <div style={styles.container}>
        <button style={styles.backBtn} onClick={() => setSelected(null)}>
          ← Back to Stories
        </button>
        <div style={styles.fullStory}>
          <h2 style={styles.storyTitle}>{selected.title}</h2>
          <p style={styles.storyDate}>
            {new Date(selected.created_at).toLocaleDateString('en-IN', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            })}
          </p>
          <p style={styles.storyContent}>{selected.content}</p>
          <button style={styles.deleteBtn} onClick={() => deleteStory(selected.id)}>
            🗑️ Delete Story
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>✍️ My Stories</h2>

      {/* Write New Story */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Write a New Story</h3>
        <input
          style={styles.input}
          placeholder="Story Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <textarea
          style={styles.textarea}
          placeholder="Once upon a time..."
          value={content}
          onChange={e => setContent(e.target.value)}
        />
        <button style={styles.button} onClick={saveStory} disabled={loading}>
          {loading ? 'Saving...' : '💾 Save Story'}
        </button>
        {message && <p style={styles.message}>{message}</p>}
      </div>

      {/* Stories List */}
      <h3 style={styles.heading}>📚 My Story Collection</h3>
      {stories.length === 0 && (
        <p style={styles.empty}>No stories yet. Start writing your first one!</p>
      )}
      <div style={styles.grid}>
        {stories.map(story => (
          <div key={story.id} style={styles.storyCard} onClick={() => setSelected(story)}>
            <h4 style={styles.cardStoryTitle}>{story.title}</h4>
            <p style={styles.cardDate}>
              {new Date(story.created_at).toLocaleDateString('en-IN', {
                year: 'numeric', month: 'short', day: 'numeric'
              })}
            </p>
            <p style={styles.preview}>
              {story.content.length > 100
                ? story.content.substring(0, 100) + '...'
                : story.content}
            </p>
            <span style={styles.readMore}>Read more →</span>
          </div>
        ))}
      </div>
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
    fontSize: '1rem', minHeight: '180px', resize: 'vertical', outline: 'none'
  },
  button: {
    padding: '0.75rem', backgroundColor: '#5c3d2e', color: 'white',
    border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer'
  },
  message: { textAlign: 'center', fontSize: '0.9rem' },
  empty: { color: '#999', textAlign: 'center' },
  grid: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  storyCard: {
    backgroundColor: 'white', padding: '1.25rem', borderRadius: '12px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)', cursor: 'pointer',
    transition: 'transform 0.1s', borderLeft: '4px solid #5c3d2e'
  },
  cardStoryTitle: { margin: '0 0 0.25rem 0', color: '#5c3d2e', fontSize: '1.1rem' },
  cardDate: { color: '#999', fontSize: '0.8rem', margin: '0 0 0.5rem 0' },
  preview: { color: '#555', lineHeight: '1.5', margin: '0 0 0.5rem 0' },
  readMore: { color: '#5c3d2e', fontWeight: 'bold', fontSize: '0.9rem' },
  backBtn: {
    marginBottom: '1rem', padding: '0.5rem 1rem', backgroundColor: 'transparent',
    border: '1px solid #5c3d2e', color: '#5c3d2e', borderRadius: '8px', cursor: 'pointer'
  },
  fullStory: {
    backgroundColor: 'white', padding: '2rem', borderRadius: '12px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
  },
  storyTitle: { color: '#5c3d2e', marginTop: 0 },
  storyDate: { color: '#999', fontSize: '0.85rem' },
  storyContent: { color: '#444', lineHeight: '1.8', whiteSpace: 'pre-wrap' },
  deleteBtn: {
    marginTop: '1rem', padding: '0.5rem 1rem', backgroundColor: '#fff0f0',
    color: '#cc0000', border: '1px solid #ffcccc', borderRadius: '6px', cursor: 'pointer'
  },
}

export default Stories