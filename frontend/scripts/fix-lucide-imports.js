#!/usr/bin/env node

/**
 * Script to convert Lucide React imports from named imports to direct ESM imports
 * This enables tree-shaking and reduces bundle size by ~40-50KB
 * 
 * Before: import { ArrowLeft, Settings } from 'lucide-react';
 * After:  import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
 *         import Settings from 'lucide-react/dist/esm/icons/settings';
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Convert PascalCase to kebab-case
function toKebabCase(str) {
    return str
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
        .toLowerCase();
}

// Process a single file
function processFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let newContent = content;

    // Match: import { Icon1, Icon2, ... } from 'lucide-react';
    const importRegex = /import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]lucide-react['"]\s*;/g;

    const matches = [...content.matchAll(importRegex)];

    if (matches.length === 0) {
        return { modified: false, content };
    }

    matches.forEach(match => {
        const iconsString = match[1];
        const icons = iconsString
            .split(',')
            .map(icon => icon.trim())
            .filter(icon => icon.length > 0);

        // Generate individual import statements
        const individualImports = icons
            .map(icon => {
                const kebabName = toKebabCase(icon);
                return `import ${icon} from 'lucide-react/dist/esm/icons/${kebabName}';`;
            })
            .join('\n');

        // Replace the named import with individual imports
        newContent = newContent.replace(match[0], individualImports);
        modified = true;
    });

    return { modified, content: newContent };
}

// Main execution
async function main() {
    console.log('🔍 Scanning for files with Lucide React imports...\n');

    // Find all TypeScript/TSX files
    const files = await glob('**/*.{ts,tsx}', {
        cwd: path.join(__dirname, '..'),
        ignore: ['node_modules/**', '.next/**', 'scripts/**'],
        absolute: true,
    });

    let processedCount = 0;
    let modifiedCount = 0;

    for (const file of files) {
        const { modified, content } = processFile(file);

        if (modified) {
            fs.writeFileSync(file, content, 'utf8');
            modifiedCount++;
            const relativePath = path.relative(path.join(__dirname, '..'), file);
            console.log(`✅ Updated: ${relativePath}`);
        }

        processedCount++;
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Files scanned: ${processedCount}`);
    console.log(`   Files modified: ${modifiedCount}`);
    console.log(`\n✨ Done! Icon imports have been optimized for tree-shaking.`);
}

main().catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
});
