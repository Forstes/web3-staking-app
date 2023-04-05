const { ethers, run, network } = require("hardhat");

async function main() {
  console.log(network.config);

  const contractFactory = await ethers.getContractFactory("StakingContract");
  const contract = await contractFactory.deploy(network.config.rewardTokenAddress, 10);
  await contract.deployed();
  console.log(`Contract address ${contract.address}`);

  if (network.config.chainId === 97) {
    contract.deployTransaction.wait(5);
    verify(contract.address, []);
  }
}

async function verify(contractAddress, arguments) {
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: arguments,
    });
  } catch (e) {
    if (e.message.toLowerCase.includes("already verified")) {
      console.log("The contract already verified");
    } else {
      console.log(e);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
