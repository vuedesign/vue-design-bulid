'use strict'
const fs = require('fs')
const path = require('path')
const utils = require('./utils')
const config = require(path.join(utils.APP_PATH, 'config'))
const vueLoaderConfig = require('./vue-loader.conf')
const vuedesignconfig = require('./vuedesignconfig.js')
const VueLoaderPlugin = require('vue-loader/lib/plugin')

const dirMap = {
  assets: 'DIR_ASSETS',
  configs: 'DIR_CONFIGS',
  globals: 'DIR_GLOBALS',
  modules: 'DIR_MODULES',
  vendors: 'DIR_VENDORS'
}
const vdc = getVueDesignConfig();

function getVueDesignConfig() {
  try {
    return require(path.join(utils.APP_PATH, '.vuedesignconfig.js'))
  } catch (error) {
    return vuedesignconfig;
  }
}

function getSrcDir(type) {
  if (vdc[dirMap[type]]) {
    const dir = resolve(`src/${vdc[dirMap[type]]}`);
    try {
      fs.statSync(dir);
    } catch (error) {
      console.warn(`warning: <${vdc[dirMap[type]]}> directory not found in src directory`);
    }
    return dir;
  } else {
    return resolve(`src/${type}`);
  }
}

function resolve (dir) {
  return path.join(utils.APP_PATH, dir)
}

const createLintingRule = () => ({
  test: /\.(js|vue)$/,
  loader: 'eslint-loader',
  enforce: 'pre',
  include: [resolve('src'), resolve('node_modules/vue-design-core')],
  options: {
    formatter: require('eslint-friendly-formatter'),
    emitWarning: !config.dev.showEslintErrorsInOverlay
  }
})

module.exports = {
  mode: process.env.NODE_ENV,
  context: utils.APP_PATH,
  entry: {
    app: path.join(utils.APP_PATH, 'src','main.js')
  },
  output: {
    path: config.build.assetsRoot,
    filename: '[name].js',
    publicPath: process.env.NODE_ENV === 'production'
      ? config.build.assetsPublicPath
      : config.dev.assetsPublicPath
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': resolve('src'),
      '@modules': getSrcDir('modules'),
      '@configs': getSrcDir('configs'),
      '@globals': getSrcDir('globals'),
      '@vendors': getSrcDir('vendors'),
      '@assets': getSrcDir('assets')
    }
  },
  performance: {
    hints: "warning", // 枚举
    maxAssetSize: 30000000, // 整数类型（以字节为单位）
    maxEntrypointSize: 50000000, // 整数类型（以字节为单位）
    assetFilter: function(assetFilename) {
    // 提供资源文件名的断言函数
      return assetFilename.endsWith('.css') || assetFilename.endsWith('.js');
    }
  },
  module: {
    rules: [
      ...(config.dev.useEslint ? [createLintingRule()] : []),
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: vueLoaderConfig
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src'), resolve('node_modules/vue-design-core')]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('img/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('media/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
        }
      }
    ]
  },
  node: {
    // prevent webpack from injecting useless setImmediate polyfill because Vue
    // source contains it (although only uses it if it's native).
    setImmediate: false,
    // prevent webpack from injecting mocks to Node native modules
    // that does not make sense for the client
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  },
  plugins: [
    new VueLoaderPlugin()
  ]
}
