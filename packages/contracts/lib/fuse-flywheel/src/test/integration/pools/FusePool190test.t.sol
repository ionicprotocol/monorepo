pragma solidity >=0.8.0;

import {Test} from "forge-std/Test.sol";
import "forge-std/Vm.sol";

import {ERC20} from "solmate/tokens/ERC20.sol";
import {FlywheelCore} from "flywheel/FlywheelCore.sol";

import "../../interfaces/IFuseAdmin.sol";
import "../../interfaces/ICErc20.sol";
import "../../interfaces/IComptroller.sol";
import "../../interfaces/IPlugin.sol";

contract Pool190Test is Test {
    address user = 0xB290f2F3FAd4E540D0550985951Cdad2711ac34A;

    ERC20 alcx = ERC20(0xdBdb4d16EdA451D0503b854CF79D55697F90c8DF);
    ERC20 sushi = ERC20(0x6B3595068778DD592e39A122f4f5a5cF09C90fE2);

    function setUp() public {}

    function testPool190() public {
        FuseAdmin fuseAdmin = FuseAdmin(
            0xa731585ab05fC9f83555cf9Bff8F58ee94e18F85
        );
        vm.label(address(fuseAdmin), "fuseAdmin");
        // pool 190 comptroller
        Comptroller comptroller = Comptroller(
            0x4Ba827A642F99773dB5CD39689B410f4646f56E3
        );
        vm.label(address(comptroller), "comptroller");
        address multisig = 0x5eA4A9a7592683bF0Bc187d6Da706c6c4770976F;
        vm.label(multisig, "multisig");

        address alEthLp = 0xc9da65931ABf0Ed1b74Ce5ad8c041C4220940368;
        address tAlcx = 0xD3B5D9a561c293Fb42b446FE7e237DaA9BF9AA84;
        address alcxeth = 0xC3f279090a47e80990Fe3a9c30d24Cb117EF91a8;

        FlywheelCore alcxFlywheelCore = FlywheelCore(
            0x48635Dd90B1d15F3bC60280C36Fb1c7b95108853
        );
        FlywheelCore sushiFlywheelCore = FlywheelCore(
            0xC78C326Ae403002eC4b328F5314763953fa06e0F
        );

        vm.startPrank(user);

        deal(alEthLp, user, 100e18);
        CErc20 alEthLpf = CErc20(0x52A3432Ba3c47baf1B09535a71a1491CAff22A08);
        require(alEthLpf.mint(100e18) == 0, "mint failed");

        vm.warp(block.timestamp + 100);

        // alEthLpf
        uint256 accrue = alcxFlywheelCore.accrue(
            ERC20(address(alEthLpf)),
            user
        );
        require(accrue > 0, "alcxFlywheelCore accrue1");
        uint256 accrued = alcxFlywheelCore.rewardsAccrued(user);
        uint256 prebalance = alcx.balanceOf(user);
        alcxFlywheelCore.claimRewards(user);
        require(
            alcx.balanceOf(user) == prebalance + accrued,
            "alcxFlywheelCore claimRewards"
        );

        vm.warp(block.timestamp + 10);

        deal(tAlcx, user, 100e18);
        CErc20 tAlcxf = CErc20(0xE7E1E74b029420e2a23706A3704E98A13e362DfC);
        require(tAlcxf.mint(100e18) == 0, "mint failed");

        // tAlcxf
        accrue = alcxFlywheelCore.accrue(ERC20(address(tAlcxf)), user);
        require(accrue > 0, "alcxFlywheelCore accrue2");
        accrued = alcxFlywheelCore.rewardsAccrued(user);
        prebalance = alcx.balanceOf(user);
        alcxFlywheelCore.claimRewards(user);
        require(
            alcx.balanceOf(user) == prebalance + accrued,
            "alcxFlywheelCore claimRewards"
        );

        deal(alcxeth, user, 100e18);
        CErc20 alcxethf = CErc20(0x2C671c44E205147792fb33Ee889fE112e3e34579);
        require(alcxethf.mint(100e18) == 0, "mint failed");

        // alcxeth
        accrue = alcxFlywheelCore.accrue(ERC20(address(alcxethf)), user);
        require(accrue > 0, "alcxFlywheelCore accrue3");
        accrued = alcxFlywheelCore.rewardsAccrued(user);
        prebalance = alcx.balanceOf(user);
        alcxFlywheelCore.claimRewards(user);
        require(
            alcx.balanceOf(user) == prebalance + accrued,
            "alcxFlywheelCore claimRewards"
        );

        accrue = sushiFlywheelCore.accrue(ERC20(address(alcxethf)), user);
        require(accrue > 0, "sushiFlywheelCore");
        accrued = sushiFlywheelCore.rewardsAccrued(user);
        prebalance = sushi.balanceOf(user);
        sushiFlywheelCore.claimRewards(user);
        require(
            sushi.balanceOf(user) == prebalance + accrued,
            "sushiFlywheelCore claimRewards"
        );

        require(
            alEthLpf.redeem(alEthLpf.balanceOf(user)) == 0,
            "alEthlpf redeem"
        );
        require(tAlcxf.redeem(tAlcxf.balanceOf(user)) == 0, "tAlcxf redeem");
        require(
            alcxethf.redeem(alcxethf.balanceOf(user)) == 0,
            "alcxethf redeem"
        );
    }
}
