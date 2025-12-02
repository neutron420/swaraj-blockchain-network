import Web3 from 'web3';
import fs from 'fs';
import path from 'path';

// Configuration
const BESU_RPC_URL = 'http://localhost:8545';
const DEPLOYER_PRIVATE_KEY = '0xYourPrivateKeyHere'; // Replace with actual key

// Contract bytecode and ABI (compile Solidity contract first)
// You need to compile the GrievanceContract.sol using solc or Hardhat
const CONTRACT_BYTECODE = 'YOUR_CONTRACT_BYTECODE_HERE';
const CONTRACT_ABI = [/* YOUR_CONTRACT_ABI_HERE */];

async function deployContract() {
  console.log(' Deploying GrievanceContract to Besu...\n');

  // Initialize Web3
  const web3 = new Web3(BESU_RPC_URL);
  
  // Add account
  const account = web3.eth.accounts.privateKeyToAccount(DEPLOYER_PRIVATE_KEY);
  web3.eth.accounts.wallet.add(account);
  web3.eth.defaultAccount = account.address;

  console.log(` Deploying from: ${account.address}`);

  // Check balance
  const balance = await web3.eth.getBalance(account.address);
  console.log(` Balance: ${web3.utils.fromWei(balance, 'ether')} ETH`);

  // Get current block number
  const blockNumber = await web3.eth.getBlockNumber();
  console.log(` Current block: ${blockNumber}\n`);

  try {
    // Create contract instance
    const contract = new web3.eth.Contract(CONTRACT_ABI);

    // Deploy
    console.log('⏳ Deploying contract...');
    
    const deployTx = contract.deploy({
      data: CONTRACT_BYTECODE,
    });

    const gas = await deployTx.estimateGas({ from: account.address });
    console.log(` Estimated gas: ${gas}`);

    const deployedContract = await deployTx.send({
      from: account.address,
      gas: Math.floor(gas * 1.2),
    });

    console.log('\n Contract deployed successfully!');
    console.log(` Contract address: ${deployedContract.options.address}`);
    console.log(` Transaction hash: ${deployedContract.options.transactionHash || 'N/A'}\n`);

    // Save contract address to file
    const config = {
      contractAddress: deployedContract.options.address,
      deployer: account.address,
      deployedAt: new Date().toISOString(),
      network: BESU_RPC_URL,
    };

    fs.writeFileSync(
      path.join(__dirname, '../contract-config.json'),
      JSON.stringify(config, null, 2)
    );

    console.log('Contract configuration saved to contract-config.json');
    console.log('\n Update your blockchain-worker.ts with this address:');
    console.log(`   contractAddress: '${deployedContract.options.address}'`);

  } catch (error: any) {
    console.error('Deployment failed:', error.message);
    throw error;
  }
}

deployContract()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });