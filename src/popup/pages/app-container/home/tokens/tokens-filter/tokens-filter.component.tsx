import { Token } from '@interfaces/tokens.interface';
import { navigateToWithParams } from '@popup/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import { loadTokens } from '@popup/actions/token.actions';
import { RootState } from '@popup/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import CheckboxComponent from 'src/common-ui/checkbox/checkbox.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import FormatUtils from 'src/utils/format.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import './tokens-filter.component.scss';

const TokensFilter = ({
  tokens,
  loadTokens,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  const [filterValue, setFilterValue] = useState('');
  const [filteredTokens, setFilteredTokens] = useState<Token[]>([]);
  const [hiddenTokens, setHiddenTokens] = useState<string[]>([]);
  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_tokens_available',
      isBackButtonEnabled: true,
    });
    loadHiddenTokens();
    loadTokens();
  }, []);

  const loadHiddenTokens = async () => {
    setHiddenTokens(
      (await LocalStorageUtils.getValueFromLocalStorage(
        LocalStorageKeyEnum.HIDDEN_TOKENS,
      )) ?? [],
    );
  };

  const toggleHiddenToken = (symbol: string) => {
    let newHiddenTokens = hiddenTokens;
    if (hiddenTokens.includes(symbol)) {
      newHiddenTokens = newHiddenTokens.filter(
        (hiddenToken) => hiddenToken !== symbol,
      );
    } else {
      newHiddenTokens = [...newHiddenTokens, symbol];
    }
    setHiddenTokens(newHiddenTokens);
    LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.HIDDEN_TOKENS,
      newHiddenTokens,
    );
  };

  useEffect(() => {
    if (tokens) {
      const filterValueLowerCase = filterValue.toLowerCase();
      setFilteredTokens(
        tokens.filter(
          (token) =>
            token.name.toLowerCase().includes(filterValueLowerCase) ||
            token.symbol.toLowerCase().includes(filterValueLowerCase) ||
            token.issuer.toLowerCase().includes(filterValueLowerCase),
        ),
      );
    }
  }, [tokens, filterValue]);

  return (
    <div className="tokens-filter">
      <div
        className="disclaimer"
        dangerouslySetInnerHTML={{
          __html: chrome.i18n.getMessage('popup_html_tokens_settings_text'),
        }}></div>

      <InputComponent
        type={InputType.TEXT}
        placeholder="popup_html_search"
        value={filterValue}
        onChange={setFilterValue}
      />

      <div className="tokens-list">
        {filteredTokens.map((token) => (
          <div className="token" key={token.symbol}>
            <CheckboxComponent
              checked={!hiddenTokens.includes(token.symbol)}
              onChange={() => {
                toggleHiddenToken(token.symbol);
              }}></CheckboxComponent>
            <div className="description">
              <div className="name">{token.name}</div>
              <div className="detail">
                {token.issuer && (
                  <div className="issued-by">
                    {token.symbol}{' '}
                    {chrome.i18n.getMessage('popup_token_issued_by', [
                      token.issuer,
                    ])}
                  </div>
                )}
              </div>
              <div className="supply">
                {chrome.i18n.getMessage('popup_token_supply')}
                {' : '}
                {FormatUtils.nFormatter(parseFloat(token.supply), 3)}/
                {FormatUtils.nFormatter(parseFloat(token.maxSupply), 3)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
    tokens: state.tokens as Token[],
  };
};

const connector = connect(mapStateToProps, {
  navigateToWithParams,
  loadTokens,
  setTitleContainerProperties,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const TokensFilterComponent = connector(TokensFilter);
