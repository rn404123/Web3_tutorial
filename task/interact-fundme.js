const { task } = require("hardhat/config")
task("interact-fundMe","interact with fundme contract ").addParam("addr", "fundme contract address").setAction(async (taskArgs, hre) => {

    const fundMeFactory = await ethers.getContractFactory("FundMe")
    //使用已部署的合约
    const fundMe = fundMeFactory.attach(taskArgs.addr)

    //初始化两个账户
    const [firstAccount, secondAccount] = await ethers.getSigners()

    //第一转账到合约
    const fundTX = await fundMe.fund({ value: ethers.parseEther("0.05") })
    await fundTX.wait()

    //查看合约余额
    const balanceOfContract = await ethers.provider.getBalance(fundMe.target)
    console.log(`balance of the conteact is ${balanceOfContract}`)


    //从第二个账号fund 到合约
    const fundTXWithSecondAccount = await fundMe.connect(secondAccount).fund({ value: ethers.parseEther("0.05") })
    await fundTXWithSecondAccount.wait()
    //查看第余额
    const balanceOfContractAfterSecondFUnd = await ethers.provider.getBalance(fundMe.target)
    console.log(`balance of the conteact is ${balanceOfContractAfterSecondFUnd}`)

    //check mapping
    const firstAccountbalanceInFundMe = await fundMe.funderToAmount(firstAccount.address)

    const sencondAccountbalanceInFundMe = await fundMe.funderToAmount(secondAccount.address)

    console.log(`Balance of first account ${firstAccount.address} is ${firstAccountbalanceInFundMe}`)
    console.log(`Balance of first account ${secondAccount.address} is ${sencondAccountbalanceInFundMe}`)

})

module.exports = {}
