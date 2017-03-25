export default {
  entry: './demo/src/index.js',
  dest: './demo/dist/demo.js',
  format: 'iife',
  context: 'window',
  external: [ 'ws-rs' ],
  globals: {
    'ws-rs': 'WsRs'
  }
};
