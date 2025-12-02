import { ethers } from "hardhat";

async function main() {
  console.log("Deploying GrievanceContract...");

  const GrievanceContract = await ethers.getContractFactory("GrievanceContract");
  const contract = await GrievanceContract.deploy();

  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`GrievanceContract deployed to: ${address}`);
  
  return address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
