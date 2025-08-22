import { task } from "hardhat/config"
import { getDeployedContractAddress } from "../utils/utils"

/**
 Example:
 hh ragnarok-transform:art-upgrade --network sepolia \
   --token-ids 1,2,3,4,5
 */
task("ragnarok-transform:art-upgrade", "Mint tokens")
	.addParam<string>("tokenIds", "Ids of tokens to transform")
	.setAction(async (taskArgs, hre) => {
		const tokenIds = taskArgs.tokenIds.split(",").map(Number)

		const contractAddress = await getDeployedContractAddress({ hre, name: "RagnarokTransform" })
		const contract = await hre.ethers.getContractAt("RagnarokTransform", contractAddress)
		console.log("art-upgrading tokens", tokenIds)
		const mintTrx = await contract.artUpgrade(tokenIds)
		console.log(`Transaction Hash: ${mintTrx.hash}`)
		await mintTrx.wait(1)
		console.log("Transaction confirmed")
	})
