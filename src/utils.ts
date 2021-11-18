import { html } from 'lit';
import type { TemplateResult } from 'lit';

// TODO check render performance
export const tailwind = (template: TemplateResult) => html`
  <link rel="stylesheet" href="./dist/tailwind.css" />
  ${template}
`;
