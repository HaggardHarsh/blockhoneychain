const fs = require('fs');

// Read from the PRISTINE source file
const sourceFile = 'c:/Users/HP/Downloads/blockhoneychain-main/blockhoneychain-main/client-landing/src/App.tsx';
const targetFile = 'c:/Users/HP/Downloads/blockhoneychain-main/blockhoneychain-main/client/src/app/page.tsx';

let app = fs.readFileSync(sourceFile, 'utf8');

// Replace App export with Home
app = app.replace('export default function App() {', `import './verify/cinematic.css';\n\nexport default function Home() {`);
app = "'use client';\n" + app;

// Replace the Nav component completely to fix the links cleanly
app = app.replace(
  /function Nav\(\{ onScan \}: \{ onScan: \(\) => void \}\) \{[\s\S]*?<\/nav>\n  \);\n}/,
  `function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 transition-all duration-400"
      style={{
        background: scrolled ? "rgba(255,251,240,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        boxShadow: scrolled ? "0 2px 24px rgba(244,166,34,0.12)" : "none",
        borderBottom: scrolled ? "1.5px solid rgba(244,166,34,0.15)" : "none",
      }}
    >
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg,#FFD04B,#F4A622)" }}>
          <span style={{ fontSize: 18 }}>🐝</span>
        </div>
        <span className="font-display text-2xl" style={{ color: "#5C3A0A" }}>Honey Chain</span>
      </div>

      <div className="hidden md:flex items-center gap-7">
        <a href="/auth/login" className="font-body font-600 text-sm transition-colors duration-200 hover:text-[#E8960A]" style={{ color: "#8B5E2A" }}>Login to Dashboard</a>
      </div>

      <a href="/scan" className="btn-primary text-base px-6 py-3">🐝 Scan QR</a>
    </nav>
  );
}`
);

// Fix the Hero buttons
app = app.replace(
  /<button className="btn-primary" onClick=\{onTrace\}>🍯 Trace Your Honey<\/button>/,
  '<a href="/scan" className="btn-primary flex items-center justify-center">🍯 Scan Your Honey</a>'
);
app = app.replace(
  /<button className="btn-outline">🌍 Explore the Ecosystem<\/button>/,
  '<a href="/auth/login" className="btn-outline flex items-center justify-center">🌍 Login to Dashboard</a>'
);

// Keep only the Hero section, drop the other sections to make it a "small page"
app = app.replace(
  /return \(\n    <div className="font-body bg-\[\#FFFBF0\] overflow-x-hidden relative text-\[\#5C3A0A\]">[\s\S]*?<\/div>\n  \);/,
  `return (
    <div className="font-body bg-[#FFFBF0] overflow-x-hidden relative text-[#5C3A0A] min-h-screen flex flex-col">
      <ScrollBee />
      <HexGrid />
      <div className="absolute top-20 -left-32 w-[600px] h-[600px] bg-[#FFD04B] rounded-full blur-[140px] opacity-20 pointer-events-none" />
      <div className="absolute top-96 -right-40 w-[800px] h-[800px] bg-[#F4A622] rounded-full blur-[160px] opacity-10 pointer-events-none" style={{ animation: "float-blob 20s ease-in-out infinite" }} />
      <Nav />
      <div className="flex-1">
        <Hero onTrace={() => {}} />
      </div>
      <Footer />
    </div>
  );`
);

// Save safely as UTF-8
fs.writeFileSync(targetFile, app, 'utf8');
console.log('Restored page.tsx from pristine source');
