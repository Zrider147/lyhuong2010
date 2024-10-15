const path = require('node:path');
const fs = require('node:fs');
const child_process = require('node:child_process');
const colors = require('picocolors');

const projDir = path.resolve(__dirname, '..', '..', '..');
process.chdir(projDir);

function main() {
    let outputDir = path.resolve('.', 'src', '.d.tmp');
    if (fs.existsSync(outputDir))
        fs.rmSync(outputDir, { recursive:true });
    
    let cmd = `pnpm vue-tsc --emitDeclarationOnly --outDir ${outputDir}`;
    console.log(cmd);
    child_process.execSync(cmd, { shell:'powershell.exe' });
    console.log(colors.green('Declarations generated.'));

    process.chdir('src');
    for (let dirName of ['vbWebEngine', 'vbWebConnector']) {
        let srcDir = path.resolve('.d.tmp', 'src', dirName);
        let docDir = path.resolve('.', `.d.${dirName}`);

        if (!fs.existsSync(srcDir))
            continue;
        if (fs.existsSync(docDir))
            fs.rmSync(docDir, { recursive:true });
        fs.cpSync(srcDir, docDir, { recursive:true });
    }
    fs.rmSync('.d.tmp', { recursive:true });
}

try {
    main();
    console.log(colors.green('Command finished.'));
}
catch (err) {
    console.log(colors.yellow(err.stack ? err.stack : err.message));
}