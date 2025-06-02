const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const employeeRoutes = require('./routes/employeeRoutes');
const authRoutes = require('./routes/authRoutes');
const skillRoutes = require('./routes/skillRoutes');
const projectRoutes = require('./routes/projectRoutes');
const app = express();
const PORT = process.env.PORT||5000;
const path = require('path');
const multer = require('multer');

//Middleware
app.use(cors());
app.use(express.json());

// Error handling middleware for Multer
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({
            error: 'File upload error',
            message: err.message
        });
    } else if (err) {
        return res.status(500).json({
            error: 'Server error',
            message: err.message
        });
    }
    next();
});

//Default Route
app.use('/api/employees',employeeRoutes);
app.use('/api/auth',authRoutes);
app.use('/uploads',express.static(path.join(__dirname,'uploads'))); //serve cert files
//skill Routes
app.use('/api/skills',skillRoutes);
//project Routes
app.use('/api/projects', projectRoutes);

//MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/employeeDB')
    .then(() => {
        console.log('MongoDB connected');
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => {
        console.error("Error connecting to MongoDB:", err);
    });
