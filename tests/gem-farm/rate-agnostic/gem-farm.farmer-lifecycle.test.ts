import { BN } from '@project-serum/anchor';
import chai, { assert, expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { GemFarmTester } from '../gem-farm.tester';
import { FarmConfig } from '../gem-farm.client';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { pause } from '../../gem-common/util';

chai.use(chaiAsPromised);

const farmConfig = <FarmConfig>{
  minStakingPeriodSec: new BN(2),
  cooldownPeriodSec: new BN(2),
  unstakingFeeLamp: new BN(LAMPORTS_PER_SOL),
};

//this test
describe('farmer lifecycle (unstaked -> staked -> cooldown)', () => {
  let gf = new GemFarmTester();

  beforeEach('preps accs', async () => {
    await gf.prepAccounts(new BN(10000));
    await gf.callInitFarm(farmConfig);
    await gf.callInitFarmer(gf.farmer1Identity);
  });

  it('moves through farmer lifecycle', async () => {
    //deposit some gems into the vault
    await gf.callDeposit(gf.gem1Amount, gf.farmer1Identity);

    //stake
    const { farmer, vault } = await gf.callStake(gf.farmer1Identity);

    //unstaking fails, since min period not passed
    await expect(gf.callUnstake(gf.farmer1Identity)).to.be.rejectedWith(
      '0x156'
    );

    await pause(3000);

    //begin cooldown
    await gf.callUnstake(gf.farmer1Identity);

    //withdrawal fails, since cooldown period not passed
    await expect(
      gf.callWithdraw(gf.gem1Amount, gf.farmer1Identity)
    ).to.be.rejectedWith('0x140');

    await pause(3000);

    //run again to unlock vault
    await gf.callUnstake(gf.farmer1Identity);

    //this time works
    await gf.callWithdraw(gf.gem1Amount, gf.farmer1Identity);

    const farmAcc = await gf.fetchFarm();
    assert(farmAcc.stakedFarmerCount.eq(new BN(0)));
    assert(farmAcc.gemsStaked.eq(new BN(0)));

    const vaultAcc = await gf.fetchVaultAcc(vault);
    assert.isFalse(vaultAcc.locked);

    const farmerAcc = await gf.fetchFarmerAcc(farmer);
    assert(farmerAcc.gemsStaked.eq(new BN(0)));
  });
});
