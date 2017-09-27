const path = require('path'),
  webpack = require('webpack');

const vendorModules = ['jquery', 'lodash'];
const dirname = path.resolve('./');
function createConfig(isDebug) {
  const devTool = isDebug ? 'eval-source-map' : 'source-map';
  const plugins = [new webpack.optimize.CommonsChunkPlugin({name: 'vendor', filename: 'vendor.js'})];
  const cssLoader = {test: /\.css$/, loader: 'style-loader!css-loader'};
  const sassLoader = {test: /\.scss$/, loader: 'style-loader!css-loader!sass-loader'};
  const appEntry = ['./src/client/application.js'];

  plugins.push(new webpack.HotModuleReplacementPlugin());
  appEntry.splice(0, 0, 'webpack-hot-middleware/client');

  return {
    // WEBPACK CONFIG
    devtool: devTool,
    entry: {
      application: appEntry,
      vendor: vendorModules
    },
    output: {
      path: path.join(dirname, 'public', 'build'),
      filename: '[name].js',
      publicPath: '/build/'
    },
    resolve: {
      alias: {
        shared: path.join(dirname, 'src', 'shared')
      }
    },
    module: {
      rules: [
        {test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/},
        {test: /\.js$/, loader: 'eslint-loader', exclude: /node_modules/},
        {test: /\.(png|jpg|jpeg|gif|woff|ttf|eot|svg|woff2)/, loader: 'url-loader?limit=512'},
        cssLoader,
        sassLoader
      ]
    },
    plugins: plugins
  };
}

module.exports = createConfig(true);