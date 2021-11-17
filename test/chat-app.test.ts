import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';

import { ChatApp } from '../src/ChatApp.js';
import '../src/chat-app.js';

describe('ChatApp', () => {
  let element: ChatApp;
  beforeEach(async () => {
    element = await fixture(html`<chat-app></chat-app>`);
  });

  it('renders a h1', () => {
    const h1 = element.shadowRoot!.querySelector('h1')!;
    expect(h1).to.exist;
    expect(h1.textContent).to.equal('My app');
  });

  it('passes the a11y audit', async () => {
    await expect(element).shadowDom.to.be.accessible();
  });
});
