import { useState, useEffect, useRef } from 'react'
import AOS from 'aos'
import { useMinigameProfile } from '../hooks/useMinigameProfile'
import { useMinigame } from '../hooks/useMinigame'
import { getDailyLevel } from '../constants/minigameLevels'
import StreakBoard from '../components/Minigame/StreakBoard'
import GameGrid from '../components/Minigame/GameGrid'
import WinModal from '../components/Minigame/WinModal'
import './Minigame.css'

export default function Minigame() {
  const { profile, loading, hasPlayedToday, recordWin } = useMinigameProfile()
  const [showWin, setShowWin] = useState(false)
  const [winPoints, setWinPoints] = useState(0)
  const [winStreak, setWinStreak] = useState(0)
  const [alreadyPlayed, setAlreadyPlayed] = useState(false)
  const winRecorded = useRef(false)

  const level = getDailyLevel()
  const game = useMinigame(level)

  useEffect(() => { AOS.refresh() }, [profile, game.gameState.status])

  useEffect(() => {
    if (!loading) {
      setAlreadyPlayed(hasPlayedToday())
    }
  }, [loading, hasPlayedToday])

  // Handle win — only once per game session
  useEffect(() => {
    if (game.gameState.status === 'won' && !winRecorded.current) {
      winRecorded.current = true
      const pts = level.points
      setWinPoints(pts)
      setWinStreak((profile?.current_streak ?? 0) + 1)
      setShowWin(true)
      recordWin(pts)
    }
  }, [game.gameState.status, level.points, profile, recordWin])

  const handleWinClose = () => {
    setShowWin(false)
    setAlreadyPlayed(true)
  }

  const progressPercent = (game.gameState.path.length / game.totalCells) * 100

  return (
    <div className="minigame-page page-enter">
      <div className="page-header" data-aos="fade-right">
        <h1>Daily Minigame</h1>
        <p>Solve the puzzle to earn Fire Points!</p>
      </div>

      <StreakBoard profile={profile} loading={loading} />

      {/* Level Info */}
      <div className="mg-level-info glass-card" data-aos="fade-up" data-aos-delay="100">
        <div className="mg-level-badge">
          Level {level.id}
        </div>
        <div className="mg-level-detail">
          <span className="mg-level-grid">{level.gridSize}x{level.gridSize} Grid</span>
          <span className="mg-level-reward">+{level.points} pts</span>
        </div>
        <div className="mg-progress-bar">
          <div className="mg-progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
        <span className="mg-progress-text">{game.gameState.path.length}/{game.totalCells} cells</span>
      </div>

      {/* Game Area */}
      {alreadyPlayed && !showWin ? (
        <div className="mg-played glass-card" data-aos="fade-up">
          <span className="mg-played-icon">{'\u2705'}</span>
          <h3>You've already played today!</h3>
          <p>Come back tomorrow to continue your streak and earn more Fire Points.</p>
        </div>
      ) : (
        <>
          <GameGrid
            level={level}
            gameState={game.gameState}
            onPointerDown={game.handlePointerDown}
            onPointerEnter={game.handlePointerEnter}
            onPointerUp={game.handlePointerUp}
            getPathIndex={game.getPathIndex}
            isLastInPath={game.isLastInPath}
            totalCells={game.totalCells}
          />

          {/* Controls */}
          <div className="mg-controls" data-aos="fade-up" data-aos-delay="200">
            <button className="btn btn-ghost" onClick={game.undo} disabled={game.gameState.path.length === 0 || game.gameState.status === 'won'}>
              Undo
            </button>
            <button className="btn btn-danger" onClick={game.reset} disabled={game.gameState.path.length === 0 || game.gameState.status === 'won'}>
              Reset
            </button>
          </div>

          {/* Instructions */}
          <div className="mg-instructions glass-card" data-aos="fade-up" data-aos-delay="300">
            <h4>How to play</h4>
            <ul>
              <li>Start from cell <strong>1</strong> and drag to connect numbers in order</li>
              <li>Your path must fill <strong>every cell</strong> in the grid</li>
              <li>You can only move to adjacent cells (up, down, left, right)</li>
              <li>Drag backward to undo moves</li>
            </ul>
          </div>
        </>
      )}

      {showWin && (
        <WinModal points={winPoints} newStreak={winStreak} onClose={handleWinClose} />
      )}
    </div>
  )
}
