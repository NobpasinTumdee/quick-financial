import { useState, useEffect, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import type { SavedAccount } from '../context/AuthContext'
import { useProfile } from '../hooks/useProfile'
import { useTheme, type ThemeName } from '../context/ThemeContext'
import './Settings.css'

const THEMES: { id: ThemeName; name: string; description: string; preview: { bg: string; primary: string; accent: string } }[] = [
  {
    id: 'dark',
    name: 'Dark',
    description: 'Deep dark with purple accent',
    preview: { bg: '#0A0A0F', primary: '#6C63FF', accent: '#00D9A6' },
  },
  {
    id: 'light',
    name: 'Light',
    description: 'Minimal white with green accent',
    preview: { bg: '#F5F5F0', primary: '#009944', accent: '#009944' },
  },
  {
    id: 'pink',
    name: 'Pink Cute',
    description: 'Cute dark pink aesthetic',
    preview: { bg: '#1A1020', primary: '#F472B6', accent: '#A78BFA' },
  },
  {
    id: 'light-green',
    name: 'Light Green',
    description: 'Minimal white with green accent',
    preview: { bg: '#F5F5F0', primary: '#009944', accent: '#01682f' }
  },
  {
    id: 'dark-emerald',
    name: 'Dark Emerald',
    description: 'Dark mode with emerald green glow',
    preview: { bg: '#0f1a14', primary: '#10b981', accent: '#059669' }
  },
  {
    id: 'midnight-blue',
    name: 'Midnight Blue',
    description: 'Deep blue professional dashboard',
    preview: { bg: '#0b1220', primary: '#3b82f6', accent: '#1d4ed8' }
  },
  {
    id: 'sunset-orange',
    name: 'Sunset Orange',
    description: 'Warm orange gradient feeling',
    preview: { bg: '#1a0f0a', primary: '#f97316', accent: '#ea580c' }
  },
  {
    id: 'purple-dream',
    name: 'Purple Dream',
    description: 'Soft modern purple UI',
    preview: { bg: '#140f1f', primary: '#a855f7', accent: '#7e22ce' }
  },
  {
    id: 'rose-pink',
    name: 'Rose Pink',
    description: 'Cute modern pink tone',
    preview: { bg: '#1a0f14', primary: '#ec4899', accent: '#be185d' }
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    description: 'Neon futuristic style',
    preview: { bg: '#0a0a0f', primary: '#00f5d4', accent: '#ff00ff' }
  },
  {
    id: 'coffee-brown',
    name: 'Coffee Brown',
    description: 'Warm brown cozy UI',
    preview: { bg: '#1a1410', primary: '#a16207', accent: '#78350f' }
  },
  {
    id: 'ocean-teal',
    name: 'Ocean Teal',
    description: 'Fresh ocean blue-green',
    preview: { bg: '#0a1f1c', primary: '#14b8a6', accent: '#0f766e' }
  },
  {
    id: 'mono-gray',
    name: 'Mono Gray',
    description: 'Clean grayscale minimal UI',
    preview: { bg: '#111111', primary: '#6b7280', accent: '#374151' }
  },
  {
    id: 'neon-blue',
    name: 'Neon Blue',
    description: 'Bright neon futuristic blue',
    preview: { bg: '#050816', primary: '#00E5FF', accent: '#2979FF' },
  },
  {
    id: 'forest',
    name: 'Forest',
    description: 'Natural deep green tone',
    preview: { bg: '#0c1f17', primary: '#22c55e', accent: '#166534' },
  },
  {
    id: 'gold-luxury',
    name: 'Gold Luxury',
    description: 'Premium gold and black',
    preview: { bg: '#0f0f0f', primary: '#d4af37', accent: '#b8962e' },
  },
  {
    id: 'ice-blue',
    name: 'Ice Blue',
    description: 'Cool icy blue minimal',
    preview: { bg: '#0a1a2f', primary: '#38bdf8', accent: '#0ea5e9' },
  },
  {
    id: 'mint-fresh',
    name: 'Mint Fresh',
    description: 'Fresh mint modern UI',
    preview: { bg: '#0f1f1a', primary: '#34d399', accent: '#10b981' },
  },
  {
    id: 'lavender-soft',
    name: 'Lavender Soft',
    description: 'Soft pastel purple',
    preview: { bg: '#1a1625', primary: '#c084fc', accent: '#a855f7' },
  },
  {
    id: 'red-dark',
    name: 'Dark Red',
    description: 'Strong red dark mode',
    preview: { bg: '#140a0a', primary: '#ef4444', accent: '#b91c1c' },
  },
  {
    id: 'sky-light',
    name: 'Sky Light',
    description: 'Light sky blue theme',
    preview: { bg: '#f0f9ff', primary: '#0ea5e9', accent: '#0284c7' },
  },
  {
    id: 'terminal-green',
    name: 'Terminal',
    description: 'Classic hacker terminal',
    preview: { bg: '#000000', primary: '#00ff9c', accent: '#00cc7a' },
  },
  {
    id: 'sand-beige',
    name: 'Sand Beige',
    description: 'Warm neutral minimal',
    preview: { bg: '#f5efe6', primary: '#c2a878', accent: '#a68a64' },
  },
]

export default function Settings() {
  const { user, signOut, savedAccounts, switchAccount, removeSavedAccount } = useAuth()
  const { profile, updateProfile } = useProfile()
  const { theme, setTheme, isSystem, setUseSystem } = useTheme()

  const [salary, setSalary] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showAllThemes, setShowAllThemes] = useState(false)
  const [switching, setSwitching] = useState<string | null>(null)
  const [switchError, setSwitchError] = useState('')

  useEffect(() => {
    if (profile) setSalary(String(profile.base_salary || ''))
  }, [profile])

  const otherAccounts = savedAccounts.filter(a => a.user_id !== user?.id)

  const handleSwitch = async (account: SavedAccount) => {
    setSwitching(account.user_id)
    setSwitchError('')
    const { error } = await switchAccount(account)
    if (error) {
      setSwitchError(`Session expired for ${account.email}. Account removed. Please log in again.`)
    }
    setSwitching(null)
  }

  const handleRemoveAccount = (account: SavedAccount) => {
    if (confirm(`Remove ${account.email} from saved accounts?`)) {
      removeSavedAccount(account.user_id)
    }
  }

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await updateProfile({ base_salary: parseFloat(salary) || 0 })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleLogout = async () => {
    if (confirm('Are you sure you want to log out?')) {
      await signOut()
    }
  }

  return (
    <div className="settings-page page-enter">
      <div className="page-header">
        <h1 data-aos="fade-right">Settings</h1>
        <p data-aos="fade-right" data-aos-delay="50">Manage your profile</p>
      </div>

      {/* Profile Info */}
      <div className="settings-section glass-card" data-aos="fade-up">
        <h3>Profile</h3>
        <div className="settings-profile-info">
          <div className="settings-avatar">
            {user?.email?.charAt(0).toUpperCase() ?? '?'}
          </div>
          <div>
            <div className="settings-email">{user?.email}</div>
            <div className="settings-id">ID: {user?.id}</div>
          </div>
        </div>
      </div>

      {/* Account Switcher */}
      {otherAccounts.length > 0 && (
        <div className="settings-section glass-card" data-aos="fade-up" data-aos-delay="75">
          <h3>Switch Account</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
            Switch to a previously logged-in account without signing in again.
          </p>
          {switchError && (
            <div className="switch-error">{switchError}</div>
          )}
          <div className="saved-accounts-list">
            {otherAccounts.map(account => (
              <div key={account.user_id} className="saved-account-item">
                <div className="saved-account-avatar">
                  {account.email.charAt(0).toUpperCase()}
                </div>
                <div className="saved-account-info">
                  <div className="saved-account-email">{account.email}</div>
                  <div className="saved-account-id">ID: {account.user_id}</div>
                </div>
                <div className="saved-account-actions">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleSwitch(account)}
                    disabled={switching !== null}
                  >
                    {switching === account.user_id ? 'Switching...' : 'Switch'}
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleRemoveAccount(account)}
                    disabled={switching !== null}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Financial Settings */}
      <form className="settings-section glass-card" onSubmit={handleSave} data-aos="fade-up" data-aos-delay="100">
        <h3>Financial Settings</h3>

        <div className="form-group" style={{ marginTop: 16 }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
            Base Monthly Salary (฿)
          </label>
          <input
            className="input"
            type="number"
            step="100"
            placeholder="Enter your base salary"
            value={salary}
            onChange={e => setSalary(e.target.value)}
          />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
            Used for budget planning and tax forecasting
          </span>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={saving}
          style={{ marginTop: 16, padding: '12px 24px' }}
        >
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </form>

      {/* Tax Info */}
      <div className="settings-section glass-card" data-aos="fade-up" data-aos-delay="150">
        <h3>Tax Information</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          Tax calculations use Thai progressive tax rates with a standard deduction of ฿160,000
          (personal expenses ฿60,000 + personal allowance ฿100,000). This is an estimate only.
          Consult a tax professional for precise calculations.
        </p>
      </div>

      {/* Theme Picker */}
      <div className="settings-section glass-card" data-aos="fade-up" data-aos-delay="75">
        <h3>Appearance</h3>

        {/* System toggle */}
        <label className="theme-system-toggle">
          <input
            type="checkbox"
            checked={isSystem}
            onChange={e => setUseSystem(e.target.checked)}
          />
          <span className="toggle-switch" />
          <span className="toggle-label">Use system theme</span>
        </label>

        {/* Theme cards */}
        <div className={`theme-list-wrapper ${showAllThemes ? 'expanded' : ''}`}>
          <div className="theme-grid">
            {THEMES.map(t => (
              <button
                key={t.id}
                className={`theme-card ${theme === t.id && !isSystem ? 'active' : ''} ${isSystem ? 'system-mode' : ''}`}
                onClick={() => setTheme(t.id)}
                disabled={isSystem}
              >
                {/* Mini preview */}
                <div className="theme-preview" style={{ background: t.preview.bg }}>
                  <div className="theme-preview-sidebar" style={{ background: t.id === 'light' ? '#fff' : `color-mix(in srgb, ${t.preview.bg} 80%, #fff)`, borderRight: `1px solid ${t.id === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.1)'}` }}>
                    <div className="theme-preview-dot" style={{ background: t.preview.primary }} />
                    <div className="theme-preview-line" style={{ background: t.id === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)' }} />
                    <div className="theme-preview-line short" style={{ background: t.id === 'light' ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.06)' }} />
                  </div>
                  <div className="theme-preview-content">
                    <div className="theme-preview-card" style={{ background: t.id === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.06)', borderColor: t.id === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)' }}>
                      <div className="theme-preview-bar" style={{ background: t.preview.primary }} />
                      <div className="theme-preview-bar accent" style={{ background: t.preview.accent }} />
                    </div>
                  </div>
                </div>

                <div className="theme-card-info">
                  <span className="theme-card-name">{t.name}</span>
                  <span className="theme-card-desc">{t.description}</span>
                </div>

                {theme === t.id && !isSystem && (
                  <div className="theme-check">&#10003;</div>
                )}
              </button>
            ))}
          </div>
          
          {!showAllThemes && (
            <div className="theme-list-overlay">
              <button 
                type="button" 
                className="theme-expand-btn"
                onClick={() => setShowAllThemes(true)}
              >
                <span>Show more themes</span>
                <span style={{ fontSize: '0.75rem' }}>▼</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="settings-section settings-danger glass-card" data-aos="fade-up" data-aos-delay="200">
        <h3>Account</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
          Sign out of your account on this device.
        </p>
        <button className="btn btn-danger" onClick={handleLogout}>
          Log Out
        </button>
      </div>
    </div>
  )
}
