/* eslint-disable max-classes-per-file */
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

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
      <link rel="stylesheet" href="./dist/tailwind.css" />

      <sl-card class="room">
        <div class="p-3" slot="header">${this.roomName}</div>
        <div class="flex-auto flex flex-col">
          <div class="flex-1">TODO</div>
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
    'lgc-participants': Participants;
  }
}
