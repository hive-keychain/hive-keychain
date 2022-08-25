import { Icons } from '@popup/icons.enum';
import { LoadingOperation } from '@popup/reducers/loading.reducer';
import React from 'react';
import Icon, { IconType } from 'src/common-ui/icon/icon.component';
import RotatingLogoComponent from 'src/common-ui/rotating-logo/rotating-logo.component';
import './loading.component.scss';

type Props = {
  operations?: LoadingOperation[];
  hide?: boolean;
};
const Loading = ({ hide, operations }: Props) => {
  return (
    <div
      aria-label="loading-container"
      className={`loading-container ${hide ? 'hide' : ''}`}>
      <div className="overlay"></div>
      <RotatingLogoComponent></RotatingLogoComponent>
      <div className="loading-text">
        {chrome.i18n.getMessage('popup_html_loading')}
      </div>
      <div className="operations">
        {operations &&
          operations.map((operation) => (
            <span key={operation.name}>
              {chrome.i18n.getMessage(operation.name)}
              {operation.done ? (
                <Icon
                  name={Icons.DONE}
                  type={IconType.STROKED}
                  additionalClassName="done"></Icon>
              ) : (
                '...'
              )}
            </span>
          ))}
      </div>
    </div>
  );
};

export const LoadingComponent = Loading;
