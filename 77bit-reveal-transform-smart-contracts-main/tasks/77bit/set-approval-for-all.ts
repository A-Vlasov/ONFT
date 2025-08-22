import { task } from "hardhat/config"
import { getDeployedContractAddress } from "../utils/utils"

/**
 Example:
 hh 77bit:set-approval-for-all \
	--operator 0x1234567890123456789012345678901234567890 \
 	--approve true \
 	--network sepolia
 */
task("77bit:set-approval-for-all", "Set approval for all 77bit tokens to RagnarokTransform contract")
	.addParam<string>("operator", "Operator address")
	.addParam<boolean>("approve", "Approve or disapprove")
	.setAction(async (taskArgs, hre) => {
		const contractAddress = await getDeployedContractAddress({ hre, name: "SevenSevenBit" })
		const contract = await hre.ethers.getContractAt("SevenSevenBit", contractAddress)

		const trx = await contract.setApprovalForAll(taskArgs.operator, taskArgs.approve)

		console.log(`Transaction Hash: ${trx.hash}`)
		await trx.wait(1)
		console.log("Transaction confirmed")
	})
