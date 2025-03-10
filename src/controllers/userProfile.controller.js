const UserProfileService = require('../services/userProfile.service');
const upload = require('../config/multer.config');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

class UserProfileController {
  static async createProfile(req, res) {
    // Ensure upload directory exists
    const uploadDir = './uploads/profile_pictures';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uploadSingle = upload.single('profilePicture');

    uploadSingle(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err });
      }

      try {
        const userId = req.user.id;
        const profileData = req.body;
        if (req.file) {
          const filePath = path.join(uploadDir, req.file.filename);
          await sharp(req.file.path)
            .resize({ width: 800, height: 800, fit: sharp.fit.inside, withoutEnlargement: true })
            .toFormat('jpeg')
            .jpeg({ quality: 80 })
            .toFile(filePath);
          profileData.profilePicture = `/uploads/profile_pictures/${req.file.filename}`;
        }
        const profile = await UserProfileService.createProfile(userId, profileData);
        res.status(201).json(profile);
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    });
  }

  static async getProfiles(req, res) {
    try {
      const userId = req.user.id;
      const profiles = await UserProfileService.getProfiles(userId);
      res.status(200).json(profiles);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async updateProfile(req, res) {
    // Ensure upload directory exists
    const uploadDir = './uploads/profile_pictures';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uploadSingle = upload.single('profilePicture');

    uploadSingle(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err });
      }

      try {
        const profileId = req.params.profileId;
        const profileData = req.body;
        if (req.file) {
          const filePath = path.join(uploadDir, req.file.filename);
          await sharp(req.file.path)
            .resize({ width: 800, height: 800, fit: sharp.fit.inside, withoutEnlargement: true })
            .toFormat('jpeg')
            .jpeg({ quality: 80 })
            .toFile(filePath);
          profileData.profilePicture = `/uploads/profile_pictures/${req.file.filename}`;
        }
        const profile = await UserProfileService.updateProfile(profileId, profileData);
        res.status(200).json(profile);
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    });
  }

  static async deleteProfile(req, res) {
    try {
      const profileId = req.params.profileId;
      const result = await UserProfileService.deleteProfile(profileId);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = UserProfileController;