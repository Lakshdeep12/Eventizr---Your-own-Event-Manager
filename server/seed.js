const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const Event = require('./models/Events');
const User = require('./models/user');

dotenv.config({ path: path.join(__dirname, '.env') });

const users = [
  { name: 'Rajesh Rathore', email: 'rajesh.rathore@eventizr.test', role: 'admin', isVerified: true },
  { name: 'Aarav Verma', email: 'aarav.verma@eventizr.test', role: 'user', isVerified: true },
  { name: 'Ananya Singh', email: 'ananya.singh@eventizr.test', role: 'user', isVerified: true },
  { name: 'Rohan Patel', email: 'rohan.patel@eventizr.test', role: 'user', isVerified: true },
  { name: 'Sneha Joshi', email: 'sneha.joshi@eventizr.test', role: 'user', isVerified: true },
  { name: 'Vikram Rathore', email: 'vikram.rathore@eventizr.test', role: 'user', isVerified: true },
  { name: 'Kavya Shekhawat', email: 'kavya.shekhawat@eventizr.test', role: 'user', isVerified: true },
];

const seedEvents = [
  {
    title: 'Sunset Music Festival', description: 'Live music, food trucks, and skyline views as Jodhpur turns gold at sunset.',
    date: '2026-10-10T18:00:00.000Z', location: 'Suraj Garden, Jodhpur, Rajasthan', category: 'Music',
    totalSeats: 250, availableSeats: 250, ticketPrice: 1200,
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Tech Startup Expo', description: 'Meet founders, investors, and builders shaping Rajasthan’s next big ideas.',
    date: '2026-10-15T10:00:00.000Z', location: 'Hotel Ghoomar, Jodhpur, Rajasthan', category: 'Technology',
    totalSeats: 180, availableSeats: 180, ticketPrice: 1500,
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Marwar Art and Culture Night', description: 'A vivid evening of local art, handmade crafts, folk music, and cultural performances.',
    date: '2026-10-18T19:30:00.000Z', location: 'Kesar Baagh, Jodhpur, Rajasthan', category: 'Culture',
    totalSeats: 320, availableSeats: 320, ticketPrice: 900,
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Business Leadership Summit', description: 'Practical conversations with leaders and an unhurried networking session.',
    date: '2026-10-22T09:00:00.000Z', location: 'Indana Palace, Jodhpur, Rajasthan', category: 'Business',
    totalSeats: 200, availableSeats: 200, ticketPrice: 2000,
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Jodhpur Food Carnival', description: 'Taste the city through live grills, regional favourites, and dessert stalls.',
    date: '2026-11-01T17:00:00.000Z', location: 'Ajit Palace, Jodhpur, Rajasthan', category: 'Food',
    totalSeats: 400, availableSeats: 400, ticketPrice: 800,
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Wellness and Yoga Retreat', description: 'A calm day of movement, meditation, and restorative wellness sessions.',
    date: '2026-11-05T08:30:00.000Z', location: 'Umaid Bhawan Palace, Jodhpur, Rajasthan', category: 'Wellness',
    totalSeats: 120, availableSeats: 120, ticketPrice: 1800,
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Gaming Arena Championship', description: 'Tournament play, casual challenges, prizes, and a full day of community gaming.',
    date: '2026-11-12T13:00:00.000Z', location: 'Udaigarh Resort and Lawns, Jodhpur, Rajasthan', category: 'Gaming',
    totalSeats: 300, availableSeats: 300, ticketPrice: 1100,
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Startup Investor Mixer', description: 'Focused introductions and short pitches for early-stage founders and investors.',
    date: '2026-11-20T18:00:00.000Z', location: 'Khas Bagh, Jodhpur, Rajasthan', category: 'Networking',
    totalSeats: 160, availableSeats: 160, ticketPrice: 1750,
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
  },
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const passwordHash = await bcrypt.hash(process.env.SEED_PASSWORD || 'Welcome@123', 10);
    await User.bulkWrite(users.map((user) => ({
      updateOne: { filter: { email: user.email }, update: { $set: { ...user, password: passwordHash } }, upsert: true },
    })));
    await Event.bulkWrite(seedEvents.map((event) => ({
      updateOne: { filter: { title: event.title }, update: { $set: event }, upsert: true },
    })));
    console.log(`Seeded ${users.length} users and ${seedEvents.length} Jodhpur events.`);
    console.log('Demo password: Welcome@123 (or set SEED_PASSWORD).');
  } catch (error) {
    console.error('Database seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedDatabase();
