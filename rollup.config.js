export default {
  entry: './src/ws-rs/index.js',
  dest: './dist/ws-rs.umd.js',
  format: 'umd',
  exports: 'named',
  context: 'window',
  moduleName: 'WsRs'
};
