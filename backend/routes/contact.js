const express = require('express');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// In-memory contact requests storage
let contactRequests = [
  {
    id: 1,
    name: 'Ahmet Yılmaz',
    email: 'ahmet@email.com',
    phone: '+90 532 123 4567',
    service: 'ev',
    message: 'Evimde karınca problemi var, yardımcı olabilir misiniz?',
    status: 'new',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: 2,
    name: 'Fatma Demir',
    email: 'fatma@email.com',
    phone: '+90 533 987 6543',
    service: 'isyeri',
    message: 'Restoranımız için düzenli ilaçlama hizmeti istiyoruz.',
    status: 'contacted',
    createdAt: new Date('2024-01-22'),
    updatedAt: new Date('2024-01-23')
  }
];

// @route   POST /api/contact
// @desc    Submit contact form
// @access  Public
router.post('/', (req, res) => {
  try {
    const { name, email, phone, service, message } = req.body;

    // Validation
    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: 'Ad, email, telefon ve mesaj alanları gereklidir'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli bir email adresi giriniz'
      });
    }

    const newRequest = {
      id: contactRequests.length > 0 ? Math.max(...contactRequests.map(req => req.id)) + 1 : 1,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      service: service || 'genel',
      message: message.trim(),
      status: 'new',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    contactRequests.push(newRequest);

    res.status(201).json({
      success: true,
      message: 'Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.',
      data: {
        id: newRequest.id,
        name: newRequest.name,
        email: newRequest.email
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Mesaj gönderilirken hata oluştu'
    });
  }
});

// @route   GET /api/contact
// @desc    Get all contact requests
// @access  Private (Admin only)
router.get('/', authMiddleware, (req, res) => {
  try {
    const { status, service } = req.query;
    let filteredRequests = [...contactRequests];

    if (status) {
      filteredRequests = filteredRequests.filter(req => req.status === status);
    }

    if (service) {
      filteredRequests = filteredRequests.filter(req => req.service === service);
    }

    // Sort by creation date (newest first)
    filteredRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      data: filteredRequests,
      total: filteredRequests.length
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'İletişim talepleri alınırken hata oluştu'
    });
  }
});

// @route   GET /api/contact/:id
// @desc    Get single contact request
// @access  Private (Admin only)
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const request = contactRequests.find(req => req.id === parseInt(req.params.id));
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'İletişim talebi bulunamadı'
      });
    }

    res.json({
      success: true,
      data: request
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'İletişim talebi alınırken hata oluştu'
    });
  }
});

// @route   PUT /api/contact/:id
// @desc    Update contact request status
// @access  Private (Admin only)
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const { status, notes } = req.body;
    const requestIndex = contactRequests.findIndex(req => req.id === parseInt(req.params.id));

    if (requestIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'İletişim talebi bulunamadı'
      });
    }

    // Update fields
    if (status) contactRequests[requestIndex].status = status;
    if (notes !== undefined) contactRequests[requestIndex].notes = notes;
    contactRequests[requestIndex].updatedAt = new Date();

    res.json({
      success: true,
      message: 'İletişim talebi başarıyla güncellendi',
      data: contactRequests[requestIndex]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'İletişim talebi güncellenirken hata oluştu'
    });
  }
});

// @route   DELETE /api/contact/:id
// @desc    Delete contact request
// @access  Private (Admin only)
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const requestIndex = contactRequests.findIndex(req => req.id === parseInt(req.params.id));

    if (requestIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'İletişim talebi bulunamadı'
      });
    }

    contactRequests.splice(requestIndex, 1);

    res.json({
      success: true,
      message: 'İletişim talebi başarıyla silindi'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'İletişim talebi silinirken hata oluştu'
    });
  }
});

// @route   GET /api/contact/stats/overview
// @desc    Get contact statistics
// @access  Private (Admin only)
router.get('/stats/overview', authMiddleware, (req, res) => {
  try {
    const stats = {
      total: contactRequests.length,
      new: contactRequests.filter(req => req.status === 'new').length,
      contacted: contactRequests.filter(req => req.status === 'contacted').length,
      completed: contactRequests.filter(req => req.status === 'completed').length,
      services: {
        ev: contactRequests.filter(req => req.service === 'ev').length,
        isyeri: contactRequests.filter(req => req.service === 'isyeri').length,
        cevre: contactRequests.filter(req => req.service === 'cevre').length,
        genel: contactRequests.filter(req => req.service === 'genel').length
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