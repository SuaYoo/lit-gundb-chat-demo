/* eslint-disable max-classes-per-file */
import { LitElement, html, css } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';

// @ts-ignore
import Gun from 'https://cdn.skypack.dev/gun/gun';
// @ts-ignore
import 'https://cdn.skypack.dev/gun/sea';

type Message = {
  id: string;
  userId: string;
  username: string;
  text: string;
  timestamp: number;
};

type User = {
  id: string;
  username: string;
  online: boolean;
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

@customElement('lgc-participants')
class Participants extends LitElement {
  @property({ type: Array }) participants: User[] = [];

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

  @state()
  user: User | null = null;

  @state()
  inputValue: string = '';

  @state()
  logMap: { [key: string]: Message } = {};

  @query('#sign-in-form')
  signInForm!: HTMLFormElement;

  private _gun: Gun;

  private _gunUser: any;

  private _db: any;

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
    this._gun = Gun(['https://gun-manhattan.herokuapp.com/gun']);
    this._gunUser = this._gun.user().recall({ sessionStorage: true });

    if (this._gunUser.is) {
      this._gunUser.get('alias').once((username: string) => {
        this.user = {
          id: this._gunUser.is.pub,
          username,
          online: true,
        };
      });

      this.initDb();
    }
  }

  render() {
    const renderContent = this.user
      ? this.renderRoom.bind(this)
      : this.renderLogin.bind(this);

    return html`
      <!-- TODO move to shared -->
      <link rel="stylesheet" href="./dist/tailwind.css" />

      ${renderContent()}
    `;
  }

  private login({
    username,
    password,
  }: {
    username: string;
    password: string;
  }) {
    this._gunUser.auth(username, password, ({ err, soul }: any) => {
      if (err) {
        // TODO show error
        console.debug(err);
      } else {
        this.user = {
          id: soul.slice(1),
          username,
          online: true,
        };

        this.initDb();
      }
    });
  }

  private handleSubmitLogin(e: any) {
    const { formData } = e.detail;
    const username = formData.get('username');
    const password = formData.get('password');

    this.login({ username, password });
  }

  private handleClickCreateAccount() {
    const formData = this.signInForm.getFormData();
    const username = formData.get('username');
    const password = formData.get('password');

    const addUser = (pub: string) => {
      this._gun.get('users').get(pub).put({
        username,
      });

      this.login({ username, password });

      console.log('added new user with pub:', pub);
    };

    this._gunUser.create(username, password, ({ err, pub }: any) => {
      if (err) {
        // TODO show error
        console.debug(err);
      } else {
        addUser(pub);
      }
    });
  }

  private handleClickLogout() {
    this._gunUser.leave();
    this.user = null;
  }

  private handleSubmitMessage(e: any) {
    this._db.set({
      ts: Date.now(),
      userId: this.user!.id,
      username: this.user!.username,
      text: this.inputValue,
    });

    this.inputValue = '';
  }

  private onInput(e: Event) {
    const input = e.target as HTMLInputElement;

    this.inputValue = input.value;
  }

  private renderLogin() {
    return html`
      <sl-card>
        <sl-form id="sign-in-form" @sl-submit="${this.handleSubmitLogin}">
          <div class="grid gap-4">
            <sl-input
              name="username"
              type="text"
              label="Username"
              required
            ></sl-input>
            <sl-input
              name="password"
              type="password"
              label="Password"
              required
              toggle-password
            ></sl-input>

            <div class="flex flex-col items-center justify-center">
              <sl-button type="primary" style="width:100%" submit pill
                >Log in</sl-button
              >
              <span class="p-2">or</span>
              <sl-button
                @click="${this.handleClickCreateAccount}"
                style="width:100%"
                pill
                >Create account</sl-button
              >
            </div>
          </div>
        </sl-form>
      </sl-card>
    `;
  }

  private renderRoom() {
    const log = Object.values(this.logMap);

    return html`
      <sl-card class="room">
        <div class="p-2 flex items-center justify-between" slot="header">
          <h1 class="p-1">${this.roomName}</h1>
          <div>
            <sl-button @click="${this.handleClickLogout}" size="small"
              >log out</sl-button
            >
          </div>
        </div>
        <div class="flex-auto flex flex-col">
          <lgc-log class="flex-1 overflow-auto" .log="${log}"></lgc-log>

          <sl-form class="p-3" @sl-submit="${this.handleSubmitMessage}">
            <sl-input
              value="${this.inputValue}"
              @input="${this.onInput}"
              placeholder="Message ${this.roomName}"
              clearable
              pill
            >
              <sl-icon name="chat" slot="prefix"></sl-icon>
            </sl-input>
          </sl-form>
        </div>
        <lgc-participants class="w-80"></lgc-participants>
      </sl-card>
    `;
  }

  private initDb() {
    window.history.replaceState(null, '', `/room/${process.env.ROOM_ID}`);

    this._db = this._gun.get(process.env.ROOM_ID).get('log');

    this._db.map().on(
      (msg: any, key: string) => {
        console.log('got message:', key);

        this.logMap = {
          ...this.logMap,
          [key]: {
            id: key,
            userId: msg.userId,
            username: msg.username, // TODO look up from users
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
}

declare global {
  interface HTMLElementTagNameMap {
    'lgc-log': Log;
    'lgc-participants': Participants;
  }
}
