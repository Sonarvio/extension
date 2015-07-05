/**
 * Build
 * =====
 *
 *
 */

const path = require('path')

const fs = require('fs-extra')
const chokidar = require('chokidar')
const webpack = require('webpack')

// const ExtractTextPlugin = require('extract-text-webpack-plugin')

const nib = require('nib')
const merge = require('deep-merge')(function (target, source) {
  if (target instanceof Array) {
    return [].concat(target, source)
  }
  return source
})

const manifest = require('./package.json')

// TODO:
// - parse argument ! -> else use default
//
// environment mode: development (default) - release
const isProduction = (process.env.NODE_ENV === 'production') || process.argv.length > 2


const inputFile = __dirname + '/shared/code/main.js'

const distDir = __dirname + '/' + manifest.main.split('/')[0] + '/' // dist
const exportFile = path.basename(manifest.main)
const exportDir = manifest.main.replace(exportFile, '')
const exportName = path.basename(manifest.main, path.extname(manifest.main)) // sonarvio

const platformDir = __dirname + '/platform/'
const sharedDir = __dirname + '/shared/'


// Default - generic settings
var config = {
  devtool: 'sourcemap',
  debug: true,
  entry: inputFile,
  output: {
    path: exportDir,
    filename: exportFile
    // library: exportName,
    // libraryTarget: 'umd' // wrapping ...
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  plugins: [
    // new webpack.DefinePlugin({
    //   'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    // })
  ],
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          optional: [
            // http://babeljs.io/blog/2015/03/31/5.0.0/#stage-0:-class-properties
            // https://gist.github.com/jeffmo/054df782c05639da2adb
            'es7.classProperties'
            // http://babeljs.io/blog/2015/05/14/function-bind/
            // https://github.com/zenparsing/es-function-bind
            // 'es7.functionBind'
          ]
        }
      },
      {
        test: /\.styl$/,
        exclude: /node_modules/,
        loader: 'style-loader!css-loader!stylus-loader'
        // query: {}
      }
      // { // e.g. referenced in 'mime-db' (dependency of request)
      //   test: /\.json$/,
      //   exclude: '/node_modules/',
      //   loader: 'json-loader'
      //   // query: {}
      // }
    ],
  },
  stylus: {
    // perhaps instead of nib - just autoprefixer or postcss:
    //  https://github.com/postcss/postcss#built-with-postcss
    use: [nib()],
    import: ['nib'],
    errors: true
  }
}

if (isProduction) {
  config = merge(config, {
    devtool: 'eval',
    debug: false,
    plugins: [
      new webpack.PrefetchPlugin('react'),
      // new webpack.PrefetchPlugin('react/lib/ReactComponentBrowserEnvironment')
      new webpack.optimize.OccurenceOrderPlugin(),
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.UglifyJsPlugin({ sourceMap: false })
    ],
    stylus: {
      compress: true
    }
  })
}


var platforms = []

var assetsDir = sharedDir + 'assets/'

// iterate over all platforms + copy setup files (e.g. all assets) | build + watch
fs.readdirSync(platformDir).forEach(function (platform) {
  var srcPlatformDir = platformDir + platform + '/'
  var distPlatformDir = distDir + platform + '/'

  platforms.push(distPlatformDir)

  if (isProduction) {
    fs.copySync(assetsDir, distPlatformDir)
    fs.copySync(srcPlatformDir, distPlatformDir)
  } else { // development - specific watcher
    chokidar.watch(srcPlatformDir).on('all', function (e, path) {
      if (['change', 'add'].indexOf(e) > -1) {
        fs.copySync(path, path.replace(srcPlatformDir, distPlatformDir))
      }
    })
  }
})

// development - shared watcher
if (!isProduction) {
  chokidar.watch(assetsDir).on('all', function (e, path) {
    if (['change', 'add'].indexOf(e) > -1) {
      platforms.forEach(function (distPlatformDir) {
        // console.log(path, path.replace(assetsDir, distPlatformDir));
        fs.copySync(path, path.replace(assetsDir, distPlatformDir))
      })
    }
  })
}

// exclude origin reference
var references = platforms.filter(function (platform) {
  return platform.indexOf(config.output.path) === -1
})

if (isProduction) {
  return webpack(config).run(copyAndLog)
}

webpack(config).watch(100, copyAndLog)

/**
 * [copyAndLog description]
 *
 * @param  {[type]} err   [description]
 * @param  {[type]} stats [description]
 * @return {[type]}       [description]
 */
function copyAndLog (err, stats) {
  if (err) {
    return console.error(err)
  }
  references.forEach(function (platform) {
    fs.copySync(config.output.path + config.output.filename, platform + '/' + config.output.filename)
  })
  console.log('[BUILD] - ', stats.toString())
}
