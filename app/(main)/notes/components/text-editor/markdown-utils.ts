/**
 * Simple Regex-based Markdown to HTML converter
 * Specifically designed for the paste functionality in RichTextEditor
 */
export const markdownToHtml = (markdown: string): string => {
  const lines = markdown.split(/\r?\n/);
  const result: string[] = [];
  let inList = false;
  let isTaskList = false;
  let inTable = false;
  let tableHeaderProcessed = false;
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];
  let codeLanguage = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // 0. Code Block Logic (Triple Backticks)
    if (trimmedLine.startsWith('```')) {
      if (inCodeBlock) {
        // End of code block
        const codeContent = codeBlockLines.join('\n');
        const langAttr = codeLanguage ? ` data-lang="${codeLanguage}"` : '';
        const langBadge = codeLanguage ? `<div class="code-lang-badge" contenteditable="false">${codeLanguage}</div>` : '';
        
        result.push(`<pre${langAttr}>${langBadge}<code>${escapeHtml(codeContent)}</code></pre>`);
        inCodeBlock = false;
        codeBlockLines = [];
        codeLanguage = '';
      } else {
        // Start of code block
        inCodeBlock = true;
        codeLanguage = trimmedLine.slice(3).trim();
        // If in list, we stay in list to maintain indentation
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    // 1. Table Logic
    const isTableLine = trimmedLine.startsWith('|') && trimmedLine.endsWith('|');
    
    if (isTableLine) {
      if (inList) { result.push('</ul>'); inList = false; }
      
      // Skip separator line (| :--- |)
      if (trimmedLine.match(/^\|?[:\-\s|]+\|?$/)) {
        continue;
      }

      if (!inTable) {
        inTable = true;
        tableHeaderProcessed = false;
        result.push('<div class="overflow-x-auto my-4"><table class="w-full border-collapse border border-slate-300">');
      }

      const cells = trimmedLine
        .split('|')
        .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
        .map(cell => cell.trim());

      if (!tableHeaderProcessed) {
        result.push('<thead><tr>');
        cells.forEach(cell => {
          result.push(`<th class="border border-slate-300 p-2 bg-slate-50 font-semibold text-left">${parseInlineMarkdown(cell)}</th>`);
        });
        result.push('</tr></thead><tbody>');
        tableHeaderProcessed = true;
      } else {
        result.push('<tr>');
        cells.forEach(cell => {
          result.push(`<td class="border border-slate-300 p-2 min-w-[50px]">${parseInlineMarkdown(cell)}</td>`);
        });
        result.push('</tr>');
      }
      continue;
    } else if (inTable) {
      result.push('</tbody></table></div>');
      inTable = false;
    }

    // 1. Horizontal Rule (---)
    if (/^---$/.test(trimmedLine)) {
      if (inList) { result.push('</ul>'); inList = false; }
      result.push('<hr />');
      continue;
    }

    // 2. Headings
    const headingMatch = trimmedLine.match(/^(#{1,3})\s+(.*)$/);
    if (headingMatch) {
      if (inList) { result.push('</ul>'); inList = false; }
      const level = headingMatch[1].length;
      const content = parseInlineMarkdown(headingMatch[2]);
      result.push(`<h${level}>${content}</h${level}>`);
      continue;
    }

    // 3. Lists (Task Lists & Unordered Lists)
    const taskMatch = trimmedLine.match(/^[\*-]\s+\[([ x])\]\s+(.*)$/i);
    const listMatch = trimmedLine.match(/^[\*-]\s+(.*)$/);

    if (taskMatch || listMatch) {
      const currentIsTask = !!taskMatch;
      const content = parseInlineMarkdown(taskMatch ? taskMatch[2] : listMatch![1]);
      const isChecked = taskMatch && taskMatch[1].toLowerCase() === 'x';

      if (!inList) {
        inList = true;
        isTaskList = currentIsTask;
        result.push(isTaskList ? '<ul class="task-list">' : '<ul>');
      } else if (isTaskList !== currentIsTask) {
        result.push('</ul>');
        isTaskList = currentIsTask;
        result.push(isTaskList ? '<ul class="task-list">' : '<ul>');
      }

      if (isTaskList) {
        result.push(`<li><input type="checkbox" class="task-checkbox select-none"${isChecked ? ' checked="true"' : ''}><span>${content}</span></li>`);
      } else {
        result.push(`<li>${content}</li>`);
      }
      continue;
    }

    // Jika sampai sini, berarti bukan list/heading/hr/table
    if (inList) {
      result.push('</ul>');
      inList = false;
    }

    // 4. Baris Kosong
    if (trimmedLine === '') {
      if (result.length > 0 && !result[result.length - 1].endsWith('>')) {
        result.push('<br>');
      }
      continue;
    }

    // 5. Paragraf Biasa
    result.push(`<div>${parseInlineMarkdown(line)}</div>`);
  }

  if (inTable) {
    result.push('</tbody></table></div>');
  }

  if (inList) {
    result.push('</ul>');
  }

  if (inCodeBlock) {
    const codeContent = codeBlockLines.join('\n');
    result.push(`<pre><code>${escapeHtml(codeContent)}</code></pre>`);
  }

  return result.join('');
};

/**
 * Basic HTML escape to prevent breaking the editor with code content
 */
const escapeHtml = (text: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
};

/**
 * Parse bold, italic, code, and links
 */
const parseInlineMarkdown = (text: string): string => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-600 underline">$1</a>');
};

/**
 * Checks if a string likely contains Markdown content
 */
export const isMarkdown = (text: string): boolean => {
  const markdownPatterns = [
    /^# /m,
    /^## /m,
    /^### /m,
    /^---$/m,
    /^[\*-] /m,
    /^\d+\. /m,
    /\[(.*?)\]\((.*?)\)/,
    /\*\*(.*?)\*\*/,
    /`(.*?)`/,
    /^```/m,
    /^[\*-] \[ [ x]\]/mi,
    /^\|.*\|/m
  ];

  return markdownPatterns.some(pattern => pattern.test(text));
};
