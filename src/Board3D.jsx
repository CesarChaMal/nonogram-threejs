import { useEffect, useRef, useState } from "react";
import {
  AmbientLight,
  BoxGeometry,
  DirectionalLight,
  Group,
  Mesh,
  MeshStandardMaterial,
  OrthographicCamera,
  Scene,
  WebGLRenderer,
} from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const BOARD_SIZE = 6;

export default function Board3D({ grid, solved, onMarkCell, tool, puzzle }) {
  const mountRef = useRef(null);
  const updateBoardRef = useRef(() => {});
  const currentPropsRef = useRef({ grid, solved });
  const [webglError, setWebglError] = useState(false);

  currentPropsRef.current = { grid, solved };
  const size = puzzle.size;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    let renderer;
    try {
      renderer = new WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      setWebglError(true);
      return undefined;
    }

    setWebglError(false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = "srgb";
    renderer.shadowMap.enabled = true;
    renderer.domElement.className = "board-canvas";
    renderer.domElement.setAttribute("aria-hidden", "true");
    mount.appendChild(renderer.domElement);

    const scene = new Scene();
    const camera = new OrthographicCamera(
      -BOARD_SIZE / 2,
      BOARD_SIZE / 2,
      BOARD_SIZE / 2,
      -BOARD_SIZE / 2,
      0.1,
      100,
    );
    camera.position.set(0, 10, 0);
    camera.up.set(0, 0, -1);
    camera.lookAt(0, 0, 0);

    scene.add(new AmbientLight(0xffffff, 1.6));
    const keyLight = new DirectionalLight(0xfff0d7, 3.4);
    keyLight.position.set(-3, 8, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    scene.add(keyLight);

    const base = new Mesh(
      new RoundedBoxGeometry(BOARD_SIZE + 0.16, 0.2, BOARD_SIZE + 0.16, 4, 0.09),
      new MeshStandardMaterial({
        color: 0xdcd8cd,
        roughness: 0.8,
      }),
    );
    base.position.y = -0.12;
    base.receiveShadow = true;
    scene.add(base);

    const cellSize = BOARD_SIZE / size;
    const gap = cellSize * 0.055;
    const tileGeometry = new RoundedBoxGeometry(
      cellSize - gap,
      0.12,
      cellSize - gap,
      3,
      Math.min(0.04, cellSize * 0.08),
    );
    const barGeometry = new BoxGeometry(cellSize * 0.46, 0.035, cellSize * 0.05);
    const markMaterial = new MeshStandardMaterial({
      color: 0x7d8597,
      roughness: 0.6,
    });
    const tiles = [];
    const emptyMarks = [];

    for (let row = 0; row < size; row += 1) {
      for (let column = 0; column < size; column += 1) {
        const x = (column - (size - 1) / 2) * cellSize;
        const z = (row - (size - 1) / 2) * cellSize;
        const tile = new Mesh(
          tileGeometry,
          new MeshStandardMaterial({
            color: 0xfffdf8,
            roughness: 0.48,
            metalness: 0.02,
          }),
        );
        tile.position.set(x, 0.035, z);
        tile.castShadow = true;
        tile.receiveShadow = true;
        scene.add(tile);
        tiles.push(tile);

        const mark = new Group();
        mark.position.set(x, 0.13, z);
        const firstBar = new Mesh(barGeometry, markMaterial);
        firstBar.rotation.y = Math.PI / 4;
        firstBar.castShadow = true;
        const secondBar = new Mesh(barGeometry, markMaterial);
        secondBar.rotation.y = -Math.PI / 4;
        secondBar.castShadow = true;
        mark.add(firstBar, secondBar);
        mark.visible = false;
        scene.add(mark);
        emptyMarks.push(mark);
      }
    }

    function render() {
      const { grid: currentGrid, solved: currentSolved } = currentPropsRef.current;
      tiles.forEach((tile, index) => {
        const row = Math.floor(index / size);
        const column = index % size;
        const mark = currentGrid[row][column];
        tile.material.color.setHex(
          mark === "filled"
            ? currentSolved
              ? 0x6ca67a
              : 0x566fd1
            : mark === "empty"
              ? 0xe8e5de
              : 0xfffdf8,
        );
        tile.material.emissive.setHex(mark === "filled" && !currentSolved ? 0x172b6a : 0x000000);
        tile.material.emissiveIntensity = mark === "filled" && !currentSolved ? 0.12 : 0;
        emptyMarks[index].visible = mark === "empty";
      });
      renderer.render(scene, camera);
    }
    updateBoardRef.current = render;

    function resize() {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      const aspect = width / height;
      camera.left = (-BOARD_SIZE * aspect) / 2;
      camera.right = (BOARD_SIZE * aspect) / 2;
      camera.top = BOARD_SIZE / 2;
      camera.bottom = -BOARD_SIZE / 2;
      camera.updateProjectionMatrix();
      render();
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    resize();

    return () => {
      resizeObserver.disconnect();
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          const materials = Array.isArray(object.material)
            ? object.material
            : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
      updateBoardRef.current = () => {};
    };
  }, [size]);

  useEffect(() => {
    updateBoardRef.current();
  }, [grid, solved]);

  function formatCellLabel(rowIndex, columnIndex, mark) {
    const label = mark === "filled" ? "filled" : mark === "empty" ? "marked empty" : "unknown";
    return `Row ${rowIndex + 1}, column ${columnIndex + 1}, ${label}; click to ${tool === "filled" ? "fill" : "mark empty"}`;
  }

  return (
    <>
      {webglError && (
        <p className="webgl-warning" role="status">
          WebGL is unavailable. The puzzle is still playable in 2D.
        </p>
      )}
      <div className={`board-stage ${webglError ? "is-fallback" : ""}`} ref={mountRef}>
        <div
          className="cell-grid"
          role="grid"
          aria-label={`${puzzle.size} by ${puzzle.size} Nonogram grid`}
          style={{
            gridTemplateColumns: `repeat(${puzzle.size}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${puzzle.size}, minmax(0, 1fr))`,
          }}
        >
          {grid.map((row, rowIndex) =>
            row.map((mark, columnIndex) => (
              <button
                className={[
                  "grid-cell",
                  mark ? `is-${mark}` : "",
                  columnIndex < puzzle.size - 1 && (columnIndex + 1) % 5 === 0
                    ? "major-right"
                    : "",
                  rowIndex < puzzle.size - 1 && (rowIndex + 1) % 5 === 0
                    ? "major-bottom"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                key={`${rowIndex}-${columnIndex}`}
                type="button"
                role="gridcell"
                aria-label={formatCellLabel(rowIndex, columnIndex, mark)}
                aria-pressed={mark === tool}
                disabled={solved}
                onClick={() => onMarkCell(rowIndex, columnIndex)}
                onContextMenu={(event) => {
                  event.preventDefault();
                  onMarkCell(rowIndex, columnIndex, "empty");
                }}
              >
                {mark === "empty" && <span aria-hidden="true">×</span>}
              </button>
            )),
          )}
        </div>
      </div>
    </>
  );
}
