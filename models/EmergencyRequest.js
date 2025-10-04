// models/EmergencyRequest.js
const mongoose = require('mongoose');

const EmergencySchema = new mongoose.Schema(
  {
    patient: {
      name: String,
      age: Number,
      gender: String,
      symptoms: String,
      emergencyType: String,
      contactMobile: String,
      contactAddress: String,
    },
    hospitalId: { type: String, index: true },
    ambulanceId: String,
    readyEquipment: String,
    status: { type: String, enum: ['Pending', 'Accepted', 'Denied', 'Transferred', 'Handled'], default: 'Pending' },
    reason: String,
    alternateHospitals: [String],
    selectedHospital: String,
    submittedBy: { type: String, enum: ['public', 'ambulance'], required: true },
    handledBy: String,
    // EMT and Pilot information (auto-attached from ambulance login)
    emtName: String,
    emtId: String,
    emtMobile: String,
    pilotName: String,
    pilotId: String,
    pilotMobile: String,
    remarks: String,
    rejectionReason: String,
    assisted: { type: Boolean, default: false },
    assistedComment: String,
    handled: { type: Boolean, default: false },
    handledAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('EmergencyRequest', EmergencySchema);


