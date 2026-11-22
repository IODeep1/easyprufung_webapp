const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
if(fs.existsSync(path.join(root,'shared/legal/operator.json')))require(path.join(root,'scripts/sync-legal.cjs'));
else console.log('Using bundled legal content for standalone deployment.');
