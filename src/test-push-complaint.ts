import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

const redis = new Redis({
  host: 'localhost',
  port: 6379,
});

const QUEUE_NAME = 'grievance:blockchain:queue';

/**
 * Test complaint data
 */
const testComplaints = [
  {
    complaintId: `COMP-${uuidv4().slice(0, 8).toUpperCase()}`,
    category: 'Infrastructure',
    subcategory: 'Road Damage',
    urgency: 'high',
    description: 'Large pothole on Main Street causing traffic issues and vehicle damage',
    attachment: 'https://example.com/images/pothole-main-st.jpg',
    submittedBy: '0x2f616ef93b69617da2366cef0f92dbc4d1cc15c3', // Use actual address
  },
  {
    complaintId: `COMP-${uuidv4().slice(0, 8).toUpperCase()}`,
    category: 'Public Services',
    subcategory: 'Water Supply',
    urgency: 'critical',
    description: 'No water supply in Ward 5 for the past 48 hours',
    attachment: '',
    submittedBy: '0x64a1ef753bad48813d5e8d80f59a7e648afc20ea',
  },
  {
    complaintId: `COMP-${uuidv4().slice(0, 8).toUpperCase()}`,
    category: 'Sanitation',
    subcategory: 'Garbage Collection',
    urgency: 'medium',
    description: 'Garbage not collected for 3 days in residential area',
    attachment: 'https://example.com/images/garbage-pile.jpg',
    submittedBy: '0xceb8b4640aa70a69349fa4fea6a115dc96b85dbd',
  },
  {
    complaintId: `COMP-${uuidv4().slice(0, 8).toUpperCase()}`,
    category: 'Public Safety',
    subcategory: 'Street Lighting',
    urgency: 'high',
    description: 'All street lights non-functional in Park Avenue for security concerns',
    attachment: '',
    submittedBy: '0xdea0acf30087e9febb21b9853d9764fe568bf05f',
  },
];

/**
 * Push a single complaint to Redis
 */
async function pushComplaint(complaint: any): Promise<void> {
  try {
    const message = JSON.stringify(complaint);
    await redis.rpush(QUEUE_NAME, message);
    
    console.log(`✅ Pushed complaint to Redis queue:`);
    console.log(`   ID: ${complaint.complaintId}`);
    console.log(`   Category: ${complaint.category} → ${complaint.subcategory}`);
    console.log(`   Urgency: ${complaint.urgency}`);
    console.log(`   Submitted by: ${complaint.submittedBy}`);
    console.log('');
  } catch (error) {
    console.error(`❌ Error pushing complaint:`, error);
  }
}

/**
 * Push multiple complaints
 */
async function pushMultipleComplaints(): Promise<void> {
  console.log('🚀 Pushing test complaints to Redis queue...\n');
  
  for (const complaint of testComplaints) {
    await pushComplaint(complaint);
    // Add small delay between pushes
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`📊 Total complaints pushed: ${testComplaints.length}`);
  
  // Check queue length
  const queueLength = await redis.llen(QUEUE_NAME);
  console.log(`📮 Current queue length: ${queueLength}\n`);
}

/**
 * Interactive CLI for manual testing
 */
async function interactivePush(): Promise<void> {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const prompt = (question: string): Promise<string> => {
    return new Promise(resolve => {
      readline.question(question, resolve);
    });
  };

  console.log('\n📝 Manual Complaint Entry\n');

  const complaintId = await prompt('Complaint ID (leave blank for auto-generate): ') || 
                      `COMP-${uuidv4().slice(0, 8).toUpperCase()}`;
  const category = await prompt('Category: ');
  const subcategory = await prompt('Subcategory: ');
  const urgency = await prompt('Urgency (low/medium/high/critical): ');
  const description = await prompt('Description: ');
  const attachment = await prompt('Attachment URL (optional): ');
  const submittedBy = await prompt('Submitted by (wallet address): ');

  const complaint = {
    complaintId,
    category,
    subcategory,
    urgency,
    description,
    attachment,
    submittedBy,
  };

  await pushComplaint(complaint);
  readline.close();
}

/**
 * View current queue
 */
async function viewQueue(): Promise<void> {
  const queueLength = await redis.llen(QUEUE_NAME);
  console.log(`📮 Queue: ${QUEUE_NAME}`);
  console.log(`📊 Length: ${queueLength}\n`);

  if (queueLength > 0) {
    const items = await redis.lrange(QUEUE_NAME, 0, -1);
    items.forEach((item, index) => {
      const complaint = JSON.parse(item);
      console.log(`[${index + 1}] ${complaint.complaintId} - ${complaint.category} (${complaint.urgency})`);
    });
  } else {
    console.log('Queue is empty');
  }
}

/**
 * Clear queue
 */
async function clearQueue(): Promise<void> {
  await redis.del(QUEUE_NAME);
  console.log('✅ Queue cleared');
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case 'push':
        await pushMultipleComplaints();
        break;
      
      case 'manual':
      case 'interactive':
        await interactivePush();
        break;
      
      case 'view':
        await viewQueue();
        break;
      
      case 'clear':
        await clearQueue();
        break;
      
      case 'single':
        // Push just one test complaint
        await pushComplaint(testComplaints[0]);
        break;
      
      default:
        console.log('Usage:');
        console.log('  npm run test:push push       - Push multiple test complaints');
        console.log('  npm run test:push single     - Push one test complaint');
        console.log('  npm run test:push manual     - Interactive complaint entry');
        console.log('  npm run test:push view       - View current queue');
        console.log('  npm run test:push clear      - Clear the queue');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await redis.quit();
  }
}

main();