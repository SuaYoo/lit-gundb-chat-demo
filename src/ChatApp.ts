/* eslint-disable max-classes-per-file */
import { LitElement, html, css } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';

// @ts-ignore
import Gun from 'https://cdn.skypack.dev/gun';

type Message = {
  id: string;
  userId: string;
  username: string;
  text: string;
  timestamp: number;
};

@customElement('lgc-log')
class Log extends LitElement {
  @property({ type: Array }) log: Message[] = [];

  static styles = [css``];

  render() {
    return html`
      <!-- TODO move to shared -->
      <link rel="stylesheet" href="./dist/tailwind.css" />

      <ul class="list-none">
        ${repeat(
          Array.from(this.log),
          item => item.id,
          item => html`<li>
            <div>
              <sl-avatar></sl-avatar>
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

  @property({ attribute: false })
  logMap: { [key: string]: Message } = {};

  @query('#input')
  input!: HTMLInputElement;

  _db: Gun;

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

  firstUpdated() {
    this._db = Gun(['https://gun-manhattan.herokuapp.com/gun'])
      .get(process.env.ROOM_ID)
      .get('log');

    this._db.map().on(
      (msg: any, key: string) => {
        console.log('got message:', key);

        this.logMap = {
          ...this.logMap,
          [key]: {
            id: key,
            userId: msg.userId,
            username: msg.userId, // TODO
            text: msg.text,
            timestamp: msg.ts,
          },
        };
      },
      {
        change: true,
      }
    );
    // TODO off
    // log.off()
  }

  send() {
    this._db.set({
      ts: Date.now(),
      userId: '1',
      text: this.input.value,
    });
  }

  render() {
    const log = Object.values(this.logMap);
    console.log(this.logMap);

    return html`
      <!-- TODO move to shared -->
      <link rel="stylesheet" href="./dist/tailwind.css" />

      <sl-card class="room">
        <div class="p-3" slot="header">${this.roomName}</div>
        <div class="flex-auto flex flex-col">
          <lgc-log class="flex-1 overflow-auto" .log="${log}"></lgc-log>
          <div class="p-3">
            <sl-input id="input" placeholder="Message ${this.roomName}" pill>
              <sl-icon name="chat" slot="prefix"></sl-icon>
            </sl-input>
            <button @click=${this.send}>Add</button>
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
