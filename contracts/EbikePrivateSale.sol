pragma solidity ^0.4.18;

import "../node_modules/zeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "../node_modules/zeppelin-solidity/contracts/crowdsale/validation/TimedCrowdsale.sol";
import "../node_modules/zeppelin-solidity/contracts/crowdsale/validation/WhitelistedCrowdsale.sol";


contract EbikePrivateSale is TimedCrowdsale, WhitelistedCrowdsale {

    uint8 constant decimals = 18;    
    uint256 public totalTokenForSale = 4000000 * (10**uint256(decimals));  // 4 million

    uint256 public totalTokensSold = 0;
    bool isFinished = false;
    
    function EbikePrivateSale(uint256 _openingTime, uint256 _closingTime, uint _rate, address _wallet, ERC20 _token)
        public
        Crowdsale(_rate, _wallet, _token)
        TimedCrowdsale(_openingTime, _closingTime) {

    }

    uint256 cap = totalTokenForSale.mul(rate);

    modifier notFinished() {
        require(isFinished != true);
        _;
    }

    function startSaleNow() public onlyOwner {
        openingTime = now;
    }

    // Change Time of the Crowdsale
    function setOpeningTime(uint256 _openingTime) public onlyOwner {
        require(_openingTime < closingTime);
        openingTime = _openingTime;
    }
    function setClosingTime(uint256 _closingTime) public onlyOwner {
        require(_closingTime > openingTime);
        require(_closingTime > now);
        closingTime = _closingTime;
    }

    /**
    @dev check if number of token is available and _beneficiary is whitelisted or not
     */
    function _preValidatePurchase(address _beneficiary, uint256 _weiAmount) internal notFinished {
        uint256 _tokenTobeSold = _getTokenAmount(_weiAmount);
        require(totalTokensSold.add(_tokenTobeSold) < totalTokenForSale);
        super._preValidatePurchase(_beneficiary, _weiAmount);
    }

    /**
    @dev Update totaltokensold */
    function _updatePurchasingState(address _beneficiary, uint256 _weiAmount) internal {
        // optional override
        uint256 _tokenSold = _getTokenAmount(_weiAmount);
        totalTokensSold = totalTokensSold.add(_tokenSold);
        super._updatePurchasingState(_beneficiary, _weiAmount);        
    }

    /**
    * @notice Terminate contract and refund to owner
    */
    function FinishPrivateSale() external onlyOwner {
        isFinished = true;
        // Transfer tokens back to owner
        uint256 balance = token.balanceOf(this);
        assert(balance > 0);
        token.transfer(wallet, balance);

        // There should be no ether in the contract but just in case
        selfdestruct(wallet);
    }
}