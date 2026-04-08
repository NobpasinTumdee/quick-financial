import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Login.css'

export default function Login() {
  const [isRegister, setIsRegister] = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (isRegister && password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    if (isRegister) {
      const { error } = await signUp(email, password)
      if (error) {
        setError(error.message)
      } else {
        setSuccess('Account created! Check your email to verify, then log in.')
        setIsRegister(false)
        setPassword('')
        setConfirmPassword('')
      }
    } else {
      const { error } = await signIn(email, password)
      if (error) {
        setError(error.message)
      } else {
        navigate('/', { replace: true })
      }
    }
    setLoading(false)
  }

  const handleGoogleSignIn = async () => {
    setError('')
    const { error } = await signInWithGoogle()
    if (error) setError(error.message)
  }

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault()
    if (!email) {
      setError('Please enter your email')
      return
    }
    setError('')
    setLoading(true)
    const { error } = await resetPassword(email)
    if (error) {
      setError(error.message)
    } else {
      setSuccess('Password reset link sent! Check your email.')
    }
    setLoading(false)
  }

  return (
    <div className="login-page">
      <div className="login-bg-orb login-bg-orb-1" />
      <div className="login-bg-orb login-bg-orb-2" />
      <div className="login-bg-orb login-bg-orb-3" />

      <div className="login-container">
        <div className="login-brand">
          <div className="login-logo">
            <img src="/quickfinancialPNG.png" alt="logo" style={{ width: '100px'}} />
          </div>
          <h1>Quick Financial</h1>
          <p>Personal finance & wealth management</p>
        </div>

        <div className={`login-card glass-card ${isRegister ? 'register-mode' : ''}`}>
          {showForgot ? (
            <>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: 8 }}>Reset Password</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
                Enter your email and we'll send you a reset link.
              </p>

              <form onSubmit={handleForgotPassword} className="login-form">
                {error && <div className="login-error">{error}</div>}
                {success && <div className="login-success">{success}</div>}

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    className="input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary login-submit" disabled={loading}>
                  {loading ? <span className="btn-loader" /> : 'Send Reset Link'}
                </button>

                <button
                  type="button"
                  className="login-link-btn"
                  onClick={() => { setShowForgot(false); setError(''); setSuccess('') }}
                >
                  Back to Sign In
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="login-tabs">
                <button
                  className={`login-tab ${!isRegister ? 'active' : ''}`}
                  onClick={() => { setIsRegister(false); setError(''); setSuccess('') }}
                >
                  Sign In
                </button>
                <button
                  className={`login-tab ${isRegister ? 'active' : ''}`}
                  onClick={() => { setIsRegister(true); setError(''); setSuccess('') }}
                >
                  Register
                </button>
                <div className={`login-tab-indicator ${isRegister ? 'right' : 'left'}`} />
              </div>

              <form onSubmit={handleSubmit} className="login-form">
                {error && <div className="login-error">{error}</div>}
                {success && <div className="login-success">{success}</div>}

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    className="input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    className="input"
                    placeholder="Enter password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className={`form-group confirm-field ${isRegister ? 'show' : ''}`}>
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    className="input"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required={isRegister}
                  />
                </div>

                {!isRegister && (
                  <button
                    type="button"
                    className="login-link-btn"
                    onClick={() => { setShowForgot(true); setError(''); setSuccess('') }}
                    style={{ alignSelf: 'flex-end', marginTop: -8 }}
                  >
                    Forgot password?
                  </button>
                )}

                <button type="submit" className="btn btn-primary login-submit" disabled={loading}>
                  {loading ? (
                    <span className="btn-loader" />
                  ) : isRegister ? 'Create Account' : 'Sign In'}
                </button>
              </form>

              <div className="login-divider">
                <span>or</span>
              </div>

              <button className="btn login-google-btn" onClick={handleGoogleSignIn} type="button">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                  <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
