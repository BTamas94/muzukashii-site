// Muzukashii — interactive 1/9 board demo
// One 3×3 box is fully visible; the other 56 cells fade to ~12% opacity.
// Click the mini-map (or use arrow keys while hovering the demo) to wander.

(() => {
  const givens = [
    "53..7....",
    "6..195...",
    ".98....6.",
    "8...6...3",
    "4..8.3..1",
    "7...2...6",
    ".6....28.",
    "...419..5",
    "....8..79",
  ].join("");

  const solution = [
    "534678912",
    "672195348",
    "198342567",
    "859761423",
    "426853791",
    "713924856",
    "961537284",
    "287419635",
    "345286179",
  ].join("");

  // player-entered cells. Map of "row,col" → digit-to-render.
  // (4,1) is intentionally wrong (correct value is 2) so it creates a real
  // row-4 conflict with the player-entered 5 at (4,4) two boxes over.
  const playerCells = new Map([
    ["0,2", "4"],
    ["1,6", "3"],
    ["1,7", "4"],
    ["2,0", "1"],
    ["4,1", "5"],
    ["4,4", "5"],
    ["5,7", "5"],
    ["6,0", "9"],
    ["7,6", "6"],
    ["8,2", "5"],
    ["8,5", "6"],
  ]);

  // Real conflict: (4,1) and (4,4) are both 5 in row 4. Each cell shows an
  // arrow pointing toward the other. Click the mid-left box on the mini-map
  // to see the mirror arrow on (4,1).
  const conflictCells = new Set(["4,1", "4,4"]);
  const conflictArrows = {
    "4,1": ["right"],
    "4,4": ["left"],
  };

  const boxLabels = [
    "Box 1 · Top-left",     "Box 2 · Top-center",   "Box 3 · Top-right",
    "Box 4 · Middle-left",  "Box 5 · Center",       "Box 6 · Middle-right",
    "Box 7 · Bottom-left",  "Box 8 · Bottom-center","Box 9 · Bottom-right",
  ];

  const boardEl = document.getElementById("demoBoard");
  const miniEl  = document.getElementById("demoMini");
  const labelEl = document.getElementById("demoBoxLabel");
  if (!boardEl || !miniEl || !labelEl) return;

  let activeBox = 4; // start at the centre

  const boxOf = (row, col) => Math.floor(row / 3) * 3 + Math.floor(col / 3);

  // build the 9×9 board once; flip classes on box-change.
  const cells = [];
  const frag = document.createDocumentFragment();
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const idx = r * 9 + c;
      const givenCh = givens[idx];
      const isGiven = givenCh !== ".";
      const key = `${r},${c}`;
      const playerDigit = playerCells.get(key);

      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.dataset.box = boxOf(r, c);

      if (isGiven) {
        cell.classList.add("given");
        cell.textContent = givenCh;
      } else if (playerDigit) {
        cell.classList.add("own");
        cell.textContent = playerDigit;
      }
      if (conflictCells.has(key)) {
        cell.classList.add("conflict");
      }

      const arrows = conflictArrows[key];
      if (arrows) {
        for (const dir of arrows) {
          const a = document.createElement("span");
          a.className = `arrow ${dir}`;
          a.textContent = { left: "‹", right: "›", up: "˄", down: "˅" }[dir];
          cell.appendChild(a);
        }
      }

      frag.appendChild(cell);
      cells.push(cell);
    }
  }
  boardEl.appendChild(frag);

  // mini-map
  const miniFrag = document.createDocumentFragment();
  for (let b = 0; b < 9; b++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.dataset.box = b;
    btn.setAttribute("aria-label", `Focus ${boxLabels[b]}`);
    btn.addEventListener("click", () => setActive(b));
    miniFrag.appendChild(btn);
  }
  miniEl.appendChild(miniFrag);

  const miniButtons = Array.from(miniEl.children);

  function setActive(box) {
    activeBox = ((box % 9) + 9) % 9;
    for (const cell of cells) {
      const inBox = Number(cell.dataset.box) === activeBox;
      cell.classList.toggle("active", inBox);
      cell.classList.toggle("dim", !inBox);
    }
    for (const btn of miniButtons) {
      btn.setAttribute("aria-current", Number(btn.dataset.box) === activeBox);
    }
    labelEl.textContent = boxLabels[activeBox];
  }

  // arrow-key navigation (when the demo is roughly in view / focused)
  document.addEventListener("keydown", (e) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
    const rect = boardEl.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (!inView) return;
    const target = e.target;
    if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;

    const row = Math.floor(activeBox / 3);
    const col = activeBox % 3;
    let nr = row, nc = col;
    if (e.key === "ArrowLeft")  nc = Math.max(0, col - 1);
    if (e.key === "ArrowRight") nc = Math.min(2, col + 1);
    if (e.key === "ArrowUp")    nr = Math.max(0, row - 1);
    if (e.key === "ArrowDown")  nr = Math.min(2, row + 1);
    if (nr !== row || nc !== col) {
      e.preventDefault();
      setActive(nr * 3 + nc);
    }
  });

  // initial render
  setActive(activeBox);
})();
