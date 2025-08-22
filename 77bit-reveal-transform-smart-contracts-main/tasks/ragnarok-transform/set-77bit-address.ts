import { task } from "hardhat/config"
import { getDeployedContractAddress } from "../utils/utils"

/**
 Example:
 hh ragnarok-transform:set-77bit-address \
   --address 0x5FbDB2315678afecb367f032d93F642f64180aa3 \
   --network sepolia
 */
task("ragnarok-transform:set-77bit-address", "Set 77bit address")
	.addParam<string>("address", "Address of 77bit contract")
	.setAction(async (taskArgs, hre) => {
		const contractAddress = await getDeployedContractAddress({ hre, name: "RagnarokTransform" })
		const contract = await hre.ethers.getContractAt("RagnarokTransform", contractAddress)
		const mintTrx = await contract.setSevenSevenBitAddress(taskArgs.address)
		console.log(`Transaction Hash: ${mintTrx.hash}`)
		await mintTrx.wait(1)
		console.log("Transaction confirmed")
	})
