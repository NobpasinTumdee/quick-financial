import type { MinigameProfile } from '../../hooks/useMinigameProfile'

interface Props {
  profile: MinigameProfile | null
  loading: boolean
}

export default function StreakBoard({ profile, loading }: Props) {
  if (loading) {
    return (
      <div className="streak-board glass-card" data-aos="fade-up">
        <div className="streak-loading">Loading...</div>
      </div>
    )
  }

  const streak = profile?.current_streak ?? 0
  const highest = profile?.highest_streak ?? 0
  const points = profile?.fire_points ?? 0
  const level = profile?.current_level ?? 1

  return (
    <div className="streak-board glass-card" data-aos="fade-up">
      <div className="streak-main">
        <div className="streak-fire">
          <span className="streak-fire-icon">{streak > 0 ? '\uD83D\uDD25' : '\u2744\uFE0F'}</span>
          <div className="streak-fire-info">
            <span className="streak-fire-count">{streak}</span>
            <span className="streak-fire-label">Day{streak !== 1 ? 's' : ''} Streak!</span>
          </div>
        </div>
        <div className="streak-points">
          <span className="streak-points-value">{points.toLocaleString()}</span>
          <span className="streak-points-label">Fire Points</span>
        </div>
      </div>
      <div className="streak-stats">
        <div className="streak-stat">
          <span className="streak-stat-value">{highest}</span>
          <span className="streak-stat-label">Best Streak</span>
        </div>
        <div className="streak-stat">
          <span className="streak-stat-value">Lv.{level}</span>
          <span className="streak-stat-label">Current Level</span>
        </div>
      </div>
    </div>
  )
}
