const fs = require('fs');
const path = require('path');

const dir = 'd:/Antigraviity/camera website/frontend/src/pages';
const files = fs.readdirSync(dir).filter(f => f.startsWith('Customer') && f.endsWith('.jsx'));

const targetStr = "{ label: 'My Orders', path: '/customer/orders', icon: '🛒' }";
const dashboardStr = "{ label: 'Dashboard', path: '/customer', icon: '📊' }";

for (const file of files) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    if (content.includes(targetStr) && !content.includes(dashboardStr)) {
        content = content.replace(targetStr, `${dashboardStr},\n        ${targetStr}`);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${file}`);
    }
}
