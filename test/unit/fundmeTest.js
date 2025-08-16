const { ethers, deployments, getNamedAccounts, network } = require("hardhat")
const { assert, expect } = require("chai")
const helpers = require("@nomicfoundation/hardhat-network-helpers")
const {developmentChains} = require("../../helper-hardhat-config")

/**
 * 
 * 单元测试测试用例
 * 
 * 
 */
!developmentChains.includes(network.name) 
? describe.skip 
: describe("test fundme contract", function () {
    let fundMe
    let fundMeSencondAccount
    let firstAccount
    let secondAccount
    let mockV3Aggregator
    beforeEach(async function () {
        await deployments.fixture(["all"])
        firstAccount = (await getNamedAccounts()).firstAccount
        secondAccount = (await getNamedAccounts()).secondAccount
        const fundMeDeployment = await deployments.get("FundMe")
        mockV3Aggregator = await deployments.get("MockV3Aggregator")
        fundMe = await ethers.getContractAt("FundMe", (await fundMeDeployment).address)
        fundMeSencondAccount = await ethers.getContract("FundMe", secondAccount)

    })

    it("test if the owner is msg.sender", async function () {

        await fundMe.waitForDeployment()

        // 3. 验证 owner 是否为部署者地址
        const owner = await fundMe.owner();
        assert.equal(owner, firstAccount);
    })

    it("test if the dataFeed is assigned correctly", async function () {


        await fundMe.waitForDeployment()

        // 3. 验证 owner 是否为部署者地址
        const dataFeed = await fundMe.dataFeed();
        //  assert.equal(dataFeed, "0x694AA1769357215DE4FAC081bf1f309aDC325306");
        assert.equal(dataFeed, mockV3Aggregator.address);
    })

    //fund getfund refund
    //unit test for fund 
    //window open 

    it("window closed value grater than minimum, fund failed",
        async function () {
            //测试window 关闭
            await helpers.time.increase(200)
            await helpers.mine()
            expect(fundMe.fund({ value: ethers.parseEther("0.1") }))
                .to.be.revertedWith("window is closed")  //wei
        })

    it("window open, value is greater minmum, fund success",
        async function () {
            await fundMe.fund({ value: ethers.parseEther("0.1") })
            const balance = await fundMe.funderToAmount(firstAccount)
            expect(balance).to.equal(ethers.parseEther("0.1"))
        })

    it("not owner, window closed, target reached,getFund failed",
        async function () {
            await fundMe.fund({ value: ethers.parseEther("1") })

            await helpers.time.increase(200)
            await helpers.mine()



            expect(fundMeSencondAccount.getFund())
                .to.be.revertedWith("this function can only be called by owner")
        })


    it("window open, target reached",
        async function () {
            await fundMe.fund({ value: ethers.parseEther("1") })
            expect(fundMe.getFund())
                .to.be.revertedWith("window is not closed")
        })


    it("window close, target reached,getFund success",
        async function () {
            await fundMe.fund({ value: ethers.parseEther("1") })
            //流失200秒
            await helpers.time.increase(200)
            await helpers.mine()

            await expect(fundMe.getFund())
                .to.emit(fundMe, "FundWithdrawByOwner").withArgs(ethers.parseEther("1.1"))
        })


    //refund
    //窗口关闭，目标值没有达到

    it("窗口没有关闭，目标值没有达到 执行refund",
        async function () {
            await fundMe.fund({ value: ethers.parseEther("0.1") })
            await expect(fundMe.refund())
                .to.be.revertedWith("window is not closed")
        })


    it("窗口已经关闭，目标值达到 执行refund",
        async function () {
            await fundMe.fund({ value: ethers.parseEther("1") })

            //流失200秒
            await helpers.time.increase(200)
            await helpers.mine()

            await expect(fundMe.refund())
                .to.be.revertedWith("Target is  reached!")
        })


    it("窗口已经关闭，目标值没有达到 执行refund",
        async function () {
            await fundMe.fund({ value: ethers.parseEther("0.1") })

            //流失200秒
            await helpers.time.increase(200)
            await helpers.mine()

            await expect(fundMeSencondAccount.refund())
                .to.be.revertedWith("there is no fund for you")
        })



    it("所有条件都满足",
        async function () {
            await fundMe.fund({ value: ethers.parseEther("0.1") })

            //流失200秒
            await helpers.time.increase(200)
            await helpers.mine()

            await expect(fundMe.refund())
                 .to.emit(fundMe, "RefundByFunder").withArgs(firstAccount, ethers.parseEther("0.1"))
        })

})