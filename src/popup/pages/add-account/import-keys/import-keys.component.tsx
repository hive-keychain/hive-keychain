import { RootState } from '@popup/store';
import { Screen } from '@reference-data/screen.enum';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import './import-keys.component.scss';

const ImportKeys = ({}: PropsFromRedux) => {
  return (
    <div
      className="import-keys-page"
      data-testid={`${Screen.ACCOUNT_PAGE_IMPORT_KEYS}-page`}>
      Import keys
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const ImportKeysComponent = connector(ImportKeys);
