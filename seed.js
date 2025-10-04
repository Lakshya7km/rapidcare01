require('dotenv').config();
const mongoose = require('mongoose');
const Hospital = require('./models/Hospital');
const Doctor = require('./models/Doctor');
const Bed = require('./models/Bed');
const Ambulance = require('./models/Ambulance');
const Attendance = require('./models/Attendance');
const bcrypt = require('bcrypt');

async function run(){
  if(!process.env.MONGO_URI){
    console.error('❌ ERROR: MONGO_URI is not defined in .env file');
    console.log('Current working directory:', process.cwd());
    console.log('Looking for .env file at:', require('path').join(process.cwd(), '.env'));
    process.exit(1);
  }
  console.log('🔗 Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGO_URI, {});
  console.log('✅ MongoDB Connected');

  await Promise.all([
    Hospital.deleteMany({}),
    Doctor.deleteMany({}),
    Bed.deleteMany({}),
    Ambulance.deleteMany({}),
    Attendance.deleteMany({}),
  ]);
  console.log('🗑️  Cleared existing data');

  // AIIMS Raipur
  const h1 = {
    hospitalId: 'CG04AIIMSRAIPUR',
    name: 'AIIMS Raipur',
    contact: '0771-2574021',
    address: { state: 'Chhattisgarh', district: 'Raipur', city: 'Raipur', street: 'GE Road, Tatibandh' },
    services: ['Emergency 24x7','OPD','IPD','Trauma Care','Ambulance Service'],
    facilities: ['ICU','NICU','PICU','Operation Theatre','Blood Bank','Pharmacy','Radiology','Laboratory'],
    tests: ['X-Ray','CT Scan','MRI','Ultrasound','ECG','Blood Tests','Pathology'],
    insurance: ['CGHS','ECHS','Ayushman Bharat','ESI','Private Insurance'],
    procedures: ['Angioplasty','Dialysis','Chemotherapy','Endoscopy','Bronchoscopy'],
    management: ['Government','AIIMS'],
    highlights: ['Super Specialty Hospital','Tertiary Care','Medical College','Research Institute'],
    treatment: ['Cardiology','Neurology','Oncology','Nephrology','Gastroenterology','Pulmonology'],
    surgery: ['Cardiac Surgery','Neurosurgery','Orthopedic Surgery','General Surgery','Plastic Surgery'],
    therapy: ['Physiotherapy','Occupational Therapy','Speech Therapy','Radiation Therapy'],
    password: await bcrypt.hash('test@1234', 10),
    forcePasswordChange: true
  };
  await Hospital.collection.insertOne(h1, { bypassDocumentValidation: true });

  // Apollo Hospital Bangalore
  const h2 = {
    hospitalId: 'KA01APOLLOBLR',
    name: 'Apollo Hospital Bangalore',
    contact: '080-26304050',
    address: { state: 'Karnataka', district: 'Bangalore Urban', city: 'Bangalore', street: 'Bannerghatta Road' },
    services: ['Emergency 24x7','OPD','IPD','International Patient Care','Health Checkup','Telemedicine'],
    facilities: ['ICU','CCU','NICU','Modular OT','Cath Lab','Pharmacy','Cafeteria','Parking'],
    tests: ['PET Scan','CT Scan','MRI','Digital X-Ray','Mammography','Bone Density','Lab Services'],
    insurance: ['Cashless TPA','Star Health','HDFC Ergo','ICICI Lombard','Max Bupa','Religare'],
    procedures: ['Robotic Surgery','Liver Transplant','Kidney Transplant','Bone Marrow Transplant','IVF'],
    management: ['Private','Apollo Hospitals Group'],
    highlights: ['JCI Accredited','NABH Accredited','500+ Bed Facility','International Standards'],
    treatment: ['Cardiology','Oncology','Neurology','Orthopedics','Gastroenterology','Urology','Nephrology'],
    surgery: ['Cardiac Surgery','Transplant Surgery','Minimally Invasive Surgery','Bariatric Surgery'],
    therapy: ['Chemotherapy','Radiation Therapy','Physiotherapy','Rehabilitation'],
    password: await bcrypt.hash('test@1234', 10),
    forcePasswordChange: true
  };
  await Hospital.collection.insertOne(h2, { bypassDocumentValidation: true });

  // Fortis Hospital Delhi
  const h3 = {
    hospitalId: 'DL07FORTISVASANT',
    name: 'Fortis Hospital Vasant Kunj',
    contact: '011-42776222',
    address: { state: 'Delhi', district: 'South Delhi', city: 'New Delhi', street: 'Sector B, Pocket 1, Aruna Asaf Ali Marg' },
    services: ['Emergency & Trauma','Critical Care','Day Care','Preventive Health','Home Care'],
    facilities: ['ICU','CCU','NICU','PICU','Modular OT','Blood Bank','Dialysis Unit','Pharmacy'],
    tests: ['CT Scan','MRI','PET CT','Digital X-Ray','Ultrasound','Echo','TMT','Holter'],
    insurance: ['Cashless','Star Health','Care Health','Bajaj Allianz','New India','United India'],
    procedures: ['Angioplasty','Pacemaker','Dialysis','Endoscopy','Colonoscopy','Laparoscopy'],
    management: ['Private','Fortis Healthcare'],
    highlights: ['NABH Accredited','NABL Accredited','Green OT','Advanced Technology'],
    treatment: ['Cardiology','Cardiac Sciences','Neurosciences','Orthopedics','Oncology','Gastroenterology'],
    surgery: ['Cardiac Surgery','Neuro Surgery','Joint Replacement','Spine Surgery','Cancer Surgery'],
    therapy: ['Physiotherapy','Cardiac Rehabilitation','Pulmonary Rehabilitation','Pain Management'],
    password: await bcrypt.hash('test@1234', 10),
    forcePasswordChange: true
  };
  await Hospital.collection.insertOne(h3, { bypassDocumentValidation: true });

  // Doctors for AIIMS Raipur
  const d1 = { hospitalId: 'CG04AIIMSRAIPUR', doctorId: 'CG0890', name: 'Dr. Lakshya Kumar Mandavi', qualification: 'MBBS, MS', speciality: 'Surgeon', experience: '5 years', password: await bcrypt.hash('test@123', 10), forcePasswordChange: true };
  const d2 = { hospitalId: 'CG04AIIMSRAIPUR', doctorId: 'CG0891', name: 'Dr. Priya Sharma', qualification: 'MBBS, MD', speciality: 'Cardiologist', experience: '8 years', password: await bcrypt.hash('test@123', 10), forcePasswordChange: true };
  const d3 = { hospitalId: 'CG04AIIMSRAIPUR', doctorId: 'CG0892', name: 'Dr. Rajesh Verma', qualification: 'MBBS, DM', speciality: 'Neurologist', experience: '12 years', password: await bcrypt.hash('test@123', 10), forcePasswordChange: true };
  
  // Doctors for Apollo Bangalore
  const d4 = { hospitalId: 'KA01APOLLOBLR', doctorId: 'KA1001', name: 'Dr. Suresh Kumar', qualification: 'MBBS, MD, DM', speciality: 'Oncologist', experience: '15 years', password: await bcrypt.hash('test@123', 10), forcePasswordChange: true };
  const d5 = { hospitalId: 'KA01APOLLOBLR', doctorId: 'KA1002', name: 'Dr. Meera Reddy', qualification: 'MBBS, MS', speciality: 'Orthopedic Surgeon', experience: '10 years', password: await bcrypt.hash('test@123', 10), forcePasswordChange: true };
  
  // Doctors for Fortis Delhi
  const d6 = { hospitalId: 'DL07FORTISVASANT', doctorId: 'DL2001', name: 'Dr. Amit Singh', qualification: 'MBBS, MD, DM', speciality: 'Cardiologist', experience: '18 years', password: await bcrypt.hash('test@123', 10), forcePasswordChange: true };
  
  await Doctor.collection.insertMany([d1, d2, d3, d4, d5, d6], { bypassDocumentValidation: true });

  // Ambulances for AIIMS Raipur
  const a1 = { hospitalId: 'CG04AIIMSRAIPUR', ambulanceId: '108AMB01', ambulanceNumber: 'CG04-1234', vehicleNumber: 'CG04AB1234', emt: { name: 'Ravi Kumar', mobile: '9876543210', emtId: 'EMT001' }, pilot: { name: 'Vikram Singh', mobile: '9876543211', pilotId: 'PIL001' }, password: await bcrypt.hash('test@1234', 10), forcePasswordChange: true, status: 'Offline' };
  const a2 = { hospitalId: 'CG04AIIMSRAIPUR', ambulanceId: '108AMB02', ambulanceNumber: 'CG04-5678', vehicleNumber: 'CG04CD5678', emt: { name: 'Suresh Yadav', mobile: '9876543212', emtId: 'EMT002' }, pilot: { name: 'Ramesh Patel', mobile: '9876543213', pilotId: 'PIL002' }, password: await bcrypt.hash('test@1234', 10), forcePasswordChange: true, status: 'Offline' };
  
  // Ambulances for Apollo Bangalore
  const a3 = { hospitalId: 'KA01APOLLOBLR', ambulanceId: 'KA108A01', ambulanceNumber: 'KA01-9876', vehicleNumber: 'KA01EF9876', emt: { name: 'Ganesh Naik', mobile: '9988776655', emtId: 'EMT101' }, pilot: { name: 'Krishna Rao', mobile: '9988776656', pilotId: 'PIL101' }, password: await bcrypt.hash('test@1234', 10), forcePasswordChange: true, status: 'Offline' };
  
  // Ambulances for Fortis Delhi
  const a4 = { hospitalId: 'DL07FORTISVASANT', ambulanceId: 'DL102A01', ambulanceNumber: 'DL07-4321', vehicleNumber: 'DL07GH4321', emt: { name: 'Manoj Kumar', mobile: '9911223344', emtId: 'EMT201' }, pilot: { name: 'Sanjay Gupta', mobile: '9911223345', pilotId: 'PIL201' }, password: await bcrypt.hash('test@1234', 10), forcePasswordChange: true, status: 'Offline' };
  
  await Ambulance.collection.insertMany([a1, a2, a3, a4], { bypassDocumentValidation: true });

  // Beds for AIIMS Raipur
  const beds = [];
  for(let i=1;i<=15;i++){
    const bedNumber = String(i).padStart(2,'0');
    const bedType = i<=3 ? 'ICU' : i<=6 ? 'Private' : 'General';
    beds.push({ hospitalId: 'CG04AIIMSRAIPUR', bedId: `CG04AIIMSRAIPUR-W1-B${bedNumber}`, bedNumber, wardNumber: '1', bedType, status: i%4===0 ? 'Occupied' : 'Vacant' });
  }
  
  // Beds for Apollo Bangalore
  for(let i=1;i<=12;i++){
    const bedNumber = String(i).padStart(2,'0');
    const bedType = i<=2 ? 'ICU' : i<=5 ? 'Private' : 'General';
    beds.push({ hospitalId: 'KA01APOLLOBLR', bedId: `KA01APOLLOBLR-W1-B${bedNumber}`, bedNumber, wardNumber: '1', bedType, status: i%3===0 ? 'Occupied' : 'Vacant' });
  }
  
  // Beds for Fortis Delhi
  for(let i=1;i<=10;i++){
    const bedNumber = String(i).padStart(2,'0');
    const bedType = i<=2 ? 'ICU' : i<=4 ? 'Private' : 'General';
    beds.push({ hospitalId: 'DL07FORTISVASANT', bedId: `DL07FORTISVASANT-W1-B${bedNumber}`, bedNumber, wardNumber: '1', bedType, status: i%3===0 ? 'Occupied' : 'Vacant' });
  }
  
  await Bed.collection.insertMany(beds, { bypassDocumentValidation: true });

  console.log('✅ Database seeded successfully with Indian hospital data!');
  await mongoose.disconnect();
  
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║              🏥 RAPIDCARE - TEST CREDENTIALS 🏥                ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
  
  console.log('🏥 HOSPITAL/RECEPTION LOGIN:');
  console.log('─────────────────────────────────────────────────────────────────');
  console.log('1. AIIMS Raipur');
  console.log('   Username: CG04AIIMSRAIPUR');
  console.log('   Password: test@1234');
  console.log('   Location: Raipur, Chhattisgarh\n');
  
  console.log('2. Apollo Hospital Bangalore');
  console.log('   Username: KA01APOLLOBLR');
  console.log('   Password: test@1234');
  console.log('   Location: Bangalore, Karnataka\n');
  
  console.log('3. Fortis Hospital Vasant Kunj');
  console.log('   Username: DL07FORTISVASANT');
  console.log('   Password: test@1234');
  console.log('   Location: New Delhi, Delhi\n');
  
  console.log('👨‍⚕️ DOCTOR LOGIN:');
  console.log('─────────────────────────────────────────────────────────────────');
  console.log('AIIMS Raipur Doctors:');
  console.log('   CG0890 - Dr. Lakshya Kumar Mandavi (Surgeon) - Password: test@123');
  console.log('   CG0891 - Dr. Priya Sharma (Cardiologist) - Password: test@123');
  console.log('   CG0892 - Dr. Rajesh Verma (Neurologist) - Password: test@123\n');
  
  console.log('Apollo Bangalore Doctors:');
  console.log('   KA1001 - Dr. Suresh Kumar (Oncologist) - Password: test@123');
  console.log('   KA1002 - Dr. Meera Reddy (Orthopedic Surgeon) - Password: test@123\n');
  
  console.log('Fortis Delhi Doctors:');
  console.log('   DL2001 - Dr. Amit Singh (Cardiologist) - Password: test@123\n');
  
  console.log('🚑 AMBULANCE LOGIN (EMT/Pilot):');
  console.log('─────────────────────────────────────────────────────────────────');
  console.log('AIIMS Raipur Ambulances:');
  console.log('   108AMB01 - Password: test@1234');
  console.log('   └─ EMT: EMT001 (Ravi Kumar) | Pilot: PIL001 (Vikram Singh)');
  console.log('   108AMB02 - Password: test@1234');
  console.log('   └─ EMT: EMT002 (Suresh Yadav) | Pilot: PIL002 (Ramesh Patel)\n');
  
  console.log('Apollo Bangalore Ambulances:');
  console.log('   KA108A01 - Password: test@1234');
  console.log('   └─ EMT: EMT101 (Ganesh Naik) | Pilot: PIL101 (Krishna Rao)\n');
  
  console.log('Fortis Delhi Ambulances:');
  console.log('   DL102A01 - Password: test@1234');
  console.log('   └─ EMT: EMT201 (Manoj Kumar) | Pilot: PIL201 (Sanjay Gupta)\n');
  
  console.log('🌐 ACCESS URLS:');
  console.log('─────────────────────────────────────────────────────────────────');
  console.log('Main Dashboard:    http://localhost:5000');
  console.log('Public Portal:     http://localhost:5000/public.html');
  console.log('Reception Portal:  http://localhost:5000/reception.html');
  console.log('Doctor Portal:     http://localhost:5000/doctor.html');
  console.log('Ambulance Portal:  http://localhost:5000/ambulance.html');
  console.log('\n═════════════════════════════════════════════════════════════════\n');
}

run().catch(e=>{ console.error(e); process.exit(1); });


