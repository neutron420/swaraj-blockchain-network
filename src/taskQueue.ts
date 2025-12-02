
import Redis from "ioredis";
import { v4 as uuidv4 } from "uuid";

export class TaskQueue {
  private redis: Redis;
  private queueName: string;

  constructor(queueName: string = "blockchain_tasks") {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
    });
    this.queueName = queueName;
  }

  async addTask(type: string, data: any): Promise<string> {
    const taskId = uuidv4();
    const task = {
      id: taskId,
      type,
      data,
      createdAt: Date.now(),
    };

    await this.redis.rpush(this.queueName, JSON.stringify(task));
    console.log(`✅ Task queued: ${type} (ID: ${taskId})`);

    return taskId;
  }

  async getTaskResult(taskId: string): Promise<any> {
    const result = await this.redis.get(`task_result:${taskId}`);
    return result ? JSON.parse(result) : null;
  }

  async close() {
    await this.redis.quit();
  }
}

// Example usage
async function main() {
  const queue = new TaskQueue();

  // Add a complaint registration task
  const taskId = await queue.addTask("REGISTER_COMPLAINT", {
    complaintId: "COMP-" + Date.now(),
    category: "Infrastructure",
    subcategory: "Road Repair",
    urgency: "high",
    descriptionHash: "hash_" + Date.now(),
    attachmentHash: "attach_hash",
    submittedBy: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  });

  console.log(`Task ID: ${taskId}`);
  console.log("Check result in a few seconds...");

  await queue.close();
}

if (require.main === module) {
  main().catch(console.error);
}
