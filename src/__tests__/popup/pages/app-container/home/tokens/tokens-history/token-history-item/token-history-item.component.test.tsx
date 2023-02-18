import { screen } from '@testing-library/react';
import tokensHistory from 'src/__tests__/popup/pages/app-container/home/tokens/tokens-history/mocks/tokens-history';
import alDiv from 'src/__tests__/utils-for-testing/aria-labels/al-div';
import alIcon from 'src/__tests__/utils-for-testing/aria-labels/al-icon';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import config from 'src/__tests__/utils-for-testing/setups/config';
import {
  clickAwait,
  clickAwaitOnFound,
} from 'src/__tests__/utils-for-testing/setups/events';
config.byDefault();
const { methods, constants, minningOperationData } = tokensHistory;
const { item, message } = constants;
describe('token-history-item.component tests:\n', () => {
  methods.afterEach;
  beforeEach(async () => {
    await tokensHistory.beforeEach();
    await clickAwait([alIcon.tokens.prefix.history + 'LEO']);
  });
  it('Must open memo when clicked', async () => {
    const itemAriaLabel = alDiv.token.list.item.history.preFix + 'LEO';
    await clickAwaitOnFound(itemAriaLabel, item.index);
    expect(
      screen.getByText('from mining lottery', { exact: false }),
    ).toBeInTheDocument();
    assertion.toHaveClass(
      itemAriaLabel + '-memo-panel-' + minningOperationData._id.toString(),
      'memo-panel opened',
    );
  });
});
