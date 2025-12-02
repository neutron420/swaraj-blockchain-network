import { ethers } from "ethers";
import Redis from "ioredis";
import { v4 as uuidv4 } from "uuid";

interface BlockchainTask {
  id: string;
  type: "REGISTER_COMPLAINT" | "UPDATE_STATUS" | "ASSIGN_COMPLAINT" | "RESOLVE_COMPLAINT";
  data: any;
  retryCount?: number;
}

interface ComplaintData {
  complaintId: string;
  category: string;
  subcategory: string;
  urgency: string;
  descriptionHash: string;
  attachmentHash: string;
  submittedBy: string;
}

class BlockchainWorker {
  private redis: Redis;
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private contract: ethers.Contract;
  private queueName: string;
  private pollInterval: number;
  private isRunning: boolean = false;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
      password: process.env.REDIS_PASSWORD || undefined,
    });

    this.provider = new ethers.JsonRpcProvider(
      process.env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:8545"
    );

    this.wallet = new ethers.Wallet(
      process.env.PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
      this.provider
    );

    const contractABI = [
      "function registerComplaint(string complaintId, string category, string subcategory, string urgency, string descriptionHash, string attachmentHash, address submittedBy) public",
      "function updateStatus(string complaintId, string newStatus) public",
      "function assignComplaint(string complaintId, string assignedTo) public",
      "function resolveComplaint(string complaintId, string resolutionDate) public",
      "function getComplaint(string complaintId) public view returns (tuple(string complaintId, string category, string subcategory, string urgency, string status, string descriptionHash, string attachmentHash, address submittedBy, uint256 timestamp, uint256 lastUpdated, string assignedTo, string resolutionDate))",
    ];

    this.contract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS || "",
      contractABI,
      this.wallet
    );

    this.queueName = process.env.QUEUE_NAME || "blockchain_tasks";
    this.pollInterval = parseInt(process.env.WORKER_POLL_INTERVAL || "5000");

    console.log(" Blockchain Worker initialized");
    console.log(` Connected to: ${process.env.BLOCKCHAIN_RPC_URL}`);
    console.log(` Contract: ${process.env.CONTRACT_ADDRESS}`);
  }

  async start() {
    this.isRunning = true;
    console.log(" Worker started. Listening for tasks...");

    while (this.isRunning) {
      try {
        await this.processNextTask();
      } catch (error) {
        console.error(" Error in worker loop:", error);
      }
      await this.sleep(this.pollInterval);
    }
  }

  async stop() {
    this.isRunning = false;
    await this.redis.quit();
    console.log(" Worker stopped");
  }

  private async processNextTask() {
    const result = await this.redis.blpop(this.queueName, 1);
    if (!result) return;

    const [, taskJson] = result;
    const task: BlockchainTask = JSON.parse(taskJson);

    console.log(` Processing task: ${task.type} (ID: ${task.id})`);

    try {
      await this.executeTask(task);
      console.log(`Task completed: ${task.id}`);

      await this.redis.setex(
        `task_result:${task.id}`,
        3600,
        JSON.stringify({ status: "success", timestamp: Date.now() })
      );
    } catch (error: any) {
      console.error(` Task failed: ${task.id}`, error.message);

      const retryCount = task.retryCount || 0;
      if (retryCount < 3) {
        task.retryCount = retryCount + 1;
        await this.redis.rpush(this.queueName, JSON.stringify(task));
        console.log(` Task re-queued for retry (${task.retryCount}/3)`);
      } else {
        await this.redis.setex(
          `task_result:${task.id}`,
          3600,
          JSON.stringify({ status: "failed", error: error.message, timestamp: Date.now() })
        );
      }
    }
  }

  private async executeTask(task: BlockchainTask) {
    switch (task.type) {
      case "REGISTER_COMPLAINT":
        await this.registerComplaint(task.data);
        break;
      case "UPDATE_STATUS":
        await this.updateStatus(task.data);
        break;
      case "ASSIGN_COMPLAINT":
        await this.assignComplaint(task.data);
        break;
      case "RESOLVE_COMPLAINT":
        await this.resolveComplaint(task.data);
        break;
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
  }

  private async registerComplaint(data: ComplaintData) {
    const tx = await this.contract.registerComplaint(
      data.complaintId,
      data.category,
      data.subcategory,
      data.urgency,
      data.descriptionHash,
      data.attachmentHash,
      data.submittedBy
    );
    console.log(` Transaction sent: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(` Transaction confirmed in block: ${receipt.blockNumber}`);
    return receipt;
  }

  private async updateStatus(data: { complaintId: string; status: string }) {
    const tx = await this.contract.updateStatus(data.complaintId, data.status);
    const receipt = await tx.wait();
    console.log(` Status updated: ${data.complaintId} -> ${data.status}`);
    return receipt;
  }

  private async assignComplaint(data: { complaintId: string; assignedTo: string }) {
    const tx = await this.contract.assignComplaint(data.complaintId, data.assignedTo);
    const receipt = await tx.wait();
    console.log(`Complaint assigned: ${data.complaintId} -> ${data.assignedTo}`);
    return receipt;
  }

  private async resolveComplaint(data: { complaintId: string; resolutionDate: string }) {
    const tx = await this.contract.resolveComplaint(data.complaintId, data.resolutionDate);
    const receipt = await tx.wait();
    console.log(` Complaint resolved: ${data.complaintId}`);
    return receipt;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

const worker = new BlockchainWorker();

process.on("SIGINT", async () => {
  console.log("\n  Shutting down gracefully...");
  await worker.stop();
  process.exit(0);
});

worker.start().catch((error) => {
  console.error(" Fatal error:", error);
  process.exit(1);
});
