import { task } from "hardhat/config"
import { getDeployedContractAddress } from "../utils/utils"

/**
 Example:
 hh ragnarok-transform:re-roll --network sepolia \
   --token-ids 1,2,3 \
   --chip-ids 4,0,0
 */
task("ragnarok-transform:re-roll", "Re-roll")
	.addParam<string>("tokenIds", "Ids of tokens to transform")
	.addParam<string>("chipIds", "Ids of tokens to transform")
	.setAction(async (taskArgs, hre) => {
		const tokenIds = taskArgs.tokenIds.split(",").map(Number)
		const chipIds = taskArgs.chipIds.split(",").map(Number)
		if (tokenIds.length !== chipIds.length) throw new Error("tokenIds and chipIds must have the same length")
		console.log("executing re-roll with tokens: ")
		for (let i = 0; i < tokenIds.length; i++) {
			if (chipIds[i] === 0) {
				console.log(`token: ${tokenIds[i]}, WITHOUT CHIP`)
			} else {
				console.log(`token: ${tokenIds[i]}, chip: ${chipIds[i]}`)
			}
		}

		const contractAddress = await getDeployedContractAddress({ hre, name: "RagnarokTransform" })
		const contract = await hre.ethers.getContractAt("RagnarokTransform", contractAddress)
		const mintTrx = await contract.reRoll(tokenIds, chipIds)
		console.log(`Transaction Hash: ${mintTrx.hash}`)
		await mintTrx.wait(1)
		console.log("Transaction confirmed")
	})
