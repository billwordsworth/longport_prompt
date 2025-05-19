const { Config, TradeContext, OrderType, OrderSide, Decimal, TimeInForceType } = require('longport')

let config = Config.fromEnv()
TradeContext.new(config)
  .then((ctx) =>
    ctx.submitOrder({
      symbol: '700.HK',
      orderType: OrderType.LO,
      side: OrderSide.Buy,
      timeInForce: TimeInForceType.Day,
      submittedQuantity: new Decimal(200),
      submittedPrice: new Decimal(300),
    })
  )
  .then((resp) => console.log(resp.toString()))

