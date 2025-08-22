import { task } from "hardhat/config"
import { getDeployedContractAddress } from "../utils/utils"

/**
 Example:
 hh ragnarok-transform:set-sld-chip-address \
   --address 0x5FbDB2315678afecb367f032d93F642f64180aa3 \
   --network sepolia
 */
task("ragnarok-transform:set-sld-chip-address", "Set sld-chip address")
	.addParam<string>("address", "Address of sld-chip contract")
	.setAction(async (taskArgs, hre) => {
		const contractAddress = await getDeployedContractAddress({ hre, name: "RagnarokTransform" })
		const contract = await hre.ethers.getContractAt("RagnarokTransform", contractAddress)
		const mintTrx = await contract.setSldChipAddress(taskArgs.address)
		console.log(`Transaction Hash: ${mintTrx.hash}`)
		await mintTrx.wait(1)
		console.log("Transaction confirmed")
	})
