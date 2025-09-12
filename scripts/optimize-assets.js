/**
 * Asset Optimization Script
 * Optimizes images and generates responsive versions
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ASSETS_DIR = path.join(__dirname, '../assets/images');
const OUTPUT_DIR = path.join(__dirname, '../assets/images/optimized');

// Image optimization settings
const IMAGE_CONFIGS = {
  webp: {
    quality: 85,
    effort: 6
  },
  avif: {
    quality: 80,
    effort: 4
  },
  jpeg: {
    quality: 85,
    progressive: true,
    mozjpeg: true
  },
  png: {
    quality: 90,
    compressionLevel: 9,
    adaptiveFiltering: true
  }
};

// Responsive breakpoints
const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1200,
  large: 1920
};

class AssetOptimizer {
  constructor() {
    this.processedCount = 0;
    this.totalCount = 0;
  }

  async optimizeAssets() {
    console.log('🚀 Starting asset optimization...');
    
    try {
      // Ensure output directory exists
      await fs.mkdir(OUTPUT_DIR, { recursive: true });
      
      // Find all image files
      const imageFiles = await this.findImageFiles(ASSETS_DIR);
      this.totalCount = imageFiles.length;
      
      console.log(`📁 Found ${this.totalCount} images to optimize`);
      
      // Process images in parallel (with concurrency limit)
      const concurrency = 5;
      for (let i = 0; i < imageFiles.length; i += concurrency) {
        const batch = imageFiles.slice(i, i + concurrency);
        await Promise.all(batch.map(file => this.optimizeImage(file)));
      }
      
      console.log(`✅ Optimization complete! Processed ${this.processedCount} images`);
      
    } catch (error) {
      console.error('❌ Optimization failed:', error);
      process.exit(1);
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

  isImageFile(filename) {
    const ext = path.extname(filename).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext);
  }

  async optimizeImage(inputPath) {
    try {
      const relativePath = path.relative(ASSETS_DIR, inputPath);
      const parsedPath = path.parse(relativePath);
      const outputBasePath = path.join(OUTPUT_DIR, parsedPath.dir);
      
      // Ensure output directory exists
      await fs.mkdir(outputBasePath, { recursive: true });
      
      const image = sharp(inputPath);
      const metadata = await image.metadata();
      
      // Generate optimized versions
      await this.generateWebP(image, inputPath, outputBasePath, parsedPath);
      await this.generateAVIF(image, inputPath, outputBasePath, parsedPath);
      await this.generateResponsiveVersions(image, inputPath, outputBasePath, parsedPath, metadata);
      
      this.processedCount++;
      console.log(`📸 Processed: ${relativePath}`);
      
    } catch (error) {
      console.error(`❌ Failed to optimize ${inputPath}:`, error.message);
    }
  }

  async generateWebP(image, inputPath, outputBasePath, parsedPath) {
    const outputPath = path.join(outputBasePath, `${parsedPath.name}.webp`);
    
    await image
      .webp(IMAGE_CONFIGS.webp)
      .toFile(outputPath);
  }

  async generateAVIF(image, inputPath, outputBasePath, parsedPath) {
    const outputPath = path.join(outputBasePath, `${parsedPath.name}.avif`);
    
    await image
      .avif(IMAGE_CONFIGS.avif)
      .toFile(outputPath);
  }

  async generateResponsiveVersions(image, inputPath, outputBasePath, parsedPath, metadata) {
    const { width, height } = metadata;
    
    for (const [breakpoint, maxWidth] of Object.entries(BREAKPOINTS)) {
      if (width > maxWidth) {
        const scale = maxWidth / width;
        const newWidth = Math.round(width * scale);
        const newHeight = Math.round(height * scale);
        
        // Generate WebP version
        const webpPath = path.join(outputBasePath, `${parsedPath.name}-${breakpoint}.webp`);
        await image
          .resize(newWidth, newHeight, { fit: 'inside', withoutEnlargement: true })
          .webp(IMAGE_CONFIGS.webp)
          .toFile(webpPath);
        
        // Generate AVIF version
        const avifPath = path.join(outputBasePath, `${parsedPath.name}-${breakpoint}.avif`);
        await image
          .resize(newWidth, newHeight, { fit: 'inside', withoutEnlargement: true })
          .avif(IMAGE_CONFIGS.avif)
          .toFile(avifPath);
      }
    }
  }

  async generateManifest() {
    const manifest = {
      version: '1.0.0',
      generated: new Date().toISOString(),
      assets: []
    };
    
    const optimizedFiles = await this.findImageFiles(OUTPUT_DIR);
    
    for (const file of optimizedFiles) {
      const relativePath = path.relative(OUTPUT_DIR, file);
      const stats = await fs.stat(file);
      
      manifest.assets.push({
        path: relativePath,
        size: stats.size,
        modified: stats.mtime.toISOString()
      });
    }
    
    const manifestPath = path.join(OUTPUT_DIR, 'manifest.json');
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
    
    console.log('📋 Generated asset manifest');
  }
}

// Run optimization
const optimizer = new AssetOptimizer();
optimizer.optimizeAssets()
  .then(() => optimizer.generateManifest())
  .catch(console.error);
