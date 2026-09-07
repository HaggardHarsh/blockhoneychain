const fs = require('fs');
let app = fs.readFileSync('c:/Users/HP/Downloads/blockhoneychain-main/blockhoneychain-main/client-landing/src/App.tsx', 'utf8');
app = app.replace('export default function App() {', `import './verify/cinematic.css';\n\nexport default function Home() {`);
app = "'use client';\n" + app;
fs.writeFileSync('c:/Users/HP/Downloads/blockhoneychain-main/blockhoneychain-main/client/src/app/page.tsx', app, 'utf8');
