// models/Doctor.js
const mongoose = require('mongoose');
// simplified: store plaintext password for now (no hashing)

const DoctorSchema = new mongoose.Schema(
  {
    hospitalId: { type: String, index: true },
    doctorId: { type: String, required: true, unique: true },
    name: String,
    qualification: String,
    speciality: String,
    experience: String,
    photoUrl: String,
    password: { type: String, default: 'test@1234' },
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

DoctorSchema.methods.comparePassword = function(candidate){
  return candidate === this.password;
};

module.exports = mongoose.model('Doctor', DoctorSchema);


