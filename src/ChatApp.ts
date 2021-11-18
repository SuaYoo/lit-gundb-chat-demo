/* eslint-disable max-classes-per-file */
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';

type Message = {
  id: string;
  userId: string;
  username: string;
  text: string;
  timestamp: number;
};

@customElement('lgc-log')
class Log extends LitElement {
  @property({ type: Array }) log: Message[] = [
    {
      id: '1',
      userId: '1',
      username: 'User 1',
      text: 'hello',
      timestamp: 1637193705959,
    },
  ];

  static styles = [css``];

  render() {
    return html`
      <!-- TODO move to shared -->
      <link rel="stylesheet" href="./dist/tailwind.css" />

      <ul class="list-none">
        ${repeat(
          this.log,
          item => item.id,
          item => html`<li>
            <div>
              <span>${item.username}</span>
              <sl-relative-time
                .date="${new Date(item.timestamp)}"
              ></sl-relative-time>
              <div>${item.text}</div>
            </div>
          </li>`
        )}
      </ul>
    `;
  }
}

type Participant = {
  id: string;
  username: string;
};

@customElement('lgc-participants')
class Participants extends LitElement {
  @property({ type: Array }) participants: Participant[] = [
    {
      id: '1',
      username: 'User 1',
    },
  ];

  static styles = [
    css`
      :host {
        background-color: rgb(var(--sl-color-neutral-200));
      }
    `,
  ];

  render() {
    return html`
      <sl-menu>
        <sl-menu-label>Online (${this.participants.length})</sl-menu-label>
        ${this.participants.map(
          user =>
            html`<sl-menu-item value="${user.id}"
              >${user.username}</sl-menu-item
            >`
        )}
      </sl-menu>
    `;
  }
}

export class ChatApp extends LitElement {
  @property({ type: String }) roomName = '#general';

  static styles = css`
    :host {
      min-width: 100vw;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .room {
      --border-radius: var(--sl-border-radius-large);
      --padding: 0;
    }

    .room::part(base) {
      display: flex;
      width: 1200px;
      height: 800px;
      max-width: 100vw;
      max-height: 100vh;
    }

    .room::part(body) {
      display: flex;
      flex: 1 1 auto;
    }
  `;

  render() {
    return html`
      <!-- TODO move to shared -->
      <link rel="stylesheet" href="./dist/tailwind.css" />

      <sl-card class="room">
        <div class="p-3" slot="header">${this.roomName}</div>
        <div class="flex-auto flex flex-col">
          <lgc-log class="flex-1"></lgc-log>
          <div class="p-3">
            <sl-input placeholder="Message ${this.roomName}" pill>
              <sl-icon name="chat" slot="prefix"></sl-icon>
            </sl-input>
          </div>
        </div>
        <lgc-participants class="w-80"></lgc-participants>
      </sl-card>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lgc-log': Log;
    'lgc-participants': Participants;
  }
}
