const fs = require('fs');
const path = 'c:/Users/HP/Downloads/blockhoneychain-main/blockhoneychain-main/client/src/app/verify/[batchCode]/page.tsx';
let app = fs.readFileSync(path, 'utf8');
app = app.replace(
  'function TraceSection({ scanActive, onScanComplete }: { scanActive: boolean; onScanComplete: () => void }) {',
  'function TraceSection({ scanActive, onScanComplete, batchCode = "HC-DEMO-123" }: { scanActive: boolean; onScanComplete: () => void; batchCode?: string }) {'
);
app = app.replace('<TraceSection scanActive={scanTriggered} onScanComplete={() => setScanDone(true)} />', '<TraceSection batchCode={batchCode} scanActive={scanTriggered} onScanComplete={() => setScanDone(true)} />');
fs.writeFileSync(path, app, 'utf8');
