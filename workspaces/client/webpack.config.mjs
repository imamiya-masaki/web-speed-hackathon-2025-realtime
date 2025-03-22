import path from 'node:path';
import webpack from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

console.log('webpack',  process?.env?.["NODE_ENV"])
/**
 * NODE_ENV が 'development' なら true、そうでなければ false
 */
const isDev = process?.env?.["NODE_ENV"] === 'development';
const isAnalyze = process?.env?.["NODE_ENV"] === 'analyze';
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
    chunkFilename: 'chunk-[contenthash].js',
    chunkFormat: 'module',
    module: true,
    filename: 'main.js',
    path: path.resolve(import.meta.dirname, './dist'),
    publicPath: 'auto',
  },
  experiments: {
    outputModule: true, // ESM出力を有効化
  },
  plugins: [
    new webpack.EnvironmentPlugin({ API_BASE_URL: '/api', NODE_ENV: isDev ? "production" : "development" }),
    // 開発環境のときだけ BundleAnalyzerPlugin を追加
    ...(isAnalyze ? [new BundleAnalyzerPlugin()] : []),
  ],

  resolve: {
    extensions: ['.js', '.cjs', '.mjs', '.ts', '.cts', '.mts', '.tsx', '.jsx'],
  },
};

export default config;
