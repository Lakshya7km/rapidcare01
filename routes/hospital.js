// routes/hospital.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Hospital = require('../models/Hospital');
const { auth } = require('../middleware/auth');

module.exports = (io) => {
  // List hospitals with optional filters
  router.get('/', async (req, res) => {
    try {
      const { state, district, city, facilities, treatment, therapy, surgery, insurance } = req.query;
      const query = {};
      if (state) query['address.state'] = state;
      if (district) query['address.district'] = district;
      if (city) query['address.city'] = city;
      const arrFilters = [
        { key: 'facilities', value: facilities },
        { key: 'treatment', value: treatment },
        { key: 'therapy', value: therapy },
        { key: 'surgery', value: surgery },
        { key: 'insurance', value: insurance },
      ];
      for (const f of arrFilters) {
        if (f.value) query[f.key] = { $in: Array.isArray(f.value) ? f.value : [f.value] };
      }
      const hospitals = await Hospital.find(query).sort({ name: 1 });
      res.json(hospitals);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, '..', 'uploads', 'gallery'));
    },
    filename: function (req, file, cb) {
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, unique + path.extname(file.originalname));
    },
  });
  const upload = multer({ storage });

  router.post('/', async (req, res) => {
    try {
      const payload = req.body;
      const h = new Hospital(payload);
      await h.save();
      res.json({ success: true, hospital: h });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  });

  router.get('/:hospitalId', async (req, res) => {
    try {
      const hospital = await Hospital.findOne({ hospitalId: req.params.hospitalId });
      if (!hospital) return res.status(404).json({ message: 'Not found' });
      res.json(hospital);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  router.put('/:hospitalId', auth(['hospital']), async (req, res) => {
    try {
      const updates = req.body;
      updates.updatedAt = new Date();
      const updated = await Hospital.findOneAndUpdate(
        { hospitalId: req.params.hospitalId },
        { $set: updates },
        { new: true, upsert: false }
      );
      res.json({ success: true, hospital: updated });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  });

  router.post('/:hospitalId/gallery', auth(['hospital']), upload.array('gallery', 12), async (req, res) => {
    try {
      const files = req.files.map((f) => `/uploads/gallery/${f.filename}`);
      const updated = await Hospital.findOneAndUpdate(
        { hospitalId: req.params.hospitalId },
        { $push: { gallery: { $each: files } } },
        { new: true }
      );
      res.json({ success: true, gallery: updated.gallery });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  router.delete('/:hospitalId/gallery', auth(['hospital']), async (req, res) => {
    try {
      const { items } = req.body;
      const updated = await Hospital.findOneAndUpdate(
        { hospitalId: req.params.hospitalId },
        { $pull: { gallery: { $in: items } } },
        { new: true }
      );
      res.json({ success: true, gallery: updated.gallery });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Generate hospital-wide attendance QR codes (one-time)
  router.post('/:hospitalId/attendance-qr', auth(['hospital']), async (req, res) => {
    try {
      const hospital = await Hospital.findOne({ hospitalId: req.params.hospitalId });
      if (!hospital) return res.status(404).json({ message: 'Hospital not found' });
      
      // Check if QR already generated
      if (hospital.attendanceQR?.presentQR && hospital.attendanceQR?.absentQR) {
        return res.status(400).json({ message: 'QR codes already generated for this hospital' });
      }

      const QRCode = require('qrcode');
      const fs = require('fs');
      const qrDir = path.join(__dirname, '..', 'uploads', 'qr');
      if (!fs.existsSync(qrDir)) fs.mkdirSync(qrDir, { recursive: true });

      const base = process.env.BASE_URL || 'http://localhost:5000';
      const presentUrl = `${base}/api/hospital/${req.params.hospitalId}/attendance-scan?type=Present`;
      const absentUrl = `${base}/api/hospital/${req.params.hospitalId}/attendance-scan?type=Absent`;

      const presentPath = path.join(qrDir, `present_${req.params.hospitalId}.png`);
      const absentPath = path.join(qrDir, `absent_${req.params.hospitalId}.png`);

      await QRCode.toFile(presentPath, presentUrl);
      await QRCode.toFile(absentPath, absentUrl);

      hospital.attendanceQR = {
        presentQR: `/uploads/qr/present_${req.params.hospitalId}.png`,
        absentQR: `/uploads/qr/absent_${req.params.hospitalId}.png`,
        generatedAt: new Date()
      };
      await hospital.save();

      res.json({ 
        success: true, 
        presentQR: hospital.attendanceQR.presentQR, 
        absentQR: hospital.attendanceQR.absentQR 
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Print attendance QR PDF (variant 1)
  router.get('/:hospitalId/attendance-qr-pdf', auth(['hospital']), async (req, res) => {
    try {
      const hospital = await Hospital.findOne({ hospitalId: req.params.hospitalId });
      if (!hospital || !hospital.attendanceQR?.presentQR) {
        return res.status(404).send('QR codes not generated yet');
      }

      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="attendance_qr_${req.params.hospitalId}.pdf"`);
      doc.pipe(res);

      doc.fontSize(24).text(`${hospital.name || req.params.hospitalId}`, { align: 'center' });
      doc.fontSize(16).text('Doctor Attendance QR Codes', { align: 'center' });
      doc.moveDown(2);

      const root = path.join(__dirname, '..');
      const presentPath = path.join(root, hospital.attendanceQR.presentQR.replace('/uploads', 'uploads'));
      const absentPath = path.join(root, hospital.attendanceQR.absentQR.replace('/uploads', 'uploads'));

      const qrSize = 200;
      const x1 = 100, x2 = 320, y = 200;

      if (fs.existsSync(presentPath)) {
        doc.image(presentPath, x1, y, { width: qrSize });
        doc.fontSize(14).text('PRESENT', x1, y + qrSize + 10, { width: qrSize, align: 'center' });
      }

      if (fs.existsSync(absentPath)) {
        doc.image(absentPath, x2, y, { width: qrSize });
        doc.fontSize(14).text('ABSENT', x2, y + qrSize + 10, { width: qrSize, align: 'center' });
      }

      doc.moveDown(3);
      doc.fontSize(12).text('Instructions:', { underline: true });
      doc.fontSize(10).text('1. Scan the PRESENT QR when entering the hospital');
      doc.fontSize(10).text('2. Scan the ABSENT QR when leaving or if absent');
      doc.fontSize(10).text('3. QR codes are valid for all doctors in this hospital');

      doc.end();
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // Scan attendance QR (hospital-wide)
  router.get('/:hospitalId/attendance-scan', async (req, res) => {
    try {
      const { type, doctorId } = req.query;
      if (!['Present', 'Absent'].includes(type)) {
        // Return HTML form for doctor to enter their ID
        return res.send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Doctor Attendance</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { font-family: Arial, sans-serif; max-width: 400px; margin: 50px auto; padding: 20px; }
              .form-group { margin: 15px 0; }
              label { display: block; margin-bottom: 5px; font-weight: bold; }
              input, select { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
              button { background: #007bff; color: white; padding: 12px 20px; border: none; border-radius: 4px; width: 100%; cursor: pointer; }
              button:hover { background: #0056b3; }
              .error { color: red; margin-top: 10px; }
              .success { color: green; margin-top: 10px; }
            </style>
          </head>
          <body>
            <h2>Doctor Attendance - ${req.params.hospitalId}</h2>
            <p>Please enter your Doctor ID and select attendance type:</p>
            <form onsubmit="markAttendance(event)">
              <div class="form-group">
                <label>Doctor ID:</label>
                <input type="text" id="doctorId" required placeholder="Enter your Doctor ID" />
              </div>
              <div class="form-group">
                <label>Attendance:</label>
                <select id="type" required>
                  <option value="">Select attendance type</option>
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>
              <div class="form-group">
                <label>Shift:</label>
                <select id="shift" required>
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Evening">Evening</option>
                  <option value="Night">Night</option>
                </select>
              </div>
              <button type="submit">Mark Attendance</button>
            </form>
            <div id="message"></div>
            
            <script>
              async function markAttendance(event) {
                event.preventDefault();
                const doctorId = document.getElementById('doctorId').value;
                const type = document.getElementById('type').value;
                const shift = document.getElementById('shift').value;
                const messageDiv = document.getElementById('message');
                
                try {
                  const response = await fetch('/api/doctors/attendance', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      doctorId: doctorId,
                      date: new Date().toISOString().split('T')[0],
                      availability: type,
                      shift: shift,
                      markedBy: 'Doctor'
                    })
                  });
                  
                  const result = await response.json();
                  
                  if (result.success) {
                    messageDiv.innerHTML = '<div class="success">✅ Attendance marked successfully!</div>';
                    document.querySelector('form').reset();
                  } else {
                    messageDiv.innerHTML = '<div class="error">❌ Error: ' + (result.message || 'Failed to mark attendance') + '</div>';
                  }
                } catch (error) {
                  messageDiv.innerHTML = '<div class="error">❌ Error: ' + error.message + '</div>';
                }
              }
            </script>
          </body>
          </html>
        `);
      }
      
      if (!doctorId) {
        return res.status(400).json({ message: 'Doctor ID required' });
      }

      const Attendance = require('../models/Attendance');
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const att = await Attendance.findOneAndUpdate(
        { doctorId, date: today },
        { $set: { availability: type, markedBy: 'Doctor', method: 'QR' } },
        { upsert: true, new: true }
      );

      res.json({ success: true, attendance: att });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // NOTE: Duplicate handler removed. Single attendance-qr-pdf route is defined above.

  return router;
};


