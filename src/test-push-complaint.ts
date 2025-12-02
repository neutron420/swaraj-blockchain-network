import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';

dotenv.config();

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
});
const QUEUE_NAME = process.env.QUEUE_NAME || 'blockchain_tasks';
const demoComplaints = [
  {
    id: uuidv4(),
    type: "REGISTER_COMPLAINT",
    data: {
      complaintId: `COMP-${uuidv4().slice(0, 8).toUpperCase()}`,
      category: 'Infrastructure',
      subcategory: 'Bridge Collapse Risk',
      urgency: 'critical',
      descriptionHash: '0x' + Buffer.from('Main river bridge showing severe structural cracks').toString('hex'),
      attachmentHash: '0x' + Buffer.from('https://ipfs.io/bridge-cracks.jpg').toString('hex'),
      submittedBy: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    }
  },
  {
    id: uuidv4(),
    type: "REGISTER_COMPLAINT",
    data: {
      complaintId: `COMP-${uuidv4().slice(0, 8).toUpperCase()}`,
      category: 'Healthcare',
      subcategory: 'Dengue Outbreak',
      urgency: 'high',
      descriptionHash: '0x' + Buffer.from('Multiple dengue cases reported in Sector 4').toString('hex'),
      attachmentHash: '0x' + Buffer.from('https://ipfs.io/report.pdf').toString('hex'),
      submittedBy: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    }
  },
  {
    id: uuidv4(),
    type: "REGISTER_COMPLAINT",
    data: {
      complaintId: `COMP-${uuidv4().slice(0, 8).toUpperCase()}`,
      category: 'Sanitation',
      subcategory: 'Missed Trash Collection',
      urgency: 'medium',
      descriptionHash: '0x' + Buffer.from('Garbage truck has not visited Green Park area for 4 days').toString('hex'),
      attachmentHash: '0x' + Buffer.from('https://ipfs.io/garbage.jpg').toString('hex'),
      submittedBy: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    }
  },
  {
    id: uuidv4(),
    type: "REGISTER_COMPLAINT",
    data: {
      complaintId: `COMP-${uuidv4().slice(0, 8).toUpperCase()}`,
      category: 'Parks & Recreation',
      subcategory: 'Broken Bench',
      urgency: 'low',
      descriptionHash: '0x' + Buffer.from('Park bench in Central Garden is broken').toString('hex'),
      attachmentHash: '0x' + Buffer.from('https://ipfs.io/bench.jpg').toString('hex'),
      submittedBy: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    }
  },
  {
    id: uuidv4(),
    type: "REGISTER_COMPLAINT",
    data: {
      complaintId: `COMP-${uuidv4().slice(0, 8).toUpperCase()}`,
      category: 'Electricity',
      subcategory: 'Live Wire Exposed',
      urgency: 'critical',
      descriptionHash: '0x' + Buffer.from('Live electricity wire fallen on street near primary school').toString('hex'),
      attachmentHash: '0x' + Buffer.from('https://ipfs.io/wire.jpg').toString('hex'),
      submittedBy: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
    }
  },
  {
    id: uuidv4(),
    type: "REGISTER_COMPLAINT",
    data: {
      complaintId: `COMP-${uuidv4().slice(0, 8).toUpperCase()}`,
      category: 'Water Supply',
      subcategory: 'Contaminated Water',
      urgency: 'high',
      descriptionHash: '0x' + Buffer.from('Tap water is muddy and smells foul in Block C').toString('hex'),
      attachmentHash: '0x' + Buffer.from('https://ipfs.io/water-sample.jpg').toString('hex'),
      submittedBy: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
    }
  },
  {
    id: uuidv4(),
    type: "REGISTER_COMPLAINT",
    data: {
      complaintId: `COMP-${uuidv4().slice(0, 8).toUpperCase()}`,
      category: 'Education',
      subcategory: 'Teacher Absenteeism',
      urgency: 'medium',
      descriptionHash: '0x' + Buffer.from('Math teacher at Govt High School regular absent').toString('hex'),
      attachmentHash: '0x' + Buffer.from('https://ipfs.io/attendance-log.pdf').toString('hex'),
      submittedBy: '0x976EA74026E726554dB657fA54763abd0C3a0aa9',
    }
  },
  {
    id: uuidv4(),
    type: "REGISTER_COMPLAINT",
    data: {
      complaintId: `COMP-${uuidv4().slice(0, 8).toUpperCase()}`,
      category: 'Traffic & Safety',
      subcategory: 'Traffic Light Malfunction',
      urgency: 'high',
      descriptionHash: '0x' + Buffer.from('Main junction traffic lights not working, causing accidents').toString('hex'),
      attachmentHash: '0x' + Buffer.from('https://ipfs.io/traffic.jpg').toString('hex'),
      submittedBy: '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955',
    }
  },
  {
    id: uuidv4(),
    type: "REGISTER_COMPLAINT",
    data: {
      complaintId: `COMP-${uuidv4().slice(0, 8).toUpperCase()}`,
      category: 'Environment',
      subcategory: 'Noise Complaint',
      urgency: 'low',
      descriptionHash: '0x' + Buffer.from('Construction work creating noise after 10 PM').toString('hex'),
      attachmentHash: '0x' + Buffer.from('https://ipfs.io/noise-recording.mp3').toString('hex'),
      submittedBy: '0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f',
    }
  },
  {
    id: uuidv4(),
    type: "REGISTER_COMPLAINT",
    data: {
      complaintId: `COMP-${uuidv4().slice(0, 8).toUpperCase()}`,
      category: 'Fire Safety',
      subcategory: 'Blocked Fire Exit',
      urgency: 'critical',
      descriptionHash: '0x' + Buffer.from('Shopping mall emergency exits are locked and blocked by boxes').toString('hex'),
      attachmentHash: '0x' + Buffer.from('https://ipfs.io/blocked-exit.jpg').toString('hex'),
      submittedBy: '0xa0Ee7A142d267C1f36714E4a8F75612F20a79720',
    }
  }
];

/**
 * Push all demo complaints
 */
async function pushDemoComplaints() {
  console.log(' Pushing 10 demo complaints to Redis queue...\n');
  
  for (const task of demoComplaints) {
    const message = JSON.stringify(task);
    await redis.rpush(QUEUE_NAME, message);
    console.log(` Pushed: ${task.data.complaintId} [${task.data.category}]`);
    // Small delay to simulate real-time arrival
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  const len = await redis.llen(QUEUE_NAME);
  console.log(`\n Done! Queue length is now: ${len}`);
}

/**
 * View current queue
 */
async function viewQueue() {
  const len = await redis.llen(QUEUE_NAME);
  console.log(`\n Queue: ${QUEUE_NAME}`);
  console.log(` Current Length: ${len}`);

  if (len > 0) {
    const items = await redis.lrange(QUEUE_NAME, 0, -1);
    items.forEach((item, i) => {
      const task = JSON.parse(item);
      console.log(`   [${i}] ${task.data.complaintId} - ${task.data.category} (${task.data.urgency})`);
    });
  } else {
    console.log("   (Queue is empty)");
  }
  console.log("");
}

/**
 * Clear queue
 */
async function clearQueue() {
  await redis.del(QUEUE_NAME);
  console.log(`  Cleared queue: ${QUEUE_NAME}`);
}

// --- MAIN CLI HANDLER ---
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case 'push':
        await pushDemoComplaints();
        break;
      case 'view':
        await viewQueue();
        break;
      case 'clear':
        await clearQueue();
        break;
      default:
        console.log("\n  Usage:");
        console.log("   npx ts-node src/test-push-complaint.ts push   (Push 10 demo tasks)");
        console.log("   npx ts-node src/test-push-complaint.ts view   (See pending tasks)");
        console.log("   npx ts-node src/test-push-complaint.ts clear  (Delete all tasks)");
        break;
    }
  } catch (error) {
    console.error(error);
  } finally {
    await redis.quit();
  }
}

main();