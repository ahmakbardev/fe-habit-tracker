// app/(main)/notes/components/text-editor/column-utils.ts

export const createColumns = (count: number = 2): string => {
  let columnsHtml = "";
  // Hitung width awal merata
  const width = (100 / count).toFixed(2);
  
  for (let i = 0; i < count; i++) {
    columnsHtml += `
      <div class="rte-column flex-1 min-w-[50px] min-h-[100px] p-3 border-2 border-transparent hover:border-blue-100 hover:bg-slate-50/50 rounded-xl transition-all outline-none relative" 
           contenteditable="true"
           style="flex: ${width} ${width} 0%">
        <p><br></p>
      </div>
    `;
    if (i < count - 1) {
      columnsHtml += `
        <div class="rte-column-resizer group/resizer w-3 h-auto cursor-col-resize self-stretch relative z-30 flex items-center justify-center -mx-1.5" contenteditable="false">
          <div class="w-1 h-full bg-transparent group-hover/resizer:bg-blue-400/30 transition-all rounded-full flex items-center justify-center">
            <div class="w-0.5 h-8 bg-slate-200 group-hover/resizer:bg-blue-500 rounded-full"></div>
          </div>
        </div>
      `;
    }
  }

  return `
    <div class="rte-columns my-8 group/columns relative border border-transparent hover:border-slate-100 rounded-2xl p-1 transition-all" contenteditable="false">
      <div class="rte-columns-actions absolute -top-4 -right-2 hidden group-hover/columns:flex items-center gap-1 z-40" contenteditable="false">
         <button class="add-column-btn flex items-center justify-center w-7 h-7 bg-white border border-slate-200 hover:bg-slate-50 rounded-md shadow-sm text-slate-500 hover:text-slate-900 transition-all text-lg font-bold" title="Add Column">+</button>
         <button class="remove-column-btn flex items-center justify-center w-7 h-7 bg-white border border-slate-200 hover:bg-slate-50 rounded-md shadow-sm text-slate-500 hover:text-red-500 transition-all text-lg font-bold" title="Remove Last Column">-</button>
      </div>
      
      <div class="rte-columns-container flex items-stretch">
        ${columnsHtml}
      </div>
    </div>
    <p><br /></p>
  `;
};

export const addColumn = (columnsWrapper: HTMLElement) => {
  const container = columnsWrapper.querySelector('.rte-columns-container') as HTMLElement;
  if (!container) return;

  const columns = container.querySelectorAll('.rte-column');
  const colCount = columns.length;
  
  // Recalculate widths to be even
  const newWidth = (100 / (colCount + 1)).toFixed(2);
  columns.forEach(col => {
    (col as HTMLElement).style.flex = `${newWidth} ${newWidth} 0%`;
  });

  // Add Resizer
  const resizer = document.createElement("div");
  resizer.className = "rte-column-resizer group/resizer w-3 h-auto cursor-col-resize self-stretch relative z-30 flex items-center justify-center -mx-1.5";
  resizer.contentEditable = "false";
  resizer.innerHTML = `
    <div class="w-1 h-full bg-transparent group-hover/resizer:bg-blue-400/30 transition-all rounded-full flex items-center justify-center">
      <div class="w-0.5 h-8 bg-slate-200 group-hover/resizer:bg-blue-500 rounded-full"></div>
    </div>
  `;
  container.appendChild(resizer);

  // Add Column
  const newCol = document.createElement("div");
  newCol.className = "rte-column flex-1 min-w-[50px] min-h-[100px] p-3 border-2 border-transparent hover:border-blue-100 hover:bg-slate-50/50 rounded-xl transition-all outline-none relative";
  newCol.contentEditable = "true";
  newCol.style.flex = `${newWidth} ${newWidth} 0%`;
  newCol.innerHTML = `<p><br></p>`;
  
  container.appendChild(newCol);
};

export const removeColumn = (columnsWrapper: HTMLElement) => {
  const container = columnsWrapper.querySelector('.rte-columns-container');
  if (!container) return;

  const columns = container.querySelectorAll('.rte-column');
  const resizers = container.querySelectorAll('.rte-column-resizer');

  if (columns.length <= 1) {
    // If only 1 left, convert to regular P or just remove
    const content = columns[0].innerHTML;
    const p = document.createElement("p");
    p.innerHTML = content === "<br>" || content === "<p><br></p>" ? "<br>" : content;
    columnsWrapper.replaceWith(p);
    return;
  }

  // Remove last column and last resizer
  columns[columns.length - 1].remove();
  if (resizers.length > 0) {
    resizers[resizers.length - 1].remove();
  }

  // Recalculate widths
  const remainingCols = container.querySelectorAll('.rte-column');
  const newWidth = (100 / remainingCols.length).toFixed(2);
  remainingCols.forEach(col => {
    (col as HTMLElement).style.flex = `${newWidth} ${newWidth} 0%`;
  });
};
