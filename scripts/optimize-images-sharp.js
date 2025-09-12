const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Function to get file size in MB
function getFileSizeMB(filePath) {
  const stats = fs.statSync(filePath);
  return (stats.size / (1024 * 1024)).toFixed(2);
}

// Function to optimize images using Sharp
async function optimizeImage(inputPath, outputPath, options = {}) {
  try {
    const originalSize = parseFloat(getFileSizeMB(inputPath));
    
    let pipeline = sharp(inputPath);
    
    // Get image metadata
    const metadata = await pipeline.metadata();
    console.log(`📐 ${path.basename(inputPath)}: ${metadata.width}x${metadata.height}`);
    
    // Resize if too large (max 2000px on longest side)
    if (metadata.width > 2000 || metadata.height > 2000) {
      const maxDimension = 2000;
      if (metadata.width > metadata.height) {
        pipeline = pipeline.resize(maxDimension, null);
      } else {
        pipeline = pipeline.resize(null, maxDimension);
      }
      console.log(`📏 Resizing to max ${maxDimension}px`);
    }
    
    // Apply format-specific optimizations
    const ext = path.extname(inputPath).toLowerCase();
    
    if (ext === '.png') {
      pipeline = pipeline.png({ 
        quality: 80,
        compressionLevel: 9,
        adaptiveFiltering: true
      });
    } else if (ext === '.jpg' || ext === '.jpeg') {
      pipeline = pipeline.jpeg({ 
        quality: 80,
        progressive: true,
        mozjpeg: true
      });
    }
    
    // Write optimized image
    await pipeline.toFile(outputPath);
    
    const newSize = parseFloat(getFileSizeMB(outputPath));
    const saved = originalSize - newSize;
    const percentSaved = ((saved / originalSize) * 100).toFixed(1);
    
    console.log(`✅ ${path.basename(inputPath)}: ${originalSize}MB → ${newSize}MB (saved ${saved.toFixed(2)}MB, ${percentSaved}%)`);
    
    return { success: true, saved, originalSize, newSize };
    
  } catch (error) {
    console.log(`❌ Failed to optimize ${path.basename(inputPath)}: ${error.message}`);
    return { success: false, saved: 0 };
  }
}

// Function to create WebP version
async function createWebP(inputPath, outputPath) {
  try {
    const originalSize = parseFloat(getFileSizeMB(inputPath));
    
    await sharp(inputPath)
      .webp({ quality: 80 })
      .toFile(outputPath);
    
    const webpSize = parseFloat(getFileSizeMB(outputPath));
    const saved = originalSize - webpSize;
    const percentSaved = ((saved / originalSize) * 100).toFixed(1);
    
    console.log(`📄 WebP: ${path.basename(inputPath)} → ${path.basename(outputPath)} (${originalSize}MB → ${webpSize}MB, saved ${saved.toFixed(2)}MB, ${percentSaved}%)`);
    
    return { success: true, saved };
    
  } catch (error) {
    console.log(`❌ Failed to create WebP for ${path.basename(inputPath)}: ${error.message}`);
    return { success: false, saved: 0 };
  }
}

// Main optimization function
async function optimizeImages() {
  const projectsDir = 'assets/images/work';
  let totalSaved = 0;
  let filesProcessed = 0;
  let webpSaved = 0;

  // Find all image files
  const findImages = (dir) => {
    const files = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.includes('backup')) {
        files.push(...findImages(fullPath));
      } else if (stat.isFile() && /\.(png|jpg|jpeg)$/i.test(item)) {
        files.push(fullPath);
      }
    }
    
    return files;
  };

  const imageFiles = findImages(projectsDir);
  
  console.log(`🔍 Found ${imageFiles.length} images to optimize...\n`);

  // Sort by file size (largest first)
  const sortedFiles = imageFiles.sort((a, b) => {
    const sizeA = parseFloat(getFileSizeMB(a));
    const sizeB = parseFloat(getFileSizeMB(b));
    return sizeB - sizeA;
  });

  for (const imagePath of sortedFiles) {
    const ext = path.extname(imagePath).toLowerCase();
    const dir = path.dirname(imagePath);
    const name = path.basename(imagePath, ext);
    const originalSize = parseFloat(getFileSizeMB(imagePath));
    
    console.log(`\n🔄 Processing: ${path.basename(imagePath)} (${originalSize}MB)`);
    
    // Skip very small files
    if (originalSize < 0.3) {
      console.log(`⏭️  Skipping small file`);
      continue;
    }
    
    // Create temporary file for optimization
    const tempPath = path.join(dir, `${name}_temp${ext}`);
    
    // Optimize the image
    const result = await optimizeImage(imagePath, tempPath);
    
    if (result.success && result.saved > 0) {
      // Replace original with optimized version
      fs.renameSync(tempPath, imagePath);
      totalSaved += result.saved;
      filesProcessed++;
      
      // Create WebP version
      const webpPath = path.join(dir, `${name}.webp`);
      const webpResult = await createWebP(imagePath, webpPath);
      if (webpResult.success) {
        webpSaved += webpResult.saved;
      }
    } else {
      // Remove temp file if optimization failed
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    }
  }

  console.log(`\n🎉 Optimization complete!`);
  console.log(`📊 Files processed: ${filesProcessed}`);
  console.log(`💾 Total space saved: ${totalSaved.toFixed(2)}MB`);
  console.log(`📄 WebP versions saved additional: ${webpSaved.toFixed(2)}MB`);
  console.log(`🚀 Total improvement: ${(totalSaved + webpSaved).toFixed(2)}MB`);
}

// Run the optimization
optimizeImages().catch(console.error);
