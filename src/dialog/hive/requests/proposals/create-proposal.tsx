import {
  RequestCreateProposal,
  RequestId,
} from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';
import React from 'react';
import { Separator } from 'src/common-ui/separator/separator.component';
import RequestItem from 'src/dialog/components/request-item/request-item';
import Operation from 'src/dialog/hive/operation/operation';

type Props = {
  data: RequestCreateProposal & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
};

const CreateProposal = (props: Props) => {
  const { data } = props;
  return (
    <Operation
      title={chrome.i18n.getMessage('dialog_title_create_proposal')}
      {...props}>
      <RequestItem title="dialog_account" content={`@${data.username}`} />
      <Separator type={'horizontal'} fullSize />
      <RequestItem title="dialog_receiver" content={`@${data.receiver}`} />
      <Separator type={'horizontal'} fullSize />
      <RequestItem title="dialog_title" content={data.subject} />
      <Separator type={'horizontal'} fullSize />
      <RequestItem title="dialog_permlink" content={data.permlink} />
      <Separator type={'horizontal'} fullSize />
      <RequestItem
        title="dialog_period"
        content={`${data.start.split('T')[0]} - ${data.end.split('T')[0]}`}
      />
      <Separator type={'horizontal'} fullSize />
      <RequestItem title="dialog_daily_pay" content={data.daily_pay} />
    </Operation>
  );
};

export default CreateProposal;
