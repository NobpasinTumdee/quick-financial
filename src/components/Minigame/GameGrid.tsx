import { useRef, useCallback } from 'react'
import type { LevelConfig } from '../../constants/minigameLevels'
import type { GameState } from '../../hooks/useMinigame'

interface Props {
  level: LevelConfig
  gameState: GameState
  onPointerDown: (row: number, col: number) => void
  onPointerEnter: (row: number, col: number) => void
  onPointerUp: () => void
  getPathIndex: (row: number, col: number) => number
  isLastInPath: (row: number, col: number) => boolean
  totalCells: number
}

function coordKey(r: number, c: number) { return `${r},${c}` }

export default function GameGrid({
  level, gameState, onPointerDown, onPointerEnter, onPointerUp,
  getPathIndex, isLastInPath, totalCells,
}: Props) {
  const gridRef = useRef<HTMLDivElement>(null)

  const handlePointerMoveOnGrid = useCallback((e: React.PointerEvent) => {
    // For touch/drag: find which cell is under the pointer
    const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null
    if (!el) return
    const cell = el.closest('[data-row][data-col]') as HTMLElement | null
    if (!cell) return
    const row = parseInt(cell.dataset.row!)
    const col = parseInt(cell.dataset.col!)
    if (!isNaN(row) && !isNaN(col)) {
      onPointerEnter(row, col)
    }
  }, [onPointerEnter])

  const { gridSize, fixedNumbers } = level
  const cells: JSX.Element[] = []

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const key = coordKey(r, c)
      const fixedNum = fixedNumbers[key]
      const pathIdx = getPathIndex(r, c)
      const visited = pathIdx >= 0
      const isLast = isLastInPath(r, c)
      const isStart = fixedNum === 1
      const isEnd = fixedNum === totalCells
      const progress = visited ? (pathIdx + 1) / totalCells : 0

      let cellClass = 'mg-cell'
      if (visited) cellClass += ' mg-cell-visited'
      if (isLast) cellClass += ' mg-cell-current'
      if (isStart && !visited) cellClass += ' mg-cell-start'
      if (isEnd && !visited) cellClass += ' mg-cell-end'
      if (gameState.status === 'won') cellClass += ' mg-cell-won'

      cells.push(
        <div
          key={key}
          className={cellClass}
          data-row={r}
          data-col={c}
          style={visited ? {
            '--progress': progress,
            '--path-idx': pathIdx,
          } as React.CSSProperties : undefined}
          onPointerDown={e => { e.preventDefault(); onPointerDown(r, c) }}
        >
          {fixedNum !== undefined && (
            <span className="mg-cell-number">{fixedNum}</span>
          )}
          {visited && !fixedNum && (
            <span className="mg-cell-dot" />
          )}
        </div>
      )
    }
  }

  // Build connection lines between path cells
  const lines: JSX.Element[] = []
  for (let i = 1; i < gameState.path.length; i++) {
    const [pr, pc] = gameState.path[i - 1]
    const [cr, cc] = gameState.path[i]
    const dr = cr - pr
    const dc = cc - pc

    let direction = ''
    if (dr === -1) direction = 'up'
    else if (dr === 1) direction = 'down'
    else if (dc === -1) direction = 'left'
    else if (dc === 1) direction = 'right'

    lines.push(
      <div
        key={`line-${i}`}
        className={`mg-line mg-line-${direction}`}
        style={{
          gridRow: pr + 1,
          gridColumn: pc + 1,
          '--line-idx': i,
        } as React.CSSProperties}
      />
    )
  }

  return (
    <div
      ref={gridRef}
      className="mg-grid-wrapper"
      data-aos="zoom-in"
      onPointerMove={handlePointerMoveOnGrid}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      style={{ touchAction: 'none' }}
    >
      <div
        className={`mg-grid ${gameState.status === 'won' ? 'mg-grid-won' : ''}`}
        style={{ '--grid-size': level.gridSize } as React.CSSProperties}
      >
        {lines}
        {cells}
      </div>
    </div>
  )
}
