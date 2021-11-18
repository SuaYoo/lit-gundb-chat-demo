import './shoelace.js';
import { Log, elementName as logName } from './log.js';
import {
  Participants,
  elementName as participantsName,
} from './participants.js';
import { ChatApp } from './ChatApp.js';

customElements.define(logName, Log);
customElements.define(participantsName, Participants);
customElements.define('lgc-app', ChatApp);

declare global {
  interface HTMLElementTagNameMap {
    [logName]: Log;
    [participantsName]: Participants;
  }
}
