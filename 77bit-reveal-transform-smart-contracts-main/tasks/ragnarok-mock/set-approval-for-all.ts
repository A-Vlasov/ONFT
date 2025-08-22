import { task } from "hardhat/config"
import { getDeployedContractAddress } from "../utils/utils"

/**
 Example:
 hh ragnarok-mock:set-approval-for-all --operator 0x55B454d00F11DDf55BFA7b50CDE6816850cB5be8 --approve true  --network sepolia
 */
task("ragnarok-mock:set-approval-for-all", "Calls setApprovalForAll")
	.addParam<string>("operator", "Operator address")
	.addParam<boolean>("approve", "Approve All")
	.setAction(async (taskArgs, hre) => {
		const contractAddress = await getDeployedContractAddress({ hre, name: "RagnarokMock" })
		const contract = await hre.ethers.getContractAt("RagnarokMock", contractAddress)

		const trx = await contract.setApprovalForAll(taskArgs.operator, taskArgs.approve)

		console.log(`Transaction Hash: ${trx.hash}`)
		await trx.wait(1)
		console.log("Transaction confirmed")
	})
