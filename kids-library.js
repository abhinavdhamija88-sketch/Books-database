import {sortTitle} from './library.js';
export function normalizeKidsTitle(title){
 return sortTitle(title.trim().normalize('NFKD').replace(/[\u0300-\u036f]/g,'')).toLowerCase().replace(/[^a-z0-9]/g,'');
}
export function selectKidsBooks(books,search=''){
 const term=search.trim().toLocaleLowerCase();
 return books.filter(b=>!term||[b.title,b.author,b.illustrator,b.notes].some(value=>(value||'').toLocaleLowerCase().includes(term)))
  .sort((a,b)=>sortTitle(a.title).localeCompare(sortTitle(b.title))||a.id.localeCompare(b.id));
}
export function duplicateKidsBooks(books,title,id){
 const normalized=normalizeKidsTitle(title);
 return normalized?books.filter(b=>b.id!==id&&normalizeKidsTitle(b.title)===normalized):[];
}
export function safeBookUrl(value){
 if(!value)return '';
 try{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password?url.href:'';}catch{return '';}
}
export function validateKidsBook(book){
 if(!book.title.trim()||book.title.length>250)return 'Enter a title of up to 250 characters.';
 if(book.author.length>250||book.illustrator.length>250)return 'Author and illustrator names must be 250 characters or fewer.';
 if(book.notes.length>10000)return 'Notes must be 10,000 characters or fewer.';
 if(book.amazon_url&&(book.amazon_url.length>2000||!safeBookUrl(book.amazon_url)))return 'Enter a valid HTTPS link, or leave the link blank.';
 return '';
}
