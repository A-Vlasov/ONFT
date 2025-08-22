import { task } from "hardhat/config"
import { getDeployedContractAddress } from "../utils/utils"

/**
 Example:
 hh 77bit:owner-of \
 --token-id 1 \
 --network sepolia
 */
task("77bit:owner-of", "Get owner of specific token")
	.addParam("tokenId", "Token ID")
	.setAction(async (taskArgs, hre) => {
		const contractAddress = await getDeployedContractAddress({ hre, name: "SevenSevenBit" })
		const contract = await hre.ethers.getContractAt("SevenSevenBit", contractAddress)
		const owner = await contract.ownerOf(taskArgs.tokenId)
		console.log(`Owner is ${owner}`)
	})
