import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

// Run as many instances of hte bot as all the .env files in the current directory
const runEnvFiles = async () => {
    const currentDir = process.cwd();
    
    // Read all files in the current directory
    const files = fs.readdirSync(currentDir);
    
    // Filter for files starting with '.env'
    const envFiles = files.filter(file => file.startsWith('.env'));
    
    if (envFiles.length === 0) {
        console.log('No .env files found in the current directory.');
        return;
    }
    
    for (const file of envFiles) {
        const env = { ...process.env, ENV_FILE_NAME: file };
        
        const npmProcess = spawn('npm', ['start'], {
            env,
            stdio: ['ignore', 'pipe', 'pipe'],
            detached: true,
            cwd: currentDir
        });
        
        npmProcess.unref();
        
        console.log(`Started Node app with ${file} in the background (PID: ${npmProcess.pid}).`);
        
        // Optionally, you can handle stdout and stderr
        npmProcess.stdout.on('data', (data) => {
            console.log(`[${file}] stdout: ${data}`);
        });
        
        npmProcess.stderr.on('data', (data) => {
            console.error(`[${file}] stderr: ${data}`);
        });
        
        npmProcess.on('close', (code) => {
            console.log(`[${file}] Child process exited with code ${code}`);
        });
    }
};

runEnvFiles().catch(console.error);