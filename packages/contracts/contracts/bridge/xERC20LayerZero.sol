// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.22;

import { OApp, Origin, MessagingFee, MessagingReceipt } from "@layerzerolabs/oapp-evm/contracts/oapp/OApp.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IXERC20 } from "./interface/IXERC20.sol";

contract xERC20LayerZero is Ownable, OApp {
  uint256 public feeBps;
  mapping(address => mapping(uint32 => address)) public mappedTokens;
  mapping(uint32 => uint32) public chainIdToEid;
  mapping(uint32 => uint32) public eidToChainId;

  event TokenMapped(address indexed _token, uint32 indexed _chainId, address indexed _dstToken);
  event ChainIdToEidSet(uint32 indexed _chainId, uint32 indexed _eid);
  event EidToChainIdSet(uint32 indexed _eid, uint32 indexed _chainId);
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

  constructor(uint256 _feeBps, address _endpoint) OApp(_endpoint, msg.sender) Ownable() {
    feeBps = _feeBps;

    // known chain ids
    // Set initial chain ID to EID mappings
    setChainIdToEid(8453, 30184); // base
    setChainIdToEid(10, 30111); // optimism
    setChainIdToEid(252, 30255); // fraxtal
    setChainIdToEid(60808, 30279); // bob
    setChainIdToEid(34443, 30260); // mode

    // Set initial EID to chain ID mappings
    setEidToChainId(30184, 8453); // base
    setEidToChainId(30111, 10); // optimism
    setEidToChainId(30255, 252); // fraxtal
    setEidToChainId(30279, 60808); // bob
    setEidToChainId(30260, 34443); // mode
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

  function setChainIdToEid(uint32 _chainId, uint32 _eid) public onlyOwner {
    chainIdToEid[_chainId] = _eid;
    emit ChainIdToEidSet(_chainId, _eid);
  }

  function setEidToChainId(uint32 _eid, uint32 _chainId) public onlyOwner {
    eidToChainId[_eid] = _chainId;
    emit EidToChainIdSet(_eid, _chainId);
  }

  // PUBLIC FUNCTIONS
  function quote(
    uint32 _dstChainId,
    address _token,
    uint256 _amount,
    address _to
  ) external view returns (uint256 nativeFee, uint256 zroFee) {
    return _quoteInternal(_dstChainId, _token, _amount, _to, bytes(""), false);
  }

  function quote(
    uint32 _dstChainId, // destination endpoint id
    address _token,
    uint256 _amount,
    address _to,
    bytes memory _options, // your message execution options
    bool _payInLzToken // boolean for which token to return fee in
  ) external view returns (uint256 nativeFee, uint256 zroFee) {
    return _quoteInternal(_dstChainId, _token, _amount, _to, _options, _payInLzToken);
  }

  function send(
    address _token,
    uint256 _amount,
    address _to,
    uint32 _dstChainId
  ) external payable {
    _send(_dstChainId, _token, _amount, _to, bytes(""));
  }

  /**
   * @notice Sends tokens to a destination chain
   *
   * @param _token The token to send
   * @param _amount The amount of tokens to send
   * @param _to The address to send the tokens to
   * @param _dstChainId The destination chain id
   * @param _options The options to send the tokens with
   */
  function send(
    address _token,
    uint256 _amount,
    address _to,
    uint32 _dstChainId,
    bytes calldata _options
  ) external payable {
    _send(_dstChainId, _token, _amount, _to, _options);
  }

  // INTERNAL FUNCTIONS
  function _quoteInternal(
    uint32 _dstChainId,
    address _token,
    uint256 _amount,
    address _to,
    bytes memory _options,
    bool _payInLzToken
  ) internal view returns (uint256 nativeFee, uint256 zroFee) {
    uint32 _dstEid = chainIdToEid[_dstChainId];
    if (_dstEid == 0) {
      revert ChainIdNotSet();
    }
    bytes memory _payload = abi.encode(_to, _token, _amount);
    MessagingFee memory fee = _quote(_dstEid, _payload, _options, _payInLzToken);
    return (fee.nativeFee, fee.lzTokenFee);
  }

  function _send(
    uint32 _dstChainId,
    address _token,
    uint256 _amount,
    address _to,
    bytes memory _options
  ) internal {
    uint32 _dstEid = chainIdToEid[_dstChainId];
    if (_dstEid == 0) {
      revert ChainIdNotSet();
    }

    // transfer tokens to this contract
    IERC20(_token).transferFrom(msg.sender, address(this), _amount);
    uint256 _amountAfterFee = (_amount * (10000 - feeBps)) / 10000;
    IXERC20(_token).burn(msg.sender, _amountAfterFee);

    bytes memory _payload = abi.encode(_to, _token, _amountAfterFee);
    MessagingReceipt memory _receipt = _lzSend(
      _dstEid,
      _payload,
      _options,
      // Fee in native gas and ZRO token.
      MessagingFee(msg.value, 0),
      // Refund address in case of failed source message.
      payable(msg.sender)
    );
    emit TokenSent(_token, _amountAfterFee, _to, _dstChainId, _receipt.guid);
  }

  // LAYERZERO FUNCTIONS

  /**
   * @dev Called when data is received from the protocol. It overrides the equivalent function in the parent contract.
   * Protocol messages are defined as packets, comprised of the following parameters.
   * @param _origin A struct containing information about where the packet came from.
   * @param _guid A global unique identifier for tracking the packet.
   * @param payload Encoded message.
   */
  function _lzReceive(
    Origin calldata _origin,
    bytes32 _guid,
    bytes calldata payload,
    address, // Executor address as specified by the OApp.
    bytes calldata // Any extra data or options to trigger on receipt.
  ) internal override {
    // Decode the payload to get the message
    // In this case, type is string, but depends on your encoding!
    (address _to, address _srcToken, uint256 _amount) = abi.decode(payload, (address, address, uint256));
    address _dstToken = mappedTokens[_srcToken][eidToChainId[_origin.srcEid]];
    if (_dstToken == address(0)) {
      revert TokenNotSet();
    }

    IXERC20(_srcToken).mint(_to, _amount);
    emit TokenReceived(_srcToken, _amount, _to, eidToChainId[_origin.srcEid], _guid);
  }
}
