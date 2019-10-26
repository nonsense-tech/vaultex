pragma solidity 0.5.11;

contract UniswapSUSD {
    function ethToTokenTransferInput(
        uint256 min_tokens,
        uint256 deadline,
        address recipient
    ) external payable returns(uint256);
}

contract Exchanger {
    UniswapSUSD uniswap;

    constructor(address _uniswapAddress) public {
        uniswap = UniswapSUSD(_uniswapAddress);
    }

    function() external payable {
        uniswap.ethToTokenTransferInput.value(msg.value)(1, block.timestamp + 100, msg.sender);
    }
}
