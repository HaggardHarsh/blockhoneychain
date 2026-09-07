const fs = require('fs');

const sourceFile = 'c:/Users/HP/Downloads/blockhoneychain-main/blockhoneychain-main/client-landing/src/App.tsx';
const targetFile = 'c:/Users/HP/Downloads/blockhoneychain-main/blockhoneychain-main/client/src/app/verify/[batchCode]/page.tsx';

let app = fs.readFileSync(sourceFile, 'utf8');

// Replace App export with VerifyPage
app = app.replace('export default function App() {', `import '../cinematic.css';\n\nexport default function VerifyPage({ params }: { params: { batchCode: string } }) {\n  const batchCode = params.batchCode;`);
app = "'use client';\n" + app;

// Fix batchCode references
app = app.replaceAll('HC-2026-08241', '{batchCode}');

// Fix TraceSection signature to pass batchCode safely
app = app.replace(
  'function TraceSection({ scanActive, onScanComplete }: { scanActive: boolean; onScanComplete: () => void }) {',
  'function TraceSection({ scanActive, onScanComplete, batchCode = "HC-DEMO-123" }: { scanActive: boolean; onScanComplete: () => void; batchCode?: string }) {'
);

app = app.replace(
  '<TraceSection scanActive={scanTriggered} onScanComplete={() => setScanDone(true)} />', 
  '<TraceSection batchCode={batchCode} scanActive={scanTriggered} onScanComplete={() => setScanDone(true)} />'
);

fs.writeFileSync(targetFile, app, 'utf8');
console.log('Restored verify page from pristine source');
