const fs = require('fs');
const path = require('path');

const dir = 'd:/Antigraviity/camera website/frontend/src/pages';
const files = fs.readdirSync(dir).filter(f => f.startsWith('Customer') && f.endsWith('.jsx'));

const targetStr = "{ label: 'Dashboard', path: '/customer', icon: '📊' }";
const dashboardStr = "{ label: 'Dashboard', path: '/customer', icon: '📊 ' }"; // Added space to match the others

for (const file of files) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    if (content.includes(targetStr)) {
        content = content.replace(targetStr, dashboardStr);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed ${file}`);
    }
}
