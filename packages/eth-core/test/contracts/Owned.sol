pragma solidity >=0.4.21 <0.6.0;

contract Owned  {
    address payable public owner;

    constructor() public {
        owner = msg.sender;
    }

    // allows execution by the owner only
    modifier ownerOnly {
        require(msg.sender == owner, 'owner only');
        _;
    }

    /**@dev allows transferring the contract ownership. */
    function transferOwnership(address payable _newOwner) public ownerOnly {
        require(_newOwner != owner, 'new oner only');
        owner = _newOwner;
    }
}
