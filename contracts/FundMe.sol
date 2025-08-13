//SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";



// 1、 创建一个收款函数  
// 2、 记录投资人，并且查看
// 3、 在锁定期内，达到目标值，生产商可以提款
// 4、  在锁定期内，没有到达目标值, 投资人可以退款

contract  FundMe {
    //2、记录投资人
    mapping (address => uint256) public funderToAmount;
 
 

     uint256 MINIMUN_VALUE_USD = 100 * 10 ** 18;  //USD

     //合约类型 内部
    AggregatorV3Interface public dataFeed;

    //constant 常量
     uint256 constant TARGET = 1000 * 10 ** 18;  //USD


    
     address public owner;

    //开始时间
     uint256 deploymentTimestamp;
     //锁定时间
     uint256 lockTime;

     address erc20Addr;

    //如果是public 类型的solidity 自动会创建get 函数和set 函数
     bool  public getFundSucess = false;


    constructor(uint256 _lockTime){
        owner = msg.sender;
        //seplolin 测试网
        dataFeed = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);
        //当前区块时间
        deploymentTimestamp = block.timestamp;
        lockTime = _lockTime;
    }



    //1、收款函数 payable
    function fund() external  payable {
        //交易要求最小值，没有达到Send more ETH
       // require(conberEthToUsd(msg.value) >= MINIMUN_VALUE_USD,"Send more ETH"); 
        require(block.timestamp < deploymentTimestamp + lockTime,"window is closed");
        funderToAmount[msg.sender] = msg.value;
    }
     /**
     * Returns the latest answer.
     */
    function getChainlinkDataFeedLatestAnswer() public view returns (int) {
        // prettier-ignore
        (
            /* uint80 roundId */,
            int256 answer,
            /*uint256 startedAt*/,
            /*uint256 updatedAt*/,
            /*uint80 answeredInRound*/
        ) = dataFeed.latestRoundData();
        return answer;
    }

    function conberEthToUsd(uint256 ethAmouont)internal view  returns (uint256) {
        
        uint256 ethPrice = uint(getChainlinkDataFeedLatestAnswer());
        return ethAmouont * ethPrice / (10 ** 8);
   
    }

    function transferOwnership(address newOwner) public {
         require(msg.sender == owner,"this function can only be called by owner !");
        owner = newOwner;
    }
    //获取资产
    function getFund() external   windowClose {
      //  require(conberEthToUsd(address(this).balance) >= TARGET,"Target is not reached!");
        //require(msg.sender == owner,"this function can only be called by owner !");
         //1、transfer 2、send 3、 call  说明: 1 和2是纯转账 3 可携带数据
      //  payable(msg.sender).transfer(address(this).balance);
      // 第二种写法
       // bool success =  payable(msg.sender).send(address(this).balance);
        //require(success,"tx failed");
        //第三种写法 call 推荐
        bool success; 
        (success,) = payable(msg.sender).call{value : address(this).balance}("");

        require(success,"txansfer tx failed");
        funderToAmount[msg.sender] = 0;

        getFundSucess = true;  //falg 标识
    }


    //退款操作
    function refund() external windowClose {
         require(conberEthToUsd(address(this).balance) <= TARGET,"Target is  reached!");

        require(funderToAmount[msg.sender] != 0,"there is no fund for you");


        bool success;
        (success,) = payable(msg.sender).call{value : funderToAmount[msg.sender]}("");

         require(success,"txansfer tx failed");
         //执行成功后把值归0
         funderToAmount[msg.sender] = 0;
    }

    function setFunderToAmount(address funder,uint256 amountTOUpdate) external  {
        require(msg.sender == erc20Addr,"you do not have permission to call this functuon");
        funderToAmount[funder] = amountTOUpdate;
    }
    function setERc20Addr(address _erc20Arrd) public onlyOwner{
        erc20Addr = _erc20Arrd;
    }


    //修饰器 抽离共同的业务逻辑 _; 代表其他操作 下就是共同逻辑下面 require 在上面主要是做代码的业务逻辑判断抽离
    modifier  windowClose() {
             require(block.timestamp >= deploymentTimestamp + lockTime,"window is not closed");
             _;
    }

     modifier onlyOwner() {
        require(msg.sender == owner, "this function can only be called by owner");
        _;
    }

}