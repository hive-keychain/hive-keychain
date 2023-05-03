import { KeychainKeyTypesLC } from '@interfaces/keychain.interface';
import {
  setErrorMessage,
  setSuccessMessage,
} from '@popup/actions/message.actions';
import { Icons } from '@popup/icons.enum';
import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import { OperationButtonComponent } from 'src/common-ui/button/operation-button.component';
import Icon, { IconType } from 'src/common-ui/icon/icon.component';
import Config from 'src/config';
import FormatUtils from 'src/utils/format.utils';
import ProposalUtils from 'src/utils/proposal.utils';
import './proposal-voting-section.component.scss';

const ProposalVotingSection = ({
  activeAccount,
  isMessageContainerDisplayed,
  globalProperties,
  setSuccessMessage,
  setErrorMessage,
}: PropsFromRedux) => {
  const [hasVoted, sethasVoted] = useState(true);
  const [forceClosed, setForcedClosed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (activeAccount.name) {
      initHasVotedForProposal();
    }
  }, [activeAccount]);

  const initHasVotedForProposal = async () => {
    if (
      await ProposalUtils.isRequestingProposalVotes(globalProperties.globals!)
    ) {
      // Consider as already voted if it is, or if the account has a proxy or few HP
      const hasVoted =
        (await ProposalUtils.hasVotedForProposal(activeAccount.name!)) ||
        !!activeAccount.account.proxy.length ||
        FormatUtils.toHP(
          activeAccount.account.vesting_shares.toString(),
          globalProperties.globals,
        ) < 100;
      sethasVoted(hasVoted);
    }
  };

  const handleVoteForProposalClicked = async () => {
    if (
      await ProposalUtils.voteForKeychainProposal(
        activeAccount.name!,
        activeAccount.keys.active!,
      )
    ) {
      setSuccessMessage('popup_html_kc_proposal_vote_successful');
    } else {
      setErrorMessage('popup_html_proposal_vote_fail');
    }
    setForcedClosed(true);
  };

  const handleReadClicked = () => {
    chrome.tabs.create({
      url: `https://peakd.com/me/proposals/${Config.KEYCHAIN_PROPOSAL}`,
    });
  };

  const handleClose = (event: any) => {
    event.nativeEvent.stopImmediatePropagation();
    setForcedClosed(true);
  };
  return (
    <div
      aria-label="proposal-voting-section"
      className={`proposal-voting-section ${
        isMessageContainerDisplayed || hasVoted || forceClosed ? 'hide' : ''
      } ${isOpen ? 'opened' : 'closed'}`}
      onClick={() => setIsOpen(!isOpen)}>
      <Icon
        type={IconType.STROKED}
        additionalClassName="close"
        onClick={handleClose}
        name={Icons.CLOSE}></Icon>
      <div className="text">
        {chrome.i18n.getMessage('popup_html_proposal_request')}
      </div>
      {isOpen && (
        <div className="button-panel">
          <ButtonComponent
            ariaLabel="button-read-proposal"
            onClick={handleReadClicked}
            label={'html_popup_read'}
          />
          <OperationButtonComponent
            ariaLabel="vote-key-chain-proposal"
            requiredKey={KeychainKeyTypesLC.active}
            onClick={handleVoteForProposalClicked}
            label={'html_popup_vote'}
          />
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
    isMessageContainerDisplayed: state.errorMessage.key.length > 0,
    globalProperties: state.globalProperties,
  };
};

const connector = connect(mapStateToProps, {
  setSuccessMessage,
  setErrorMessage,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const ProposalVotingSectionComponent = connector(ProposalVotingSection);
