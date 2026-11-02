import {cloud,loadKidsBooks,saveKidsBook,deleteKidsBook} from './cloud.js';
import {selectKidsBooks,duplicateKidsBooks,safeBookUrl,validateKidsBook} from './kids-library.js';

export function setupKidsBooks({getOwner,notice}){
 const $=id=>document.getElementById(id);
 let books=[],loaded=false,loading=null,current=null,saving=false;
 function updateOwner(){
  $('kids-add').hidden=!cloud||!getOwner()||!loaded;
  if($('kids-editor').open&&!getOwner())$('kids-editor').close();
 }
 function render(){
  const selected=selectKidsBooks(books,$('kids-search').value);
  $('kids-count').textContent=`${selected.length} of ${books.length} books ordered`;
  $('kids-empty').hidden=!loaded||selected.length>0;
  $('kids-export').disabled=!loaded;
  $('kids-grid').replaceChildren(...selected.map(book=>{
   const card=document.createElement('button');card.className='book kids-book';
   card.setAttribute('aria-label',`${getOwner()?'Edit':'View'} ${book.title}`);
   const colors=[['#e5e8db','#63705c'],['#eee2d4','#a36f52'],['#dde6e8','#4b707b'],['#e9dfdf','#8b5d68'],['#e7e3d3','#8c7b4e']];
   const color=colors[[...book.id].reduce((sum,c)=>sum+c.charCodeAt(0),0)%colors.length];
   card.style.setProperty('--cover',color[0]);card.style.setProperty('--jacket',color[1]);
   const cover=document.createElement('div');cover.className='cover';
   const mini=document.createElement('span');mini.className='mini';const label=document.createElement('span');label.textContent=book.title;mini.append(label);cover.append(mini);
   const details=document.createElement('div');details.className='details';
   const meta=document.createElement('span');meta.className='eyebrow';meta.textContent='ON THE LITTLE BOOKSHELF';
   const title=document.createElement('h3');title.textContent=book.title;
   const author=document.createElement('p');author.className='kids-author';author.textContent=book.author||'Author details pending';
   details.append(meta,title,author);
   if(book.notes){const notes=document.createElement('p');notes.className='notes';notes.textContent=book.notes;details.append(notes);}
   card.append(cover,details);card.onclick=()=>edit(book);return card;
  }));
  updateOwner();
 }
 function showDuplicates(){
  const duplicates=duplicateKidsBooks(books,$('kids-title').value,current?.id);
  $('kids-duplicate').hidden=duplicates.length===0;
  $('kids-duplicate-text').textContent=duplicates.length?`Already listed: ${duplicates.map(b=>b.title).join(', ')}.`:'';
  return duplicates;
 }
 function edit(book){
  current=book;const readOnly=!cloud||!getOwner();
  $('kids-editor-heading').textContent=book?.title||'Add a kids’ book';
  $('kids-title').value=book?.title||'';$('kids-author').value=book?.author||'';
  $('kids-illustrator').value=book?.illustrator||'';$('kids-notes').value=book?.notes||'';$('kids-url').value=book?.amazon_url||'';
  for(const id of ['kids-title','kids-author','kids-illustrator','kids-notes','kids-url'])$(id).disabled=readOnly;
  $('kids-save').hidden=readOnly;$('kids-delete').hidden=readOnly||!book;
  $('kids-help').textContent=cloud?(getOwner()?'Save books you’ve ordered. Changes are shared across devices.':'Sign in as the owner to add or edit books.'):'Preview collection. Shared editing requires Supabase setup.';
  $('kids-error').textContent='';$('kids-allow-duplicate').checked=false;showDuplicates();
  const url=safeBookUrl(book?.amazon_url);
  $('kids-product-link').hidden=!url;
  if(url)$('kids-product-link').href=url;else $('kids-product-link').removeAttribute('href');
  $('kids-editor').showModal();
 }
 async function load(){
  if(loaded)return;
  if(loading)return loading;
  $('kids-load-status').hidden=false;$('kids-load-status').textContent='Loading the little bookshelf…';$('kids-retry').hidden=true;
  loading=(async()=>{
   try{
    if(cloud)books=await loadKidsBooks();
    else {const response=await fetch('/kids-books.json');if(!response.ok)throw Error();books=await response.json();}
    loaded=true;$('kids-load-status').hidden=true;render();
   }catch{
    $('kids-load-status').textContent='The kids’ bookshelf could not load. Please retry. If this section was just added, its database setup may still need to be completed.';
    $('kids-count').textContent='Books temporarily unavailable';$('kids-retry').hidden=false;
   }finally{loading=null;}
  })();return loading;
 }
 $('kids-search').addEventListener('input',render);
 $('kids-retry').onclick=load;
 $('kids-add').onclick=()=>{if(getOwner()&&loaded)edit(null);};
 $('kids-close').onclick=()=>$('kids-editor').close();
 $('kids-title').addEventListener('input',()=>{$('kids-allow-duplicate').checked=false;showDuplicates();});
 $('kids-form').onsubmit=async event=>{
  event.preventDefault();if(!cloud||!getOwner()||saving)return;
  const book={id:current?.id||crypto.randomUUID(),title:$('kids-title').value.trim(),author:$('kids-author').value.trim(),illustrator:$('kids-illustrator').value.trim(),notes:$('kids-notes').value.trim(),amazon_url:$('kids-url').value.trim(),recipients:current?.recipients||[]};
  const error=validateKidsBook(book);if(error){$('kids-error').textContent=error;return;}
  if(showDuplicates().length&&!$('kids-allow-duplicate').checked){$('kids-error').textContent='This title is already listed. Confirm another copy below, or change the title.';return;}
  saving=true;$('kids-save').disabled=true;$('kids-delete').disabled=true;$('kids-close').disabled=true;$('kids-error').textContent='';
  try{
   const saved=await saveKidsBook(book,!current);
   books=current?books.map(b=>b.id===saved.id?saved:b):[...books,saved];
   $('kids-editor').close();render();notice('Kids’ book saved to the shared library.');
  }catch(error){$('kids-error').textContent=error.message||'Could not save. Please try again.';}
  finally{saving=false;$('kids-save').disabled=false;$('kids-delete').disabled=false;$('kids-close').disabled=false;}
 };
 $('kids-delete').onclick=async()=>{
  if(!cloud||!getOwner()||!current||saving||!confirm(`Delete “${current.title}” from the kids’ bookshelf?`))return;
  saving=true;$('kids-delete').disabled=true;$('kids-save').disabled=true;$('kids-close').disabled=true;
  try{await deleteKidsBook(current.id);books=books.filter(b=>b.id!==current.id);$('kids-editor').close();render();notice('Kids’ book deleted.');}
  catch(error){$('kids-error').textContent=error.message||'Could not delete. Please try again.';}
  finally{saving=false;$('kids-delete').disabled=false;$('kids-save').disabled=false;$('kids-close').disabled=false;}
 };
 $('kids-export').onclick=()=>{
  if(!loaded)return;
  const url=URL.createObjectURL(new Blob([JSON.stringify(books,null,2)],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download='pams-kids-books.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 const tabs=[$('library-tab'),$('kids-tab')];
 function activate(kids,updateUrl=true){
  for(const [index,tab] of tabs.entries()){const selected=index===(kids?1:0);tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;}
  $('library-panel').hidden=kids;$('kids-panel').hidden=!kids;
  if(updateUrl){const url=new URL(location.href);if(kids)url.searchParams.set('shelf','kids');else url.searchParams.delete('shelf');history.replaceState(null,'',url.pathname+url.search+url.hash);}
  if(kids)load();
 }
 tabs.forEach((tab,index)=>{tab.onclick=()=>activate(index===1);tab.onkeydown=event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?1:1-index;tabs[next].focus();activate(next===1);};});
 activate(new URL(location.href).searchParams.get('shelf')==='kids',false);
 return {updateOwner,closeEditor(){if($('kids-editor').open)$('kids-editor').close();}};
}
