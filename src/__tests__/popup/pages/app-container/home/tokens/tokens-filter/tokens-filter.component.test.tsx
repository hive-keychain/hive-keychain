import App from '@popup/App';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { screen } from '@testing-library/react';
import React from 'react';
import tokens from 'src/__tests__/popup/pages/app-container/home/tokens/mocks/tokens';
import alCheckbox from 'src/__tests__/utils-for-testing/aria-labels/al-checkbox';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import alDiv from 'src/__tests__/utils-for-testing/aria-labels/al-div';
import alIcon from 'src/__tests__/utils-for-testing/aria-labels/al-icon';
import alInput from 'src/__tests__/utils-for-testing/aria-labels/al-input';
import tokensUser from 'src/__tests__/utils-for-testing/data/tokens/tokens-user';
import { EventType } from 'src/__tests__/utils-for-testing/enums/enums';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import config from 'src/__tests__/utils-for-testing/setups/config';
import {
  clickAwait,
  clickTypeAwait,
} from 'src/__tests__/utils-for-testing/setups/events';
config.byDefault();
const { methods, constants } = tokens;
const { messages, typeValue } = constants;
describe('tokens-filter.component tests:\n', () => {
  methods.afterEach;
  beforeEach(async () => {
    await tokens.beforeEach(<App />);
  });
  it('Must show filter icon', () => {
    assertion.getByLabelText(alIcon.tokens.openFilter);
  });
  describe('Opening the filter:\n', () => {
    beforeEach(async () => await methods.clickOnFilter());
    it('Must load tokens filter and show disclaimer, tokens list', async () => {
      expect(
        screen.queryAllByText(constants.asShown.supply(tokensUser.balances[0])),
      );
      expect(screen.queryByDisplayValue(messages.tokenFilter.disclaimer));
      assertion.getByLabelText(alComponent.tokensFilter);
    });
    it('Must set filter value', async () => {
      await clickTypeAwait([
        {
          ariaLabel: alInput.filterBox,
          event: EventType.TYPE,
          text: typeValue.tokenFilter.toFind,
        },
      ]);
      assertion.toHaveValue(alInput.filterBox, typeValue.tokenFilter.toFind);
    });
    it('Must show one token', async () => {
      await clickTypeAwait([
        {
          ariaLabel: alInput.filterBox,
          event: EventType.TYPE,
          text: typeValue.tokenFilter.toFind,
        },
      ]);
      await assertion.allToHaveLength(alDiv.token.list.item.description, 1);
    });
    it('Must show no token', async () => {
      await clickTypeAwait([
        {
          ariaLabel: alInput.filterBox,
          event: EventType.TYPE,
          text: typeValue.tokenFilter.nonExistent,
        },
      ]);
      assertion.queryByLabel(alDiv.token.list.item.description, false);
    });
    it('Must include token as hidden', async () => {
      await clickAwait([alCheckbox.tokensFilter.selectToken.preFix + 'BEE']);
      expect(methods.spyLocalStorage().mock.calls[1]).toEqual([
        LocalStorageKeyEnum.HIDDEN_TOKENS,
        ['BEE'],
      ]);
      methods.spyLocalStorage().mockClear();
      methods.spyLocalStorage().mockRestore();
    });
  });
});
