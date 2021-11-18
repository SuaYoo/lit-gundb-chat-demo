import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';

import { Participant } from './types.js';

export const elementName = 'lgc-participants';

export class Participants extends LitElement {
  @property({ type: Array }) participants: Participant[] = [];

  static styles = [
    css`
      :host {
        background-color: rgb(var(--sl-color-neutral-200));
      }

      sl-avatar {
        --size: 2rem;
      }
    `,
  ];

  render() {
    return html`
      <sl-menu>
        <sl-menu-label>Online (${this.participants.length})</sl-menu-label>
        ${this.participants.map(
          user =>
            html`<sl-menu-item value="${user.id}">
              <sl-avatar slot="prefix"></sl-avatar>
              <span class="ml-1">${user.username}</span>
            </sl-menu-item>`
        )}
      </sl-menu>
    `;
  }
}
