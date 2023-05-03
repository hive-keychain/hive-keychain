import ClaimModule from '@background/claim.module';
import Config from 'src/config';
import claimModuleMocks from 'src/__tests__/background/mocks/claim.module.mocks';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import {
  transactionConfirmationFailed,
  transactionConfirmationSuccess,
} from 'src/__tests__/utils-for-testing/data/confirmations';
describe('claim.module tests:\n', () => {
  const { mocks, methods, spies, constants } = claimModuleMocks;
  const { validClaims, nonValidClaims, error, differentAccount } = constants;
  const { availableSavings, noAvailableSavings } = constants;
  methods.afterEach;
  methods.afterAll;
  it('Must create alarm and call Logger', async () => {
    mocks.getMultipleValueFromLocalStorage({
      __MK: undefined,
      claimAccounts: undefined,
      claimRewards: undefined,
      claimSavings: undefined,
    });
    await ClaimModule.start();
    expect(spies.logger.info).toBeCalledWith(
      `Will autoclaim every ${Config.claims.FREQUENCY}mn`,
    );
    expect(spies.create).toBeCalledWith({
      periodInMinutes: Config.claims.FREQUENCY,
    });
  });

  it('Must call Logger with error on each case', async () => {
    for (let i = 0; i < nonValidClaims.length; i++) {
      mocks.getMultipleValueFromLocalStorage(nonValidClaims[i]);
      await ClaimModule.start();
      expect(spies.logger.error.mock.calls).toEqual(error);
      spies.logger.error.mockReset();
    }
  });

  it('Must call logger with nothing to claim', async () => {
    mocks.getMultipleValueFromLocalStorage(validClaims({ savings: true }));
    mocks.getExtendedAccounts(noAvailableSavings);
    mocks.getAccountsFromLocalStorage([accounts.local.justTwoKeys]);
    mocks.calculateRCMana(accounts.active.rc);
    await ClaimModule.start();
    expect(spies.logger.info.mock.calls[1][0]).toBe(
      `@${accounts.active.name} doesn't have any savings interests to claim`,
    );
    expect(spies.claimSavings(transactionConfirmationFailed)).not.toBeCalled();
  });

  it('Must call logger with no time to claim', async () => {
    mocks.getMultipleValueFromLocalStorage(validClaims({ savings: true }));
    mocks.getExtendedAccounts(availableSavings);
    mocks.getAccountsFromLocalStorage([accounts.local.justTwoKeys]);
    mocks.calculateRCMana(accounts.active.rc);
    mocks.setMaxDelay(1000000000);
    await ClaimModule.start();
    expect(spies.logger.info.mock.calls[1][0]).toBe(
      `Not time to claim yet for @${accounts.active.name}`,
    );
    expect(spies.claimSavings(transactionConfirmationFailed)).not.toBeCalled();
  });

  describe('Same local accounts:\n', () => {
    const addedParams = {
      max_rc_creation_adjustment: {
        amount: '5491893317',
        nai: '@@000000037',
        precision: 6,
      },
      rc_manabar: {
        current_mana: '58990650660',
        last_update_time: 1669382499,
      },
      percentage: 100,
    };
    const rcWithAddedParams = {
      ...accounts.active.rc,
      ...addedParams,
    };
    beforeEach(() => {
      mocks.getRCMana(constants.rcAccountData);
      mocks.getExtendedAccounts([accounts.extended]);
      mocks.getAccountsFromLocalStorage([accounts.local.justTwoKeys]);
      mocks.calculateRCMana(accounts.active.rc);
    });
    it('Must claim accounts', async () => {
      mocks.resetMin_RC;
      mocks.getMultipleValueFromLocalStorage(validClaims({ accounts: true }));
      await ClaimModule.start();
      expect(spies.claimAccounts).toBeCalledWith(constants.rcAccountData, {
        ...accounts.active,
        rc: constants.rcAccountData,
      });
    });
    it('Must claim rewards', async () => {
      mocks.getMultipleValueFromLocalStorage(validClaims({ rewards: true }));
      await ClaimModule.start();
      expect(spies.logger.info).toBeCalledWith(
        `Claiming rewards for @${accounts.extended.name}`,
      );
      expect(spies.claimRewards).toBeCalledWith(
        accounts.active.name,
        accounts.extended.reward_hive_balance,
        accounts.extended.reward_hbd_balance,
        accounts.extended.reward_vesting_balance,
        accounts.local.one.keys.posting,
      );
    });
    it('Must claim savings', async () => {
      mocks.getMultipleValueFromLocalStorage(validClaims({ savings: true }));
      mocks.getExtendedAccounts(availableSavings);
      mocks.setMaxDelay(0);
      spies.claimSavings(transactionConfirmationSuccess);
      await ClaimModule.start();
      expect(spies.logger.info.mock.calls[1][0]).toBe(
        `Claim savings for @${accounts.active.name} successful`,
      );
    });
  });
  describe('Different local accounts:\n', () => {
    beforeEach(() => {
      mocks.getExtendedAccounts([accounts.extended]);
      mocks.getAccountsFromLocalStorage(differentAccount);
    });

    it('Must not claim accounts', async () => {
      mocks.getMultipleValueFromLocalStorage(validClaims({ accounts: true }));
      await ClaimModule.start();
      expect(spies.claimAccounts).not.toBeCalled();
    });

    it('Must not claim rewards', async () => {
      mocks.getMultipleValueFromLocalStorage(validClaims({ rewards: true }));
      await ClaimModule.start();
      expect(spies.claimRewards).not.toBeCalled();
    });

    it('Must not claim savings', async () => {
      mocks.getMultipleValueFromLocalStorage(validClaims({ savings: true }));
      await ClaimModule.start();
      expect(
        spies.claimSavings(transactionConfirmationFailed),
      ).not.toBeCalled();
    });
  });
});
