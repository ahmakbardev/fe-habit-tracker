// app/(main)/notes/utils/id-utils.ts

export const generateId = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Hapus karakter non-alfanumerik
    .replace(/\s+/g, '-')      // Ganti spasi dengan hyphen
    .replace(/-+/g, '-')       // Hapus hyphen ganda
    .trim();
};

export const ensureSectionIds = (html: string): string => {
  if (typeof window === 'undefined') return html;
  
  const div = document.createElement('div');
  div.innerHTML = html;
  
  const headings = div.querySelectorAll('h1, h2, h3');
  headings.forEach((h, index) => {
    if (!h.id) {
      const baseId = generateId(h.textContent || `section-${index}`);
      h.id = baseId || `section-${index}`;
    }
  });
  
  return div.innerHTML;
};
