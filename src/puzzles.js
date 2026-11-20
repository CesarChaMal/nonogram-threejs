export function getRunClues(line) {
  const clues = [];
  let runLength = 0;

  for (const filled of line) {
    if (filled) {
      runLength += 1;
    } else if (runLength > 0) {
      clues.push(runLength);
      runLength = 0;
    }
  }

  if (runLength > 0) clues.push(runLength);
  return clues;
}

function createPuzzle(title, pattern) {
  const size = pattern.length;
  if (
    pattern.some(
      (row) => row.length !== size || !/^[01]+$/.test(row),
    )
  ) {
    throw new Error(`The ${title} puzzle must be a square binary grid.`);
  }

  const solution = pattern.map((row) =>
    Array.from(row, (cell) => cell === "1"),
  );
  const rowClues = solution.map(getRunClues);
  const columnClues = Array.from({ length: size }, (_, column) =>
    getRunClues(solution.map((row) => row[column])),
  );

  return {
    title,
    size,
    solution,
    rowClues,
    columnClues,
    filledCount: solution.flat().filter(Boolean).length,
    maxClueCount: Math.max(
      1,
      ...rowClues.map((clues) => clues.length),
      ...columnClues.map((clues) => clues.length),
    ),
  };
}

const butterflyWings = [
  "1100000",
  "1110000",
  "1111000",
  "0111100",
  "0011110",
  "0001111",
  "0000111",
  "0000011",
  "0000011",
  "0000111",
  "0001111",
  "0011110",
  "0111100",
  "1111000",
  "1110000",
];

export const PUZZLES = {
  easy: {
    label: "Easy",
    ...createPuzzle("Heart", ["01110", "11111", "11111", "01110", "00100"]),
  },
  medium: {
    label: "Medium",
    ...createPuzzle("Pine tree", [
      "0000010000",
      "0000111000",
      "0001111100",
      "0011111110",
      "0111111111",
      "0001111100",
      "0000010000",
      "0000010000",
      "0000111000",
      "0001111100",
    ]),
  },
  advanced: {
    label: "Advanced",
    ...createPuzzle(
      "Butterfly",
      butterflyWings.map((wing) => `${wing}1${[...wing].reverse().join("")}`),
    ),
  },
};

export function createEmptyGrid(size) {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => null),
  );
}

export function isPuzzleSolved(solution, marks) {
  return solution.every(
    (row, rowIndex) =>
      marks[rowIndex]?.length === row.length &&
      row.every(
        (isFilled, columnIndex) =>
          isFilled === (marks[rowIndex][columnIndex] === "filled"),
      ),
  );
}
