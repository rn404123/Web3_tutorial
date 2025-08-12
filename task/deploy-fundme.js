const { task } = require("hardhat/config")
task("deploy-fundme","deploy and verify fundme contract ").setAction(async (taskArgs, hre) => {
    //创建一个合约工厂
    const fundMeFactory = await ethers.getContractFactory("FundMe")

    console.log("contract  deploying ")

    //发布合约
    const fundMe = await fundMeFactory.deploy(300)

    //等待发布完成  该代码执行完成表示该合约真正的部署完成
    await fundMe.waitForDeployment()

    console.log("contract has been deployed successfully ,contrats address is " + fundMe.target)

    //验证合约
    // if(hre.network.config.chinId == 11155111 && process.env.ETHERSCAN_API_KEY){
    //     fundMe.deploymentTransaction().wait(5)
    //     console.log("waiting for 5 confirmations " + fundMe.target)
    //     await verifyFundMe(fundMe.target, [300])
    // }else{
    //      console.log("verification skipped..... " )
    // }
})

async function verifyFundMe(fundMeAddr, args) {

    await hre.run("verify:verify", {
        address: fundMeAddr,
        constructorArguments: args,
    });
}