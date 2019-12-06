pragma solidity >=0.4.21 <0.6.0;

interface IWallet {
    function withdrawTo(address payable to) external;
}