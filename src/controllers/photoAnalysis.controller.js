const PhotoAnalysisService = require('../services/photoAnalysis.service');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

class PhotoAnalysisController {
  static async analyzePhoto(req, res) {
    try {
      const userId = req.user.id;
      const { file } = req;
      console.log('file', file);
      
      if (!file) {
        return res.status(400).json({ message: 'No photo uploaded' });
      }
      
      // Convert the image to PNG format first
      const uploadDir = './uploads/temp';
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const pngPhotoPath = path.join(uploadDir, `converted-${Date.now()}.png`);
      
      try {
        // Convert to PNG format
        await sharp(file.path)
          .toFormat('png')
          .png({ quality: 90 })
          .toFile(pngPhotoPath);
        
        console.log("Image converted to PNG for OpenCV compatibility:", pngPhotoPath);
        
        // Process the converted PNG photo
        const analysis = await PhotoAnalysisService.analyzePhoto(userId, pngPhotoPath);
        
        // Clean up original file if needed
        // fs.unlinkSync(file.path);
        
        res.status(200).json(analysis);
      } catch (conversionError) {
        console.error('Error converting image:', conversionError.message.substring(0, 100));
        
        // If conversion fails, try with the original file
        const analysis = await PhotoAnalysisService.analyzePhoto(userId, file.path);
        res.status(200).json(analysis);
      }
    } catch (error) {
      const errorMessage = error.message.length > 100 ? error.message.substring(0, 100) + '...' : error.message;
      console.error('Error analyzing photo:', errorMessage);
      res.status(400).json({ message: error.message });
    }
  }
  
  static async getAnalysisHistory(req, res) {
    try {
      const userId = req.user.id;
      const history = await PhotoAnalysisService.getAnalysisHistory(userId);
      res.status(200).json(history);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
  
  static async getAnalysisById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const analysis = await PhotoAnalysisService.getAnalysisById(id, userId);
      res.status(200).json(analysis);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = PhotoAnalysisController;