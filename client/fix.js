const fs = require('fs');
let app = fs.readFileSync('c:/Users/HP/Downloads/blockhoneychain-main/blockhoneychain-main/client-landing/src/App.tsx', 'utf8');
app = app.replace('export default function App() {', `import '../cinematic.css';\n\nexport default function VerifyPage({ params }: { params: { batchCode: string } }) {\n  const batchCode = params.batchCode;`);
app = "'use client';\n" + app;
app = app.replaceAll('HC-2026-08241', '{batchCode}');
fs.writeFileSync('c:/Users/HP/Downloads/blockhoneychain-main/blockhoneychain-main/client/src/app/verify/[batchCode]/page.tsx', app, 'utf8');
