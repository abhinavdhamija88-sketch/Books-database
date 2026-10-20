import {build} from 'esbuild';
import {mkdir,copyFile,writeFile} from 'node:fs/promises';
const url=process.env.SUPABASE_URL||'';
const key=process.env.SUPABASE_PUBLISHABLE_KEY||'';
if(Boolean(url)!==Boolean(key))throw new Error('Set both SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY');
if(url&&!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url))throw new Error('SUPABASE_URL must be the HTTPS project URL without a trailing slash');
if(key.startsWith('sb_secret_'))throw new Error('Use a publishable key, never a secret key');
if(key.startsWith('eyJ')){try{const payload=JSON.parse(Buffer.from(key.split('.')[1],'base64url'));if(payload.role!=='anon')throw Error();}catch{throw new Error('Only a publishable or legacy anon key may be exposed to browsers');}}
await mkdir('dist',{recursive:true});
await build({entryPoints:['app.js'],outfile:'dist/app.js',bundle:true,format:'esm',minify:true,define:{__SUPABASE_URL__:JSON.stringify(url),__SUPABASE_KEY__:JSON.stringify(key)}});
for(const name of ['index.html','style.css','books.json'])await copyFile(name,'dist/'+name);
console.log(url?'Built shared library with Supabase':'Built local demo; Supabase is not configured');
