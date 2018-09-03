'use strict'

const Web3 = require('web3')

module.exports = class ERC20 {
  constructor ({ alias, container, options }) {
    this.alias = alias
    this.logger = container.resolvePlugin('logger')
    this.emitter = container.resolvePlugin('event-emitter')

    const web3 = new Web3(options.ethereumPeer)
    this.contract = new web3.eth.Contract(options.contractABI, options.contractAddress)
    this.web3 = web3
    this.previousBlock = null
    this.options = options
  }

  setUp () {
    this.__getBlocks()
    this.__listenMethods()
  }

  /**
   * Return a transcation object for that method
   * https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#id12
  */
  trigger (method, params = []) {
    const hasMethod = method && this.contract.methods && this.contract.methods[method]

    if (!hasMethod) {
      this.__log(`Method ${method} not found.`, 'error')
      return
    }

    return this.contract.methods[method](...params)
  }

  /**
   * The API needs a filter with a range of blocks.
  */
  async __getBlocks () {
    // TODO: listen for a specific event, such as block.forged.
    const lastBlock = await this.web3.eth.getBlockNumber()
    const realBlock = lastBlock - this.options.blockConfirmations

    if (!this.previousBlock) {
      this.previousBlock = realBlock - 1
    }

    if (realBlock > this.previousBlock) {
      this.__log(`New block: ${realBlock}`)
      this.emitter.emit(`${this.alias}.block`, realBlock)

      await this.__fetchEvents(realBlock)
      this.previousBlock = realBlock
    }

    return setTimeout(() => this.__getBlocks(), this.options.checkInterval)
  }

  /**
   * Useful to call this by the emitter plugin
   * Eg: emitter.emit('erc20', { method: 'name', callback: (name) => name.call() })
  */
  __listenMethods () {
    this.emitter.on(this.alias, async ({ method, params, callback }) => {
      const result = await this.trigger(method, params)
      callback(result)
    })
  }

  /**
   * Emit events triggered in the block interval
   * https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#getpastevents
  */
  __fetchEvents (toBlock) {
    const filter = { ...this.options.filter }
    filter.fromBlock = this.previousBlock + 1
    filter.toBlock = toBlock

    this.contract.getPastEvents('allEvents', filter)
      .then(response => {
        response.forEach(evt => {
          const name = `${this.alias}.${evt.event}`

          this.emitter.emit(name, evt)
          this.__log(`Event '${name}' emitted!`)
        })
      })
      .catch(error => {
        this.__log(`Failed to fetch events. Reason: ${error.message}`, 'error')
      })
  }

  __log (message, type = 'info') {
    const pluginName = this.alias.toUpperCase()
    const msg = `[${pluginName}] ${message}`
    this.logger[type](msg)
  }
}
