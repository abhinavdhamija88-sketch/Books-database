// Browser/API integration checks use simulated Supabase responses, never a live database.
import {chromium} from 'playwright-core';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {spawn,spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../',import.meta.url));
const env={...process.env,SUPABASE_URL:'',SUPABASE_PUBLISHABLE_KEY:''};
const runBuild=cloud=>{
 const result=spawnSync(process.execPath,['build.mjs'],{cwd:root,env:cloud?{...env,SUPABASE_URL:'https://kids-preview.supabase.co',SUPABASE_PUBLISHABLE_KEY:'sb_publishable_browser_test'}:env,encoding:'utf8'});
 assert.equal(result.status,0,result.stderr);
};
const port=33000+Math.floor(Math.random()*10000),base=`http://localhost:${port}`;
let server,browser;
try{
 runBuild(false);
 server=spawn(process.execPath,['server.mjs'],{cwd:root,env:{...env,PORT:String(port)},stdio:'ignore'});
 for(let i=0;i<50;i++){try{if((await fetch(base)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 const errors=[];
 const demo=await browser.newPage();demo.on('pageerror',e=>errors.push(e.message));
 await demo.goto(base);await demo.waitForSelector('#books .book');assert.equal(await demo.locator('#books .book').count(),156);
 await demo.click('#kids-tab');await demo.waitForSelector('#kids-grid .book');assert.equal(await demo.locator('#kids-grid .book').count(),67);
 assert.equal(await demo.locator('#stats').isVisible(),false);assert.equal(await demo.locator('#kids-add').isVisible(),false);
 await demo.fill('#kids-search','honeybee');await demo.locator('#kids-grid .book').click();assert.equal(await demo.locator('#kids-author').inputValue(),'');assert.equal(await demo.locator('#kids-save').isVisible(),false);await demo.click('#kids-close');
 await demo.click('#library-tab');assert.equal(await demo.locator('#books .book').count(),156);await demo.close();
 runBuild(true);
 const original=JSON.parse(await readFile(root+'kids-books.json','utf8'));
 let records=structuredClone(original),allowOwner=true,failKids=false,failSave=false;
 const adult=JSON.parse(await readFile(root+'books.json','utf8'));
 const user={id:'00000000-0000-4000-8000-000000000001',aud:'authenticated',role:'authenticated',email:'pam@example.test',created_at:new Date().toISOString()};
 async function context(){
  const ctx=await browser.newContext();
  await ctx.route('https://kids-preview.supabase.co/**',async route=>{
   const req=route.request(),url=new URL(req.url());let body,status=200;
   if(url.pathname==='/auth/v1/token')body={access_token:'mock-token',refresh_token:'mock-refresh',expires_in:3600,token_type:'bearer',user};
   else if(url.pathname==='/auth/v1/user')body=user;
   else if(url.pathname==='/auth/v1/logout')body={};
   else if(url.pathname.endsWith('/rpc/is_library_owner'))body=allowOwner;
   else if(url.pathname==='/rest/v1/books')body=url.searchParams.get('category')?[]:adult;
   else if(url.pathname==='/rest/v1/kids_books'){
    const id=url.searchParams.get('id')?.slice(3);
    if(failKids){status=404;body={code:'PGRST205',message:'Table not found'};}
    else if(failSave&&req.method()!=='GET'){status=503;body={message:'Temporary save failure'};}
    else if(req.method()==='POST'){body=req.postDataJSON();records.push(body);}
    else if(req.method()==='PATCH'){const update=req.postDataJSON();records=records.map(b=>b.id===id?{...b,...update}:b);body=records.find(b=>b.id===id);}
    else if(req.method()==='DELETE'){records=records.filter(b=>b.id!==id);body=[{id}];}
    else body=records;
   }else throw Error('Unexpected endpoint '+url.pathname);
   await route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
  });return ctx;
 }
 const ctx=await context(),page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/?shelf=kids');await page.waitForSelector('#kids-grid .book');
 assert.equal(await page.locator('#kids-tab').getAttribute('aria-selected'),'true');
 await page.fill('#kids-search','david shannon');assert.equal(await page.locator('#kids-grid .book').count(),3);
 await page.locator('#kids-grid .book').first().click();assert.equal(await page.locator('#kids-title').isDisabled(),true);assert.equal(await page.locator('#kids-save').isVisible(),false);await page.click('#kids-close');
 await page.click('#sign-in');await page.fill('#email','pam@example.test');await page.fill('#password','not-a-real-password');await page.click('#login-submit');await page.waitForSelector('#login',{state:'hidden'});await page.waitForSelector('#kids-add:visible');
 await page.click('#kids-add');await page.fill('#kids-title','snowy day');await page.click('#kids-save');assert.equal(await page.locator('#kids-duplicate').isVisible(),true);assert.match(await page.locator('#kids-error').innerText(),/already listed/);assert.equal(records.length,67);
 await page.fill('#kids-title','A New Kids Book');await page.fill('#kids-author','Fresh Author');await page.fill('#kids-illustrator','An Illustrator');await page.fill('#kids-url','https://www.amazon.com/dp/0593465210');failSave=true;await page.click('#kids-save');await page.waitForFunction(()=>document.querySelector('#kids-error').textContent.includes('Temporary save failure'));assert.equal(records.length,67);
 failSave=false;await page.click('#kids-save');await page.waitForSelector('#kids-editor',{state:'hidden'});assert.equal(records.length,68);
 const created=records.find(b=>b.title==='A New Kids Book');created.recipients=['Future grandchild'];
 await page.reload();await page.waitForSelector('#kids-grid .book');await page.fill('#kids-search','fresh author');assert.equal(await page.locator('#kids-grid .book').count(),1);
 await page.locator('#kids-grid .book').click();assert.equal(await page.locator('#kids-product-link').getAttribute('href'),'https://www.amazon.com/dp/0593465210');await page.fill('#kids-notes','Birthday gift');await page.click('#kids-save');await page.waitForSelector('#kids-editor',{state:'hidden'});assert.deepEqual(records.find(b=>b.id===created.id).recipients,['Future grandchild']);
 const visitor=await context(),view=await visitor.newPage();await view.goto(base+'/?shelf=kids');await view.waitForSelector('#kids-grid .book');await view.fill('#kids-search','A New Kids Book');assert.equal(await view.locator('#kids-grid .book').count(),1);assert.equal(await view.locator('#kids-add').isVisible(),false);
 await page.locator('#kids-grid .book').click();page.once('dialog',d=>d.accept());await page.click('#kids-delete');await page.waitForSelector('#kids-editor',{state:'hidden'});assert.equal(records.length,67);
 await page.fill('#kids-search','nothing matches xyz');assert.equal(await page.locator('#kids-empty').isVisible(),true);await page.fill('#kids-search','');
 await page.click('#library-tab');await page.selectOption('#rating','4');assert.ok((await page.locator('#books .rating-number').allTextContents()).every(x=>Number(x)===4));assert.equal(adult.length,156);
 await page.focus('#library-tab');await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#kids-tab').getAttribute('aria-selected'),'true');
 await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:'/tmp/pams-kids-mobile.png',fullPage:false});
 await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:'/tmp/pams-kids-desktop.png',fullPage:false});
 await page.click('#sign-out');await page.waitForSelector('#sign-in:visible');assert.equal(await page.locator('#kids-add').isVisible(),false);
 failKids=true;const brokenCtx=await context(),broken=await brokenCtx.newPage();await broken.goto(base+'/?shelf=kids');await broken.waitForSelector('#kids-retry:visible');assert.equal(await broken.locator('#kids-add').isVisible(),false);await broken.click('#library-tab');await broken.waitForSelector('#books .book');assert.equal(await broken.locator('#books .book').count(),156);failKids=false;await broken.click('#kids-tab');await broken.waitForSelector('#kids-grid .book');assert.equal(await broken.locator('#kids-grid .book').count(),67);
 allowOwner=false;const otherCtx=await context(),other=await otherCtx.newPage();await other.goto(base+'/?shelf=kids');await other.waitForSelector('#kids-grid .book');await other.click('#sign-in');await other.fill('#email','visitor@example.test');await other.fill('#password','not-a-real-password');await other.click('#login-submit');await other.waitForFunction(()=>document.querySelector('#login-error').textContent.includes('does not have owner'));assert.equal(await other.locator('#kids-add').isVisible(),false);
 assert.deepEqual(errors,[]);
 console.log('PASS: demo and shared kids tab, 67 imports, pending author, readonly visitors/nonowners, owner CRUD, duplicate warning, save failure, cross-browser data, future recipients preserved, adult regression, keyboard tabs, phone width, missing-table retry. Supabase responses were simulated.');
}finally{
 if(browser)await browser.close();if(server)server.kill();runBuild(false);
}
