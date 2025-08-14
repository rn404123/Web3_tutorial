
// function deployFunction(){
//     console.log("this is a deploy function")
// }

const { network } = require("hardhat")
const { developmentChains, networkConfig,LOCK_TIME,CONFIRMATIONS } = require("../helper-hardhat-config")



//module.exports.default = deployFunction
// module.exports = async() => {
//     const getNamedAccounts = hre.getNamedAccounts
//     const deployments = hre.deployments
//      console.log("this is a deploy function")
// }

module.exports = async ({ getNamedAccounts, deployments }) => {
     const { firstAccount } = await getNamedAccounts()  //const firstAccount = (await getNamedAccounts()).firstAccount
     const { deploy } = deployments  //  const deploy = deployments.deploy

     let dataFeedAddr
     if (developmentChains.includes(network.name)) {
          //本地环境
          const mockV3Aggregator = await  deployments.get("MockV3Aggregator")
          dataFeedAddr = mockV3Aggregator.address
     } else {
          dataFeedAddr = networkConfig[network.config.chainId].ethUsdDataFeed
     }


     const fundMe = await deploy("FundMe", {
          from: firstAccount,
          args: [LOCK_TIME, dataFeedAddr],
          log: true,
          //waitConfirmations: CONFIRMATIONS   //说明在mock 等待区块不需要加，浪费时间，再测试网络 1 - 2 个，如果在主网则一般等待网络区块3-6个即可
     })
     //删除deployments 文件夹或者命令后reset   如:npx hardhat deploy --network sepolia --reset  
     if (hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_API_KEY) {

          // await hre.run("verify:verify", {
          //      address: fundMe.address,
          //      constructorArguments: [LOCK_TIME, dataFeedAddr],
          // });
          console.log("我想验证但是网络连接不上")
     } else {
          console.log("newwork is not sepolia verification skipped...")
     }

}


module.exports.tags = ["all", "fundme"]