# Nonogram 3D

A React Nonogram puzzle with a Three.js board. Play the same three original puzzles in Easy (5×5), Medium (10×10), and Advanced (15×15) difficulty. Row and column clues are generated from each solution.

## Requirements

- Node.js 20 or later
- npm
- A browser with WebGL enabled for the 3D board

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## How to play

- Select a difficulty. Changing levels starts a fresh puzzle.
- The numbers beside each row and above each column give the lengths of its consecutive filled runs, in order. Different runs have at least one empty cell between them.
- Choose **Fill** or **Mark empty**, then click or tap a cell on the board. Click a marked cell again with the same tool to clear it. Right-click a cell to mark it empty.
- Complete the picture to solve the puzzle. Select **Reset** to clear the current board.

Nonogram rules: [Wikipedia — Nonogram](https://en.wikipedia.org/wiki/Nonogram).

## Tests and production build

```bash
npm test
npm run build
npm run preview
```

## Author

Made by [cesarchamal](https://github.com/cesarchamal).
