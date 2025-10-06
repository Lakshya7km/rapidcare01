#!/usr/bin/env node
/*
  Cleanup MongoDB collections for RapidCare project.
  - Keeps: users, emergencyrequests, attendance, hospitals, doctors, ambulances, beds
  - Removes: any other collections in the database

  Usage:
    MONGODB_URI=mongodb://localhost:27017/rapidcare node scripts/cleanupMongo.js
*/

const mongoose = require('mongoose');

async function main(){
  const uri = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://localhost:27017/rapidcare';
  await mongoose.connect(uri, { autoIndex: false });
  const db = mongoose.connection.db;

  const keep = new Set([
    // normalized to lowercase as Mongo lists are lowercase by default for collection names
    'users',
    'emergencyrequests',
    'attendance',
    'hospitals',
    'doctors',
    'ambulances',
    'beds',
  ]);

  const cols = await db.listCollections().toArray();
  const toDrop = cols
    .map(c => c.name)
    .filter(name => !keep.has(name.toLowerCase()))
    .sort();

  if(toDrop.length === 0){
    console.log('No extra collections found. Database is clean.');
    await mongoose.disconnect();
    return;
  }

  console.log('Dropping collections:', toDrop);
  for(const name of toDrop){
    try{
      await db.dropCollection(name);
      console.log(`Dropped: ${name}`);
    }catch(err){
      console.warn(`Skip ${name}: ${err.message}`);
    }
  }

  await mongoose.disconnect();
  console.log('Cleanup complete.');
}

main().catch(err => {
  console.error('Cleanup failed:', err);
  process.exit(1);
});


