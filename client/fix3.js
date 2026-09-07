const fs = require('fs');
const path = 'c:/Users/HP/Downloads/blockhoneychain-main/blockhoneychain-main/client/src/app/verify/[batchCode]/page.tsx';
let app = fs.readFileSync(path, 'utf8');
app = app.replace(
  'function TraceSection({ onScanComplete }: { onScanComplete: () => void }) {',
  'function TraceSection({ onScanComplete, batchCode = "HC-DEMO-123" }: { onScanComplete: () => void, batchCode?: string }) {'
);
app = app.replace('<TraceSection onScanComplete={', '<TraceSection batchCode={batchCode} onScanComplete={');
fs.writeFileSync(path, app, 'utf8');
