# Grievance Blockchain Worker

A production-ready blockchain worker service that processes user registrations and complaints from Redis queues and permanently stores them on the blockchain with IPFS integration.

## 📋 Overview

This worker service acts as a bridge between your application's Redis queue system and the blockchain. It automatically processes incoming user registrations and grievance complaints, uploads metadata to IPFS (InterPlanetary File System) via Pinata, and records transactions on the blockchain using smart contracts.

### Key Features

- 🔄 **Automatic Queue Processing**: Continuously polls Redis queues for new user registrations and complaints
- 🔗 **Blockchain Integration**: Stores data immutably on the blockchain using Ethereum smart contracts
- 📦 **IPFS Storage**: Uploads complaint metadata to IPFS via Pinata for decentralized storage
- 🔁 **Retry Mechanism**: Built-in retry logic for failed transactions with exponential backoff
- 🚀 **Production Ready**: Dockerized and deployable to AWS ECS with health checks
- ⚡ **High Performance**: Built with Bun runtime for optimal performance

## 🏗️ Architecture

```
Application → Redis Queue → Blockchain Worker → IPFS (Pinata) → Blockchain
```

1. **Application Layer**: Your frontend/API pushes user registrations and complaints to Redis queues
2. **Redis Queues**: Two queues are monitored:
   - `user:registration:queue` - User registration data
   - `complaint:blockchain:queue` - Grievance complaints
3. **Worker Service**: Polls queues, processes data, uploads to IPFS, and writes to blockchain
4. **Blockchain**: Permanent, immutable storage via smart contract transactions

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or Bun runtime
- Redis instance (local or cloud)
- Ethereum RPC endpoint
- Pinata JWT token for IPFS uploads
- Private key for blockchain transactions

### Installation

```bash
# Install dependencies
bun install
# or
npm install
```

### Configuration

Create a `.env` file in the root directory:

```env
# Redis Configuration
REDIS_URL=redis://localhost:6379

# Blockchain Configuration
BLOCKCHAIN_RPC_URL=https://your-rpc-endpoint
PRIVATE_KEY=your_private_key_here
CONTRACT_ADDRESS=0xYourContractAddress

# IPFS Configuration
PINATA_JWT=your_pinata_jwt_token

# Worker Configuration
WORKER_POLL_INTERVAL=5000
```

### Running Locally

```bash
# Development mode
bun run worker

# Production build
bun run build
bun dist/src/worker.js
```

## 🐳 Docker Deployment

### Build Docker Image

```bash
docker build -t blockchain-worker .
```

### Run Container

```bash
docker run -d \
  --env-file .env \
  --name blockchain-worker \
  blockchain-worker
```

## ☁️ AWS ECS Deployment

This project includes complete AWS ECS deployment configuration for production use.

### Prerequisites

- AWS CLI configured with appropriate credentials
- Docker installed locally
- ECR repository created
- Secrets stored in AWS Secrets Manager

### Deployment Steps

1. **Build and push Docker image to ECR**
   ```bash
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com
   docker build -t blockchain-worker .
   docker tag blockchain-worker:latest <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/blockchain-worker:latest
   docker push <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/blockchain-worker:latest
   ```

2. **Register task definition**
   ```bash
   aws ecs register-task-definition --cli-input-json file://aws-ecs-task-definition.json
   ```

3. **Create ECS service**
   ```bash
   aws ecs create-service --cluster blockchain-worker-cluster --service-name blockchain-worker-service --task-definition blockchain-worker --desired-count 1 --launch-type FARGATE --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}"
   ```

### Managing the Service

**Start the worker:**
```bash
aws ecs update-service --cluster blockchain-worker-cluster --service blockchain-worker-service --desired-count 1 --region us-east-1
```

**Stop the worker:**
```bash
aws ecs update-service --cluster blockchain-worker-cluster --service blockchain-worker-service --desired-count 0 --region us-east-1
```

**View logs:**
```bash
aws logs tail /ecs/blockchain-worker --follow --region us-east-1
```

## 🔄 CI/CD with GitHub Actions

This project includes automated deployment via GitHub Actions. When you push code to the `main` branch, it will automatically:

1. Build a new Docker image
2. Push to AWS ECR
3. Update the ECS service with the new image
4. Wait for deployment to stabilize

### Setup GitHub Secrets

To enable automatic deployment, add these secrets to your GitHub repository:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add the following secrets:

| Secret Name | Description |
|-------------|-------------|
| `AWS_ACCESS_KEY_ID` | Your AWS access key ID |
| `AWS_SECRET_ACCESS_KEY` | Your AWS secret access key |

### How It Works

- **Trigger**: Automatically runs on push to `main` branch (only when files in `blockchain-be/` change)
- **Build**: Creates Docker image with commit SHA as tag
- **Deploy**: Updates ECS task definition and service automatically
- **Verify**: Waits for service to stabilize before completing

### Manual Trigger

You can also trigger deployment manually:
1. Go to **Actions** tab in GitHub
2. Select **Deploy to AWS ECS** workflow
3. Click **Run workflow**

### Workflow File

The workflow is located at `.github/workflows/deploy-ecs.yml` and can be customized as needed.

## 📊 Data Processing

### User Registration Queue

The worker processes user registrations with the following data structure:

- User ID, email, phone number, name
- Aadhaar ID
- Location details (PIN, district, city, state, municipal)
- Creation timestamp

### Complaint Queue

The worker processes complaints with:

- Category and subcategory
- Description and urgency level
- Attachment URLs
- Assigned department
- Location information
- User ID and submission date
- Public/private flag

### Processing Flow

1. Worker polls Redis queues at configured intervals
2. Retrieves data from queue (FIFO)
3. Uploads metadata to IPFS via Pinata
4. Constructs blockchain transaction
5. Submits transaction to smart contract
6. Handles retries on failure
7. Logs success/failure for monitoring

## 🔧 Development

### Project Structure

```
blockchain-be/
├── src/
│   └── worker.ts          # Main worker implementation
├── artifacts/             # Compiled smart contract ABIs
├── contracts/             # Solidity smart contracts
├── Dockerfile             # Docker configuration
├── aws-ecs-task-definition.json  # AWS ECS task definition
└── tsconfig.json          # TypeScript configuration
```

### Building

```bash
# Compile TypeScript
bun run build
# or
tsc
```

### Testing

```bash
# Run Hardhat tests
bun test
# or
npx hardhat test
```

## 🔐 Security Considerations

- **Private Keys**: Never commit private keys to version control. Use AWS Secrets Manager or environment variables
- **Redis Security**: Use secure Redis connections (TLS) in production
- **IPFS**: Pinata JWT tokens should be stored securely
- **Network**: Deploy worker in secure VPC with appropriate security groups

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `REDIS_URL` | Redis connection string | Yes |
| `BLOCKCHAIN_RPC_URL` | Ethereum RPC endpoint | Yes |
| `PRIVATE_KEY` | Wallet private key for transactions | Yes |
| `CONTRACT_ADDRESS` | Deployed smart contract address | Yes |
| `PINATA_JWT` | Pinata API JWT token | Yes |
| `WORKER_POLL_INTERVAL` | Polling interval in milliseconds | No (default: 5000) |

## 🐛 Troubleshooting

### Worker not processing items

- Check Redis connection: Verify `REDIS_URL` is correct
- Check queue names: Ensure queues match expected names
- Check logs: Review CloudWatch logs for errors

### Blockchain transaction failures

- Verify RPC endpoint is accessible
- Check private key has sufficient balance for gas
- Verify contract address is correct
- Check network congestion

### IPFS upload failures

- Verify Pinata JWT token is valid
- Check API rate limits
- Verify network connectivity

## 📄 License

ISC

## 🤝 Contributing

Contributions are welcome! Please ensure all tests pass before submitting pull requests.

## 📞 Support

For issues and questions, please open an issue in the repository.
