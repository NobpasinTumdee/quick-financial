export interface LevelConfig {
  id: number
  gridSize: number
  /** Map of "row,col" → display number (checkpoints the path must hit in order) */
  fixedNumbers: Record<string, number>
  /** The valid solution path as [row, col] tuples */
  solution: [number, number][]
  /** Points awarded for completing this level */
  points: number
}

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    gridSize: 3,
    fixedNumbers: { '0,0': 1, '2,2': 9 },
    solution: [
      [0, 0], [0, 1], [0, 2],
      [1, 2], [1, 1], [1, 0],
      [2, 0], [2, 1], [2, 2],
    ],
    points: 10,
  },
  {
    id: 2,
    gridSize: 3,
    fixedNumbers: { '2,0': 1, '0,0': 3, '1,1': 7, '2,2': 9 },
    solution: [
      [2, 0], [1, 0], [0, 0],
      [0, 1], [0, 2], [1, 2],
      [1, 1], [2, 1], [2, 2],
    ],
    points: 15,
  },
  {
    id: 3,
    gridSize: 4,
    fixedNumbers: { '0,0': 1, '1,0': 8, '2,0': 9, '3,0': 16 },
    solution: [
      [0, 0], [0, 1], [0, 2], [0, 3],
      [1, 3], [1, 2], [1, 1], [1, 0],
      [2, 0], [2, 1], [2, 2], [2, 3],
      [3, 3], [3, 2], [3, 1], [3, 0],
    ],
    points: 25,
  },
  {
    id: 4,
    gridSize: 4,
    fixedNumbers: { '0,0': 1, '3,0': 4, '0,1': 8, '3,2': 12, '0,3': 16 },
    solution: [
      [0, 0], [1, 0], [2, 0], [3, 0],
      [3, 1], [2, 1], [1, 1], [0, 1],
      [0, 2], [1, 2], [2, 2], [3, 2],
      [3, 3], [2, 3], [1, 3], [0, 3],
    ],
    points: 30,
  },
  {
    id: 5,
    gridSize: 5,
    fixedNumbers: { '0,0': 1, '1,0': 10, '2,4': 15, '3,0': 20, '4,4': 25 },
    solution: [
      [0, 0], [0, 1], [0, 2], [0, 3], [0, 4],
      [1, 4], [1, 3], [1, 2], [1, 1], [1, 0],
      [2, 0], [2, 1], [2, 2], [2, 3], [2, 4],
      [3, 4], [3, 3], [3, 2], [3, 1], [3, 0],
      [4, 0], [4, 1], [4, 2], [4, 3], [4, 4],
    ],
    points: 50,
  },
]

/** Returns a deterministic daily level based on today's date */
export function getDailyLevel(): LevelConfig {
  const now = new Date()
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
  return LEVELS[seed % LEVELS.length]
}
