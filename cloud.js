import {categoryForBook,normalizeBook} from './categories.js';
import {createClient} from '@supabase/supabase-js';
export const cloud=__SUPABASE_URL__&&__SUPABASE_KEY__?createClient(__SUPABASE_URL__,__SUPABASE_KEY__):null;
export async function loadBooks(){
 const {data,error}=await cloud.from('books').select('*').order('id').limit(10000);
 if(error)throw error;
 return data.map(normalizeBook);
}
export async function isOwner(){
 const {data:{session}}=await cloud.auth.getSession();
 if(!session)return false;
 const {data,error}=await cloud.rpc('is_library_owner');
 if(error)throw error;
 return data===true;
}
export async function saveBook(book,isNew){
 const query=isNew?cloud.from('books').insert(book):cloud.from('books').update(book).eq('id',book.id);
 const {data,error}=await query.select().single();
 if(error)throw error;
 return data;
}
export async function deleteBook(id){
 const {data,error}=await cloud.from('books').delete().eq('id',id).select('id');
 if(error)throw error;
 if(data.length!==1)throw new Error('The book was not deleted. Check owner access.');
}

// Owners persist the legacy category changes; visitors can see the same categories immediately.
// The category predicate preserves any category another owner has already edited.
export async function migrateLegacyCategories(){
 const {data,error}=await cloud.from('books').select('id,category').eq('category','To review');
 if(error)throw error;
 for(const book of data){
  const {error}=await cloud.from('books').update({category:categoryForBook(book)}).eq('id',book.id).eq('category','To review');
  if(error)throw error;
 }
}
