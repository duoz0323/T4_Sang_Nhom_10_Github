import { mkdir } from 'fs/promises';
import { join } from 'path';

const dirs = [
  'src/features/home/pages',
  'src/features/home/components',
];

async function createDirs() {
  for (const dir of dirs) {
    try {
      await mkdir(dir, { recursive: true });
      console.log(`✓ Created: ${dir}`);
    } catch (error) {
      console.error(`✗ Error creating ${dir}:`, error.message);
    }
  }
  console.log('\n✅ All directories created!');
}

createDirs();
