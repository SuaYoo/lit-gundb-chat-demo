import { LitElement, html, css } from 'lit';
import { property, query, state } from 'lit/decorators.js';

// @ts-ignore
import Gun from 'https://cdn.skypack.dev/gun/gun';
// @ts-ignore
import 'https://cdn.skypack.dev/gun/sea';

import { Message, Participant, User } from './types.js';

export class ChatApp extends LitElement {
  @property({ type: String }) roomName = '#general';

  @state()
  user: User | null = null;

  @state()
  inputValue: string = '';

  @state()
  logMap: { [key: string]: Message } = {};

  @state()
  loginError?: Error;

  @state()
  participantsMap: { [key: string]: Participant } = {};

  @query('#sign-in-form')
  signInForm!: HTMLFormElement;

  private _gun: Gun;

  private _gunUser: any;

  private _usersDb: any;

  private _logDb: any;

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
    this._usersDb = this._gun.get('users');

    if (this._gunUser.is) {
      this._gunUser.get('alias').once((username: string) => {
        this.user = {
          id: this._gunUser.is.pub,
          username,
          online: true,
        };
      });

      this._usersDb.get(this._gunUser.is.pub).get('online').put(true);

      this.initDb();
    }
  }

  disconnectedCallback() {
    if (this.user) {
      // TODO before window unload?
      this._usersDb
        .get(this.user.id)
        .get('online')
        .put(false, () => {
          this._usersDb.off();
        });
    } else {
      this._usersDb.off();
    }

    this._logDb.off();
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
        this.loginError = new Error(err);
      } else {
        const pub = soul.slice(1);

        this.user = {
          id: pub,
          username,
          online: true,
        };

        this._usersDb.get(pub).get('online').put(true);

        this.initDb();
      }
    });
  }

  private handleSubmitLogin(e: any) {
    this.loginError = undefined;

    const { formData } = e.detail;
    const username = formData.get('username');
    const password = formData.get('password');

    this.login({ username, password });
  }

  private handleClickCreateAccount() {
    this.loginError = undefined;

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
        this.loginError = new Error(err);
      } else {
        addUser(pub);
      }
    });
  }

  private handleClickLogout() {
    const userId = this.user!.id;

    this._gunUser.leave();
    this.user = null;

    this._usersDb
      .get(userId)
      .get('online')
      .put(false, () => {});
  }

  private handleSubmitMessage(e: any) {
    this._logDb.set({
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
      <div>
        ${this.loginError
          ? html`<sl-alert class="mb-3" type="danger" open>
              <sl-icon slot="icon" name="exclamation-triangle"></sl-icon>
              ${this.loginError.message}
            </sl-alert>`
          : ''}

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
      </div>
    `;
  }

  private renderRoom() {
    const log = Object.values(this.logMap);
    const participants = Object.values(this.participantsMap);

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
        <lgc-participants
          class="w-80"
          .participants="${participants}"
        ></lgc-participants>
      </sl-card>
    `;
  }

  private initDb() {
    window.history.replaceState(null, '', `/room/${process.env.ROOM_ID}`);

    this._logDb = this._gun.get(process.env.ROOM_ID).get('log');

    this._logDb.map().on(
      (msg: any, key: string) => {
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

    this._usersDb.map().on(
      (data: any, key: string) => {
        if (data.online) {
          this.participantsMap = {
            ...this.participantsMap,
            [key]: {
              id: key,
              username: data.username,
            },
          };
        } else if (this.participantsMap[key]) {
          const { [key]: discard, ...other } = this.participantsMap;

          this.participantsMap = other;
        }
      },
      {
        change: true,
      }
    );
  }
}
