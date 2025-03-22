import path from 'node:path';
import webpack from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

console.log('webpack')
/**
 * NODE_ENV が 'development' なら true、そうでなければ false
 */
const isDev = process.env["NODE_ENV"] === 'development';
/** @type {import('webpack').Configuration} */
const config = {
  // mode と devtool を分岐
  mode: isDev ? 'development' : 'production',
  devtool: isDev ? 'inline-source-map' : false,

  entry: './src/main.tsx',

  module: {
    rules: [
      {
        exclude: [/node_modules\/video\.js/, /node_modules\/@videojs/],
        resolve: {
          fullySpecified: false,
        },
        test: /\.(?:js|mjs|cjs|jsx|ts|mts|cts|tsx)$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  // モダンブラウザ向けにターゲットを限定
                  targets: ['last 2 Chrome versions'],
                },
              ],
              ['@babel/preset-react', { runtime: 'automatic' }],
              ['@babel/preset-typescript'],
            ],
          },
        },
      },
      {
        test: /\.png$/,
        type: 'asset/inline',
      },
      {
        resourceQuery: /raw/,
        type: 'asset/source',
      },
      {
        resourceQuery: /arraybuffer/,
        type: 'javascript/auto',
        use: {
          loader: 'arraybuffer-loader',
        },
      },
    ],
  },

  output: {
    chunkFilename: '[name]-[contenthash].js',
    chunkFormat: false,
    filename: '[main].js',
    path: path.resolve(import.meta.dirname, './dist'),
    publicPath: 'auto',
  },

  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),
    new webpack.EnvironmentPlugin({ API_BASE_URL: '/api', NODE_ENV: '' }),
    // 開発環境のときだけ BundleAnalyzerPlugin を追加
    ...(isDev ? [new BundleAnalyzerPlugin()] : []),
  ],

  resolve: {
    alias: {
      '@ffmpeg/core$': path.resolve(
        import.meta.dirname,
        'node_modules',
        '@ffmpeg/core/dist/umd/ffmpeg-core.js'
      ),
      '@ffmpeg/core/wasm$': path.resolve(
        import.meta.dirname,
        'node_modules',
        '@ffmpeg/core/dist/umd/ffmpeg-core.wasm'
      ),
    },
    extensions: ['.js', '.cjs', '.mjs', '.ts', '.cts', '.mts', '.tsx', '.jsx'],
  },
};

export default config;
