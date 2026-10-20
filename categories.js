export const DEFAULT_CATEGORY = 'Literary & contemporary fiction';
export const CATEGORIES = ['Fantasy & sci-fi','Historical fiction','Literary & contemporary fiction','Memoir','Mystery & thriller','Nonfiction','Romance'];
// Target only the original records; never overwrite a category selected by the owner.
export const LEGACY_CATEGORIES = {
  "2025-28": "Mystery & thriller",
  "2025-22": "Literary & contemporary fiction",
  "2026-21": "Memoir",
  "2026-24": "Memoir",
  "2026-34": "Historical fiction",
  "2026-18": "Memoir",
  "2024-11": "Historical fiction",
  "2024-37": "Memoir",
  "2026-28": "Mystery & thriller"
};
export function categoryForBook(book) {
 return !book.category || book.category === 'To review'
  ? LEGACY_CATEGORIES[book.id] || DEFAULT_CATEGORY : book.category;
}
export function normalizeBook(book) { return {...book, category: categoryForBook(book)}; }
