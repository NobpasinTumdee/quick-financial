import { useState, useEffect, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { useProfile } from '../hooks/useProfile'
import './Settings.css'

export default function Settings() {
  const { user, signOut } = useAuth()
  const { profile, updateProfile } = useProfile()

  const [salary, setSalary] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (profile) setSalary(String(profile.base_salary || ''))
  }, [profile])

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
            <div className="settings-id">ID: {user?.id?.slice(0, 8)}...</div>
          </div>
        </div>
      </div>

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
