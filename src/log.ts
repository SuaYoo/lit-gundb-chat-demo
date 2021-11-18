import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';

import { Message } from './types.js';

export const elementName = 'lgc-log';

export class Log extends LitElement {
  @property({ type: Array }) log: Message[] = [];

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
            <div class="flex pl-4 pr-4 pt-5">
              <div class="mr-4">
                <sl-avatar></sl-avatar>
              </div>
              <div>
                <div class="mb-1">
                  <strong class="mr-1">${item.username}</strong>
                  <sl-relative-time
                    class="text-xs text-gray-500"
                    .date="${new Date(item.timestamp)}"
                  ></sl-relative-time>
                </div>
                <div>${item.text}</div>
              </div>
            </div>
          </li>`
        )}
      </ul>
    `;
  }
}
