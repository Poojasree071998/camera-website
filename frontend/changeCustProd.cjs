const fs = require('fs');
const path = require('path');
const dir = 'd:/Antigraviity/camera website/frontend/src/pages';
const files = fs.readdirSync(dir).filter(f => f.startsWith('Customer') && f.endsWith('.jsx'));

files.forEach(f => {
    const fp = path.join(dir, f);
    let c = fs.readFileSync(fp, 'utf8');
    
    const restored = c.replace(
        /\{\s*label:\s*'Add Product',\s*path:\s*'\/vendor\/add-product',\s*icon:\s*'➕'\s*\}/g,
        "{ label: 'Products', path: '/', icon: '📸' }"
    );
    
    if (c !== restored) {
        fs.writeFileSync(fp, restored);
        console.log('Fixed ' + f);
    }
});
