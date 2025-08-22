import { HardhatRuntimeEnvironment } from "hardhat/types"

export async function getDeployedContractAddress({ hre, name }: { hre: HardhatRuntimeEnvironment; name: string }) {
	const deployedContracts = await hre.deployments.get(name)
	console.log(`resolved address of deployed '${name}' contract`, deployedContracts.address)
	return deployedContracts.address
}

export async function getDefaultAccountIfEmpty({
	hre,
	account,
	argName,
}: {
	hre: HardhatRuntimeEnvironment
	account: string | undefined
	argName: string
}) {
	if (!account) {
		const defaultAddress = (await hre.ethers.getSigners())[0].address
		console.log(`${argName} not provided, using default account as ${argName}:`, defaultAddress)
		return defaultAddress
	}
	return account
}
