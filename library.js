export const sortTitle=title=>title.replace(/^(the|an|a)\s+/i,'');
export function selectBooks(books,{search='',year='',rating='',format='',category='',sort='title',favorites=false}={}){
 const alphabetical=(a,b)=>sortTitle(a.title).localeCompare(sortTitle(b.title))||b.year-a.year;
 return books.filter(b=>(!search||b.title.toLowerCase().includes(search.toLowerCase()))&&(!year||b.year===Number(year))&&(!rating||b.rating===Number(rating))&&(!format||b.format===format)&&(!category||b.category===category)&&(!favorites||b.favorite)).sort((a,b)=>(sort==='rating-desc'?b.rating-a.rating:sort==='rating-asc'?a.rating-b.rating:0)||alphabetical(a,b));
}
