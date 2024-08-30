/* istanbul ignore file */
import {
  DialogCommand,
  MultisigDialogCommand,
} from '@reference-data/dialog-message-key.enum';
import { BackgroundCommand } from 'src/reference-data/background-message-key.enum';

export interface BackgroundMessage {
  command: BackgroundCommand;
  value?: any;
}

export interface DialogMessage {
  command: DialogCommand;
  value?: any;
}

export interface MultisigDialogMessage {
  command: MultisigDialogCommand;
  value?: any;
}
