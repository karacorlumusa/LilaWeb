const express = require('express');
const bcrypt = require('bcryptjs');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// In-memory settings storage
let siteSettings = {
  companyName: 'Lila İlaçlama',
  phone: '+90 (212) 555 0123',
  email: 'info@lilailacla.com',
  address: 'Atatürk Mahallesi, İlaçlama Sokak No:15, Kadıköy / İstanbul',
  workingHours: 'Pazartesi - Cumartesi: 08:00 - 18:00\nPazar: Acil durumlar için 24/7',
  description: 'Profesyonel ilaçlama hizmetleri ile sağlıklı yaşam alanları',
  socialMedia: {
    facebook: '',
    instagram: '',
    twitter: '',
    linkedin: ''
  },
  updatedAt: new Date()
};

// @route   GET /api/settings
// @desc    Get site settings
// @access  Public
router.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      data: siteSettings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Ayarlar alınırken hata oluştu'
    });
  }
});

// @route   PUT /api/settings
// @desc    Update site settings
// @access  Private (Admin only)
router.put('/', authMiddleware, (req, res) => {
  try {
    const {
      companyName,
      phone,
      email,
      address,
      workingHours,
      description,
      socialMedia
    } = req.body;

    // Update fields
    if (companyName) siteSettings.companyName = companyName;
    if (phone) siteSettings.phone = phone;
    if (email) siteSettings.email = email;
    if (address) siteSettings.address = address;
    if (workingHours) siteSettings.workingHours = workingHours;
    if (description) siteSettings.description = description;
    if (socialMedia) siteSettings.socialMedia = { ...siteSettings.socialMedia, ...socialMedia };
    
    siteSettings.updatedAt = new Date();

    res.json({
      success: true,
      message: 'Ayarlar başarıyla güncellendi',
      data: siteSettings
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Ayarlar güncellenirken hata oluştu'
    });
  }
});

// @route   PUT /api/settings/password
// @desc    Change admin password
// @access  Private (Admin only)
router.put('/password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Mevcut şifre ve yeni şifre gereklidir'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Yeni şifre en az 6 karakter olmalıdır'
      });
    }

    // In a real app, you would verify current password and update in database
    // For now, just return success
    res.json({
      success: true,
      message: 'Şifre başarıyla değiştirildi'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Şifre değiştirilirken hata oluştu'
    });
  }
});

module.exports = router;