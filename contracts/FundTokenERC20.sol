//SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

//1 、 让FundMe 的参与者，基于mapping 来领取响应数量的token通证
//2、  让FundMe 的参与者 transfet 通证
//3、  在使用完成以后需要burn (烧掉)通证
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {FundMe} from "./FundMe.sol";

contract FundTokenERC20 is ERC20 {
    FundMe fundMe;
    //重写父类erc20 构造方法
    constructor(address fundMeAddr) ERC20("FundTokenERC20" ,"FT"){
        fundMe = FundMe(fundMeAddr);
    }

    function mint(uint256 amountToMint) public {
        require(fundMe.funderToAmount(msg.sender) >= amountToMint,"You cannot mint this many tokens");
        require(fundMe.getFundSucess(),"The fundme is not completed yet");
        _mint(msg.sender,amountToMint);
        fundMe.setFunderToAmount(msg.sender,fundMe.funderToAmount(msg.sender) - amountToMint);
    }
    function claim(uint256 amountToClaim) public {
        require(balanceOf(msg.sender) >= amountToClaim,"You dont have enough ERC20 tokens");
          require(fundMe.getFundSucess(),"The fundme is not completed yet");
        _burn(msg.sender, amountToClaim);
    }
}