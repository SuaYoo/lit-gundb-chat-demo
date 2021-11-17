/**
 * Cherry-picked Shoelace components
 * https://shoelace.style
 */
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';

import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
import '@shoelace-style/shoelace/dist/components/input/input.js';

if (process.env.SHOELACE_ASSET_DEST) {
  setBasePath(process.env.SHOELACE_ASSET_DEST);
}
