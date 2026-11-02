import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {selectKidsBooks,duplicateKidsBooks,normalizeKidsTitle,safeBookUrl,validateKidsBook} from './kids-library.js';
const books=JSON.parse(await readFile(new URL('./kids-books.json',import.meta.url)));
test('67 kids entries retain confirmed book and illustrator details',()=>{
 assert.equal(books.length,67);assert.equal(new Set(books.map(b=>b.id)).size,67);
 const honeybee=books.find(b=>b.id==='kids-061');assert.equal(honeybee.title,'The Honeybee');assert.equal(honeybee.author,'Kirsten Hall');assert.equal(honeybee.illustrator,'Isabelle Arsenault');assert.equal(honeybee.notes,'');
 const star=books.find(b=>b.title==='Little Star (You Are the Light)');assert.equal(star.author,'Lisa Edwards');assert.equal(star.illustrator,'Kat Kalindi');
 assert.equal(books.find(b=>b.title==='Goodnight, Monkey').author,'Joshua George');
 assert.ok(books.every(b=>b.recipients.length===0));assert.ok(books.every(b=>!('rating' in b)&&!('year' in b)));
});
test('kids search includes authors and sorts independently of leading articles',()=>{
 const found=selectKidsBooks(books,'david shannon');assert.equal(found.length,3);
 assert.equal(selectKidsBooks(books,'honeybee').length,1);assert.equal(selectKidsBooks(books,'no such book xyz').length,0);
 const sorted=selectKidsBooks([{id:'2',title:'The Apple',author:''},{id:'1',title:'Banana',author:''}]);assert.equal(sorted[0].title,'The Apple');
});
test('duplicate warnings ignore articles, punctuation, case, accents, and the edited record',()=>{
 assert.equal(normalizeKidsTitle('  The Snowy Day! '),normalizeKidsTitle('snowy day'));
 assert.equal(duplicateKidsBooks(books,'snowy day').length,1);
 assert.equal(duplicateKidsBooks(books,'The Snowy Day','kids-018').length,0);
 assert.equal(duplicateKidsBooks(books,'').length,0);
});
test('optional links allow only safe HTTPS URLs and fields validate before saving',()=>{
 for(const url of ['javascript:alert(1)','data:text/html,x','http://example.com','https://user:password@example.com','not a link'])assert.equal(safeBookUrl(url),'');
 assert.equal(safeBookUrl('https://www.amazon.com/dp/0593465210'),'https://www.amazon.com/dp/0593465210');
 const book={title:'New book',author:'',illustrator:'',notes:'',amazon_url:''};assert.equal(validateKidsBook(book),'');
 assert.match(validateKidsBook({...book,title:' '}),/title/);assert.match(validateKidsBook({...book,amazon_url:'javascript:alert(1)'}),/HTTPS/);
});
