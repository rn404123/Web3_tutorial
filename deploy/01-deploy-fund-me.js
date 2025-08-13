// function deployFunction(){
//     console.log("this is a deploy function")
// }



//module.exports.default = deployFunction
// module.exports = async() => {
//     const getNamedAccounts = hre.getNamedAccounts
//     const deployments = hre.deployments
//      console.log("this is a deploy function")
// }

module.exports = async({getNamedAccounts,deployments}) => {
     const {firstAccount} = await getNamedAccounts()  //const firstAccount = (await getNamedAccounts()).firstAccount
     const {deploy} = deployments  //  const deploy = deployments.deploy
     await deploy("FundMe",{
          from: firstAccount,
          args: [180],
          log: true
     })
}

module.exports.tags = ["all","fundme"]