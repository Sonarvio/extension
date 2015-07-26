/**
 * Index (start)
 * =============
 *
 * - setup to allow 'watch' swap task loading the data/scripts....
 */

 /**
  * Latest Check  -  41.0a2 (2015-07-15)
  * ------------
  *
  * - media source are currently not working on youtube (flash container is used...),
  * 	-> https://bugzilla.mozilla.org/show_bug.cgi?id=778617#c73
  */

var {get, set} = require('sdk/preferences/service')
var {when: unload} = require('sdk/system/unload')
var {PageMod} = require('sdk/page-mod') // https://developer.mozilla.org/en-US/Add-ons/SDK/High-Level_APIs/page-mod
var {id, data} = require('sdk/self')

// TODO:
// - reset on unload to toggle back to the original configuration

// enable debugging - show all logs
// - https://developer.mozilla.org/en-US/Add-ons/SDK/Tools/console#Logging_Levels
// - https://developer.mozilla.org/en-US/Add-ons/SDK/Low-Level_APIs/preferences_service

set('extensions.' + id + '.sdk.console.logLevel', 'all')

// current limited browser support for MSE - enable as a browser configuration
// - http://caniuse.com/#search=mediasource
// - https://bugzilla.mozilla.org/show_bug.cgi?id=778617
set('media.mediasource.enabled', true)
set('media.mediasource.webm.enabled', true)
// preferences.set('media.mediasource.whitelist', true)   // breaks further handling in FF Developer Edition

PageMod({
  include: '*',
  contentScriptFile: data.url('sonarvio.js')
})

unload(function(){
  console.log('UNLOADED - Sonarvio')
})
