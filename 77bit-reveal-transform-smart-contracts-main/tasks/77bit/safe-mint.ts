import { task } from "hardhat/config"
import { getDefaultAccountIfEmpty, getDeployedContractAddress } from "../utils/utils"

/**
 Example:
 hardhat 77bit:safe-mint \
 --amount 7777 \
 --recipient 0x73faDd7E476a9Bc2dA6D1512A528366A3E50c3cF \
 --network sepolia
 */
task("77bit:safe-mint", "Mint token for BasicERC721 Smart Contract")
	.addParam<number>("amount", "Token Amount")
	.addParam<string>("recipient", "NFT Token Recipient", undefined, undefined, true)
	.setAction(async (taskArgs, hre) => {
		const recipient = await getDefaultAccountIfEmpty({ hre, account: taskArgs.recipient, argName: "recipient" })
		const contractAddress = await getDeployedContractAddress({ hre, name: "SevenSevenBit" })
		const contract = await hre.ethers.getContractAt("SevenSevenBit", contractAddress)

		const mintTrx = await contract.safeMint(recipient, taskArgs.amount)

		console.log(`Transaction Hash: ${mintTrx.hash}`)
		await mintTrx.wait(1)
		console.log("Transaction confirmed")
	})
