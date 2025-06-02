const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillController');
const upload = require('../middleware/upload');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Wrapper for handling file upload errors
const uploadMiddleware = (req, res, next) => {
    upload.single('certificateFile')(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                error: 'File upload error',
                message: err.message
            });
        }
        next();
    });
};

// Get all pending skills - Must be before the :employeeId route
router.get('/pending', protect, authorizeRoles('hr', 'verifier'), skillController.getPendingSkills);

// Approve/Reject routes
router.patch('/:id/approve', protect, authorizeRoles('hr', 'verifier'), skillController.approveSkill);
router.patch('/:id/reject', protect, authorizeRoles('hr', 'verifier'), skillController.rejectSkill);

// Regular CRUD routes
router.get('/:employeeId', protect, skillController.getSkills);
router.post('/', protect, uploadMiddleware, skillController.addSkill);
router.put('/:id', protect, uploadMiddleware, skillController.updateSkill);
router.delete('/:id', protect, skillController.deleteSkill);

module.exports = router;
