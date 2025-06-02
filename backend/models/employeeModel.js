const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['employee', 'verifier', 'hr', 'admin'],
    required: true,
  },
  skills: {
    type: [mongoose.Schema.Types.ObjectId],
    ref:'Skill',
    default: [],
  },
  experience: {
    type: Number,
    default: 0,  // ✅ Changed from '' to 0 (must match type: Number)
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
}, {
  timestamps: true // ✅ Adds createdAt and updatedAt fields automatically
});

// ✅ Hash password before saving
employeeSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const Employee = mongoose.model('Employee', employeeSchema);
module.exports = Employee;
