import { LocalAccount } from '@interfaces/local-account.interface';
import { screen } from '@testing-library/react';
import manageAccounts from 'src/__tests__/popup/pages/app-container/settings/accounts/manage-account/mocks/manage-accounts';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import alDiv from 'src/__tests__/utils-for-testing/aria-labels/al-div';
import alIcon from 'src/__tests__/utils-for-testing/aria-labels/al-icon';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import { QueryDOM } from 'src/__tests__/utils-for-testing/enums/enums';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import config from 'src/__tests__/utils-for-testing/setups/config';
import {
  actAdvanceTime,
  clickAwait,
} from 'src/__tests__/utils-for-testing/setups/events';
config.byDefault();
describe('account-keys-list.component tests:\n', () => {
  let _asFragment: () => DocumentFragment | undefined;
  const { methods, constants, extraMocks, keys } = manageAccounts;
  const { localAccount } = constants;
  methods.afterEach;
  describe('General cases:\n', () => {
    beforeEach(async () => {
      _asFragment = await manageAccounts.beforeEach();
    });
    it('Must show selected private key when clicking', async () => {
      for (let i = 0; i < keys.length; i++) {
        await clickAwait([
          alDiv.keys.list.preFix.clickeableKey +
            methods.getKeyName(keys[i].keyName),
        ]);
        assertion.getOneByText(keys[i].privateKey);
      }
    });
    it('Must copy selected private key to clipboard', async () => {
      for (let i = 0; i < keys.length; i++) {
        await clickAwait([
          alDiv.keys.list.preFix.clickeableKey +
            methods.getKeyName(keys[i].keyName),
          alDiv.keys.list.preFix.clickeableKey +
            methods.getKeyName(keys[i].keyName),
        ]);
      }
      actAdvanceTime(200);
      expect(screen.queryAllByText(constants.message.copied)).toHaveLength(3);
    });
    it('Must show confirmation page when removing key and go back', async () => {
      for (let i = 0; i < keys.length; i++) {
        await clickAwait([
          alIcon.keys.list.preFix.remove + methods.getKeyName(keys[i].keyName),
        ]);
        assertion.getByLabelText(alComponent.confirmationPage);
        await clickAwait([alButton.dialog.cancel]);
      }
    });
    it('Must show confirmation to remove account', async () => {
      await clickAwait([alButton.accounts.manage.delete]);
      await assertion.awaitFor(
        constants.message.toDeleteAccount,
        QueryDOM.BYTEXT,
      );
    });
    it('Must remove from keychain and navigate to homepage', async () => {
      extraMocks.remockGetAccount();
      extraMocks.deleteAccount();
      await clickAwait([
        alButton.accounts.manage.delete,
        alButton.dialog.confirm,
      ]);
      await assertion.awaitMk(constants.localAccountDeletedOne[0].name);
      assertion.getByLabelText(alComponent.homePage);
    });
  });
  describe('Removing key cases:\n', () => {
    beforeEach(async () => {
      const cloneLocalAccounts = objects.clone(localAccount) as LocalAccount[];
      _asFragment = await manageAccounts.beforeEach({
        localAccount: cloneLocalAccounts,
      });
    });
    it('Must remove active key', async () => {
      const ariaLabel =
        alIcon.keys.list.preFix.remove +
        methods.getKeyName('popup_html_active');
      await methods.clickNAssert(ariaLabel);
      await methods.gotoManageAccounts();
      assertion.queryByLabel(ariaLabel, false);
    });
    it('Must remove posting key', async () => {
      const ariaLabel =
        alIcon.keys.list.preFix.remove +
        methods.getKeyName('popup_html_posting');
      await methods.clickNAssert(ariaLabel);
      await methods.gotoManageAccounts();
      assertion.queryByLabel(ariaLabel, false);
    });
    it('Must remove memo key', async () => {
      const ariaLabel =
        alIcon.keys.list.preFix.remove + methods.getKeyName('popup_html_memo');
      await methods.clickNAssert(ariaLabel);
      await methods.gotoManageAccounts();
      assertion.queryByLabel(ariaLabel, false);
    });
  });
  describe('Using authorized account', () => {
    beforeEach(async () => {
      _asFragment = await manageAccounts.beforeEach({
        localAccount: constants.authorizedLocalAccount,
      });
    });
    it('Must show using authorized account message', () => {
      assertion.getByLabelText(alDiv.keys.list.usingAuthorized);
      assertion.getOneByText(constants.message.usingAuthorized);
    });
    it('Must load authorization source account', async () => {
      extraMocks.remockGetAccount();
      await clickAwait([alDiv.keys.list.usingAuthorized]);
      expect(screen.getByLabelText(alDiv.selectedAccount)).toHaveTextContent(
        mk.user.two,
      );
    });
  });
});
