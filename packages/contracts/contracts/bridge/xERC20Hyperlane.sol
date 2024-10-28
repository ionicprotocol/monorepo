// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.22;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IXERC20 } from "./interface/IXERC20.sol";
import { IMailbox } from "./hyperlane/interfaces/IMailbox.sol";

library TypeCasts {
  // alignment preserving cast
  function addressToBytes32(address _addr) internal pure returns (bytes32) {
    return bytes32(uint256(uint160(_addr)));
  }

  // alignment preserving cast
  function bytes32ToAddress(bytes32 _buf) internal pure returns (address) {
    return address(uint160(uint256(_buf)));
  }
}

contract xERC20Hyperlane is Ownable {
  using TypeCasts for address;
  using TypeCasts for bytes32;

  uint256 public feeBps;
  mapping(address => mapping(uint32 => address)) public mappedTokens;
  mapping(uint32 => address) public allowedSenders;
  IMailbox immutable mailbox;

  event TokenMapped(address indexed _token, uint32 indexed _chainId, address indexed _dstToken);
  event AllowedSenderSet(uint32 indexed _chainId, address indexed _sender);
  event FeeBpsSet(uint256 indexed _feeBps);
  event TokenSent(
    address indexed _token,
    uint256 _amount,
    address indexed _to,
    uint32 indexed _dstChainId,
    bytes32 _guid
  );
  event TokenReceived(
    address indexed _token,
    uint256 _amount,
    address indexed _to,
    uint32 indexed _srcChainId,
    bytes32 _guid
  );

  error TokenNotSet();
  error ChainIdNotSet();
  error OriginNotMirrorAdapter();
  error OriginNotAllowed(uint32 _chainId, address _sender);

  /**
   * @notice Only accept messages from an Hyperlane Mailbox contract
   */
  modifier onlyMailbox() {
    require(msg.sender == address(mailbox), "MailboxClient: sender not mailbox");
    _;
  }

  constructor(uint256 _feeBps, address _mailbox) Ownable() {
    mailbox = IMailbox(_mailbox);
    feeBps = _feeBps;
  }

  // ADMIN FUNCTIONS
  function setFeeBps(uint256 _feeBps) public onlyOwner {
    feeBps = _feeBps;
    emit FeeBpsSet(_feeBps);
  }

  function setMappedToken(uint32 _chainId, address _srcToken, address _dstToken) public onlyOwner {
    mappedTokens[_srcToken][_chainId] = _dstToken;
    emit TokenMapped(_srcToken, _chainId, _dstToken);
  }

  function setAllowedSender(uint32 _chainId, address _sender) public onlyOwner {
    allowedSenders[_chainId] = _sender;
    emit AllowedSenderSet(_chainId, _sender);
  }

  function withdrawFee(address _token) public onlyOwner {
    uint256 _amount = IERC20(_token).balanceOf(address(this));
    IERC20(_token).transfer(msg.sender, _amount);
  }

  function withdrawFee(address _token, uint256 _amount) public onlyOwner {
    IERC20(_token).transfer(msg.sender, _amount);
  }

  function withdrawEth() public onlyOwner {
    uint256 _amount = address(this).balance;
    payable(msg.sender).transfer(_amount);
  }

  function withdrawEth(uint256 _amount) public onlyOwner {
    payable(msg.sender).transfer(_amount);
  }

  // PUBLIC FUNCTIONS
  function quote(uint32 _dstChainId, address _token, uint256 _amount, address _to) external view returns (uint256 fee) {
    return _quoteInternal(_dstChainId, _token, _amount, _to);
  }

  function send(address _token, uint256 _amount, address _to, uint32 _dstChainId) external payable {
    _send(_dstChainId, _token, _amount, _to);
  }

  // INTERNAL FUNCTIONS
  function _quoteInternal(
    uint32 _dstChainId,
    address _token,
    uint256 _amount,
    address _to
  ) internal view returns (uint256 fee) {
    uint256 _amountAfterFee = (_amount * (10000 - feeBps)) / 10000;
    bytes memory _payload = abi.encode(_to, _token, _amountAfterFee);
    fee = mailbox.quoteDispatch(_dstChainId, _to.addressToBytes32(), _payload);
    return fee;
  }

  function _send(uint32 _dstChainId, address _token, uint256 _amount, address _to) internal {
    // transfer tokens to this contract
    IERC20(_token).transferFrom(msg.sender, address(this), _amount);

    // take fee and burn the tokens
    uint256 _amountAfterFee = (_amount * (10000 - feeBps)) / 10000;
    IXERC20(_token).burn(address(this), _amountAfterFee);

    bytes memory _payload = abi.encode(_to, _token, _amountAfterFee);
    bytes32 _guid = mailbox.dispatch{ value: msg.value }(_dstChainId, _to.addressToBytes32(), _payload);
    emit TokenSent(_token, _amountAfterFee, _to, _dstChainId, _guid);
  }

  function handle(uint32 _origin, bytes32 _sender, bytes calldata _data) external payable virtual onlyMailbox {
    if (allowedSenders[_origin] != _sender.bytes32ToAddress()) {
      revert OriginNotAllowed(_origin, _sender.bytes32ToAddress());
    }
    // Decode the payload to get the message
    (address _to, address _srcToken, uint256 _amount) = abi.decode(_data, (address, address, uint256));

    // get the mapped token using the current chain id and received source token
    address _dstToken = mappedTokens[_srcToken][_origin];
    if (_dstToken == address(0)) {
      revert TokenNotSet();
    }

    // mint the tokens to the destination address
    IXERC20(_dstToken).mint(_to, _amount);
    emit TokenReceived(_dstToken, _amount, _to, _origin, bytes32(0));
  }

  receive() external payable {}
}
