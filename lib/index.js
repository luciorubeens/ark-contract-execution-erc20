'use strict'

const ERC20 = require('./erc20')
const alias = 'erc20'
/**
 * The struct used by the plugin container.
 * @type {Object}
 */
exports.plugin = {
  pkg: require('../package.json'),
  defaults: require('./defaults'),
  alias,
  register (container, options) {
    if (!options.enabled) {
      container.resolvePlugin('logger').info('ERC20 is disabled :grey_exclamation:')

      return
    }

    const erc20 = new ERC20({ alias, container, options })
    erc20.setUp()

    return erc20
  }
}
