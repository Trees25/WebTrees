const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src/components');
const filesToProcess = [
  'AdminProyectos.jsx',
  'AdminPersonal.jsx',
  'AdminBalance.jsx',
  'Resumen.jsx',
  'Presupuesto.jsx',
  'Recibo.jsx',
  'Catalogo.jsx',
  'Perfiles.jsx',
  'Clientes.jsx',
  'ClientesPosventa.jsx'
];

const replacements = [
  [/bg-slate-50\b(?! dark:)/g, 'bg-slate-50 dark:bg-slate-950'],
  [/text-slate-900\b(?! dark:)/g, 'text-slate-900 dark:text-slate-100'],
  [/bg-white\b(?! dark:)/g, 'bg-white dark:bg-slate-900'],
  [/border-slate-200\b(?! dark:)/g, 'border-slate-200 dark:border-slate-800'],
  [/border-slate-100\b(?! dark:)/g, 'border-slate-100 dark:border-slate-800'],
  [/text-slate-800\b(?! dark:)/g, 'text-slate-800 dark:text-slate-100'],
  [/text-slate-500\b(?! dark:)/g, 'text-slate-500 dark:text-slate-400'],
  [/text-slate-600\b(?! dark:)/g, 'text-slate-600 dark:text-slate-300'],
  [/text-slate-700\b(?! dark:)/g, 'text-slate-700 dark:text-slate-200'],
  [/bg-slate-100\b(?! dark:)/g, 'bg-slate-100 dark:bg-slate-800'],
  [/hover:bg-slate-50\b(?! dark:)/g, 'hover:bg-slate-50 dark:hover:bg-slate-800'],
  [/hover:bg-slate-100\b(?! dark:)/g, 'hover:bg-slate-100 dark:hover:bg-slate-800'],
  [/divide-slate-100\b(?! dark:)/g, 'divide-slate-100 dark:divide-slate-800'],
  [/divide-slate-200\b(?! dark:)/g, 'divide-slate-200 dark:divide-slate-800'],
  // Table rows
  [/even:bg-slate-50\b(?! dark:)/g, 'even:bg-slate-50 dark:even:bg-slate-800/50'],
  // Modals / Overlay
  [/bg-black\/50\b(?! dark:)/g, 'bg-black/50 dark:bg-black/70'],
  // Inputs
  [/bg-white dark:bg-slate-900\b/g, 'bg-white dark:bg-slate-900'], // Just to avoid double replacement if applied
];

filesToProcess.forEach(file => {
  const filePath = path.join(dir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    replacements.forEach(([regex, replacement]) => {
      content = content.replace(regex, replacement);
    });
    // Add transition-colors to the main wrapper if not present
    if (content.includes('min-h-screen') && !content.includes('transition-colors')) {
      content = content.replace('min-h-screen bg-slate-50 dark:bg-slate-950 pb-12 text-slate-900 dark:text-slate-100', 'min-h-screen bg-slate-50 dark:bg-slate-950 pb-12 text-slate-900 dark:text-slate-100 transition-colors');
    }
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Processed ${file}`);
  } else {
    console.log(`File not found: ${file}`);
  }
});
