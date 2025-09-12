/**
 * Asset Standardization Script
 * Standardizes file naming and organization
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ASSETS_DIR = path.join(__dirname, '../assets');

class AssetStandardizer {
  constructor() {
    this.processedCount = 0;
    this.totalCount = 0;
  }

  async standardizeAssets() {
    console.log('🚀 Starting asset standardization...');
    
    try {
      // Standardize image files
      await this.standardizeImages();
      
      // Standardize font files
      await this.standardizeFonts();
      
      // Generate asset manifest
      await this.generateAssetManifest();
      
      console.log(`✅ Standardization complete! Processed ${this.processedCount} assets`);
      
    } catch (error) {
      console.error('❌ Standardization failed:', error);
      process.exit(1);
    }
  }

  async standardizeImages() {
    const imagesDir = path.join(ASSETS_DIR, 'images');
    const imageFiles = await this.findImageFiles(imagesDir);
    this.totalCount += imageFiles.length;
    
    console.log(`📁 Found ${imageFiles.length} images to standardize`);
    
    for (const file of imageFiles) {
      await this.standardizeImageFile(file);
    }
  }

  async standardizeFonts() {
    const fontsDir = path.join(ASSETS_DIR, 'fonts');
    const fontFiles = await this.findFontFiles(fontsDir);
    this.totalCount += fontFiles.length;
    
    console.log(`📁 Found ${fontFiles.length} fonts to standardize`);
    
    for (const file of fontFiles) {
      await this.standardizeFontFile(file);
    }
  }

  async findImageFiles(dir) {
    const files = [];
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          const subFiles = await this.findImageFiles(fullPath);
          files.push(...subFiles);
        } else if (this.isImageFile(entry.name)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.warn(`⚠️  Could not read directory ${dir}:`, error.message);
    }
    
    return files;
  }

  async findFontFiles(dir) {
    const files = [];
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          const subFiles = await this.findFontFiles(fullPath);
          files.push(...subFiles);
        } else if (this.isFontFile(entry.name)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.warn(`⚠️  Could not read directory ${dir}:`, error.message);
    }
    
    return files;
  }

  isImageFile(filename) {
    const ext = path.extname(filename).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif'].includes(ext);
  }

  isFontFile(filename) {
    const ext = path.extname(filename).toLowerCase();
    return ['.otf', '.ttf', '.woff', '.woff2', '.eot'].includes(ext);
  }

  async standardizeImageFile(filePath) {
    try {
      const dir = path.dirname(filePath);
      const filename = path.basename(filePath);
      const ext = path.extname(filename);
      const name = path.basename(filename, ext);
      
      // Standardize filename
      const standardizedName = this.standardizeImageName(name);
      const newFilename = `${standardizedName}${ext}`;
      const newPath = path.join(dir, newFilename);
      
      // Only rename if different
      if (filename !== newFilename) {
        await fs.rename(filePath, newPath);
        console.log(`📸 Renamed: ${filename} → ${newFilename}`);
      }
      
      this.processedCount++;
      
    } catch (error) {
      console.error(`❌ Failed to standardize ${filePath}:`, error.message);
    }
  }

  async standardizeFontFile(filePath) {
    try {
      const dir = path.dirname(filePath);
      const filename = path.basename(filePath);
      const ext = path.extname(filename);
      const name = path.basename(filename, ext);
      
      // Standardize filename
      const standardizedName = this.standardizeFontName(name);
      const newFilename = `${standardizedName}${ext}`;
      const newPath = path.join(dir, newFilename);
      
      // Only rename if different
      if (filename !== newFilename) {
        await fs.rename(filePath, newPath);
        console.log(`🔤 Renamed: ${filename} → ${newFilename}`);
      }
      
      this.processedCount++;
      
    } catch (error) {
      console.error(`❌ Failed to standardize ${filePath}:`, error.message);
    }
  }

  standardizeImageName(name) {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  standardizeFontName(name) {
    return name
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  async generateAssetManifest() {
    const manifest = {
      version: '1.0.0',
      generated: new Date().toISOString(),
      assets: {
        images: [],
        fonts: []
      }
    };
    
    // Collect image assets
    const imageFiles = await this.findImageFiles(path.join(ASSETS_DIR, 'images'));
    for (const file of imageFiles) {
      const relativePath = path.relative(ASSETS_DIR, file);
      const stats = await fs.stat(file);
      
      manifest.assets.images.push({
        path: relativePath,
        size: stats.size,
        modified: stats.mtime.toISOString()
      });
    }
    
    // Collect font assets
    const fontFiles = await this.findFontFiles(path.join(ASSETS_DIR, 'fonts'));
    for (const file of fontFiles) {
      const relativePath = path.relative(ASSETS_DIR, file);
      const stats = await fs.stat(file);
      
      manifest.assets.fonts.push({
        path: relativePath,
        size: stats.size,
        modified: stats.mtime.toISOString()
      });
    }
    
    const manifestPath = path.join(ASSETS_DIR, 'manifest.json');
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
    
    console.log('📋 Generated asset manifest');
  }
}

// Run standardization
const standardizer = new AssetStandardizer();
standardizer.standardizeAssets().catch(console.error);
