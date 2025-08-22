import { task } from "hardhat/config"
import { getDeployedContractAddress } from "../utils/utils"

/**
 Example:
 hh 77bit:add-minter \
 --address 0x5FbDB2315678afecb367f032d93F642f64180aa3 \
 --network sepolia
 */
task("77bit:add-minter", "Add minter")
	.addParam<string>("address", "Address to add as minter")
	.setAction(async (taskArgs, hre) => {
	const contractAddress = await getDeployedContractAddress({ hre, name: "SevenSevenBit" })
	const contract = await hre.ethers.getContractAt("SevenSevenBit", contractAddress)
	const tx = await contract.addMinter(taskArgs.address)
	console.log(`Adding minter ${taskArgs.address} to ${contractAddress}...txHash=${tx.hash}`)
	await tx.wait()
	console.log(`Adding minter ${taskArgs.address} to ${contractAddress}...done`)
})
