import { splash } from 'docz-plugin-splash'

export default {
  entry: 'src/index.ts',
  esm: 'rollup',
  cjs: 'rollup',
  doc: {
    src: './docs',
    public: './public',
    base: '/sock-client-stomp/',
    title: 'Sockjs-Client via Stomp',
    description: 'Project based high level abstraction of SSP',
    plugins: [splash()]
  }
}
