import { useState } from 'react'
import { supabase } from './supabaseClient'

function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setLoading(true)
    setMessage('')

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage('❌ ' + error.message)
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setMessage('❌ ' + error.message)
      else setMessage('✅ Account created! You can now log in.')
    }
    setLoading(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div style={styles.page}>
      <div style={styles.left}>
        <div style={styles.leftContent}>
          <div style={styles.bigEmoji}>📔</div>
          <h1 style={styles.appName}>My Diary</h1>
          <p style={styles.tagline}>
            Your private space to write, reflect, and create stories.
          </p>
          <div style={styles.features}>
            <p>📝 Write daily diary entries</p>
            <p>✍️ Create personal stories</p>
            <p>🔐 Completely private & secure</p>
            <p>☁️ Saved to the cloud</p>
          </div>
        </div>
      </div>

      <div style={styles.right}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p style={styles.cardSubtitle}>
            {isLogin ? 'Login to your diary' : 'Start your journey today'}
          </p>

          <label style={styles.label}>Email</label>
          <input
            style={styles.input}
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <button style={styles.button} onClick={handleSubmit} disabled={loading}>
            {loading ? 'Please wait...' : isLogin ? '🔓 Login' : '🚀 Sign Up'}
          </button>

          {message && (
            <p style={{
              ...styles.message,
              color: message.startsWith('✅') ? '#2d6a2d' : '#cc0000',
              backgroundColor: message.startsWith('✅') ? '#f0fff0' : '#fff0f0',
            }}>
              {message}
            </p>
          )}

          <p style={styles.toggle}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <span style={styles.link} onClick={() => { setIsLogin(!isLogin); setMessage('') }}>
              {isLogin ? 'Sign Up' : 'Login'}
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh', display: 'flex',
  },
  left: {
    flex: 1, backgroundColor: '#5c3d2e',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '3rem',
  },
  leftContent: {
    color: 'white', maxWidth: '360px',
  },
  bigEmoji: { fontSize: '4rem', marginBottom: '1rem' },
  appName: {
    fontSize: '2.5rem', fontFamily: 'Playfair Display, serif',
    marginBottom: '0.75rem', color: '#f5e6d3'
  },
  tagline: {
    fontSize: '1.1rem', color: '#d4b8a0', lineHeight: '1.6', marginBottom: '2rem'
  },
  features: {
    display: 'flex', flexDirection: 'column', gap: '0.6rem',
    color: '#e8d5c4', fontSize: '1rem', lineHeight: '1.8'
  },
  right: {
    flex: 1, display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: '2rem', backgroundColor: '#f5f0e8'
  },
  card: {
    backgroundColor: 'white', padding: '2.5rem', borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px',
    display: 'flex', flexDirection: 'column', gap: '0.75rem'
  },
  cardTitle: {
    fontFamily: 'Playfair Display, serif', color: '#5c3d2e',
    fontSize: '1.8rem', margin: 0
  },
  cardSubtitle: { color: '#999', margin: 0, marginBottom: '0.5rem' },
  label: { color: '#555', fontSize: '0.9rem', fontWeight: 'bold' },
  input: {
    padding: '0.75rem 1rem', borderRadius: '8px', border: '1.5px solid #ddd',
    fontSize: '1rem', transition: 'all 0.2s'
  },
  button: {
    padding: '0.85rem', backgroundColor: '#5c3d2e', color: 'white',
    border: 'none', borderRadius: '8px', fontSize: '1rem',
    cursor: 'pointer', marginTop: '0.5rem', fontWeight: 'bold'
  },
  message: {
    textAlign: 'center', fontSize: '0.9rem', padding: '0.6rem',
    borderRadius: '8px', fontWeight: 'bold'
  },
  toggle: { textAlign: 'center', color: '#888', fontSize: '0.9rem' },
  link: { color: '#5c3d2e', cursor: 'pointer', fontWeight: 'bold' },
}

export default Auth