#!/usr/bin/env node
// E2E smoke test for RapidCare key flows

const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;

const HOSPITAL_ID = process.env.HOSPITAL_ID || 'CG04AIIMSRAIPUR';
const HOSPITAL_PASSWORD = process.env.HOSPITAL_PASSWORD || 'test@1234';
const DOCTOR_ID = process.env.DOCTOR_ID || 'CG0890';
const DOCTOR_PASSWORD = process.env.DOCTOR_PASSWORD || 'test@1234';
const AMBULANCE_USERNAME = process.env.AMBULANCE_USERNAME || '108AMB01';
const AMBULANCE_PASSWORD = process.env.AMBULANCE_PASSWORD || 'test@1234';

/**
 * Minimal fetch wrapper with JSON handling and Bearer token support
 */
async function request(path, { method = 'GET', token, body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(BASE_URL + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = text ? JSON.parse(text) : {}; } catch (e) { json = { raw: text }; }
  if (!res.ok) {
    const msg = json && (json.message || json.error) ? (json.message || json.error) : `HTTP ${res.status}`;
    throw new Error(`${method} ${path} -> ${msg}`);
  }
  return json;
}

function logStep(label) { console.log(`\n=== ${label} ===`); }

async function login(role, username, password){
  const data = await request('/api/auth/login', { method:'POST', body: { role, username, password } });
  return data; // { token, forcePasswordChange, ... }
}

async function run(){
  const summary = { steps: [], ok: 0, fail: 0 };
  const record = (name, ok, extra) => { summary.steps.push({ name, ok, extra }); ok ? summary.ok++ : summary.fail++; };

  try {
    logStep('Public: list hospitals');
    const hospitals = await request('/api/hospital');
    record('List hospitals', Array.isArray(hospitals) && hospitals.length > 0, { count: hospitals.length });

    const targetHospitalId = HOSPITAL_ID;

    logStep('Public: submit emergency to selected hospital');
    const emPublic = await request('/api/emergency/public', {
      method: 'POST',
      body: {
        hospitalId: targetHospitalId,
        patient: {
          name: 'Test Patient',
          age: 30,
          gender: 'Male',
          symptoms: 'Chest pain',
          emergencyType: 'Cardiac',
          contactMobile: '9999999999',
          contactAddress: 'Test Address'
        },
        status: 'Pending'
      }
    });
    record('Public emergency submission', emPublic && emPublic.success === true, { id: emPublic?.emergency?._id });

    const publicEmergencyId = emPublic?.emergency?._id;

    logStep('Hospital: login');
    const hLogin = await login('hospital', targetHospitalId, HOSPITAL_PASSWORD);
    const hospitalToken = hLogin.token;
    record('Hospital login', Boolean(hospitalToken));

    logStep('Reception: get beds list');
    const bedsBefore = await request(`/api/beds/${targetHospitalId}`, { token: hospitalToken });
    record('Beds fetched', Array.isArray(bedsBefore));

    logStep('Reception: create one test bed');
    const wardNumber = '99';
    const createBedsResp = await request('/api/beds', {
      method: 'POST',
      token: hospitalToken,
      body: { hospitalId: targetHospitalId, wardNumber, bedType: 'General', start: 1, end: 1 }
    });
    const createdBed = (createBedsResp.created || [])[0];
    record('Create bed', Boolean(createdBed), { bedId: createdBed?.bedId });

    if (createdBed) {
      logStep('Reception: toggle bed status');
      const newStatus = createdBed.status === 'Vacant' ? 'Occupied' : 'Vacant';
      const upd = await request(`/api/beds/${createdBed.bedId}`, { method: 'PUT', token: hospitalToken, body: { status: newStatus } });
      record('Update bed status', upd && upd.success === true, { status: newStatus });
    }

    logStep('Doctors: list and mark manual attendance');
    const doctors = await request(`/api/doctors/${targetHospitalId}`, { token: hospitalToken });
    record('Doctors fetched', Array.isArray(doctors));
    const doctorId = DOCTOR_ID;
    const today = new Date().toISOString().split('T')[0];
    const att = await request('/api/doctors/attendance', { method: 'POST', token: hospitalToken, body: { doctorId, date: today, availability: 'Present', shift: 'Morning' } });
    record('Mark attendance (reception)', att && att.success === true);

    logStep('Doctor: login and update profile');
    const dLogin = await login('doctor', doctorId, DOCTOR_PASSWORD);
    const doctorToken = dLogin.token;
    record('Doctor login', Boolean(doctorToken));
    const profileUpd = await request(`/api/doctors/${doctorId}`, { method: 'PUT', token: doctorToken, body: { experience: '5+ years (updated by e2e)' } });
    record('Doctor profile update', profileUpd && profileUpd.success === true);

    logStep('Ambulance: login and submit emergency');
    const aLogin = await login('ambulance', AMBULANCE_USERNAME, AMBULANCE_PASSWORD);
    const ambulanceToken = aLogin.token;
    const ambulance = aLogin.ambulance;
    record('Ambulance login', Boolean(ambulanceToken));
    const emAmb = await request('/api/emergency', {
      method: 'POST',
      token: ambulanceToken,
      body: {
        hospitalId: targetHospitalId,
        ambulanceId: ambulance?.ambulanceId || AMBULANCE_USERNAME,
        patient: {
          name: 'Amb Case',
          age: 40,
          gender: 'Female',
          symptoms: 'Trauma',
          emergencyType: 'Trauma',
          contactMobile: '8888888888',
          contactAddress: 'Road'
        },
        emtRef: ambulance?.emt || { name: 'EMT', emtId: 'EMT', mobile: '1111111111' },
        pilotRef: ambulance?.pilot || { name: 'PILOT', pilotId: 'PILOT', mobile: '2222222222' },
        status: 'Pending'
      }
    });
    record('Ambulance emergency submission', emAmb && emAmb.success === true, { id: emAmb?.emergency?._id });

    const ambulanceEmergencyId = emAmb?.emergency?._id;

    logStep('Reception: accept ambulance emergency');
    if (ambulanceEmergencyId) {
      const acc = await request(`/api/emergency/${ambulanceEmergencyId}/accept`, { method: 'PUT', token: hospitalToken, body: { remarks: 'Accepted by e2e' } });
      record('Accept ambulance emergency', acc && acc.success === true && acc.emergency?.status === 'Accepted');
    } else {
      record('Accept ambulance emergency', false, { reason: 'No ambulance emergency id' });
    }

    logStep('Public: check emergency detail endpoint');
    if (publicEmergencyId) {
      const det = await request(`/api/emergency/detail/${publicEmergencyId}`);
      record('Public emergency detail', det && det.success === true && det.emergency && det.emergency._id === publicEmergencyId);
    } else {
      record('Public emergency detail', false, { reason: 'No public emergency id' });
    }

    console.log(`\nSummary: ${summary.ok} passed, ${summary.fail} failed.`);
    summary.steps.forEach(s => console.log(`${s.ok ? '✅' : '❌'} ${s.name}${s.extra ? ' - ' + JSON.stringify(s.extra) : ''}`));
    if (summary.fail > 0) process.exit(1);
    process.exit(0);
  } catch (err) {
    console.error('E2E smoke test failed:', err.message);
    process.exit(1);
  }
}

run();



