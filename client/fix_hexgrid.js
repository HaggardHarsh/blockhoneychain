const fs = require('fs');
let c = fs.readFileSync('src/app/page.tsx', 'utf8');
c = c.replace(
    '<HexGrid cols={40} rows={40} />', 
    '<div className="absolute inset-0 z-0 pointer-events-none opacity-30 overflow-hidden"><HexGrid cols={30} rows={30} /></div>'
);
fs.writeFileSync('src/app/page.tsx', c, 'utf8');
console.log('Fixed HexGrid wrapper');
