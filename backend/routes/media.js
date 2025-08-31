const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// In-memory media storage (in production, use database)
let mediaItems = [
  {
    id: 1,
    type: 'image',
    title: 'Ev İlaçlama Öncesi',
    category: 'ev',
    description: 'Ev ilaçlama işlemi öncesi durum tespiti',
    filename: 'sample1.jpg',
    url: '/uploads/sample1.jpg',
    location: 'İstanbul, Kadıköy',
    date: '2024-01-15',
    status: 'active',
    createdAt: new Date('2024-01-15')
  },
  {
    id: 2,
    type: 'video',
    title: 'Profesyonel İlaçlama Süreci',
    category: 'isyeri',
    description: 'Ofis binası ilaçlama sürecinin videolu anlatımı',
    filename: 'sample2.mp4',
    url: '/uploads/sample2.mp4',
    location: 'İstanbul, Şişli',
    date: '2024-01-20',
    status: 'active',
    createdAt: new Date('2024-01-20')
  },
  {
    id: 3,
    type: 'image',
    title: 'İlaçlama Sonrası Kontrol',
    category: 'ev',
    description: 'İlaçlama sonrası etkinlik kontrolü',
    filename: 'sample3.jpg',
    url: '/uploads/sample3.jpg',
    location: 'İstanbul, Beşiktaş',
    date: '2024-01-25',
    status: 'active',
    createdAt: new Date('2024-01-25')
  }
];

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|avi|mov|wmv/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Sadece resim ve video dosyaları yüklenebilir!'));
    }
  }
});

// @route   GET /api/media
// @desc    Get all media items
// @access  Public
router.get('/', (req, res) => {
  try {
    const { category, type, status } = req.query;
    let filteredItems = [...mediaItems];

    if (category && category !== 'all') {
      filteredItems = filteredItems.filter(item => item.category === category);
    }

    if (type) {
      filteredItems = filteredItems.filter(item => item.type === type);
    }

    if (status) {
      filteredItems = filteredItems.filter(item => item.status === status);
    }

    // Sort by creation date (newest first)
    filteredItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      data: filteredItems,
      total: filteredItems.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Medya öğeleri alınırken hata oluştu'
    });
  }
});

// @route   GET /api/media/:id
// @desc    Get single media item
// @access  Public
router.get('/:id', (req, res) => {
  try {
    const mediaItem = mediaItems.find(item => item.id === parseInt(req.params.id));
    
    if (!mediaItem) {
      return res.status(404).json({
        success: false,
        message: 'Medya öğesi bulunamadı'
      });
    }

    res.json({
      success: true,
      data: mediaItem
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Medya öğesi alınırken hata oluştu'
    });
  }
});

// @route   POST /api/media
// @desc    Upload new media
// @access  Private (Admin only)
router.post('/', authMiddleware, upload.single('file'), (req, res) => {
  try {
    const { title, category, description, location } = req.body;

    if (!title || !category) {
      return res.status(400).json({
        success: false,
        message: 'Başlık ve kategori gereklidir'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Dosya yüklenmesi gereklidir'
      });
    }

    // Determine file type
    const fileType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';

    const newMediaItem = {
      id: mediaItems.length > 0 ? Math.max(...mediaItems.map(item => item.id)) + 1 : 1,
      type: fileType,
      title,
      category,
      description: description || '',
      filename: req.file.filename,
      url: `/uploads/${req.file.filename}`,
      location: location || '',
      date: new Date().toISOString().split('T')[0],
      status: 'active',
      createdAt: new Date()
    };

    mediaItems.push(newMediaItem);

    res.status(201).json({
      success: true,
      message: 'Medya başarıyla yüklendi',
      data: newMediaItem
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Medya yüklenirken hata oluştu'
    });
  }
});

// @route   PUT /api/media/:id
// @desc    Update media item
// @access  Private (Admin only)
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const { title, category, description, location, status } = req.body;
    const mediaIndex = mediaItems.findIndex(item => item.id === parseInt(req.params.id));

    if (mediaIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Medya öğesi bulunamadı'
      });
    }

    // Update fields
    if (title) mediaItems[mediaIndex].title = title;
    if (category) mediaItems[mediaIndex].category = category;
    if (description !== undefined) mediaItems[mediaIndex].description = description;
    if (location !== undefined) mediaItems[mediaIndex].location = location;
    if (status) mediaItems[mediaIndex].status = status;

    res.json({
      success: true,
      message: 'Medya başarıyla güncellendi',
      data: mediaItems[mediaIndex]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Medya güncellenirken hata oluştu'
    });
  }
});

// @route   DELETE /api/media/:id
// @desc    Delete media item
// @access  Private (Admin only)
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const mediaIndex = mediaItems.findIndex(item => item.id === parseInt(req.params.id));

    if (mediaIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Medya öğesi bulunamadı'
      });
    }

    const mediaItem = mediaItems[mediaIndex];

    // Delete file from filesystem
    const filePath = path.join(__dirname, '../uploads', mediaItem.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove from array
    mediaItems.splice(mediaIndex, 1);

    res.json({
      success: true,
      message: 'Medya başarıyla silindi'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Medya silinirken hata oluştu'
    });
  }
});

// @route   GET /api/media/stats/overview
// @desc    Get media statistics
// @access  Private (Admin only)
router.get('/stats/overview', authMiddleware, (req, res) => {
  try {
    const stats = {
      total: mediaItems.length,
      active: mediaItems.filter(item => item.status === 'active').length,
      images: mediaItems.filter(item => item.type === 'image').length,
      videos: mediaItems.filter(item => item.type === 'video').length,
      categories: {
        ev: mediaItems.filter(item => item.category === 'ev').length,
        isyeri: mediaItems.filter(item => item.category === 'isyeri').length,
        cevre: mediaItems.filter(item => item.category === 'cevre').length
      }
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'İstatistikler alınırken hata oluştu'
    });
  }
});

module.exports = router;