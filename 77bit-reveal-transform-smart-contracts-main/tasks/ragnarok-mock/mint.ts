import { task } from "hardhat/config"
import { getDefaultAccountIfEmpty, getDeployedContractAddress } from "../utils/utils"

/**
 Example:
 hardhat ragnarok-mock:mint \
 --contract 0x320bd6de80d3D5361e1c9bB4CF1D7D9Ef24F3Ac7 \
 --recipient 0x73faDd7E476a9Bc2dA6D1512A528366A3E50c3cF \
 --id 1 \
 --amount 10 \
 --network sepolia
 */
task("ragnarok-mock:mint", "Mint tokens")
	.addParam<string>("recipient", "Token Recipient", undefined, undefined, true)
	.addParam<string>("id", "Token ID")
	.addParam<string>("amount", "Token Amount")
	.setAction(async (taskArgs, hre) => {
		const recipient = await getDefaultAccountIfEmpty({
			hre,
			account: taskArgs["recipient"],
			argName: "recipient",
		})
		const contractAddress = await getDeployedContractAddress({ hre, name: "RagnarokMock" })
		const contract = await hre.ethers.getContractAt("RagnarokMock", contractAddress)
		const mintTrx = await contract.mint(recipient, taskArgs.id, taskArgs.amount)
		console.log(`Transaction Hash: ${mintTrx.hash}`)
		await mintTrx.wait(1)
		console.log("Transaction confirmed")
	})
