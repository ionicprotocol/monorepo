// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { MarketsTest, BaseTest } from "./config/MarketsTest.t.sol";

import { LeveredPosition } from "../ionic/levered/LeveredPosition.sol";
import { ICErc20 } from "../compound/CTokenInterfaces.sol";

contract LeveredPositionsWithAggregatorTest is MarketsTest {

  function test_aggregatorRawCall() public debuggingOnly forkAtBlock(OP_MAINNET, 130403591) {
    bytes memory callData = hex"97a998cc00000000000000000000000000000000000000000000000029a2241af62c00000000000000000000000000001231deb6f5749ef6ce6943a275a1d3e7486f4eae0000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000008e44666fc808bf494dfd1f0e07722d5297c531149491027d7358a1df1240d44940e003bc13e00000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000100000000000000000000000000f4d35ed90f9f7c501f291535736538df210038f20000000000000000000000000000000000000000000000000003751f90b8d9d0000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000000086c6966692d73646b000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002a307830303030303030303030303030303030303030303030303030303030303030303030303030303030000000000000000000000000000000000000000000000000000000000000000000006131b5fae19ea4f9d964eac0408e4408b66337b50000000000000000000000006131b5fae19ea4f9d964eac0408e4408b66337b500000000000000000000000042000000000000000000000000000000000000060000000000000000000000001f32b1c2345538c0c6f582fcb022739c4a194ebb000000000000000000000000000000000000000000000000000421eaca2eee8500000000000000000000000000000000000000000000000000000000000000e000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000664e21fd0e9000000000000000000000000000000000000000000000000000000000000002000000000000000000000000011ddd59c33c73c44733b4123a86ea5ce57f6e854000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000001a000000000000000000000000000000000000000000000000000000000000003e000000000000000000000000000000000000000000000000000000000000000df010100000048000000ba12222222228d8ba445958a75a0704d566bf2c87ca75bdea9dede97f8b13c6641b768650cb837820002000000000000000000d5000000000000000000000421eaca2eee850b42000000000000000000000000000000000000061f32b1c2345538c0c6f582fcb022739c4a194ebb1231deb6f5749ef6ce6943a275a1d3e7486f4eae000000000000000000000000677f77ae0000004000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003a4c8707000000000000000000037992376629610000000000000000000000000042000000000000000000000000000000000000060000000000000000000000001f32b1c2345538c0c6f582fcb022739c4a194ebb000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000001a000000000000000000000000000000000000000000000000000000000000001e000000000000000000000000000000000000000000000000000000000000002000000000000000000000000001231deb6f5749ef6ce6943a275a1d3e7486f4eae000000000000000000000000000000000000000000000000000421eaca2eee850000000000000000000000000000000000000000000000000003751f90b8d9cf00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000220000000000000000000000000000000000000000000000000000000000000000100000000000000000000000011ddd59c33c73c44733b4123a86ea5ce57f6e8540000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000421eaca2eee85000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022a7b22536f75726365223a226c692e6669222c22416d6f756e74496e555344223a22332e383631373635303332393935333937222c22416d6f756e744f7574555344223a22332e38363137383739383232353232333334222c22526566657272616c223a22222c22466c616773223a302c22416d6f756e744f7574223a22393738303933383331373630323235222c2254696d657374616d70223a313733363430353735382c22496e74656772697479496e666f223a7b224b65794944223a2231222c225369676e6174757265223a22566a6e2b33656f5072344f594e792b79737a557a31395153387743782b6653462b6f7a4c6e664d6d305a4a4134332f69667634647635754c4e4444614b58343365666746332b6e543337373052507546596837477a6c634a5061774c6c3438614e77355a75594567427569685571526f4d4b5273582b2f64582f755162315241616f496e456f706a3534654d4e4d426765316b426231756462626e6a61756a36454e746848514d363335625a6f35686a57626852496c536876664e6c4c7a714f6859303441326977647a444e3447696c536b7370395a49316c6354634f74536d7a595867586a36577045393039766152554c366c62716646584a334642352f5964783071524f646e646b4450522f757341475a373954546a65396e644c676859435072706a517933692b3779476f6d31684838544843336a72427a43566363725958655072487447324d47446665305a6561624757773d3d227d7d000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
    address caller = 0x1155b614971f16758C92c4890eD338C9e3ede6b7;
    address target = 0xf4d35ed90F9F7C501F291535736538dF210038F2;

    emit log(vm.rpcUrl("optimism"));
    vm.prank(caller);
    _functionCall(
      target, callData, "raw call err"
    );

    LeveredPosition position = LeveredPosition(0xf4d35ed90F9F7C501F291535736538dF210038F2);
    uint256 levRatio = position.getCurrentLeverageRatio();
    emit log_named_uint("leverage ratio", levRatio);
  }

  function test_aggregatorSpecificData() public debuggingOnly forkAtBlock(OP_MAINNET, 130330738) {
    address caller = 0x9C35288D6A100ec1ac2F1d9D99c60E24484dCAcA; // levered position
    address aggregatorTarget = 0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE;
    bytes memory aggregatorData = hex"4666fc80e563c68f7cdc4deb2aa36306cc195b0b09e0a2d48221c87215aa26c37417c81d00000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000001000000000000000000000000009c35288d6a100ec1ac2f1d9d99c60e24484dcaca0000000000000000000000000000000000000000000000000022c9794b5671bf000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000000086c6966692d73646b000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002a307830303030303030303030303030303030303030303030303030303030303030303030303030303030000000000000000000000000000000000000000000000000000000000000000000006131b5fae19ea4f9d964eac0408e4408b66337b50000000000000000000000006131b5fae19ea4f9d964eac0408e4408b66337b50000000000000000000000005a7facb970d094b6c7ff1df0ea68d99e6e73cbff000000000000000000000000420000000000000000000000000000000000000600000000000000000000000000000000000000000000000000211e84ca0da0b800000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000006a4e21fd0e9000000000000000000000000000000000000000000000000000000000000002000000000000000000000000011ddd59c33c73c44733b4123a86ea5ce57f6e854000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000001e00000000000000000000000000000000000000000000000000000000000000420000000000000000000000000000000000000000000000000000000000000011d010200000048000000ba12222222228d8ba445958a75a0704d566bf2c82bb4712247d5f451063b5e4f6948abdfb925d93d00000000000000000000013600000000000000000000211e84ca0da0b80b00000039000000ba12222222228d8ba445958a75a0704d566bf2c87ca75bdea9dede97f8b13c6641b768650cb837820002000000000000000000d501010b5a7facb970d094b6c7ff1df0ea68d99e6e73cbff42000000000000000000000000000000000000061231deb6f5749ef6ce6943a275a1d3e7486f4eae000000000000000000000000677d3f220000004000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024a8fdb5e00000000000000000022f639950afaae0000000000000000000000000000005a7facb970d094b6c7ff1df0ea68d99e6e73cbff0000000000000000000000004200000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000001a000000000000000000000000000000000000000000000000000000000000001e000000000000000000000000000000000000000000000000000000000000002000000000000000000000000001231deb6f5749ef6ce6943a275a1d3e7486f4eae00000000000000000000000000000000000000000000000000211e84ca0da0b80000000000000000000000000000000000000000000000000022c9794b5671bf00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000220000000000000000000000000000000000000000000000000000000000000000100000000000000000000000011ddd59c33c73c44733b4123a86ea5ce57f6e854000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000211e84ca0da0b8000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022a7b22536f75726365223a226c692e6669222c22416d6f756e74496e555344223a2233352e3830343333333737393732333934222c22416d6f756e744f7574555344223a2233352e3739313233393933373030323234222c22526566657272616c223a22222c22466c616773223a302c22416d6f756e744f7574223a2239383430383736333832323535373930222c2254696d657374616d70223a313733363236303231302c22496e74656772697479496e666f223a7b224b65794944223a2231222c225369676e6174757265223a224a67474d3872414f53587855506c52445854476b5156314e347535786c634643786e7067397348774c34317742537439626f36715759645846414a69477a4d486e4a6a427a585049774d4d612f44685058713662777349306b512f4e5654594136684571576231777047384e6762774552714733377373447930577168455376696b322f4845774a78463353387a31446651315051454c34496b4d50555751383337676550486e626b614b75565a72524477494769374469444b704149534b6b4f6d785a70396152774d7068414a5a47372f723065594a512b37356d5343732f51484d654f55356e4844566c7a48586c2b547842543467496f50676d6a63494154354243542b4345595a6f4857585a4d536354524c34347a433266444e585a724f365a7054766438566430464254427575656764563462535a324d6d4168795a7a596472437a766a683950495a3362695554784354413d3d227d7d0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";

    vm.prank(caller);
    _functionCall(aggregatorTarget, aggregatorData, "failed to simulate aggregator call");
  }

  function _functionCall(address target, bytes memory data, string memory errorMessage) internal returns (bytes memory) {
    (bool success, bytes memory returndata) = target.call(data);

    if (!success) {
      // Look for revert reason and bubble it up if present
      if (returndata.length > 0) {
        // The easiest way to bubble the revert reason is using memory via assembly

        // solhint-disable-next-line no-inline-assembly
        assembly {
          let returndata_size := mload(returndata)
          revert(add(32, returndata), returndata_size)
        }
      } else {
        revert(errorMessage);
      }
    }

    return returndata;
  }

  function test_aggregatorAdjustWithDynamicData() public debuggingOnly forkAtBlock(OP_MAINNET, 130412661) {
    LeveredPosition position = LeveredPosition(0xf4d35ed90F9F7C501F291535736538dF210038F2);

    uint256 levRatio = 3e18;
    uint256 expectedSlippage = 10;

    (uint256 supplyDelta, uint256 borrowsDelta) = position.getAdjustmentAmountDeltas(
      levRatio,
      expectedSlippage
    );

    emit log_named_uint("borrowsDelta", borrowsDelta);
    // 1189385188652777
    // 1189385507762529
    // debug why aggr tries to pull
    // 1164360136957453
    // available
    // 1164360058734471
    vm.prank(position.positionOwner());
    position.adjustLeverageRatio(
      levRatio,
      0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE,
      abi.encodePacked(
        hex"4666fc80fd45291b2cf61a5a929e445bd2d22b5f295d822cf64a287305a2b46beaa7d6b400000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000100000000000000000000000000f4d35ed90f9f7c501f291535736538df210038f2000000000000000000000000000000000000000000000000000375f7a9516413000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000000086c6966692d73646b000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002a307830303030303030303030303030303030303030303030303030303030303030303030303030303030000000000000000000000000000000000000000000000000000000000000000000006140b987d6b51fd75b66c3b07733beb5167c42fc0000000000000000000000006140b987d6b51fd75b66c3b07733beb5167c42fc00000000000000000000000042000000000000000000000000000000000000060000000000000000000000001f32b1c2345538c0c6f582fcb022739c4a194ebb000000000000000000000000000000000000000000000000000422fab3b1078700000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000001442646478b0000000000000000000000004200000000000000000000000000000000000006",
        bytes32(borrowsDelta),
        hex"0000000000000000000000001f32b1c2345538c0c6f582fcb022739c4a194ebb000000000000000000000000000000000000000000000000000375f7a95164130000000000000000000000001231deb6f5749ef6ce6943a275a1d3e7486f4eae00000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000004202420000000000000000000000000000000000000601ffff0104f6c85a1b00f6d9b75f91fd23835974cc07e65c001231deb6f5749ef6ce6943a275a1d3e7486f4eae00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
      ),
      expectedSlippage
    );
  }

  function test_aggregatorAdjustSpecificPosition() public debuggingOnly forkAtBlock(OP_MAINNET, 130330738) {
    LeveredPosition position = LeveredPosition(0x9C35288D6A100ec1ac2F1d9D99c60E24484dCAcA);

    {
      // mock the weeeth balanceof call
      vm.mockCall(
        0x5A7fACB970D094B6C7FF1df0eA68D99E6e73CBFF,
        abi.encodeWithSelector(0x70a08231, 0xC741af01903f39841228dE21d9DdD31Ba604Fec5),
        abi.encode(27317778891177182941)
      );
    }

    {
      // mock the weeeth decimals call
      vm.mockCall(
        0x5A7fACB970D094B6C7FF1df0eA68D99E6e73CBFF,
        abi.encodeWithSelector(0x313ce567),
        abi.encode(18)
      );
    }

    vm.prank(position.positionOwner());
    position.adjustLeverageRatio(
      2000000000000000000,
      0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE,
      hex"4666fc80e563c68f7cdc4deb2aa36306cc195b0b09e0a2d48221c87215aa26c37417c81d00000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000001000000000000000000000000009c35288d6a100ec1ac2f1d9d99c60e24484dcaca0000000000000000000000000000000000000000000000000022c9794b5671bf000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000000086c6966692d73646b000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002a307830303030303030303030303030303030303030303030303030303030303030303030303030303030000000000000000000000000000000000000000000000000000000000000000000006131b5fae19ea4f9d964eac0408e4408b66337b50000000000000000000000006131b5fae19ea4f9d964eac0408e4408b66337b50000000000000000000000005a7facb970d094b6c7ff1df0ea68d99e6e73cbff000000000000000000000000420000000000000000000000000000000000000600000000000000000000000000000000000000000000000000211e84ca0da0b800000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000006a4e21fd0e9000000000000000000000000000000000000000000000000000000000000002000000000000000000000000011ddd59c33c73c44733b4123a86ea5ce57f6e854000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000001e00000000000000000000000000000000000000000000000000000000000000420000000000000000000000000000000000000000000000000000000000000011d010200000048000000ba12222222228d8ba445958a75a0704d566bf2c82bb4712247d5f451063b5e4f6948abdfb925d93d00000000000000000000013600000000000000000000211e84ca0da0b80b00000039000000ba12222222228d8ba445958a75a0704d566bf2c87ca75bdea9dede97f8b13c6641b768650cb837820002000000000000000000d501010b5a7facb970d094b6c7ff1df0ea68d99e6e73cbff42000000000000000000000000000000000000061231deb6f5749ef6ce6943a275a1d3e7486f4eae000000000000000000000000677d3f220000004000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024a8fdb5e00000000000000000022f639950afaae0000000000000000000000000000005a7facb970d094b6c7ff1df0ea68d99e6e73cbff0000000000000000000000004200000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000001a000000000000000000000000000000000000000000000000000000000000001e000000000000000000000000000000000000000000000000000000000000002000000000000000000000000001231deb6f5749ef6ce6943a275a1d3e7486f4eae00000000000000000000000000000000000000000000000000211e84ca0da0b80000000000000000000000000000000000000000000000000022c9794b5671bf00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000220000000000000000000000000000000000000000000000000000000000000000100000000000000000000000011ddd59c33c73c44733b4123a86ea5ce57f6e854000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000211e84ca0da0b8000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022a7b22536f75726365223a226c692e6669222c22416d6f756e74496e555344223a2233352e3830343333333737393732333934222c22416d6f756e744f7574555344223a2233352e3739313233393933373030323234222c22526566657272616c223a22222c22466c616773223a302c22416d6f756e744f7574223a2239383430383736333832323535373930222c2254696d657374616d70223a313733363236303231302c22496e74656772697479496e666f223a7b224b65794944223a2231222c225369676e6174757265223a224a67474d3872414f53587855506c52445854476b5156314e347535786c634643786e7067397348774c34317742537439626f36715759645846414a69477a4d486e4a6a427a585049774d4d612f44685058713662777349306b512f4e5654594136684571576231777047384e6762774552714733377373447930577168455376696b322f4845774a78463353387a31446651315051454c34496b4d50555751383337676550486e626b614b75565a72524477494769374469444b704149534b6b4f6d785a70396152774d7068414a5a47372f723065594a512b37356d5343732f51484d654f55356e4844566c7a48586c2b547842543467496f50676d6a63494154354243542b4345595a6f4857585a4d536354524c34347a433266444e585a724f365a7054766438566430464254427575656764563462535a324d6d4168795a7a596472437a766a683950495a3362695554784354413d3d227d7d0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
      10
    );
  }

  function test_aggregatorFundingAmountAtSwap() public debuggingOnly forkAtBlock(BASE_MAINNET, 23869636) {
    ICErc20 collateralMarket = ICErc20(0x84341B650598002d427570298564d6701733c805); // weEth

    uint256 fundingAmount = 46812493237034571;

    {
      // mock the weeeth call
      // 69556115648002101623
      vm.mockCall(
        0x04C0599Ae5A44757c0af6F9eC3b93da8976c150A,
        abi.encodeWithSelector(collateralMarket.balanceOf.selector, 0x84341B650598002d427570298564d6701733c805),
        abi.encode(69556115648002101623)
      );
    }

    _test_aggregatorFundingAmountAtSwap(collateralMarket, fundingAmount);
  }

  function _test_aggregatorFundingAmountAtSwap(ICErc20 collateralMarket, uint256 fundingAmount) internal {
    _upgradeMarket(collateralMarket);

    uint256 actualRedeemedAssetsForSwap = collateralMarket.previewRedeem(
      collateralMarket.previewDeposit(fundingAmount)
    );

    emit log_named_uint("initial funding amount", fundingAmount);
    emit log_named_uint("actual redeemed amount for swap", actualRedeemedAssetsForSwap);
  }

  function test_withdrawIonicFees() public debuggingOnly fork(BASE_MAINNET) {
    ICErc20 wethMarket = ICErc20(0x49420311B518f3d0c94e897592014de53831cfA3); // weth

    _upgradeMarket(wethMarket);

    require(wethMarket._withdrawIonicFees(1) == 0, "withdraw fees error");
  }
}
