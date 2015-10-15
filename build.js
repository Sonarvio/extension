/**
 * Build
 * =====
 *
 *
 */

var path = require('path')
// var spawn = require('child_process').spawn

var fs = require('fs-extra')
var chokidar = require('chokidar')
var webpack = require('webpack')
var glob = require('glob')
var JSZip = require('jszip')
var ChromeExtension = require('crx')

var merge = require('deep-merge')(function (target, source) {
  if (target instanceof Array) {
    return [].concat(target, source)
  }
  return source
})

var autoprefixer = require('autoprefixer')
var pxtorem = require('postcss-pxtorem')
var lost = require('lost')
var rucksack = require('rucksack-css')

var manifest = require('./package.json')

// environment (default mode: development)
var env = {
  SHARED_DIRECTORY: path.resolve(__dirname, 'shared'),
  ASSETS_DIRECTORY: path.resolve(__dirname, 'shared/assets'),
  PLATFORM_DIRECTORY: path.resolve(__dirname, 'platform'),
  ENTRY_FILE: path.resolve(__dirname, 'shared/code/main.js'),
  DIST_DIRECTORY: path.resolve(__dirname, path.dirname(manifest.main).split('/')[0]),
  DIST_DIRECTORY_REFERENCE: path.resolve(__dirname, path.dirname(manifest.main)), // == bookmarklet
  DIST_FILENAME: path.basename(manifest.main, path.extname(manifest.main)),
  isProduction: (process.env.NODE_ENV === 'production') || process.argv.length > 2
}

if (env.isProduction) {
  fs.removeSync(env.DIST_DIRECTORY)
}

// #1 - copy assets into bookmarklet (e.g. '/icons/...')
if (!env.isProduction) {
  chokidar.watch(env.ASSETS_DIRECTORY).on('all', function (e, path) {
    if (['change', 'add'].indexOf(e) > -1) {
      fs.copySync(env.ASSETS_DIRECTORY, env.DIST_DIRECTORY_REFERENCE)
    }
  })
} else {
  fs.copySync(env.ASSETS_DIRECTORY, env.DIST_DIRECTORY_REFERENCE)
}

// #2 - bundle shared code (~ content script) into bookmarklet
var config = {
  target: 'web',
  entry: env.ENTRY_FILE,
  output: {
    path: env.DIST_DIRECTORY_REFERENCE,
    filename: env.DIST_FILENAME + '.js'
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        include: env.SHARED_DIRECTORY,
        loader: 'babel',
        query: {
          optional: ['runtime'],
          stage: 0
        }
      },
      {
        test: /\.(jpe?g|png|gif|svg|ico)$/i,
        include: env.SHARED_DIRECTORY,
        loader: 'url',
        query: {
          limit: 10240
        }
      }
    ]
  },
  stylus: {
    errors: true
  },
  postcss: function(){
    return [
      lost({/** https://github.com/corysimmons/lost#global-grid-settings **/
        flexbox: 'flex'
      }),
      rucksack({/** https://github.com/simplaio/rucksack#options **/}),
      pxtorem({/** https://github.com/cuth/postcss-pxtorem#options **/}),
      autoprefixer({/** https://github.com/postcss/autoprefixer-core#usage **/
        // browsers: ['last 2 versions']
      })
    ]
  }
}

// development: build + watch
if (!env.isProduction) {
  config = merge(config, {
    devtool: 'eval',
    module: {
      loaders: [
        {
          test: /\.styl$/,
          include: env.SHARED_DIRECTORY,
          // https://medium.com/seek-ui-engineering/the-end-of-global-css-90d2a4a06284
          loader: 'style-loader!css-loader?modules&importLoaders=1&localIdentName=[path][name]__[local]--[hash:base64:5]!stylus-loader'
        }
      ]
    }
  })
  var ready = false
  webpack(config).watch(100, function (error, stats) {
    if (ready) {
      if (error) {
        return console.error('error', error)
      }
      return console.log(new Date().toISOString(), ' - [sonarvio-extension]', stats.toString())
    }
    ready = true
    notify.apply(null, arguments)
  })
} else {
  // production: release
  config = merge(config, {
    devtool: 'source-map',
    plugins: [
      new webpack.PrefetchPlugin('react'),
      new webpack.optimize.OccurenceOrderPlugin(),
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.UglifyJsPlugin({
        // sourceMap: false,
        compress: {
          warnings: false
        }
      })
    ],
    module: {
      loaders: [
        {
          test: /\.styl$/,
          include: env.SHARED_DIRECTORY,
          // https://medium.com/seek-ui-engineering/the-end-of-global-css-90d2a4a06284
          loader: 'style-loader!css-loader?modules!stylus-loader'
        }
      ]
    },
    stylus: {
      compress: true
    }
  })
  webpack(config).run(notify)
}

// async ready
function notify (error, stats) {
  if (error) {
    return console.error('error', error)
  }
  console.log(new Date().toISOString(), ' - [sonarvio-extension]', stats.toString())

  // #3 - include all the bookmarklet files and transfer them into the specific platform packages
  // (incl. now the reference file-loader hashed data)
  fs.readdirSync(env.PLATFORM_DIRECTORY).forEach(function (platform) {
    if (env.DIST_DIRECTORY_REFERENCE.indexOf(platform) === -1) {
      // if (platform  === 'firefox') {
      //   platform += '/data'
      // }
      var distPlatformDirectory = path.join(env.DIST_DIRECTORY, platform)
      if (!env.isProduction) {
        chokidar.watch(env.DIST_DIRECTORY_REFERENCE).on('all', function (e, path) {
          if (['change', 'add'].indexOf(e) > -1) {
            fs.copySync(path, path.replace(env.DIST_DIRECTORY_REFERENCE, distPlatformDirectory))
          }
        })
      } else {
        fs.copySync(env.DIST_DIRECTORY_REFERENCE, distPlatformDirectory)
      }
    }
  })

  // #4 - check all platforms for '.webextensions.js' files and sync them between the specified platforms
  // + #5 - copy all files from the platforms directories into the dist platforms folders !
  // TODO:
  // - include regular handler for IE/Edge and safari as well
  var webextensionsVendors = ['chrome', 'opera', 'firefox']

  webextensionsVendors.forEach(function (vendor) {
    var vendorSourceDirectory = path.join(env.PLATFORM_DIRECTORY, vendor)
    var vendorDistDirectory = path.join(env.DIST_DIRECTORY, vendor)
    var others = webextensionsVendors.reduce(function (others, otherVendor) {
      if (otherVendor !== vendor) {
        others.push(path.join(env.PLATFORM_DIRECTORY, otherVendor))
      }
      return others
    }, [])
    if (!env.isProduction) {
      chokidar.watch(vendorSourceDirectory).on('all', function (e, path) {
        if (['change', 'add'].indexOf(e) > -1) {
          if ((/\.webextensions\.js$/).test(path)) {
            others.forEach(function (othersDirectory) { // internaly prevents - as it detect the same
              fs.copySync(path, path.replace(vendorSourceDirectory, othersDirectory))
            })
          }
          fs.copySync(path, path.replace(vendorSourceDirectory, vendorDistDirectory))
        }
      })
    } else { // copy static files in sync
      fs.readdirSync(vendorSourceDirectory).forEach(function (file) {
        var vendorFile = path.join(vendorSourceDirectory, file)
        if ((/\.webextensions\.js$/).test(file)) {
          others.forEach(function (othersDirectory) {
            fs.copySync(vendorFile, path.join(othersDirectory, file))
          })
        }
        fs.copySync(vendorFile, path.join(vendorDistDirectory, file))
      })
    }
  })


  // #6 - build package

  // wrap chrome
  var chromeDirectory = path.join(env.DIST_DIRECTORY, 'chrome')
  var chromeRelease = path.join(chromeDirectory, 'release')
  var chromeExtension = path.join(chromeRelease, 'sonarvio.crx')
  fs.ensureDirSync(chromeRelease)

  if (env.isProduction) {
    var crx = new ChromeExtension({
      // codebase: '' // online reference for auto-updates
      privateKey: fs.readFileSync(path.join(__dirname, 'chrome-key.pem')),
      rootDirectory: chromeDirectory
    })
    crx.load(chromeDirectory).then(function(){
      return crx.loadContents()
    })
    .then(function (archiveBuffer) {
      return crx.pack(archiveBuffer)
    })
    .then(function (crxBuffer) {
      fs.writeFileSync(chromeExtension, crxBuffer)
    })
    .catch(console.error.bind(console))
  }

  // wrap firefox
  // https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Chrome_incompatibilities
  // https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Packaging_and_installation
  // https://wiki.mozilla.org/WebExtensions#Packaging_2
  var firefoxDirectory = path.join(env.DIST_DIRECTORY, 'firefox')
  var firefoxRelease = path.join(firefoxDirectory, 'release')
  var firefoxExtension = path.join(firefoxRelease, 'sonarvio.xpi')
  fs.ensureDirSync(firefoxRelease)

  var zip = new JSZip()
  glob.sync('**/**', { cwd: firefoxDirectory, mark: true }).forEach(function (file) {
    if (file.charAt(file.length-1) !== '/' && file.indexOf(firefoxRelease) === -1) {
      zip.file(file, fs.readFileSync(path.join(firefoxDirectory, file)))
    }
  })
  fs.writeFileSync(firefoxExtension, zip.generate({ // content
    type: 'nodebuffer',
    platform: process.platform
  }))

  // if (!env.isProduction) {
  //   chokidar.watch(firefoxDirectory).on('all', function (e, path) {
  //     if (['change', 'add'].indexOf(e) > -1 && path.indexOf(firefoxRelease) === -1) {
  //       zip.file(path.replace(firefoxDirectory, ''), fs.readFileSync(path))
  //       fs.writeFileSync(firefoxExtension, zip.generate({ // content
  //         type: 'nodebuffer',
  //         platform: process.platform
  //       }))
  //     }
  //   })
  // }

  // --- currently jpm and the WebExtensions API doesn't worker together  ---
  // http://stackoverflow.com/questions/32670794/how-do-i-use-jpm-with-webextension-in-firefox
  //
  // spawn process for updating the firefox extension build + release package
  // var jpmCLI = null
  // if (!isProduction) {
  //   jpmCLI = spawn('jpm', ['watchpost', '--post-url', 'http://localhost:8888/', '-v'], {
  //     cwd: path.join(env.DIST_DIRECTORY, 'firefox/')
  //   })
  // } else {
  //   jpmCLI = spawn('jpm', ['xpi', '-v'], {
  //     cwd: path.join(env.DIST_DIRECTORY, 'firefox/')
  //   })
  // }
  // jpmCLI.stdout.pipe(process.stdout)
  // jpmCLI.stderr.pipe(process.stderr)
  // jpmCLI.on('error', console.error.bind(console))

  if (env.isProduction) {
    console.log('[DONE]');
  }
}
