// models/Doctor.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const DoctorSchema = new mongoose.Schema(
  {
    hospitalId: { type: String, index: true },
    doctorId: { type: String, required: true, unique: true },
    name: String,
    qualification: String,
    speciality: String,
    experience: String,
    photoUrl: String,
    password: { type: String, default: 'test@123' },
    forcePasswordChange: { type: Boolean, default: true },
    availability: { type: String, enum: ['Available', 'Not Available'], default: 'Not Available' },
    shift: { type: String, enum: ['Morning', 'Afternoon', 'Evening', 'Night'], default: 'Morning' },
    attendance: [
      {
        date: { type: Date },
        status: { type: String, enum: ['Present', 'Absent'] },
        shift: { type: String, enum: ['Morning', 'Afternoon', 'Evening', 'Night'] },
        markedBy: { type: String, enum: ['Reception', 'Doctor'] }
      }
    ],
  },
  { timestamps: true }
);

DoctorSchema.pre('save', async function(next){
  if(!this.isModified('password')) return next();
  try{
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  }catch(err){ next(err); }
});

DoctorSchema.methods.comparePassword = function(candidate){
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('Doctor', DoctorSchema);


