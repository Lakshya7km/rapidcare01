// models/Ambulance.js
const mongoose = require('mongoose');
// simplified: store plaintext password for now (no hashing)

const AmbulanceSchema = new mongoose.Schema(
  {
    hospitalId: { type: String, index: true },
    ambulanceId: { type: String, required: true, unique: true },
    ambulanceNumber: { type: String, required: true },
    vehicleNumber: { type: String, default: '' },
    pilot: {
      name: String,
      mobile: String,
      pilotId: String,
    },
    emt: {
      name: String,
      mobile: String,
      emtId: String,
    },
    password: { type: String, default: 'test@1234' },
    forcePasswordChange: { type: Boolean, default: true },
    status: { type: String, enum: ['On Duty', 'Offline', 'In Transit'], default: 'Offline' },
    location: { lat: Number, lng: Number },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

AmbulanceSchema.methods.comparePassword = function(candidate){
  return candidate === this.password;
};

module.exports = mongoose.model('Ambulance', AmbulanceSchema);


