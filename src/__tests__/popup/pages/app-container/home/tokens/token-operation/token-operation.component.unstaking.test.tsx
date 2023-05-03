import App from '@popup/App';
import { TokenOperationType } from '@popup/pages/app-container/home/tokens/token-operation/token-operation.component';
import React from 'react';
import tokenOperation from 'src/__tests__/popup/pages/app-container/home/tokens/token-operation/mocks/token-operation';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import alInput from 'src/__tests__/utils-for-testing/aria-labels/al-input';
import { QueryDOM } from 'src/__tests__/utils-for-testing/enums/enums';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import config from 'src/__tests__/utils-for-testing/setups/config';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
config.byDefault();
const { methods, constants, extraMocks } = tokenOperation;
const { message, title, leoToken, displayedCommon, i18n } = constants;
const { typeValues, unstakeDisclaimer } = leoToken;
const { balance } = typeValues;
describe('token-operation Unstaking tests:\n', () => {
  methods.afterEach;
  beforeEach(async () => {
    await tokenOperation.beforeEach(<App />);
    await clickAwait([alButton.token.action.unstake]);
  });
  const operationType = TokenOperationType.UNSTAKE;
  it('Must load operation as unstake', () => {
    assertion.getByLabelText(alComponent.tokensOperationPage);
    assertion.getManyByText([title(operationType), unstakeDisclaimer]);
  });
  it('Must display unstake info and input element', () => {
    assertion.getManyByText(leoToken.screenInfo.unstake);
    assertion.getByLabelText(alInput.amount);
  });
  it('Must show confirmation page', async () => {
    extraMocks.doesAccountExist(true);
    await methods.userInteraction(balance.min, operationType);
    assertion.getByLabelText(alComponent.confirmationPage);
    assertion.getManyByText([
      message.confirmation(operationType),
      ...displayedCommon,
    ]);
  });
  it('Must go back from confirmation when cancelling', async () => {
    extraMocks.doesAccountExist(true);
    await methods.userInteraction(balance.min, operationType);
    assertion.getByLabelText(alComponent.confirmationPage);
    await clickAwait([alButton.dialog.cancel]);
    assertion.queryByText('Confirm', false);
    assertion.getByLabelText(alComponent.tokensOperationPage);
  });
  it('Must show error if unexistent account', async () => {
    extraMocks.doesAccountExist(false);
    await methods.userInteraction(balance.min, operationType);
    await assertion.awaitFor(message.error.noSuchAccount, QueryDOM.BYTEXT);
  });
  it('Must show error if not enough balance', async () => {
    extraMocks.doesAccountExist(true);
    await methods.userInteraction(balance.exceeded, operationType);
    await assertion.awaitFor(message.error.notEnoughBalance, QueryDOM.BYTEXT);
  });
  it('Must show error if unstaking fails', async () => {
    extraMocks.doesAccountExist(true);
    extraMocks.unstakeToken({ broadcasted: false, confirmed: false });
    await methods.userInteraction(balance.min, operationType, true);
    await assertion.awaitFor(
      message.error.transactionFailed(operationType),
      QueryDOM.BYTEXT,
    );
  });
  it('Must show timeout error', async () => {
    extraMocks.doesAccountExist(true);
    extraMocks.unstakeToken(
      undefined,
      new Error(i18n.get('popup_token_timeout')),
    );
    await methods.userInteraction(balance.min, operationType, true);
    await assertion.awaitFor(message.error.timeOut, QueryDOM.BYTEXT);
  });
  it('Must unstake and show message', async () => {
    extraMocks.doesAccountExist(true);
    extraMocks.unstakeToken({ broadcasted: true, confirmed: true });
    await methods.userInteraction(balance.min, operationType, true);
    await assertion.awaitFor(
      message.operationConfirmed(operationType),
      QueryDOM.BYTEXT,
    );
  });
});
