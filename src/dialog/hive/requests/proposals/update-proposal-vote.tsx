import {
  RequestId,
  RequestUpdateProposalVote,
} from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';
import React from 'react';
import { Separator } from 'src/common-ui/separator/separator.component';
import RequestItem from 'src/dialog/components/request-item/request-item';
import Operation from 'src/dialog/hive/operation/operation';

type Props = {
  data: RequestUpdateProposalVote & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
};

const UpdateProposalVote = (props: Props) => {
  const { data } = props;
  return (
    <Operation
      title={chrome.i18n.getMessage('dialog_title_vote_proposal')}
      {...props}>
      <RequestItem title="dialog_account" content={`@${data.username}`} />
      <Separator type={'horizontal'} fullSize />
      <RequestItem
        title="dialog_proposal_ids"
        content={
          typeof data.proposal_ids === 'string'
            ? JSON.parse(data.proposal_ids).join(', ')
            : data.proposal_ids.join(', ')
        }
      />
      <Separator type={'horizontal'} fullSize />
      <RequestItem
        title="dialog_approve"
        content={
          data.approve
            ? chrome.i18n.getMessage('common_yes')
            : chrome.i18n.getMessage('common_no')
        }
      />
    </Operation>
  );
};

export default UpdateProposalVote;
