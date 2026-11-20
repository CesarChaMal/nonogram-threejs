import assert from "node:assert/strict";
import test from "node:test";
import { createEmptyGrid, getRunClues, isPuzzleSolved, PUZZLES } from "./puzzles.js";

test("run clues count ordered groups of filled cells", () => {
  assert.deepEqual(getRunClues([true, true, false, true, true, true, false]), [2, 3]);
  assert.deepEqual(getRunClues([false, false, false]), []);
});

test("each difficulty has a square solution whose clues cover every filled cell", () => {
  for (const [level, puzzle] of Object.entries(PUZZLES)) {
    assert.ok(puzzle.solution.every((row) => row.length === puzzle.size), level);
    assert.equal(
      puzzle.rowClues.flat().reduce((sum, clue) => sum + clue, 0),
      puzzle.filledCount,
      level,
    );
    assert.equal(
      puzzle.columnClues.flat().reduce((sum, clue) => sum + clue, 0),
      puzzle.filledCount,
      level,
    );
  }
});

test("a puzzle is solved only when filled cells match the complete solution", () => {
  const puzzle = PUZZLES.easy;
  const marks = puzzle.solution.map((row) =>
    row.map((isFilled) => (isFilled ? "filled" : "empty")),
  );

  assert.equal(isPuzzleSolved(puzzle.solution, createEmptyGrid(puzzle.size)), false);
  assert.equal(isPuzzleSolved(puzzle.solution, marks), true);

  marks[0][1] = "unknown";
  assert.equal(isPuzzleSolved(puzzle.solution, marks), false);
});
