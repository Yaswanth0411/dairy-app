import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import Auth from './Auth'
import Diary from './Diary'
import Stories from './Stories'
import Calendar from './Calendar'

function App() {
  const [session, setSession] = useState(null)
  const [activeTab, setActiveTab] = useState('diary')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (!session) return <Auth />

  const tabs = [
    { id: 'diary', label: '📔 Diary' },
    { id: 'calendar', label: '📅 Calendar' },
    { id: 'stories', label: '✍️ Stories' },
  ]

  return (
    <div style={{ backgroundColor: '#f5f0e8', minHeight: '100vh', padding: '1rem' }}>

      {/* Top Bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        maxWidth: '700px', margin: '0 auto 1rem auto'
      }}>
        <h1 style={{ color: '#5c3d2e', margin: 0 }}>📔 My Diary App</h1>
        <button
          onClick={() => supabase.auth.signOut()}
          style={{
            padding: '0.5rem 1rem', backgroundColor: '#5c3d2e',
            color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: '0.5rem',
        maxWidth: '700px', margin: '0 auto 1.5rem auto'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none',
              backgroundColor: activeTab === tab.id ? '#5c3d2e' : 'white',
              color: activeTab === tab.id ? 'white' : '#5c3d2e',
              fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'diary' && <Diary user={session.user} />}
      {activeTab === 'calendar' && <Calendar user={session.user} />}
      {activeTab === 'stories' && <Stories user={session.user} />}

    </div>
  )
}

export default App