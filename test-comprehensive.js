#!/usr/bin/env node

/**
 * Comprehensive RapidCare System Test Suite
 * Tests all major functionality including forms, APIs, QR codes, PDFs, etc.
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'http://localhost:5000';
const API_BASE = `${BASE_URL}/api`;
const COLORS = {
  RESET: '\x1b[0m',
  BRIGHT: '\x1b[1m',
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  MAGENTA: '\x1b[35m',
  CYAN: '\x1b[36m',
  WHITE: '\x1b[37m'
};

// Test results
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Helper functions
function log(message, color = COLORS.WHITE) {
  console.log(`${color}${message}${COLORS.RESET}`);
}

function logTest(testName) {
  log(`\n=== TEST: ${testName} ===`, COLORS.CYAN);
}

function logSuccess(message) {
  log(`✅ ${message}`, COLORS.GREEN);
  testResults.passed++;
}

function logError(message, error = null) {
  log(`❌ ${message}`, COLORS.RED);
  if (error) {
    log(`   Error: ${error.message || error}`, COLORS.RED);
  }
  testResults.failed++;
}

function logInfo(message) {
  log(`ℹ️  ${message}`, COLORS.BLUE);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test functions
async function testServerConnection() {
  logTest('Server Connection');
  try {
    const response = await axios.get(BASE_URL, { timeout: 5000 });
    if (response.status === 200) {
      logSuccess('Server is running and accessible');
      return true;
    }
    logError('Server returned non-200 status');
    return false;
  } catch (error) {
    logError('Server is not accessible', error);
    return false;
  }
}

async function testDatabaseReset() {
  logTest('Database Reset');
  try {
    const response = await axios.post(`${API_BASE}/reset-db`, {}, { timeout: 30000 });
    if (response.data.success) {
      logSuccess(`Database reset successful - Created ${response.data.counts?.hospitals || 0} hospitals`);
      // Wait for database operations to complete
      await sleep(2000);
      return true;
    }
    logError('Database reset failed');
    return false;
  } catch (error) {
    logError('Database reset request failed', error);
    return false;
  }
}

async function testHospitalLogin() {
  logTest('Hospital Login & Authentication');
  try {
    // Test login
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      role: 'hospital',
      username: 'HOSP001',
      password: 'test@1234'
    });

    if (loginResponse.data.token) {
      logSuccess('Hospital login successful');
      
      // Test password change requirement
      if (loginResponse.data.forcePasswordChange) {
        logInfo('Password change required - testing password change');
        
        const changeResponse = await axios.post(`${API_BASE}/auth/change-password`, {
          role: 'hospital',
          username: 'HOSP001',
          newPassword: 'newpass123'
        });
        
        if (changeResponse.data.success) {
          logSuccess('Password change successful');
        } else {
          logError('Password change failed');
        }
      }
      
      return loginResponse.data.token;
    }
    logError('Login failed - no token received');
    return null;
  } catch (error) {
    logError('Hospital login failed', error);
    return null;
  }
}

async function testDoctorLogin() {
  logTest('Doctor Login & Authentication');
  try {
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      role: 'doctor',
      username: 'DOC100',
      password: 'test@123'
    });

    if (loginResponse.data.token && loginResponse.data.doctor) {
      logSuccess('Doctor login successful');
      
      if (loginResponse.data.forcePasswordChange) {
        logInfo('Testing doctor password change');
        const changeResponse = await axios.post(`${API_BASE}/auth/change-password`, {
          role: 'doctor',
          username: 'DOC100',
          newPassword: 'docpass123'
        });
        
        if (changeResponse.data.success) {
          logSuccess('Doctor password change successful');
        }
      }
      
      return { token: loginResponse.data.token, doctor: loginResponse.data.doctor };
    }
    logError('Doctor login failed');
    return null;
  } catch (error) {
    logError('Doctor login failed', error);
    return null;
  }
}

async function testAmbulanceLogin() {
  logTest('Ambulance Login & Authentication');
  try {
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      role: 'ambulance',
      username: 'AMB001',
      password: 'test@1234'
    });

    if (loginResponse.data.token && loginResponse.data.ambulance) {
      logSuccess('Ambulance login successful');
      return { token: loginResponse.data.token, ambulance: loginResponse.data.ambulance };
    }
    logError('Ambulance login failed');
    return null;
  } catch (error) {
    logError('Ambulance login failed', error);
    return null;
  }
}

async function testHospitalAPI(token) {
  logTest('Hospital API Operations');
  const headers = { Authorization: `Bearer ${token}` };
  
  try {
    // Test get hospitals
    const hospitalsResponse = await axios.get(`${API_BASE}/hospital`);
    if (hospitalsResponse.data.length > 0) {
      logSuccess(`Retrieved ${hospitalsResponse.data.length} hospitals`);
    }
    
    // Test get specific hospital
    const hospitalResponse = await axios.get(`${API_BASE}/hospital/HOSP001`);
    if (hospitalResponse.data.hospitalId === 'HOSP001') {
      logSuccess('Retrieved specific hospital data');
    }
    
    // Test update hospital
    const updateResponse = await axios.put(`${API_BASE}/hospital/HOSP001`, {
      name: 'Updated Hospital Name'
    }, { headers });
    
    if (updateResponse.data.success) {
      logSuccess('Hospital update successful');
    }
    
    return true;
  } catch (error) {
    logError('Hospital API operations failed', error);
    return false;
  }
}

async function testBedManagement(token) {
  logTest('Bed Management');
  const headers = { Authorization: `Bearer ${token}` };
  
  try {
    // Get existing beds
    const bedsResponse = await axios.get(`${API_BASE}/beds/HOSP001`, { headers });
    const existingBeds = bedsResponse.data.length;
    logInfo(`Found ${existingBeds} existing beds`);
    
    // Create new beds
    const createResponse = await axios.post(`${API_BASE}/beds`, {
      hospitalId: 'HOSP001',
      wardNumber: '2',
      bedType: 'General',
      start: 1,
      end: 3
    }, { headers, timeout: 30000 });
    
    if (createResponse.data.success && createResponse.data.created.length > 0) {
      logSuccess(`Created ${createResponse.data.created.length} new beds`);
    }
    
    // Test bed status update
    const bedId = createResponse.data.created[0].bedId;
    const updateResponse = await axios.put(`${API_BASE}/beds/${bedId}`, {
      status: 'Occupied'
    }, { headers });
    
    if (updateResponse.data.success) {
      logSuccess('Bed status update successful');
    }
    
    return true;
  } catch (error) {
    logError('Bed management failed', error);
    return false;
  }
}

async function testDoctorManagement(token) {
  logTest('Doctor Management');
  const headers = { Authorization: `Bearer ${token}` };
  
  try {
    // Create new doctor
    const createResponse = await axios.post(`${API_BASE}/doctors`, {
      hospitalId: 'HOSP001',
      doctorId: 'DOC999',
      name: 'Dr. Test Doctor',
      qualification: 'MBBS',
      speciality: 'General Medicine',
      experience: '5 years'
    }, { headers });
    
    if (createResponse.data.success) {
      logSuccess('Doctor creation successful');
    }
    
    // Test doctor attendance
    const attendanceResponse = await axios.post(`${API_BASE}/doctors/attendance`, {
      doctorId: 'DOC999',
      date: new Date().toISOString().split('T')[0],
      availability: 'Present',
      shift: 'Morning'
    }, { headers });
    
    if (attendanceResponse.data.success) {
      logSuccess('Doctor attendance marking successful');
    }
    
    return true;
  } catch (error) {
    logError('Doctor management failed', error);
    return false;
  }
}

async function testAmbulanceManagement(token) {
  logTest('Ambulance Management');
  const headers = { Authorization: `Bearer ${token}` };
  
  try {
    // Create new ambulance
    const createResponse = await axios.post(`${API_BASE}/ambulances`, {
      hospitalId: 'HOSP001',
      ambulanceId: 'AMB999',
      ambulanceNumber: 'TEST-999',
      vehicleNumber: 'CG04-TEST',
      emt: {
        name: 'Test EMT',
        emtId: 'EMT999',
        mobile: '9999999999'
      },
      pilot: {
        name: 'Test Pilot',
        pilotId: 'PIL999',
        mobile: '8888888888'
      }
    }, { headers });
    
    if (createResponse.data.success) {
      logSuccess('Ambulance creation successful');
    }
    
    return true;
  } catch (error) {
    logError('Ambulance management failed', error);
    return false;
  }
}

async function testEmergencyWorkflow(ambulanceToken, hospitalToken) {
  logTest('Emergency Request Workflow');
  
  try {
    // Submit emergency from ambulance
    const emergencyResponse = await axios.post(`${API_BASE}/emergency`, {
      hospitalId: 'HOSP001',
      ambulanceId: 'AMB001',
      patient: {
        name: 'Test Patient',
        age: 30,
        gender: 'Male',
        symptoms: 'Chest pain',
        emergencyType: 'ICU',
        contactMobile: '9876543210',
        contactAddress: 'Test Address'
      },
      readyEquipment: 'Oxygen',
      reason: 'Heart attack suspected',
      submittedBy: 'ambulance'
    }, { headers: { Authorization: `Bearer ${ambulanceToken}` } });
    
    if (emergencyResponse.data.success) {
      logSuccess('Emergency request submitted successfully');
      
      const emergencyId = emergencyResponse.data.emergency._id;
      
      // Test hospital response - Accept
      const acceptResponse = await axios.put(`${API_BASE}/emergency/${emergencyId}/accept`, {
        remarks: 'Accepted for immediate treatment'
      }, { headers: { Authorization: `Bearer ${hospitalToken}` } });
      
      if (acceptResponse.data.success) {
        logSuccess('Emergency request accepted by hospital');
      }
    }
    
    return true;
  } catch (error) {
    logError('Emergency workflow failed', error);
    return false;
  }
}

async function testQRCodeGeneration(token) {
  logTest('QR Code Generation');
  const headers = { Authorization: `Bearer ${token}` };
  
  try {
    // Test hospital-wide QR generation
    const qrResponse = await axios.post(`${API_BASE}/hospital/HOSP001/attendance-qr`, {}, { headers });
    
    if (qrResponse.data.success && qrResponse.data.presentQR) {
      logSuccess('Hospital attendance QR codes generated');
      
      // Test QR scan endpoint
      const scanResponse = await axios.get(`${API_BASE}/hospital/HOSP001/attendance-scan?type=Present&doctorId=DOC100`);
      if (scanResponse.data.success) {
        logSuccess('QR scan endpoint working');
      }
    }
    
    // Test doctor-specific QR
    const doctorQRResponse = await axios.get(`${API_BASE}/doctors/DOC100/attendance/qrs`, { headers });
    if (doctorQRResponse.data.present && doctorQRResponse.data.absent) {
      logSuccess('Doctor-specific QR codes generated');
    }
    
    return true;
  } catch (error) {
    logError('QR code generation failed', error);
    return false;
  }
}

async function testPDFGeneration(token) {
  logTest('PDF Generation');
  const headers = { Authorization: `Bearer ${token}` };
  
  try {
    // Test attendance QR PDF
    const pdfResponse = await axios.get(`${API_BASE}/hospital/HOSP001/attendance-qr-pdf`, { 
      headers,
      responseType: 'stream'
    });
    
    if (pdfResponse.status === 200) {
      logSuccess('Attendance QR PDF generation successful');
    }
    
    // Test bed QR PDF
    const bedPDFResponse = await axios.get(`${API_BASE}/beds/pdf/mass/HOSP001`, {
      headers,
      responseType: 'stream'
    });
    
    if (bedPDFResponse.status === 200) {
      logSuccess('Bed QR PDF generation successful');
    }
    
    return true;
  } catch (error) {
    logError('PDF generation failed', error);
    return false;
  }
}

async function testFormLoadingAndExchange() {
  logTest('Form Loading and Exchange');
  
  try {
    // Test main page
    const mainResponse = await axios.get(BASE_URL);
    if (mainResponse.status === 200 && mainResponse.data.includes('RapidCare')) {
      logSuccess('Main page loads correctly');
    }
    
    // Test reception portal
    const receptionResponse = await axios.get(`${BASE_URL}/reception.html`);
    if (receptionResponse.status === 200) {
      logSuccess('Reception portal loads correctly');
    }
    
    // Test doctor portal
    const doctorResponse = await axios.get(`${BASE_URL}/doctor.html`);
    if (doctorResponse.status === 200) {
      logSuccess('Doctor portal loads correctly');
    }
    
    // Test ambulance portal
    const ambulanceResponse = await axios.get(`${BASE_URL}/ambulance.html`);
    if (ambulanceResponse.status === 200) {
      logSuccess('Ambulance portal loads correctly');
    }
    
    return true;
  } catch (error) {
    logError('Form loading failed', error);
    return false;
  }
}

async function testPublicEmergencySubmission() {
  logTest('Public Emergency Submission');
  
  try {
    const emergencyResponse = await axios.post(`${API_BASE}/emergency/public`, {
      patient: {
        name: 'Public Patient',
        age: 25,
        gender: 'Female',
        symptoms: 'Fever and cough',
        emergencyType: 'General',
        contactMobile: '9876543210',
        contactAddress: 'Public Address'
      }
    });
    
    if (emergencyResponse.data.success) {
      logSuccess('Public emergency submission successful');
    }
    
    return true;
  } catch (error) {
    logError('Public emergency submission failed', error);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  log('\n🧪 RAPIDCARE COMPREHENSIVE SYSTEM TEST', COLORS.BRIGHT + COLORS.CYAN);
  log('='.repeat(60), COLORS.CYAN);
  
  const startTime = Date.now();
  
  // Test 1: Server Connection
  testResults.total++;
  const serverOK = await testServerConnection();
  if (!serverOK) {
    log('\n❌ Server not accessible. Please start the server first.', COLORS.RED);
    process.exit(1);
  }
  
  // Test 2: Database Reset
  testResults.total++;
  await testDatabaseReset();
  
  // Test 3: Authentication Tests
  testResults.total++;
  const hospitalToken = await testHospitalLogin();
  
  testResults.total++;
  const doctorAuth = await testDoctorLogin();
  
  testResults.total++;
  const ambulanceAuth = await testAmbulanceLogin();
  
  // Test 4: Form Loading
  testResults.total++;
  await testFormLoadingAndExchange();
  
  // Test 5: API Operations (if hospital token available)
  if (hospitalToken) {
    testResults.total++;
    await testHospitalAPI(hospitalToken);
    
    testResults.total++;
    await testBedManagement(hospitalToken);
    
    testResults.total++;
    await testDoctorManagement(hospitalToken);
    
    testResults.total++;
    await testAmbulanceManagement(hospitalToken);
    
    testResults.total++;
    await testQRCodeGeneration(hospitalToken);
    
    testResults.total++;
    await testPDFGeneration(hospitalToken);
  }
  
  // Test 6: Emergency Workflow
  if (ambulanceAuth && hospitalToken) {
    testResults.total++;
    await testEmergencyWorkflow(ambulanceAuth.token, hospitalToken);
  }
  
  // Test 7: Public Emergency
  testResults.total++;
  await testPublicEmergencySubmission();
  
  // Results Summary
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  log('\n' + '='.repeat(60), COLORS.CYAN);
  log('COMPREHENSIVE TEST RESULTS', COLORS.BRIGHT + COLORS.CYAN);
  log('='.repeat(60), COLORS.CYAN);
  
  const passRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
  
  log(`✅ Passed: ${testResults.passed}/${testResults.total} (${passRate}%)`, COLORS.GREEN);
  log(`❌ Failed: ${testResults.failed}/${testResults.total}`, COLORS.RED);
  log(`⏱️  Duration: ${duration}s`, COLORS.BLUE);
  
  if (testResults.passed === testResults.total) {
    log('\n🎉 ALL TESTS PASSED! System is working correctly.', COLORS.GREEN + COLORS.BRIGHT);
  } else {
    log('\n⚠️  Some tests failed. Please check the issues above.', COLORS.YELLOW);
  }
  
  log('='.repeat(60), COLORS.CYAN);
}

// Error handling
process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

// Run tests
runAllTests().catch(error => {
  console.error('Test runner failed:', error);
  process.exit(1);
});
