import { useState, useCallback, useRef } from 'react'
import type { LevelConfig } from '../constants/minigameLevels'

type Coord = [number, number]

function coordKey(r: number, c: number): string {
  return `${r},${c}`
}

function isAdjacent(a: Coord, b: Coord): boolean {
  const dr = Math.abs(a[0] - b[0])
  const dc = Math.abs(a[1] - b[1])
  return (dr + dc) === 1
}

export interface GameState {
  path: Coord[]
  visited: Set<string>
  status: 'idle' | 'playing' | 'won'
  nextRequiredNumber: number
}

export function useMinigame(level: LevelConfig) {
  const totalCells = level.gridSize * level.gridSize
  const isDragging = useRef(false)

  // Build a reverse map: number → coord key
  const numberToCoord = useRef<Record<number, string>>({})
  numberToCoord.current = {}
  for (const [key, num] of Object.entries(level.fixedNumbers)) {
    numberToCoord.current[num] = key
  }

  // Find the max fixed number to know all checkpoints
  const allFixedNumbers = Object.values(level.fixedNumbers).sort((a, b) => a - b)

  const [gameState, setGameState] = useState<GameState>({
    path: [],
    visited: new Set(),
    status: 'idle',
    nextRequiredNumber: allFixedNumbers.length > 0 ? allFixedNumbers[0] : 1,
  })

  const getNextRequired = useCallback((path: Coord[]): number => {
    // Find the next fixed number that hasn't been reached yet
    for (const num of allFixedNumbers) {
      const expectedCoord = numberToCoord.current[num]
      const pathIdx = num - 1 // number N should be at path position N-1
      if (pathIdx >= path.length) return num
      if (coordKey(path[pathIdx][0], path[pathIdx][1]) !== expectedCoord) return num
    }
    return totalCells + 1 // all checkpoints satisfied
  }, [allFixedNumbers, totalCells])

  const canMoveTo = useCallback((row: number, col: number, currentPath: Coord[], currentVisited: Set<string>): boolean => {
    const key = coordKey(row, col)

    // Can't visit already visited cell
    if (currentVisited.has(key)) return false

    // If path is empty, must start at cell with number 1
    if (currentPath.length === 0) {
      return key === numberToCoord.current[1]
    }

    // Must be adjacent to last cell
    const last = currentPath[currentPath.length - 1]
    if (!isAdjacent(last, [row, col])) return false

    // If this cell has a fixed number, check it matches the path position
    const fixedNum = level.fixedNumbers[key]
    if (fixedNum !== undefined) {
      // This cell's number must equal path.length + 1 (the position it would occupy)
      if (fixedNum !== currentPath.length + 1) return false
    }

    return true
  }, [level.fixedNumbers])

  const tryMove = useCallback((row: number, col: number) => {
    setGameState(prev => {
      if (prev.status === 'won') return prev

      const key = coordKey(row, col)

      // Allow undo: if clicking the second-to-last cell, remove last cell
      if (prev.path.length >= 2) {
        const secondLast = prev.path[prev.path.length - 2]
        if (secondLast[0] === row && secondLast[1] === col) {
          const newPath = prev.path.slice(0, -1)
          const newVisited = new Set(newPath.map(([r, c]) => coordKey(r, c)))
          return {
            ...prev,
            path: newPath,
            visited: newVisited,
            nextRequiredNumber: getNextRequired(newPath),
          }
        }
      }

      if (!canMoveTo(row, col, prev.path, prev.visited)) return prev

      const newPath = [...prev.path, [row, col] as Coord]
      const newVisited = new Set(prev.visited)
      newVisited.add(key)

      // Check win
      const won = newPath.length === totalCells
      const newNext = getNextRequired(newPath)

      return {
        path: newPath,
        visited: newVisited,
        status: won ? 'won' : 'playing',
        nextRequiredNumber: newNext,
      }
    })
  }, [canMoveTo, getNextRequired, totalCells])

  const handlePointerDown = useCallback((row: number, col: number) => {
    isDragging.current = true
    tryMove(row, col)
  }, [tryMove])

  const handlePointerEnter = useCallback((row: number, col: number) => {
    if (!isDragging.current) return
    tryMove(row, col)
  }, [tryMove])

  const handlePointerUp = useCallback(() => {
    isDragging.current = false
  }, [])

  const reset = useCallback(() => {
    isDragging.current = false
    setGameState({
      path: [],
      visited: new Set(),
      status: 'idle',
      nextRequiredNumber: allFixedNumbers.length > 0 ? allFixedNumbers[0] : 1,
    })
  }, [allFixedNumbers])

  const undo = useCallback(() => {
    setGameState(prev => {
      if (prev.path.length === 0) return prev
      const newPath = prev.path.slice(0, -1)
      const newVisited = new Set(newPath.map(([r, c]) => coordKey(r, c)))
      return {
        ...prev,
        path: newPath,
        visited: newVisited,
        status: newPath.length === 0 ? 'idle' : 'playing',
        nextRequiredNumber: getNextRequired(newPath),
      }
    })
  }, [getNextRequired])

  const getPathIndex = useCallback((row: number, col: number): number => {
    const key = coordKey(row, col)
    if (!gameState.visited.has(key)) return -1
    return gameState.path.findIndex(([r, c]) => r === row && c === col)
  }, [gameState])

  const isLastInPath = useCallback((row: number, col: number): boolean => {
    if (gameState.path.length === 0) return false
    const last = gameState.path[gameState.path.length - 1]
    return last[0] === row && last[1] === col
  }, [gameState.path])

  return {
    gameState,
    handlePointerDown,
    handlePointerEnter,
    handlePointerUp,
    reset,
    undo,
    getPathIndex,
    isLastInPath,
    totalCells,
  }
}
