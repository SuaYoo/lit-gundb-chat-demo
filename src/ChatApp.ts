/* eslint-disable max-classes-per-file */
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

// const logo = new URL('../../assets/open-wc-logo.svg', import.meta.url).href;

/**
 * @slot - Box content
 * @cssproperty --padding
 * @cssproperty --margin
 */
@customElement('lgc-box')
class Box extends LitElement {
  static styles = [
    css`
      :host {
        /* --padding: var(--sl-spacing-large); */
        --padding: 0;
        --margin: 0;
        position: relative;
      }

      .box {
        padding: var(--padding);
        margin: var(--margin);
      }
    `,
  ];

  render() {
    return html`<div class="box"><slot></slot></div>`;
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

    .app {
      --border-radius: var(--sl-border-radius-large);
      --padding: var(--sl-spacing-small);
    }

    .app::part(base) {
      display: flex;
      width: 580px;
      height: 1100px;
      max-width: 100vw;
      max-height: 100vh;
    }

    .app::part(body) {
      flex: 1 1 auto;
      overflow: auto;
    }
  `;

  render() {
    return html`
      <sl-card class="app">
        <div slot="header">TODO</div>
        TODO
        <div slot="footer">
          <sl-input placeholder="Message ${this.roomName}" pill>
            <sl-icon name="chat" slot="prefix"></sl-icon>
          </sl-input>
        </div>
      </sl-card>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lgc-box': Box;
  }
}
