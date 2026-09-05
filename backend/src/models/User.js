/**
 * User.js
 * ------------------------------------------------------------------
 * A worker/admin account that can log into the app. Passwords are
 * hashed with bcrypt before saving; comparePassword() is used by the
 * login controller to verify a plaintext password against the hash.
 * ------------------------------------------------------------------
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['admin', 'worker'], default: 'worker' },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function comparePassword(plainText) {
  return bcrypt.compare(plainText, this.password);
};

module.exports = mongoose.model('User', userSchema);
