import {setupPasswordReset} from './password-reset.js';
import {CATEGORIES,DEFAULT_CATEGORY,normalizeBook} from './categories.js';
import {selectBooks} from './library.js';
import {cloud,loadBooks,isOwner,saveBook,deleteBook,migrateLegacyCategories} from './cloud.js';
const $=id=>document.getElementById(id);
let books=[],onlyFavorites=false,current,owner=false;
const key='reading-room-edits-v1';
const categories=CATEGORIES;
let categoryMigration;

const palette=[['#e5e8db','#63705c'],['#eee2d4','#a36f52'],['#dde6e8','#4b707b'],['#e9dfdf','#8b5d68'],['#e7e3d3','#8c7b4e']];
function notice(text){$('notice').textContent=text;$('notice').hidden=!text;}
function refreshOptions(){
 const year=$('year').value,category=$('category').value;
 $('year').replaceChildren(new Option('All years',''),...[...new Set(books.map(b=>b.year))].sort((a,b)=>b-a).map(y=>new Option(y,y)));$('year').value=year;
 const all=[...new Set([...categories,...books.map(b=>b.category)])].filter(c=>c&&c!=='To review').sort();
 $('category').replaceChildren(new Option('All categories',''),...all.map(c=>new Option(c,c)));$('category').value=category;
 $('edit-category').replaceChildren(...all.map(c=>new Option(c,c)));
}
function render(){const selected=selectBooks(books,{search:$('search').value,year:$('year').value,rating:$('rating').value,format:$('format').value,category:$('category').value,sort:$('sort').value,favorites:onlyFavorites});$('sort-description').textContent=$('sort').value==='title'?'Alphabetical · ignoring A, An & The':$('sort').value==='rating-desc'?'Rating · highest first':'Rating · lowest first';$('count').textContent=`${selected.length} books on the shelf`;$('empty').hidden=!!selected.length;$('books').replaceChildren(...selected.map(b=>{const card=document.createElement('button');card.className='book';card.setAttribute('aria-label',`${owner||!cloud?"Edit":"View"} ${b.title}, ${b.rating} stars`);const p=palette[[...b.id].reduce((sum,c)=>sum+c.charCodeAt(0),0)%palette.length];card.style.setProperty('--cover',p[0]);card.style.setProperty('--jacket',p[1]);const cover=document.createElement('div');cover.className='cover';const mini=document.createElement('span');mini.className='mini';mini.textContent=b.title;cover.append(mini);const details=document.createElement('div');details.className='details';const meta=document.createElement('div');meta.className='meta';const year=document.createElement('span');year.textContent=b.year;const format=document.createElement('span');format.textContent=b.format==='audio'?'♫ Audiobook':'▤ Kindle / print';meta.append(year,format);const title=document.createElement('h3');title.textContent=b.title;const row=document.createElement('div');row.className='rating-row';const stars=document.createElement('span');stars.className='stars';stars.textContent='★'.repeat(Math.floor(b.rating))+(b.rating%1?'½':'');const number=document.createElement('span');number.className='rating-number';number.textContent=b.rating.toFixed(1);row.append(stars,number);const category=document.createElement('p');category.className='category-tag';category.textContent=b.category||DEFAULT_CATEGORY;details.append(meta,title,category,row);if(b.favorite){const badge=document.createElement('span');badge.className='badge';badge.textContent='✦ EXTRA FAVORITE';details.append(badge);}if(b.notes){const notes=document.createElement('p');notes.className='notes';notes.textContent=b.notes;details.append(notes);}card.append(cover,details);card.onclick=()=>edit(b);return card;}));const stats=[[books.length,'Books & counting'],[new Set(books.map(b=>b.year)).size,'Years of reading'],[(books.length?books.reduce((s,b)=>s+b.rating,0)/books.length:0).toFixed(1),'Average rating'],[books.filter(b=>b.format==='audio').length,'Audiobooks enjoyed']];$('stats').replaceChildren(...stats.map(([value,label])=>{const el=document.createElement('div');el.className='stat';const n=document.createElement('strong');n.textContent=value;const l=document.createElement('span');l.textContent=label;el.append(n,l);return el;}));}
function edit(b){
 current=b;$('edit-title').textContent=b?.title||'Add a book';
 $('edit-book-title').value=b?.title||'';$('edit-year').value=b?.year||new Date().getFullYear();
 $('edit-format').value=b?.format||'print';$('edit-rating').value=b?.rating||4;
 $('edit-category').value=b?.category||DEFAULT_CATEGORY;$('edit-favorite').checked=b?.favorite||false;$('edit-notes').value=b?.notes||'';
 const readOnly=!!cloud&&!owner;
 for(const id of ['edit-book-title','edit-year','edit-format','edit-rating','edit-category','edit-favorite','edit-notes'])$(id).disabled=readOnly;
 $('save-book').hidden=readOnly;$('delete-book').hidden=!cloud||!owner||!b;
 $('edit-help').textContent=cloud?(owner?'Changes save to the shared library.':'Sign in as the owner to make changes.'):'Demo edits stay in this browser.';
 $('edit-error').textContent='';$('editor').showModal();
}
for(let i=1;i<=5;i+=.5)$('edit-rating').append(new Option(`${i} stars`,i));
for(const id of ['search','year','rating','format','category','sort'])$(id).addEventListener('input',render);
$('favorites').onclick=()=>{onlyFavorites=!onlyFavorites;$('favorites').setAttribute('aria-pressed',onlyFavorites);render();};
$('close').onclick=()=>$('editor').close();$('add-book').onclick=()=>edit(null);
$('edit-form').onsubmit=async e=>{
 e.preventDefault();if(cloud&&!owner)return;
 const book={id:current?.id||crypto.randomUUID(),title:$('edit-book-title').value.trim().replace(/^the\s+/i,''),year:Number($('edit-year').value),format:$('edit-format').value,category:$('edit-category').value,rating:Number($('edit-rating').value),favorite:$('edit-favorite').checked,notes:$('edit-notes').value};
 if(!book.title){$('edit-error').textContent='Enter a book title.';return;}
 $('save-book').disabled=true;$('edit-error').textContent='';
 try{
  if(cloud){const saved=await saveBook(book,!current);books=current?books.map(b=>b.id===saved.id?saved:b):[...books,saved];}
  else {if(!current)throw new Error('Connect shared storage before adding books.');let edits=JSON.parse(localStorage.getItem(key)||'{}');edits[current.id]=book;localStorage.setItem(key,JSON.stringify(edits));Object.assign(current,book);}
  refreshOptions();render();$('editor').close();notice(cloud?'Saved to the shared library.':'Saved in this browser.');
 }catch(error){$('edit-error').textContent=error.message||'Could not save. Please try again.';}finally{$('save-book').disabled=false;}
};
$('delete-book').onclick=async()=>{
 if(!owner||!current||!confirm(`Delete “${current.title}” from the shared library?`))return;
 $('delete-book').disabled=true;
 try{await deleteBook(current.id);books=books.filter(b=>b.id!==current.id);refreshOptions();render();$('editor').close();notice('Book deleted.');}
 catch(error){$('edit-error').textContent=error.message||'Could not delete.';}finally{$('delete-book').disabled=false;}
};
$('export').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(books,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='pams-reading-room-library.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
$('sign-in').onclick=()=>{$('login-error').textContent='';$('reset-request-status').textContent='';$('login').showModal();};
$('close-login').onclick=()=>$('login').close();
$('login-form').onsubmit=async e=>{
 e.preventDefault();$('login-submit').disabled=true;$('login-error').textContent='';
 try{const {error}=await cloud.auth.signInWithPassword({email:$('email').value.trim(),password:$('password').value});if(error)throw error;await updateAccount();$('password').value='';if(!owner){$('login-error').textContent='This account does not have owner access. Ask the project administrator to grant access.';}else{$('login').close();notice('Signed in. You can now add and edit books.');}}
 catch(error){$('login-error').textContent=error.message||'Unable to sign in.';}finally{$('login-submit').disabled=false;}
};
$('sign-out').onclick=async()=>{const {error}=await cloud.auth.signOut();if(error){notice('Unable to sign out. Please try again.');return;}owner=false;await updateAccount();$('editor').close();notice('Signed out.');};
async function updateAccount(){
 owner=await isOwner();const {data:{session}}=await cloud.auth.getSession();
 $('sign-in').hidden=!!session;$('sign-out').hidden=!session;$('add-book').hidden=!owner;
 $('account-status').textContent=owner?'Owner access':session?'Browsing access':'A life in books';
 if(owner&&!categoryMigration){categoryMigration=migrateLegacyCategories().catch(()=>{notice('Categories are displayed, but could not be saved. Refresh while signed in to retry.');});}
 if(categoryMigration)await categoryMigration;
}
async function initialize(){
 try{
  if(cloud){books=await loadBooks();await updateAccount();$('storage-status').textContent='Shared library · changes save across devices.';
   try{if(localStorage.getItem(key))notice('Shared saving is now active. Earlier browser-only edits have not been imported; export them from the old demo if needed.');}catch{}

  }else{
   const response=await fetch('/books.json');if(!response.ok)throw Error('Could not load the demo library.');books=await response.json();
   try{const edits=JSON.parse(localStorage.getItem(key)||'{}');for(const b of books){const e=edits[b.id];if(e&&typeof e.rating==='number'&&e.rating>=1&&e.rating<=5&&Number.isInteger(e.rating*2)){for(const field of ['title','notes','category'])if(typeof e[field]==='string')b[field]=e[field];b.rating=e.rating;b.favorite=!!e.favorite;if(Number.isInteger(e.year))b.year=e.year;if(['print','audio'].includes(e.format))b.format=e.format;}}}catch{}
   $('storage-status').textContent='Demo · edits stay in this browser. Export to keep a backup.';
  }
  books=books.map(normalizeBook);refreshOptions();render();
 }catch(error){notice('The library could not load. '+(error.message||'Please refresh to try again.'));$('count').textContent='Library unavailable';$('storage-status').textContent='Connection unavailable';}
}
const passwordReset=setupPasswordReset(cloud,notice);
if(cloud)cloud.auth.onAuthStateChange(event=>{passwordReset.onAuthEvent(event);setTimeout(()=>updateAccount().catch(()=>{owner=false;$('add-book').hidden=true;notice('Could not verify owner access. Please sign in again.');}),0);});
await initialize();
await passwordReset.resume();
