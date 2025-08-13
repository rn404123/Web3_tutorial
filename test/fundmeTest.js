const { ethers, deployments, getNamedAccounts } = require("hardhat")
const { assert } = require("chai")

describe("test fundme contract",function(){
    let fundMe
    let firstAccount 
    beforeEach(async function(){
        await deployments.fixture(["all"])
        firstAccount = (await getNamedAccounts()).firstAccount
        const fundMeDeployment = deployments.get("FundMe")
        fundMe = await ethers.getContractAt("FundMe",(await fundMeDeployment).address)
    })

    it("test if the owner is mag.sender", async function () {
      
        await fundMe.waitForDeployment()
     
        // 3. 验证 owner 是否为部署者地址
        const owner = await fundMe.owner();
        assert.equal(owner, firstAccount);
    })

    it("test if the dataFeed is assigned correctly", async function () {
       
       
        await fundMe.waitForDeployment()
     
        // 3. 验证 owner 是否为部署者地址
        const dataFeed = await fundMe.dataFeed();
        assert.equal(dataFeed, "0x694AA1769357215DE4FAC081bf1f309aDC325306");
    })
})