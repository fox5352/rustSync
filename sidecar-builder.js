import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

console.log("building app");

execSync("npm run build:server");

const ext = process.platform == "win32" ? ".exe" : "";

const rustInfo = execSync('rustc -vV');
const targetTriple = /host: (\S+)/g.exec(rustInfo)[1];


if (!targetTriple) {
    console.error("failed to determine platform target triple");
}

const distPath = path.join("./", "server", "dist");

const distFiles = fs.readdirSync(distPath);

const currentOs = os.platform();

let pattern = '';

if (currentOs == "win32") {
    pattern = "win"
} else {
    pattern = currentOs;
}

const binariesFileName = distFiles.filter(file => file.includes(pattern))[0]


const binariesDir = path.join("./", "src-tauri", "binaries");

console.log(`checking for binaries`);

// Check and create directory if it doesn't exist
try {
    if (!fs.existsSync(binariesDir)) {
        fs.mkdirSync(binariesDir, { recursive: true });
        console.log(`Created directory: ${binariesDir}`);
    } else {
        console.log(`Directory already exists: ${binariesDir}`);
    }
} catch (err) {
    console.error(`Error creating directory: ${err}`);
}

console.log(`copying server binary to binaries directory`);

fs.copyFileSync(
    path.join("./", "server", "dist", binariesFileName),
    path.join(binariesDir, `server-${targetTriple}${ext}`)
);
