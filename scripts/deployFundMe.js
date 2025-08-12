// import ethers.js
// create main function
    //1、初始化两个账户
    //2、fund 合约到第一个账
    // 3 查看合约余额
//execute main function

const { ethers } = require("hardhat")

async function main() {
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
   
    //初始化两个账户
    const [firstAccount,secondAccount] = await ethers.getSigners()

    //第一转账到合约
    const fundTX = await fundMe.fund({value: ethers.parseEther("0.05")})
    await fundTX.wait()

    //查看合约余额
    const balanceOfContract = await ethers.provider.getBalance(fundMe.target)
    console.log(`balance of the conteact is ${balanceOfContract}`)


    //从第二个账号fund 到合约
    const fundTXWithSecondAccount = await fundMe.connect(secondAccount).fund({value: ethers.parseEther("0.05")})
    await fundTXWithSecondAccount.wait()
    //查看第余额
    const balanceOfContractAfterSecondFUnd = await ethers.provider.getBalance(fundMe.target)
    console.log(`balance of the conteact is ${balanceOfContractAfterSecondFUnd}`)

    //check mapping
    const firstAccountbalanceInFundMe = await fundMe.funderToAmount(firstAccount.address)

     const sencondAccountbalanceInFundMe = await fundMe.funderToAmount(secondAccount.address)

     console.log(`Balance of first account ${firstAccount.address} is ${firstAccountbalanceInFundMe}`)
      console.log(`Balance of first account ${secondAccount.address} is ${sencondAccountbalanceInFundMe}`)

}

async function verifyFundMe(fundMeAddr, args) {

    await hre.run("verify:verify", {
        address: fundMeAddr,
        constructorArguments: args,
    });
}

// 自动重试验证函数，最多尝试 maxRetries 次
async function verifyWithRetry(address, constructorArguments, maxRetries) {
    for (let i = 1; i <= maxRetries; i++) {
        try {
            console.log(`Verification attempt ${i}...`);
            await run("verify:verify", {
                address,
                constructorArguments,
            });
            console.log("✅ Verification successful!");
            break; // 成功后跳出循环
        } catch (error) {
            console.warn(`⚠️ Attempt ${i} failed: ${error.message}`);
            if (i === maxRetries) {
                console.error("❌ Verification failed after maximum retries.");
                throw error;
            }
            console.log("⏳ Waiting 10 seconds before retry...");
            await new Promise(resolve => setTimeout(resolve, 10000));
        }
    }
}

main().then(result => {
    console.log("成功：", result);
}).catch((error) => {
    console.error(error);
    process.exit(1)

})