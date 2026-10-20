import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('.',import.meta.url));
const types={html:'text/html',css:'text/css',js:'text/javascript',json:'application/json'};
http.createServer(async(req,res)=>{try{const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(!['/','/index.html','/style.css','/app.js','/library.js','/books.json'].includes(path)){res.writeHead(404);return res.end('Not found');}const file=path==='/'?'index.html':path.slice(1);res.setHeader('Content-Type',types[file.split('.').pop()]+'; charset=utf-8');res.end(await readFile(root+file));}catch{res.writeHead(500);res.end('Unable to load library');}}).listen(process.env.PORT||3000,'0.0.0.0',()=>console.log('Reading Room listening on port '+(process.env.PORT||3000)));
