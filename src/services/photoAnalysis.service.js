const PhotoAnalysis = require('../models/photoAnalysis.model');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const cv = require('opencv.js');

class PhotoAnalysisService {
  static async analyzePhoto(userId, photoPath) {
    try {
      // 1. Perform image preprocessing and get processed image path
      console.log("photo path", photoPath);
      const processedPhotoPath = await this.preprocessImage(photoPath);

      // 2. Analyze the image to get measurements
      const analysisResults = await this.performImageAnalysis(processedPhotoPath);
      console.log("Image analysis results:", analysisResults);

      // 3. Create and save the analysis record
      // Temporary fix: Adding a default profileId (using userId as profileId)
      const photoAnalysis = await PhotoAnalysis.create({
        userId,
        profileId: userId, // Temporary fix: using userId as profileId
        photoPath: processedPhotoPath,
        ...analysisResults
      });

      return photoAnalysis;
    } catch (error) {
      const errorMessage = error.message.length > 100 ? error.message.substring(0, 100) + '...' : error.message;
      console.error('Error analyzing photo:', errorMessage);
      throw new Error(`Failed to analyze photo: ${errorMessage}`);
    }
  }

  static async preprocessImage(photoPath) {
    // Create a directory for processed images if it doesn't exist
    const uploadDir = './uploads/processed';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Create a filename for the processed image with PNG extension
    const processedPhotoPath = path.join(uploadDir, `processed-${path.basename(photoPath)}`);
    
    try {
      // Force PNG format with explicit conversion
      await sharp(photoPath)
        .resize({ width: 800, height: 800, fit: sharp.fit.inside, withoutEnlargement: true })
        .sharpen()
        .normalize() // Normalize the image for better edge detection
        .png() // Explicitly convert to PNG format
        .toFile(processedPhotoPath);
        
      console.log("Image preprocessed and converted to PNG:", processedPhotoPath);
      
      // Verify the file has proper PNG magic bytes
      const buffer = fs.readFileSync(processedPhotoPath);
      const isPng = buffer[0] === 0x89 && 
                    buffer[1] === 0x50 && 
                    buffer[2] === 0x4E && 
                    buffer[3] === 0x47;
      
      if (!isPng) {
        console.log("Warning: File doesn't have proper PNG header. Trying explicit conversion.");
        // Create a secondary conversion to ensure PNG format
        const secondaryPath = path.join(uploadDir, `processed-verified-${Date.now()}.png`);
        
        // Use a more direct conversion method
        await sharp(processedPhotoPath, { failOn: 'none' })
          .toFormat('png')
          .png()
          .toFile(secondaryPath);
        
        console.log("Secondary PNG conversion complete:", secondaryPath);
        return secondaryPath;
      }
      
      return processedPhotoPath;
    } catch (error) {
      console.error("Error in preprocessing image:", error.message);
      // If preprocessing fails, return original path
      return photoPath;
    }
  }

  static async performImageAnalysis(photoPath) {
    return new Promise(async (resolve, reject) => {
      try {
        console.log("Starting image analysis for:", photoPath);
        
        // Check if the file exists and has content
        let imgWidth = 750;
        let imgHeight = 1000;
        
        try {
          const stats = fs.statSync(photoPath);
          if (!stats.isFile() || stats.size === 0) {
            console.error("Invalid or empty image file");
            resolve(this.getEstimatedMeasurements(imgWidth, imgHeight));
            return;
          }
          console.log("Image file size:", stats.size, "bytes");
          
          // Verify the file has proper PNG magic bytes
          const headerBytes = fs.readFileSync(photoPath, { start: 0, end: 8 });
          const isPng = headerBytes[0] === 0x89 && 
                        headerBytes[1] === 0x50 && 
                        headerBytes[2] === 0x4E && 
                        headerBytes[3] === 0x47;
          
          if (!isPng) {
            console.warn("File doesn't have PNG header. Converting to PNG before processing.");
            // Create a temporary PNG file
            const tempPngPath = path.join(path.dirname(photoPath), `temp-png-${Date.now()}.png`);
            
            try {
              // Convert to PNG using sharp
              await sharp(photoPath)
                .toFormat('png')
                .png({ quality: 90 })
                .toFile(tempPngPath);
              
              console.log("Image converted to proper PNG format:", tempPngPath);
              // Continue with the new path
              this.processImageWithSharp(tempPngPath, resolve);
            } catch (convErr) {
              console.error("PNG conversion failed:", convErr.message.substring(0, 100));
              // Continue with original path if conversion fails
              this.processImageWithSharp(photoPath, resolve);
            }
          } else {
            // Already a PNG, proceed with processing
            this.processImageWithSharp(photoPath, resolve);
          }
        } catch (err) {
          console.error("Error checking file:", err.message.substring(0, 100));
          resolve(this.getEstimatedMeasurements(imgWidth, imgHeight));
        }
      } catch (generalError) {
        const shortError = generalError.message.substring(0, 100);
        console.error('General error in image analysis:', shortError);
        resolve(this.getEstimatedMeasurements(1000, 750));
      }
    });
  }

  static processImageWithSharp(photoPath, resolve) {
    let imgWidth = 750;
    let imgHeight = 1000;
    
    sharp(photoPath)
      .metadata()
      .then(metadata => {
        if (metadata && metadata.width && metadata.height) {
          imgWidth = metadata.width;
          imgHeight = metadata.height;
          console.log("Image dimensions from Sharp:", imgWidth, "x", imgHeight);
        }
        
        try {
          // Read the image data
          const imageBuffer = fs.readFileSync(photoPath);
          console.log("Image data length:", imageBuffer.length, "bytes");
          
          // Log first few bytes to check format
          const firstBytes = Array.from(imageBuffer.slice(0, 8))
            .map(byte => byte.toString(16).padStart(2, '0'))
            .join(' ');
          console.log("First bytes of image data:", firstBytes);
          
          // Convert buffer to a format OpenCV can read
          const data = new Uint8Array(imageBuffer);
          
          try {
            console.log("Attempting OpenCV processing...");
            const img = cv.imdecode(data, cv.IMREAD_COLOR);
            
            if (!img || img.empty()) {
              throw new Error("Image decoded but is empty");
            }
            
            console.log("Successfully decoded image with OpenCV! Dimensions:", img.cols, "x", img.rows);
            imgWidth = img.cols;
            imgHeight = img.rows;
            
            // 2. Convert to grayscale
            const gray = new cv.Mat();
            cv.cvtColor(img, gray, cv.COLOR_BGR2GRAY);
            
            // 3. Apply Gaussian blur
            const blurred = new cv.Mat();
            const ksize = new cv.Size(5, 5);
            cv.GaussianBlur(gray, blurred, ksize, 1.5);
            
            // 4. Apply Canny edge detection
            const edges = new cv.Mat();
            cv.Canny(blurred, edges, 30, 100);
            
            // 5. Find contours
            const contours = new cv.MatVector();
            const hierarchy = new cv.Mat();
            cv.findContours(edges, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
            
            // 6. Find largest contour (likely to be the person)
            let largestContour = null;
            let largestArea = 0;
            let largestContourIdx = -1;
            
            for (let i = 0; i < contours.size(); i++) {
              const cnt = contours.get(i);
              const area = cv.contourArea(cnt);
              if (area > largestArea) {
                largestArea = area;
                largestContour = cnt;
                largestContourIdx = i;
              }
            }
            
            // 7. If no significant contour found, switch to basic analysis
            if (!largestContour || largestArea < 1000) {
              console.log('No significant body contour detected, switching to basic analysis');
              
              // Clean up OpenCV objects
              img.delete();
              gray.delete();
              blurred.delete();
              edges.delete();
              contours.delete();
              hierarchy.delete();
              
              // Throw error to trigger basic analysis
              throw new Error("No significant contours found");
            }
            
            // 8. Get bounding rectangle of the person
            const boundingRect = cv.boundingRect(largestContour);
            
            // 9. Use the bounding rectangle to estimate the person's height in pixels
            const bodyHeight = boundingRect.height;
            const bodyWidth = boundingRect.width;
            
            // 10. Estimate real-world height based on image context
            const REFERENCE_HEIGHT_CM = 170;
            
            // 11. Calculate pixel to cm ratio
            const pixelToCm = REFERENCE_HEIGHT_CM / bodyHeight;
            
            // 12. Calculate measurements at different body points
            
            // Chest (28% from top)
            const chestY = Math.floor(boundingRect.y + bodyHeight * 0.28);
            let chestWidth = this.getBodyWidthAtHeight(edges, chestY);
            if (chestWidth <= 0) chestWidth = bodyWidth * 0.8;
            
            // Waist (43% from top)
            const waistY = Math.floor(boundingRect.y + bodyHeight * 0.43);
            let waistWidth = this.getBodyWidthAtHeight(edges, waistY);
            if (waistWidth <= 0) waistWidth = bodyWidth * 0.7;
            
            // Hip (58% from top)
            const hipY = Math.floor(boundingRect.y + bodyHeight * 0.58);
            let hipWidth = this.getBodyWidthAtHeight(edges, hipY);
            if (hipWidth <= 0) hipWidth = bodyWidth * 0.9;
            
            // Bicep (18% from top)
            const bicepY = Math.floor(boundingRect.y + bodyHeight * 0.18);
            let bicepWidth = this.findArmWidth(edges, boundingRect, bicepY);
            if (bicepWidth <= 0) bicepWidth = bodyWidth * 0.15;
            
            // 13. Calculate circumference estimates
            const chestDepthEstimate = bodyWidth * 0.6;
            const chestCircumference = this.calculateEllipticalCircumference(chestWidth, chestDepthEstimate);
            
            const waistDepthEstimate = bodyWidth * 0.5;
            const waistCircumference = this.calculateEllipticalCircumference(waistWidth, waistDepthEstimate);
            
            const hipDepthEstimate = bodyWidth * 0.55;
            const hipCircumference = this.calculateEllipticalCircumference(hipWidth, hipDepthEstimate);
            
            const bicepCircumference = bicepWidth * Math.PI;
            
            // 14. Convert to real-world measurements
            const height = REFERENCE_HEIGHT_CM;
            const cmChest = chestCircumference * pixelToCm;
            const cmWaist = waistCircumference * pixelToCm;
            const cmHip = hipCircumference * pixelToCm;
            const cmBicep = bicepCircumference * pixelToCm;
            
            // 15. Final measurements
            const finalMeasurements = {
              height: parseFloat(height.toFixed(1)),
              chest: parseFloat(cmChest.toFixed(1)),
              waist: parseFloat(cmWaist.toFixed(1)),
              hip: parseFloat(cmHip.toFixed(1)),
              bicep: parseFloat(cmBicep.toFixed(1))
            };
            
            console.log("OpenCV analysis measurements:", finalMeasurements);
            
            // 16. Create visualization
            try {
              const visualizationPath = this.saveVisualization(
                img, 
                { x: boundingRect.x, y: boundingRect.y, width: boundingRect.width, height: boundingRect.height }, 
                chestY, waistY, hipY, bicepY, photoPath
              );
              finalMeasurements.visualizationPath = visualizationPath;
            } catch (e) {
              console.log("Visualization skipped:", e.message.substring(0, 100));
            }
            
            // Clean up OpenCV objects
            img.delete();
            gray.delete();
            blurred.delete();
            edges.delete();
            contours.delete();
            hierarchy.delete();
            
            // Clean up temp file if we created one
            if (photoPath.includes('temp-png-')) {
              try { fs.unlinkSync(photoPath); } catch (e) { /* ignore cleanup errors */ }
            }
            
            resolve(finalMeasurements);
            
          } catch (cvError) {
            const shortError = cvError.message.substring(0, 100);
            console.error("OpenCV processing failed:", shortError);
            
            // Clean up temp file if we created one
            if (photoPath.includes('temp-png-')) {
              try { fs.unlinkSync(photoPath); } catch (e) { /* ignore cleanup errors */ }
            }
            
            // Fall back to basic analysis
            console.log("Falling back to basic analysis approach");
            
            // Basic analysis based on image dimensions
            const estimatedPersonHeight = imgHeight * 0.9;
            
            // Apply typical body proportions
            const estimatedChestWidth = imgWidth * 0.45;  // ~45% of image width 
            const estimatedWaistWidth = imgWidth * 0.4;   // ~40% of image width
            const estimatedHipWidth = imgWidth * 0.47;    // ~47% of image width
            const estimatedBicepWidth = imgWidth * 0.12;  // ~12% of image width
            
            // Estimate depths (front-to-back dimension)
            const chestDepthEstimate = estimatedChestWidth * 0.6;
            const waistDepthEstimate = estimatedWaistWidth * 0.5;
            const hipDepthEstimate = estimatedHipWidth * 0.55;
            
            // Calculate circumferences
            const chestCircumference = this.calculateEllipticalCircumference(estimatedChestWidth, chestDepthEstimate);
            const waistCircumference = this.calculateEllipticalCircumference(estimatedWaistWidth, waistDepthEstimate);
            const hipCircumference = this.calculateEllipticalCircumference(estimatedHipWidth, hipDepthEstimate);
            const bicepCircumference = estimatedBicepWidth * Math.PI;
            
            // Use standard height reference
            const REFERENCE_HEIGHT_CM = 170;
            const pixelToCmRatio = REFERENCE_HEIGHT_CM / estimatedPersonHeight;
            
            const measurements = {
              height: REFERENCE_HEIGHT_CM,
              chest: parseFloat((chestCircumference * pixelToCmRatio).toFixed(1)),
              waist: parseFloat((waistCircumference * pixelToCmRatio).toFixed(1)),
              hip: parseFloat((hipCircumference * pixelToCmRatio).toFixed(1)),
              bicep: parseFloat((bicepCircumference * pixelToCmRatio).toFixed(1))
            };
            
            console.log("Basic analysis measurements:", measurements);
            resolve(measurements);
          }
        } catch (processingError) {
          console.error("Processing error:", processingError.message.substring(0, 100));
          
          // Emergency fallback to estimated measurements
          console.log("Using estimated measurements as fallback");
          resolve(this.getEstimatedMeasurements(imgWidth, imgHeight));
        }
      })
      .catch(sharpError => {
        console.error("Sharp metadata error:", sharpError.message.substring(0, 100));
        resolve(this.getEstimatedMeasurements(1000, 750));
      });
  }

  static getBodyWidthAtHeight(edgesMat, y) {
    try {
      const width = edgesMat.cols;
      let leftEdge = -1;
      let rightEdge = -1;
      
      // Find leftmost edge pixel
      for (let x = 0; x < width; x++) {
        const pixel = edgesMat.ucharPtr(y, x)[0];
        if (pixel > 0) {
          leftEdge = x;
          break;
        }
      }
      
      // Find rightmost edge pixel
      for (let x = width - 1; x >= 0; x--) {
        const pixel = edgesMat.ucharPtr(y, x)[0];
        if (pixel > 0) {
          rightEdge = x;
          break;
        }
      }
      
      if (leftEdge >= 0 && rightEdge >= 0 && rightEdge > leftEdge) {
        return rightEdge - leftEdge;
      }
      return 0;
    } catch (error) {
      console.error("Error measuring body width:", error);
      return 0;
    }
  }
  
  static findArmWidth(edgesMat, bodyRect, y) {
    try {
      const bodyCenter = bodyRect.x + (bodyRect.width / 2);
      const bodyLeft = bodyRect.x;
      const bodyRight = bodyRect.x + bodyRect.width;
      const searchMargin = Math.floor(bodyRect.width * 0.3);
      
      // Left arm detection
      let leftArmWidth = 0;
      let leftStart = -1;
      let leftEnd = -1;
      
      for (let x = Math.max(0, bodyLeft - searchMargin); x < bodyCenter; x++) {
        const pixel = edgesMat.ucharPtr(y, x)[0];
        if (leftStart < 0 && pixel > 0) {
          leftStart = x;
        } else if (leftStart >= 0 && leftEnd < 0 && pixel === 0) {
          leftEnd = x - 1;
          break;
        }
      }
      
      if (leftStart >= 0 && leftEnd >= 0) {
        leftArmWidth = leftEnd - leftStart;
      }
      
      // Right arm detection
      let rightArmWidth = 0;
      let rightStart = -1;
      let rightEnd = -1;
      
      for (let x = bodyCenter; x < Math.min(edgesMat.cols, bodyRight + searchMargin); x++) {
        const pixel = edgesMat.ucharPtr(y, x)[0];
        if (rightStart < 0 && pixel > 0) {
          rightStart = x;
        } else if (rightStart >= 0 && rightEnd < 0 && pixel === 0) {
          rightEnd = x - 1;
          break;
        }
      }
      
      if (rightStart >= 0 && rightEnd >= 0) {
        rightArmWidth = rightEnd - rightStart;
      }
      
      if (leftArmWidth > 0 && rightArmWidth > 0) {
        return (leftArmWidth + rightArmWidth) / 2;
      } else {
        return Math.max(leftArmWidth, rightArmWidth);
      }
    } catch (error) {
      console.error("Error finding arm width:", error);
      return 0;
    }
  }
  
  static calculateEllipticalCircumference(width, depth) {
    const a = width / 2;  // semi-major axis
    const b = depth / 2;  // semi-minor axis
    
    if (a <= 0 || b <= 0) return 0;
    
    // Ramanujan's approximation for ellipse circumference
    const h = Math.pow((a - b) / (a + b), 2);
    return Math.PI * (a + b) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
  }
  
  static getEstimatedMeasurements(imgHeight, imgWidth) {
    // If we can't detect a proper body contour, provide reasonable estimates
    // based on average human proportions
    return {
      height: 170.0,  // Average human height in cm
      chest: 95.0,    // Average chest circumference in cm
      waist: 85.0,    // Average waist circumference in cm
      hip: 100.0,     // Average hip circumference in cm
      bicep: 32.0     // Average bicep circumference in cm
    };
  }
  
  static saveVisualization(img, boundingRect, chestY, waistY, hipY, bicepY, originalPhotoPath) {
    try {
      // Create directory for visualizations if it doesn't exist
      const visualDir = './uploads/visualizations';
      if (!fs.existsSync(visualDir)) {
        fs.mkdirSync(visualDir, { recursive: true });
      }
      
      // Create a copy for visualization
      const visualImg = img.clone();
      
      // Draw bounding rectangle
      cv.rectangle(
        visualImg,
        new cv.Point(boundingRect.x, boundingRect.y),
        new cv.Point(boundingRect.x + boundingRect.width, boundingRect.y + boundingRect.height),
        new cv.Scalar(255, 0, 0),
        2
      );
      
      // Draw measurement lines
      // Chest (green)
      cv.line(
        visualImg,
        new cv.Point(boundingRect.x, chestY),
        new cv.Point(boundingRect.x + boundingRect.width, chestY),
        new cv.Scalar(0, 255, 0),
        2
      );
      
      // Waist (cyan)
      cv.line(
        visualImg,
        new cv.Point(boundingRect.x, waistY),
        new cv.Point(boundingRect.x + boundingRect.width, waistY),
        new cv.Scalar(0, 255, 255),
        2
      );
      
      // Hip (magenta)
      cv.line(
        visualImg,
        new cv.Point(boundingRect.x, hipY),
        new cv.Point(boundingRect.x + boundingRect.width, hipY),
        new cv.Scalar(255, 0, 255),
        2
      );
      
      // Bicep (yellow)
      cv.line(
        visualImg,
        new cv.Point(boundingRect.x, bicepY),
        new cv.Point(boundingRect.x + boundingRect.width, bicepY),
        new cv.Scalar(255, 255, 0),
        2
      );
      
      // Add text labels
      const fontScale = 0.8;
      const fontColor = new cv.Scalar(255, 255, 255);
      const thickness = 1;
      
      cv.putText(
        visualImg,
        'Chest',
        new cv.Point(boundingRect.x + boundingRect.width + 10, chestY),
        cv.FONT_HERSHEY_SIMPLEX,
        fontScale,
        fontColor,
        thickness
      );
      
      cv.putText(
        visualImg,
        'Waist',
        new cv.Point(boundingRect.x + boundingRect.width + 10, waistY),
        cv.FONT_HERSHEY_SIMPLEX,
        fontScale,
        fontColor,
        thickness
      );
      
      cv.putText(
        visualImg,
        'Hip',
        new cv.Point(boundingRect.x + boundingRect.width + 10, hipY),
        cv.FONT_HERSHEY_SIMPLEX,
        fontScale,
        fontColor,
        thickness
      );
      
      cv.putText(
        visualImg,
        'Bicep',
        new cv.Point(boundingRect.x + boundingRect.width + 10, bicepY),
        cv.FONT_HERSHEY_SIMPLEX,
        fontScale,
        fontColor,
        thickness
      );
      
      // Save the visualization
      const filename = `visualization-${Date.now()}.jpg`;
      const visualPath = path.join(visualDir, filename);
      cv.imwrite(visualPath, visualImg);
      console.log(`Visualization saved to: ${visualPath}`);
      
      // Clean up
      visualImg.delete();
      
      return `/uploads/visualizations/${filename}`;
    } catch (error) {
      console.error('Error creating visualization:', error);
      return null;
    }
  }
  
  static async getAnalysisHistory(userId) {
    try {
      const history = await PhotoAnalysis.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']]
      });
      return history;
    } catch (error) {
      console.error('Error fetching analysis history:', error);
      throw new Error('Failed to fetch analysis history');
    }
  }
  
  static async getAnalysisById(id, userId) {
    try {
      const analysis = await PhotoAnalysis.findOne({
        where: { id, userId }
      });
      
      if (!analysis) {
        throw new Error('Analysis not found');
      }
      
      return analysis;
    } catch (error) {
      console.error('Error fetching analysis:', error);
      throw new Error('Failed to fetch analysis');
    }
  }
}

module.exports = PhotoAnalysisService;