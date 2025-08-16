const { ethers, deployments, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")
const helpers = require("@nomicfoundation/hardhat-network-helpers")
const {developmentChains} = require("../../helper-hardhat-config")

/**
 * 
 * 集成测试测试用例
 * 
 */
describe("test fundme contract", function () {
    let fundMe
    let firstAccount
    beforeEach(async function () {
        await deployments.fixture(["all"])
        firstAccount = (await getNamedAccounts()).firstAccount
        const fundMeDeployment = await deployments.get("FundMe")
        fundMe = await ethers.getContractAt("FundMe", (await fundMeDeployment).address)

    })

    //测试 成功fund 后成功 后refund

      it("fund and getFund sucessfully ", async function () {
        //保证达到一定 的数量
        await fundMe.fund({ value: ethers.parseEther("0.5") })
        //等待180 秒达到窗口已经关闭
        await new Promise(resolve => setTimeout(resolve, 181*1000))
        const  getFundTx  = await fundMe.getFund()
        //等待连上区块
        const  getFundReceipt  = await getFundTx.wait()
         expect(getFundReceipt)
                .to.emit(fundMe, "FundWithdrawByOwner").withArgs(ethers.parseEther("0.5"))
    })


    it("fund and reFund sucessfully ", async function () {
        //保证达到一定 的数量
        await fundMe.fund({ value: ethers.parseEther("0.1") })  //3000*0.1 = 300
        //等待180 秒达到窗口已经关闭
        await new Promise(resolve => setTimeout(resolve, 181*1000))
        const  reFundTx  = await fundMe.refund()
        //等待连上区块
        const  reFundReceipt  = await reFundTx.wait()
         expect(reFundReceipt)
                .to.emit(fundMe, "RefundByFunder").withArgs(firstAccount,ethers.parseEther("0.1"))
    })
    

})