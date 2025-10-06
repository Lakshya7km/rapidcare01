// Reset database route
const Hospital = require('../models/Hospital');
const Doctor = require('../models/Doctor');
const Bed = require('../models/Bed');
const Ambulance = require('../models/Ambulance');
const Attendance = require('../models/Attendance');
const EmergencyRequest = require('../models/EmergencyRequest');
// simplified: no hashing in reset

module.exports = (io) => {
  const router = require('express').Router();

  // Reset database endpoint
  router.post('/', async (req, res) => {
    try {
      console.log('🔄 Starting database reset...');
      
      // Clear all existing data
      await Promise.all([
        Hospital.deleteMany({}),
        Doctor.deleteMany({}),
        Bed.deleteMany({}),
        Ambulance.deleteMany({}),
        Attendance.deleteMany({}),
        EmergencyRequest.deleteMany({})
      ]);
      console.log('🗑️  Cleared existing data');

      // Create dummy hospitals
      const hospitals = [
        {
          hospitalId: 'HOSP001',
          name: 'RapidCare General Hospital',
          contact: '9999999999',
          address: { 
            state: 'Chhattisgarh', 
            district: 'Raipur', 
            city: 'Raipur', 
            street: 'MG Road' 
          },
          services: ['Emergency', 'OPD', 'Surgery'],
          facilities: ['Pharmacy', 'ICU', 'Radiology', 'Laboratory'],
          insurance: ['ABC Health', 'XYZ Insure', 'MediCare'],
          treatment: ['Cardiology', 'Orthopedics', 'Neurology', 'Pediatrics'],
          surgery: ['Appendectomy', 'Gallbladder', 'Hernia'],
          therapy: ['Physiotherapy', 'Occupational Therapy'],
          password: 'test@1234',
          forcePasswordChange: true
        },
        {
          hospitalId: 'HOSP002',
          name: 'City Multispeciality Hospital',
          contact: '8888888888',
          address: { 
            state: 'Chhattisgarh', 
            district: 'Raipur', 
            city: 'Naya Raipur', 
            street: 'Sector 21' 
          },
          services: ['Emergency', 'Diagnostics', 'Surgery'],
          facilities: ['Radiology', 'ICU', 'Laboratory', 'Pharmacy'],
          insurance: ['ABC Health', 'MediCare'],
          treatment: ['Neurology', 'Cardiology', 'Oncology'],
          surgery: ['Bypass', 'Brain Surgery', 'Cancer Surgery'],
          therapy: ['Occupational', 'Speech Therapy'],
          password: 'test@1234',
          forcePasswordChange: true
        },
        {
          hospitalId: 'HOSP003',
          name: 'Raipur Medical Center',
          contact: '7777777777',
          address: { 
            state: 'Chhattisgarh', 
            district: 'Raipur', 
            city: 'Raipur', 
            street: 'Civil Lines' 
          },
          services: ['Emergency', 'OPD', 'Maternity'],
          facilities: ['ICU', 'NICU', 'Laboratory', 'Pharmacy'],
          insurance: ['XYZ Insure', 'MediCare', 'Health Plus'],
          treatment: ['Gynecology', 'Pediatrics', 'General Medicine'],
          surgery: ['C-Section', 'Hysterectomy', 'Appendectomy'],
          therapy: ['Physiotherapy', 'Occupational Therapy'],
          password: 'test@1234',
          forcePasswordChange: true
        }
      ];

      await Hospital.collection.insertMany(hospitals, { bypassDocumentValidation: true });
      console.log(`✅ Created ${hospitals.length} hospitals`);

      // Create dummy doctors
      const doctors = [
        { 
          hospitalId: 'HOSP001', 
          doctorId: 'DOC100', 
          name: 'Dr. A Sharma', 
          qualification: 'MBBS, MD', 
          speciality: 'Cardiology', 
          experience: '10 yrs',
          photoUrl: '',
          password: 'test@1234', 
          forcePasswordChange: true,
          availability: 'Available',
          shift: 'Morning'
        },
        { 
          hospitalId: 'HOSP001', 
          doctorId: 'DOC101', 
          name: 'Dr. B Verma', 
          qualification: 'MBBS, MS', 
          speciality: 'Orthopedics', 
          experience: '7 yrs',
          photoUrl: '',
          password: 'test@1234', 
          forcePasswordChange: true,
          availability: 'Available',
          shift: 'Afternoon'
        },
        { 
          hospitalId: 'HOSP002', 
          doctorId: 'DOC102', 
          name: 'Dr. C Patel', 
          qualification: 'MBBS, MD', 
          speciality: 'Neurology', 
          experience: '12 yrs',
          photoUrl: '',
          password: 'test@1234', 
          forcePasswordChange: true,
          availability: 'Not Available',
          shift: 'Evening'
        },
        { 
          hospitalId: 'HOSP003', 
          doctorId: 'DOC103', 
          name: 'Dr. D Singh', 
          qualification: 'MBBS, MS', 
          speciality: 'Gynecology', 
          experience: '8 yrs',
          photoUrl: '',
          password: 'test@1234', 
          forcePasswordChange: true,
          availability: 'Available',
          shift: 'Morning'
        }
      ];
      await Doctor.collection.insertMany(doctors, { bypassDocumentValidation: true });
      console.log(`✅ Created ${doctors.length} doctors`);

      // Create dummy ambulances
      const ambulances = [
        { 
          hospitalId: 'HOSP001', 
          ambulanceId: 'AMB001', 
          ambulanceNumber: 'CG04-1234', 
          vehicleNumber: 'CG04-1234', 
          emt: { name: 'Ravi Kumar', mobile: '9000000001', emtId: 'EMT01' }, 
          pilot: { name: 'Vikram Singh', mobile: '9000000002', pilotId: 'PIL01' }, 
          password: await bcrypt.hash('test@1234', 10), 
          forcePasswordChange: true,
          status: 'On Duty'
        },
        { 
          hospitalId: 'HOSP002', 
          ambulanceId: 'AMB002', 
          ambulanceNumber: 'CG04-5678', 
          vehicleNumber: 'CG04-5678', 
          emt: { name: 'Suresh Yadav', mobile: '9000000003', emtId: 'EMT02' }, 
          pilot: { name: 'Rajesh Kumar', mobile: '9000000004', pilotId: 'PIL02' }, 
          password: await bcrypt.hash('test@1234', 10), 
          forcePasswordChange: true,
          status: 'Offline'
        }
      ];
      await Ambulance.collection.insertMany(ambulances, { bypassDocumentValidation: true });
      console.log(`✅ Created ${ambulances.length} ambulances`);

      // Create dummy beds for each hospital
      const beds = [];
      const hospitalsForBeds = ['HOSP001', 'HOSP002', 'HOSP003'];
      
      hospitalsForBeds.forEach(hospitalId => {
        // ICU beds
        for(let i = 1; i <= 3; i++) {
          const bedNumber = String(i).padStart(2, '0');
          beds.push({
            hospitalId,
            bedId: `${hospitalId}-ICU-B${bedNumber}`,
            bedNumber,
            wardNumber: 'ICU',
            bedType: 'ICU',
            status: i % 2 === 0 ? 'Occupied' : 'Vacant'
          });
        }
        
        // General beds
        for(let i = 1; i <= 10; i++) {
          const bedNumber = String(i).padStart(2, '0');
          beds.push({
            hospitalId,
            bedId: `${hospitalId}-W1-B${bedNumber}`,
            bedNumber,
            wardNumber: '1',
            bedType: 'General',
            status: i % 3 === 0 ? 'Occupied' : 'Vacant'
          });
        }
      });
      
      await Bed.collection.insertMany(beds, { bypassDocumentValidation: true });
      console.log(`✅ Created ${beds.length} beds`);

      // Create some sample attendance records
      const attendanceRecords = [
        {
          doctorId: 'DOC100',
          date: new Date(),
          availability: 'Present',
          shift: 'Morning'
        },
        {
          doctorId: 'DOC101',
          date: new Date(),
          availability: 'Present',
          shift: 'Afternoon'
        }
      ];
      await Attendance.collection.insertMany(attendanceRecords, { bypassDocumentValidation: true });
      console.log(`✅ Created ${attendanceRecords.length} attendance records`);

      // Emit reset completion event
      io.emit('database:reset', {
        message: 'Database has been reset with fresh dummy data',
        timestamp: new Date(),
        counts: {
          hospitals: hospitals.length,
          doctors: doctors.length,
          ambulances: ambulances.length,
          beds: beds.length,
          attendance: attendanceRecords.length
        }
      });

      res.json({
        success: true,
        message: 'Database reset successfully',
        counts: {
          hospitals: hospitals.length,
          doctors: doctors.length,
          ambulances: ambulances.length,
          beds: beds.length,
          attendance: attendanceRecords.length
        }
      });

    } catch (error) {
      console.error('❌ Database reset failed:', error);
      res.status(500).json({
        success: false,
        message: 'Database reset failed',
        error: error.message
      });
    }
  });

  return router;
};

