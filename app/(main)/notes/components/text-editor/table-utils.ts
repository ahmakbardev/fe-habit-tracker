// app/(main)/notes/components/text-editor/table-utils.ts

import { moveCaretToStart } from "./caret-utils";

export const addRow = (table: HTMLTableElement) => {
  const tbody = table.querySelector("tbody");
  if (!tbody) return;
  
  const rowSample = table.querySelector("tr");
  const colCount = rowSample ? rowSample.children.length : 1;

  const newRow = document.createElement("tr");
  for (let i = 0; i < colCount; i++) {
    const td = document.createElement("td");
    td.className = "border border-slate-300 p-2 min-w-[50px]";
    td.innerHTML = "<br>";
    newRow.appendChild(td);
  }
  tbody.appendChild(newRow);
};

export const addColumn = (table: HTMLTableElement) => {
  const rows = table.querySelectorAll("tr");
  rows.forEach((row) => {
    const isHeader = row.parentElement?.tagName === "THEAD";
    const cell = document.createElement(isHeader ? "th" : "td");
    
    cell.className = `border border-slate-300 p-2 min-w-[50px] ${
      isHeader ? "text-left bg-slate-50 font-semibold" : ""
    }`;
    cell.innerHTML = isHeader ? "New Header" : "<br>";
    row.appendChild(cell);
  });
};

// --- [BARU] DELETE ROW ---
export const deleteRow = (table: HTMLTableElement) => {
  const rows = table.querySelectorAll("tr");
  // Minimal sisakan 1 baris header + 1 baris body (total 2) agar tabel tidak rusak
  if (rows.length <= 2) return; 
  
  // Hapus baris terakhir
  const lastRow = rows[rows.length - 1];
  lastRow.remove();
};

// --- [BARU] DELETE COLUMN ---
export const deleteColumn = (table: HTMLTableElement) => {
  const rows = table.querySelectorAll("tr");
  const colCount = rows[0]?.children.length || 0;

  // Minimal sisakan 1 kolom
  if (colCount <= 1) return;

  rows.forEach((row) => {
    const lastCell = row.lastElementChild;
    if (lastCell) lastCell.remove();
  });
};

export const removeTable = (table: HTMLTableElement) => {
  const parent = table.parentElement;
  if (parent && parent.classList.contains("overflow-x-auto")) {
    parent.remove();
  } else {
    table.remove();
  }
};

export const toggleTableWidth = (table: HTMLTableElement) => {
  if (table.classList.contains("w-full")) {
    table.classList.remove("w-full");
    table.style.width = "auto";
  } else {
    table.classList.add("w-full");
    table.style.width = "100%";
  }
};

// ... (handleTableTab tetap sama)
export const handleTableTab = (e: React.KeyboardEvent, cell: HTMLElement) => {
  e.preventDefault(); 
  const table = cell.closest("table");
  if (!table) return;

  const cells = Array.from(table.querySelectorAll("th, td"));
  const currentIndex = cells.indexOf(cell);

  if (currentIndex < cells.length - 1) {
    const nextCell = cells[currentIndex + 1] as HTMLElement;
    if (nextCell) moveCaretToStart(nextCell);
  } else {
    addRow(table);
    const newRows = table.querySelectorAll("tr");
    const lastRow = newRows[newRows.length - 1];
    const firstCellInNewRow = lastRow.querySelector("td");
    
    if (firstCellInNewRow) {
      moveCaretToStart(firstCellInNewRow);
    }
  }
};