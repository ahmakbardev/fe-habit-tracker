/**
 * Simple Regex-based Markdown to HTML converter
 * Specifically designed for the paste functionality in RichTextEditor
 */
export const markdownToHtml = (markdown: string): string => {
  let html = markdown;

  // 1. Escape HTML special characters to prevent XSS (if needed, but we might want to keep some if it's already HTML)
  // For simplicity and because it's a personal habit tracker, we'll focus on the conversion.

  // 2. Horizontal Rules
  html = html.replace(/^---$/gm, '<hr />');

  // 3. Headings
  html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
  html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
  html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');

  // 4. Task Lists (Checkboxes)
  // * [ ] task or - [ ] task
  html = html.replace(/^[\*-] \[ \] (.*$)/gm, '<li class="task-item"><input type="checkbox" class="task-checkbox select-none">$1</li>');
  html = html.replace(/^[\*-] \[x\] (.*$)/gm, '<li class="task-item"><input type="checkbox" class="task-checkbox select-none" checked="true">$1</li>');
  
  // 5. Unordered Lists (Standard)
  html = html.replace(/^[\*-] (?!\[ [ x]\])(.*$)/gm, '<li>$1</li>');

  // 6. Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');

  // 7. Italic
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.*?)_/g, '<em>$1</em>');

  // 8. Inline Code
  html = html.replace(/`(.*?)`/g, '<code>$1</code>');

  // 9. Links
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-600 underline">$1</a>');

  // 10. Group <li> elements into <ul> or <ul class="task-list">
  // This is tricky with regex. Let's do a multi-pass approach.
  
  const lines = html.split('\n');
  const result = [];
  let inList = false;
  let isTaskList = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    
    if (line.startsWith('<li')) {
      const currentIsTask = line.includes('class="task-item"');
      
      if (!inList) {
        inList = true;
        isTaskList = currentIsTask;
        result.push(isTaskList ? '<ul class="task-list">' : '<ul>');
      } else if (isTaskList !== currentIsTask) {
        // Switch between task list and normal list
        result.push('</ul>');
        isTaskList = currentIsTask;
        result.push(isTaskList ? '<ul class="task-list">' : '<ul>');
      }
      
      // Remove task-item class if it's there as we handle it with the parent <ul>
      if (currentIsTask) {
        line = line.replace('class="task-item"', '');
      }
      result.push(line);
    } else {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      
      if (line === '') {
        result.push('<br>');
      } else if (!line.startsWith('<h') && !line.startsWith('<hr') && !line.startsWith('<ul') && !line.startsWith('<li')) {
        result.push(`<p>${line}</p>`);
      } else {
        result.push(line);
      }
    }
  }
  
  if (inList) {
    result.push('</ul>');
  }

  return result.join('');
};

/**
 * Checks if a string likely contains Markdown content
 */
export const isMarkdown = (text: string): boolean => {
  const markdownPatterns = [
    /^# /m,           // Heading 1
    /^## /m,          // Heading 2
    /^---$/m,         // HR
    /^\* /m,          // Unordered list
    /^- /m,           // Unordered list
    /^\d+\. /m,       // Ordered list
    /\[(.*?)\]\((.*?)\)/, // Link
    /\*\*(.*?)\*\*/,  // Bold
    /`(.*?)`/,        // Inline code
    /^[\*-] \[ [ x]\]/m  // Task list
  ];

  return markdownPatterns.some(pattern => pattern.test(text));
};
