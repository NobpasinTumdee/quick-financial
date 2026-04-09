import { useEffect, useState } from 'react'

interface Props {
  points: number
  newStreak: number
  onClose: () => void
}

interface Particle {
  id: number
  x: number
  y: number
  color: string
  delay: number
  duration: number
  size: number
}

export default function WinModal({ points, newStreak, onClose }: Props) {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    const colors = ['#FF6B35', '#FF4444', '#FFD700', '#FF8C00', '#FFA500', '#FF6347', '#FF1493']
    const newParticles: Particle[] = []
    for (let i = 0; i < 40; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.5,
        duration: 1 + Math.random() * 2,
        size: 4 + Math.random() * 8,
      })
    }
    setParticles(newParticles)
  }, [])

  return (
    <div className="modal-overlay mg-win-overlay" onClick={onClose}>
      <div className="mg-win-particles">
        {particles.map(p => (
          <div
            key={p.id}
            className="mg-particle"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              background: p.color,
              width: p.size,
              height: p.size,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}
      </div>
      <div className="modal-content mg-win-modal" onClick={e => e.stopPropagation()}>
        <div className="mg-win-fire">{'\uD83D\uDD25'}</div>
        <h2 className="mg-win-title">Level Complete!</h2>
        <div className="mg-win-stats">
          <div className="mg-win-stat">
            <span className="mg-win-stat-value">+{points}</span>
            <span className="mg-win-stat-label">Fire Points</span>
          </div>
          <div className="mg-win-stat">
            <span className="mg-win-stat-value">{newStreak} {'\uD83D\uDD25'}</span>
            <span className="mg-win-stat-label">Day Streak</span>
          </div>
        </div>
        <button className="btn btn-primary mg-win-btn" onClick={onClose}>
          Continue
        </button>
      </div>
    </div>
  )
}
