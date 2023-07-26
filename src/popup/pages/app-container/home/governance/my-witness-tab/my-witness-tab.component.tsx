import { Witness } from '@interfaces/witness.interface';
import { setErrorMessage } from '@popup/actions/message.actions';
import { Icons } from '@popup/icons.enum';
import { EditMyWitnessComponent } from '@popup/pages/app-container/home/governance/my-witness-tab/edit-my-witness/edit-my-witness.component';
import { WitnessInformationComponent } from '@popup/pages/app-container/home/governance/my-witness-tab/witness-information/witness-information.component';
import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import Icon, { IconType } from 'src/common-ui/icon/icon.component';
import RotatingLogoComponent from 'src/common-ui/rotating-logo/rotating-logo.component';
import WitnessUtils from 'src/utils/witness.utils';
import './my-witness-tab.component.scss';

type Props = {
  ranking: Witness[];
};

const MyWitnessTab = ({
  ranking,
  globalProperties,
  activeAccount,
  currencyPrices,
  setErrorMessage,
}: PropsFromRedux & Props) => {
  const [witnessInfo, setWitnessInfo] = useState<any>();
  const [isLoading, setIsLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    setIsLoading(true);
    try {
      const result = await WitnessUtils.getWitnessInfo(
        activeAccount.name!,
        globalProperties,
        currencyPrices,
      );

      setWitnessInfo(result);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      setHasError(true);
      setErrorMessage('popup_html_error_retrieving_witness_information');
    }
  };

  return (
    <div className="my-witness-tab">
      {!isLoading &&
        witnessInfo &&
        (!editMode ? (
          <WitnessInformationComponent
            ranking={ranking}
            setEditMode={setEditMode}
            witnessInfo={witnessInfo}
          />
        ) : (
          <EditMyWitnessComponent
            setEditMode={setEditMode}
            witnessInfo={witnessInfo}
          />
        ))}
      {isLoading && (
        <div className="rotating-logo-container">
          <RotatingLogoComponent />
        </div>
      )}
      {hasError && (
        <div aria-label="error-witness" className="error-witness">
          <Icon name={Icons.ERROR} type={IconType.OUTLINED}></Icon>
          <span>
            {chrome.i18n.getMessage(
              'popup_html_error_retrieving_witness_information',
            )}
          </span>
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
    globalProperties: state.globalProperties,
    currencyPrices: state.currencyPrices,
  };
};

const connector = connect(mapStateToProps, {
  setErrorMessage,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const MyWitnessTabComponent = connector(MyWitnessTab);
