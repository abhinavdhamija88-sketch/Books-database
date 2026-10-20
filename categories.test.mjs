import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {CATEGORIES,LEGACY_CATEGORIES,DEFAULT_CATEGORY,categoryForBook,normalizeBook} from './categories.js';
import {validateNewPassword} from './password-reset.js';
test('nine legacy categories are assigned and owner-selected categories are preserved',()=>{
 assert.equal(Object.keys(LEGACY_CATEGORIES).length,9);
 for(const [id,category] of Object.entries(LEGACY_CATEGORIES)){
  assert.equal(categoryForBook({id,category:'To review'}),category);
  assert.equal(categoryForBook({id,category:'Romance'}),'Romance');
 }
 assert.equal(categoryForBook({id:'new',category:'To review'}),DEFAULT_CATEGORY);
 assert.ok(!CATEGORIES.includes('To review'));
});
test('all seeded books have real categories and normalization retains data',async()=>{
 const books=JSON.parse(await readFile(new URL('./books.json',import.meta.url)));
 assert.equal(books.length,156);assert.ok(books.every(b=>CATEGORIES.includes(b.category)));
 const original={id:'2026-28',title:'Whistler',category:'To review',rating:5,notes:'!!'};
 assert.deepEqual(normalizeBook(original),{...original,category:'Mystery & thriller'});
 assert.equal(original.category,'To review');
});
test('password reset requires eight characters and matching confirmation',()=>{
 assert.match(validateNewPassword('short','short'),/at least 8/);
 assert.match(validateNewPassword('long-password','different'),/do not match/);
 assert.equal(validateNewPassword('long-password','long-password'),'');
});
