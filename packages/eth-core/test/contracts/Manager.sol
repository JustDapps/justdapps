pragma solidity >=0.4.21 <0.6.0;

import './IWallet.sol';
import './Owned.sol';

contract Manager is Owned {
    IWallet public wallet;

    constructor(IWallet _wallet) public {
        wallet = _wallet;
    }

    function withdraw() public ownerOnly {
        wallet.withdrawTo(owner);
    }
}