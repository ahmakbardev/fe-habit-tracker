/**
 * Simple Regex-based Markdown to HTML converter
 * Specifically designed for the paste functionality in RichTextEditor
 */
export const markdownToHtml = (markdown: string): string => {
  // Pecah berdasarkan baris dan bersihkan spasi di akhir setiap baris
  const lines = markdown.split(/\r?\n/);
  const result: string[] = [];
  let inList = false;
  let isTaskList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

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
        result.push(`<li><input type="checkbox" class="task-checkbox select-none"${isChecked ? ' checked="true"' : ''}>${content}</li>`);
      } else {
        result.push(`<li>${content}</li>`);
      }
      continue;
    }

    // Jika sampai sini, berarti bukan list/heading/hr
    if (inList) {
      result.push('</ul>');
      inList = false;
    }

    // 4. Baris Kosong
    if (trimmedLine === '') {
      // Hanya tambahkan break jika baris sebelumnya bukan block element atau jika ada banyak baris kosong
      if (result.length > 0 && !result[result.length - 1].endsWith('>')) {
        result.push('<br>');
      }
      continue;
    }

    // 5. Paragraf Biasa
    result.push(`<div>${parseInlineMarkdown(line)}</div>`);
  }

  if (inList) {
    result.push('</ul>');
  }

  return result.join('');
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
    /^---$/m,
    /^[\*-] /m,
    /^\d+\. /m,
    /\[(.*?)\]\((.*?)\)/,
    /\*\*(.*?)\*\*/,
    /`(.*?)`/,
    /^[\*-] \[ [ x]\]/mi
  ];

  return markdownPatterns.some(pattern => pattern.test(text));
};
