const fs = require('fs');
const path = require('path');
const dir = 'd:/Antigraviity/camera website/frontend/src/pages';
const files = fs.readdirSync(dir).filter(f => f.startsWith('Customer') && f.endsWith('.jsx'));

files.forEach(f => {
    const fp = path.join(dir, f);
    let c = fs.readFileSync(fp, 'utf8');
    if (c.includes('Compare Cameras') && !c.includes('Add Product')) {
        const result = c.replace(
            /\{\s*label:\s*'Compare Cameras',\s*path:\s*'\/customer\/compare',\s*icon:\s*'[^']+'\s*\},/,
            "$& \n        { label: 'Add Product', path: '/vendor/add-product', icon: '➕' },"
        );
        fs.writeFileSync(fp, result);
        console.log('Updated ' + f);
    }
});
