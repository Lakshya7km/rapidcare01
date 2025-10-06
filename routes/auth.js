// routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const Hospital = require('../models/Hospital');
const Doctor = require('../models/Doctor');
const Ambulance = require('../models/Ambulance');

const router = express.Router();

function signToken(payload){
  return jwt.sign(payload, process.env.JWT_SECRET || 'devsecret', { expiresIn: '12h' });
}

router.post('/login', async (req,res) => {
  try{
    let { role, username, password } = req.body;
    role = (role||'').trim().toLowerCase();
    username = (username||'').trim();
    password = password || '';
    let user = null;
    if(role === 'hospital'){
      user = await Hospital.findOne({ hospitalId: { $regex: `^${username}$`, $options: 'i' } });
    } else if(role === 'doctor'){
      user = await Doctor.findOne({ doctorId: { $regex: `^${username}$`, $options: 'i' } });
    } else if(role === 'ambulance'){
      const rx = { $regex: `^${username}$`, $options: 'i' };
      user = await Ambulance.findOne({ $or: [{ 'emt.emtId': rx }, { 'pilot.pilotId': rx }, { ambulanceId: rx }] });
    } else {
      return res.status(400).json({ message: 'Invalid role' });
    }
    if(!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await user.comparePassword(password);
    if(!ok) return res.status(401).json({ message: 'Invalid credentials' });
    
    // Update last login for ambulance
    if(role === 'ambulance'){
      user.lastLogin = new Date();
      user.status = 'On Duty'; // Set to active on login
      await user.save();
    }
    
    const token = signToken({ role, id: user._id, ref: username });
    
    // Return user data for login
    if(role === 'ambulance') {
      res.json({ token, forcePasswordChange: !!user.forcePasswordChange, ambulance: user });
    } else if(role === 'doctor') {
      res.json({ token, forcePasswordChange: !!user.forcePasswordChange, doctor: user });
    } else {
      res.json({ token, forcePasswordChange: !!user.forcePasswordChange });
    }
  }catch(err){ res.status(500).json({ message: err.message }); }
});

router.post('/change-password', async (req,res) => {
  try{
    const { role, username, newPassword } = req.body;
    let Model = null, filter = {};
    if(role === 'hospital'){ Model = Hospital; filter = { hospitalId: username }; }
    if(role === 'doctor'){ Model = Doctor; filter = { doctorId: username }; }
    if(role === 'ambulance'){ Model = Ambulance; filter = { $or: [{ 'emt.emtId': username }, { 'pilot.pilotId': username }, { ambulanceId: username }] }; }
    if(!Model) return res.status(400).json({ message: 'Invalid role' });
    const doc = await Model.findOne(filter);
    if(!doc) return res.status(404).json({ message: 'Not found' });
    doc.password = newPassword;
    doc.forcePasswordChange = false;
    await doc.save();
    res.json({ success: true });
  }catch(err){ res.status(500).json({ message: err.message }); }
});

module.exports = (io) => router;





