pragma solidity ^0.4.18;

import "../node_modules/zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";

contract EbikeToken is MintableToken {
    string public name = "Bike";
    string public symbol = "BIKE";
    uint8 public decimals = 18;
    uint256 public constant INITIAL_SUPPLY = 4000000 * (10 ** uint256(decimals));

    function EbikeToken() public {
        balances[msg.sender] = INITIAL_SUPPLY;
        emit Transfer(0x0, msg.sender, INITIAL_SUPPLY);
    }
}