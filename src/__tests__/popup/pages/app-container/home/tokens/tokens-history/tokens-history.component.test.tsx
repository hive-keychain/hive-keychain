import { OperationsHiveEngine } from '@interfaces/tokens.interface';
import tokensHistory from 'src/__tests__/popup/pages/app-container/home/tokens/tokens-history/mocks/tokens-history';
import alDiv from 'src/__tests__/utils-for-testing/aria-labels/al-div';
import alIcon from 'src/__tests__/utils-for-testing/aria-labels/al-icon';
import * as DataLeoTokenHistory from 'src/__tests__/utils-for-testing/data/history/transactions/tokens/token-history';
import tokensUser from 'src/__tests__/utils-for-testing/data/tokens/tokens-user';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import config from 'src/__tests__/utils-for-testing/setups/config';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
config.byDefault();
const { methods } = tokensHistory;
let _asFragment: () => DocumentFragment;
describe('tokens-history.component tests:\n', () => {
  methods.afterEach;
  describe('With history to show', () => {
    beforeEach(async () => {
      _asFragment = await tokensHistory.beforeEach(false);
      await clickAwait([alIcon.tokens.prefix.history + 'LEO']);
    });
    it('Must show LEO token history', async () => {
      await assertion.allToHaveLength(
        alDiv.token.list.item.history.preFix + 'LEO',
        DataLeoTokenHistory.default.leoToken.length,
      );
    });
    it('Must show one result when searching', async () => {
      await methods.typeOnFilter(OperationsHiveEngine.TOKEN_UNDELEGATE_DONE);
      assertion.getByLabelText(alDiv.token.list.item.history.preFix + 'LEO');
    });
    it('Must show no results when searching', async () => {
      await methods.typeOnFilter('not_found-this');
      assertion.queryByLabel(
        alDiv.token.list.item.history.preFix + 'LEO',
        false,
      );
    });
    it('Must go back when pressing the arrow', async () => {
      await clickAwait([alIcon.arrowBack]);
      await assertion.allToHaveLength(
        alDiv.token.user.item,
        tokensUser.balances.length,
      );
    });
  });
  describe('No history to show', () => {
    beforeEach(async () => {
      _asFragment = await tokensHistory.beforeEach(true);
      await clickAwait([alIcon.tokens.prefix.history + 'LEO']);
    });
    it('Must show no transactions', () => {
      assertion.queryByLabel(
        alDiv.token.list.item.history.preFix + 'LEO',
        false,
      );
    });
  });
});
