import { task } from "hardhat/config"
import { getDeployedContractAddress } from "../utils/utils"

/**
 Example:
 hh 77bit:remove-minter \
 --address 0x5FbDB2315678afecb367f032d93F642f64180aa3 \
 --network sepolia
 */
task("77bit:remove-minter", "Remove minter")
	.addParam<string>("address", "Address to remove as minter")
	.setAction(async (taskArgs, hre) => {
	const contractAddress = await getDeployedContractAddress({ hre, name: "SevenSevenBit" })
	const contract = await hre.ethers.getContractAt("SevenSevenBit", contractAddress)
	const tx = await contract.removeMinter(taskArgs.address)
	console.log(`Removing minter ${taskArgs.address} from ${contractAddress}...txHash=${tx.hash}`)
	await tx.wait()
	console.log(`Removing minter ${taskArgs.address} from ${contractAddress}...done`)
})
