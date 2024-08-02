const fs = require('fs').promises;
const path = require('path');

async function findPerformanceFolders(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries
        .filter(entry => entry.isDirectory() && entry.name.includes('performance'))
        .map(entry => path.join(dir, entry.name));
}

async function findJsonFiles(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries
        .filter(entry => entry.isFile() && path.extname(entry.name) === '.json')
        .map(entry => path.join(dir, entry.name));
}

async function readJsonFile(filePath) {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
}

async function analyzePerformanceLogs() {
    const logDir = './log';
    const performanceFolders = await findPerformanceFolders(logDir);
    let allObjects = [];

    for (const folder of performanceFolders) {
        const jsonFiles = await findJsonFiles(folder);
        for (const file of jsonFiles) {
            const obj = await readJsonFile(file);
            allObjects.push(obj);
        }
    }

    // Sort objects by guessRatio in descending order and get top 5
    const topFive = allObjects
        .sort((a, b) => b.guessRatio - a.guessRatio)
        .slice(0, 5);

    // Create winners folder if it doesn't exist
    const winnersDir = path.join(logDir, 'winners');
    await fs.mkdir(winnersDir, { recursive: true });

    // Generate filename with current date and time
    const now = new Date();
    const fileName = `winners-${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getFullYear()}:${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.json`;

    // Save top five objects to the new file
    await fs.writeFile(path.join(winnersDir, fileName), JSON.stringify(topFive, null, 2));

    console.log(`Analysis complete. Results saved to ${path.join(winnersDir, fileName)}`);
}

analyzePerformanceLogs().catch(console.error);