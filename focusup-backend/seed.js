import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';
import Group from './models/Group.js';
import Session from './models/Session.js';
import Analytics from './models/Analytics.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected for seeding');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

const seedUsers = async () => {
  const users = [
    {
      name: 'Chaithali Shettigar',
      username: 'chaithali',
      email: 'chaithali@example.com',
      password: await bcryptjs.hash('password123', 12),
      college: 'MIT',
      department: 'Computer Science',
      year: 'Third',
      bio: 'Passionate about web development and AI',
      interests: ['coding', 'reading', 'music']
    },
    {
      name: 'Megha Sharma',
      username: 'megha',
      email: 'megha@example.com',
      password: await bcryptjs.hash('password123', 12),
      college: 'Stanford',
      department: 'Data Science',
      year: 'Second',
      bio: 'Love analyzing data and machine learning',
      interests: ['data science', 'hiking', 'photography']
    },
    {
      name: 'Darsha Patel',
      username: 'darsha',
      email: 'darsha@example.com',
      password: await bcryptjs.hash('password123', 12),
      college: 'UC Berkeley',
      department: 'Software Engineering',
      year: 'Fourth',
      bio: 'Building the next generation of apps',
      interests: ['mobile development', 'gaming', 'cooking']
    },
    {
      name: 'Alex Johnson',
      username: 'alex_j',
      email: 'alex@example.com',
      password: await bcryptjs.hash('password123', 12),
      college: 'Harvard',
      department: 'Computer Science',
      year: 'Third',
      bio: 'Focus enthusiast and productivity expert',
      interests: ['productivity', 'meditation', 'books']
    },
    {
      name: 'Maya Chen',
      username: 'maya_chen',
      email: 'maya@example.com',
      password: await bcryptjs.hash('password123', 12),
      college: 'MIT',
      department: 'AI/ML',
      year: 'Second',
      bio: 'Building intelligent systems',
      interests: ['AI', 'robotics', 'tennis']
    }
  ];

  await User.deleteMany({});
  const createdUsers = await User.insertMany(users);
  console.log(`✅ Created ${createdUsers.length} users`);
  return createdUsers;
};

const seedGroups = async (users) => {
  const groups = [
    {
      name: 'Study Squad',
      description: 'A focused study group for computer science students',
      createdBy: users[0]._id,
      members: [users[0]._id, users[1]._id, users[3]._id],
      isPrivate: false
    },
    {
      name: 'Code Warriors',
      description: 'Competitive programming and algorithm practice',
      createdBy: users[2]._id,
      members: [users[2]._id, users[4]._id],
      isPrivate: false
    },
    {
      name: 'AI Research Group',
      description: 'Discussing latest trends in artificial intelligence',
      createdBy: users[4]._id,
      members: [users[4]._id, users[1]._id, users[3]._id],
      isPrivate: true
    },
    {
      name: 'Web Dev Masters',
      description: 'Full-stack web development learning group',
      createdBy: users[0]._id,
      members: [users[0]._id, users[2]._id, users[4]._id],
      isPrivate: false
    }
  ];

  await Group.deleteMany({});
  const createdGroups = await Group.insertMany(groups);
  console.log(`✅ Created ${createdGroups.length} groups`);
  return createdGroups;
};

const seedSessions = async (users) => {
  const sessions = [];
  const sessionTypes = ['General', 'Study', 'Work', 'Reading', 'Coding'];
  
  // Create sessions for the past 30 days
  for (let i = 0; i < 50; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const randomDays = Math.floor(Math.random() * 30);
    const sessionDate = new Date();
    sessionDate.setDate(sessionDate.getDate() - randomDays);
    
    const targetMinutes = Math.floor(Math.random() * 90) + 30; // 30-120 minutes
    const actualMinutes = Math.floor(Math.random() * targetMinutes) + Math.floor(targetMinutes * 0.7); // Usually 70-100% of target
    const focusScore = Math.floor(Math.random() * 40) + 60; // 60-100 score
    
    const endTime = new Date(sessionDate);
    endTime.setMinutes(endTime.getMinutes() + actualMinutes);
    
    sessions.push({
      userId: randomUser._id,
      subject: sessionTypes[Math.floor(Math.random() * sessionTypes.length)],
      targetMinutes: targetMinutes,
      actualMinutes: actualMinutes,
      tabSwitches: Math.floor(Math.random() * 15),
      startTime: sessionDate,
      endTime: endTime,
      status: 'completed',
      focusScore: focusScore,
      notes: `Sample session ${i + 1}`,
      createdAt: sessionDate
    });
  }

  await Session.deleteMany({});
  const createdSessions = await Session.insertMany(sessions);
  console.log(`✅ Created ${createdSessions.length} sessions`);
  return createdSessions;
};

const seedAnalytics = async (users) => {
  const analytics = [];
  
  for (const user of users) {
    // Create analytics for the past 7 days
    for (let i = 0; i < 7; i++) {
      const analyticsDate = new Date();
      analyticsDate.setDate(analyticsDate.getDate() - i);
      
      analytics.push({
        userId: user._id,
        date: analyticsDate,
        totalFocusTime: Math.floor(Math.random() * 300) + 60, // 1-6 hours
        averageFocusScore: Math.floor(Math.random() * 30) + 70, // 70-100
        sessionsCompleted: Math.floor(Math.random() * 8) + 1, // 1-8 sessions
        totalDistractions: Math.floor(Math.random() * 20),
        mostProductiveHour: Math.floor(Math.random() * 12) + 8, // 8 AM - 8 PM
        streak: Math.floor(Math.random() * 15) + 1
      });
    }
  }

  await Analytics.deleteMany({});
  const createdAnalytics = await Analytics.insertMany(analytics);
  console.log(`✅ Created ${createdAnalytics.length} analytics records`);
  return createdAnalytics;
};

const seedDatabase = async () => {
  try {
    await connectDB();
    
    console.log('🌱 Starting database seeding...\n');
    
    const users = await seedUsers();
    const groups = await seedGroups(users);
    const sessions = await seedSessions(users);
    const analytics = await seedAnalytics(users);
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`👥 Users: ${users.length}`);
    console.log(`👨‍👩‍👧‍👦 Groups: ${groups.length}`);
    console.log(`⏱️ Sessions: ${sessions.length}`);
    console.log(`📈 Analytics: ${analytics.length}`);
    
    console.log('\n🔐 Test Login Credentials:');
    console.log('Email: chaithali@example.com | Password: password123');
    console.log('Email: megha@example.com | Password: password123');
    console.log('Email: darsha@example.com | Password: password123');
    
    console.log('\n👥 Sample Usernames for Search:');
    console.log('chaithali, megha, darsha, alex_j, maya_chen');
    
    console.log('\n🏷️ Group Codes (auto-generated):');
    groups.forEach(group => {
      console.log(`${group.name}: ${group.code}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();