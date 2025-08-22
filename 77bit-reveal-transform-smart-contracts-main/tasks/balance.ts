import { task } from "hardhat/config"
import { getDefaultAccountIfEmpty } from "./utils/utils"

task("balance", "Prints an account's balance")
	.addParam("account", "The account's address", undefined, undefined, true)
	.setAction(async (taskArgs, hre) => {
		const account = await getDefaultAccountIfEmpty({
			hre,
			account: taskArgs.account,
			argName: "account",
		})
		const balance = await hre.ethers.provider.getBalance(account)

		console.log("balance is", hre.ethers.formatEther(balance), "ETH")
	})
