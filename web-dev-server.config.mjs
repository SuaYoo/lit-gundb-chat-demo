// import { hmrPlugin, presets } from '@open-wc/dev-server-hmr';
import { fromRollup } from '@web/dev-server-rollup';
import rollupReplace from '@rollup/plugin-replace';
import { nanoid } from 'nanoid';

const replace = fromRollup(rollupReplace);

/** Use Hot Module replacement by adding --hmr to the start command */
const hmr = process.argv.includes('--hmr');

const shoelaceAssetDest = '/node_modules/@shoelace-style/shoelace/dist';

export default /** @type {import('@web/dev-server').DevServerConfig} */ ({
  open: '/',
  watch: !hmr,
  /** Resolve bare module imports */
  nodeResolve: {
    exportConditions: ['browser', 'development'],
  },

  /** Compile JS for older browsers. Requires @web/dev-server-esbuild plugin */
  // esbuildTarget: 'auto'

  /** Set appIndex to enable SPA routing */
  appIndex: 'index.html',

  plugins: [
    /** Use Hot Module Replacement by uncommenting. Requires @open-wc/dev-server-hmr plugin */
    // hmr && hmrPlugin({ exclude: ['**/*/node_modules/**/*'], presets: [presets.litElement] }),

    // Expose environment variables
    // TODO sync rollup.config with web-dev-server.config
    replace({
      'process.env.NODE_ENV': JSON.stringify('development'),
      'process.env.SHOELACE_ASSET_DEST': JSON.stringify(shoelaceAssetDest),
      'process.env.ROOM_ID': JSON.stringify(nanoid()),
    }),
  ],

  // See documentation for all available options
});
