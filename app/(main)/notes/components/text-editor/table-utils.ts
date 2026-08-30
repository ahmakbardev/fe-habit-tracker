// app/(main)/notes/components/text-editor/table-utils.ts

import { moveCaretToStart } from "./caret-utils";

export const MIN_COLUMN_WIDTH = 50;

// Total lebar semua <col> di dalam colgroup, dipakai supaya tabel ikut
// melebar/menyempit sesuai jumlah lebar kolomnya (bukan dipaksa 100%).
const syncTableWidthFromColgroup = (table: HTMLTableElement, colgroup: HTMLTableColElement) => {
  const total = Array.from(colgroup.children).reduce(
    (sum, col) => sum + (parseFloat((col as HTMLElement).style.width) || 0),
    0
  );
  if (total > 0) table.style.width = `${total}px`;
};

// Membuat <colgroup> dari lebar kolom header saat ini (sekali saja / lazy),
// lalu mengunci table-layout ke "fixed" supaya lebar per kolom bisa
// diatur independen (tidak lagi ikut auto menyesuaikan isi sel).
export const ensureColgroup = (table: HTMLTableElement): HTMLTableColElement | null => {
  const headerRow = table.querySelector("tr");
  if (!headerRow) return null;

  let colgroup = table.querySelector("colgroup");
  const cells = Array.from(headerRow.children) as HTMLElement[];

  if (!colgroup) {
    colgroup = document.createElement("colgroup");
    cells.forEach((cell) => {
      const col = document.createElement("col");
      col.style.width = `${Math.max(cell.offsetWidth, MIN_COLUMN_WIDTH)}px`;
      colgroup!.appendChild(col);
    });
    table.insertBefore(colgroup, table.firstChild);
  } else if (colgroup.children.length < cells.length) {
    // Tabel lama yang barisnya sudah nambah kolom tapi colgroup belum sinkron
    for (let i = colgroup.children.length; i < cells.length; i++) {
      const col = document.createElement("col");
      col.style.width = `${Math.max(cells[i]?.offsetWidth || 100, MIN_COLUMN_WIDTH)}px`;
      colgroup.appendChild(col);
    }
  }

  table.style.tableLayout = "fixed";
  table.classList.remove("w-full");
  syncTableWidthFromColgroup(table, colgroup);

  return colgroup;
};

// Mengubah lebar satu kolom secara realtime (dipanggil saat drag berlangsung).
export const resizeColumn = (table: HTMLTableElement, colIndex: number, newWidth: number) => {
  const colgroup = table.querySelector("colgroup");
  if (!colgroup) return;
  const col = colgroup.children[colIndex] as HTMLElement | undefined;
  if (!col) return;

  const clamped = Math.max(MIN_COLUMN_WIDTH, newWidth);
  col.style.width = `${clamped}px`;
  syncTableWidthFromColgroup(table, colgroup);
};

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

  const colgroup = table.querySelector("colgroup");
  if (colgroup) {
    const col = document.createElement("col");
    col.style.width = `${MIN_COLUMN_WIDTH * 2}px`;
    colgroup.appendChild(col);
    syncTableWidthFromColgroup(table, colgroup);
  }
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

  const colgroup = table.querySelector("colgroup");
  if (colgroup && colgroup.lastElementChild) {
    colgroup.lastElementChild.remove();
    syncTableWidthFromColgroup(table, colgroup);
  }
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