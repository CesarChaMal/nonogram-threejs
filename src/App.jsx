import { useMemo, useState } from "react";
import Board3D from "./Board3D.jsx";
import { createEmptyGrid, isPuzzleSolved, PUZZLES } from "./puzzles.js";

function formatClue(clues) {
  return clues.length ? clues.join(", ") : "No filled cells";
}

export default function App() {
  const [level, setLevel] = useState("easy");
  const [tool, setTool] = useState("filled");
  const [grid, setGrid] = useState(() => createEmptyGrid(PUZZLES.easy.size));

  const puzzle = PUZZLES[level];
  const solved = useMemo(
    () => isPuzzleSolved(puzzle.solution, grid),
    [grid, puzzle],
  );
  const filledCount = grid.flat().filter((mark) => mark === "filled").length;
  const statusText = solved
    ? `${puzzle.title} solved! Great work.`
    : "Use the clues to reveal the hidden picture.";

  function chooseLevel(nextLevel) {
    setLevel(nextLevel);
    setGrid(createEmptyGrid(PUZZLES[nextLevel].size));
  }

  function markCell(rowIndex, columnIndex, nextTool = tool) {
    if (solved) return;

    setGrid((current) =>
      current.map((row, currentRow) =>
        row.map((mark, currentColumn) =>
          currentRow === rowIndex && currentColumn === columnIndex
            ? mark === nextTool
              ? null
              : nextTool
            : mark,
        ),
      ),
    );
  }

  function resetPuzzle() {
    setGrid(createEmptyGrid(puzzle.size));
  }

  return (
    <main className="page">
      <section className="game-shell" aria-labelledby="game-title">
        <header className="game-header">
          <div className="eyebrow">
            <span className="eyebrow-dot" />
            A PICTURE LOGIC PUZZLE
          </div>
          <h1 id="game-title">Nonogram <span>3D</span></h1>
          <p>Follow the clues. Fill the grid. Discover the picture.</p>
        </header>

        <section className="game-card" aria-label="3D Nonogram puzzle">
          <div className="level-row" aria-label="Puzzle difficulty">
            {Object.entries(PUZZLES).map(([id, option]) => (
              <button
                className={`level-button ${level === id ? "is-selected" : ""}`}
                key={id}
                type="button"
                aria-pressed={level === id}
                onClick={() => chooseLevel(id)}
              >
                {option.label}
                <span>{option.size}×{option.size}</span>
              </button>
            ))}
          </div>

          <div className="puzzle-heading">
            <div>
              <h2>{puzzle.title}</h2>
              <p>{puzzle.label} puzzle</p>
            </div>
            <p className="progress">
              <strong>{filledCount}</strong> / {puzzle.filledCount} filled
            </p>
          </div>

          <div
            className="puzzle-layout"
            style={{
              "--grid-size": puzzle.size,
              "--max-clues": puzzle.maxClueCount,
            }}
          >
            <div className="clue-spacer" aria-hidden="true" />
            <div className="column-clues" aria-label="Column clues">
              {puzzle.columnClues.map((clues, columnIndex) => (
                <div
                  className="column-clue"
                  key={columnIndex}
                  aria-label={`Column ${columnIndex + 1}: ${formatClue(clues)}`}
                >
                  {clues.length ? (
                    clues.map((clue, clueIndex) => (
                      <span className="clue-number" key={clueIndex} aria-hidden="true">
                        {clue}
                      </span>
                    ))
                  ) : (
                    <span className="empty-clue" aria-hidden="true">·</span>
                  )}
                </div>
              ))}
            </div>
            <div className="row-clues" aria-label="Row clues">
              {puzzle.rowClues.map((clues, rowIndex) => (
                <div
                  className="row-clue"
                  key={rowIndex}
                  aria-label={`Row ${rowIndex + 1}: ${formatClue(clues)}`}
                >
                  {clues.length ? (
                    clues.map((clue, clueIndex) => (
                      <span className="clue-number" key={clueIndex} aria-hidden="true">
                        {clue}
                      </span>
                    ))
                  ) : (
                    <span className="empty-clue" aria-hidden="true">·</span>
                  )}
                </div>
              ))}
            </div>
            <Board3D
              grid={grid}
              solved={solved}
              onMarkCell={markCell}
              tool={tool}
              puzzle={puzzle}
            />
          </div>

          <div className="controls-row">
            <div className="tool-group" aria-label="Cell marking tool">
              <button
                className={`tool-button ${tool === "filled" ? "is-selected" : ""}`}
                type="button"
                aria-pressed={tool === "filled"}
                onClick={() => setTool("filled")}
              >
                <span className="tool-icon tool-icon--filled" aria-hidden="true" />
                Fill
              </button>
              <button
                className={`tool-button ${tool === "empty" ? "is-selected" : ""}`}
                type="button"
                aria-pressed={tool === "empty"}
                onClick={() => setTool("empty")}
              >
                <span className="tool-icon tool-icon--empty" aria-hidden="true">×</span>
                Mark empty
              </button>
            </div>
            <button className="reset-button" type="button" onClick={resetPuzzle}>
              <span aria-hidden="true">↻</span>
              Reset
            </button>
          </div>

          <p className={`game-status ${solved ? "is-solved" : ""}`} role="status" aria-live="polite">
            <span className="status-dot" aria-hidden="true" />
            {statusText}
          </p>
          <p className="instructions">
            Numbers show consecutive filled cells in order. Separate each run with at least
            one empty cell. Mark empty squares to check off your progress.
          </p>
        </section>

        <footer className="game-footer">
          <span className="footer-line" />
          <p>
            Made by{" "}
            <a href="https://github.com/cesarchamal" target="_blank" rel="noreferrer">
              cesarchamal
            </a>
          </p>
          <span className="footer-line" />
        </footer>
      </section>
    </main>
  );
}
