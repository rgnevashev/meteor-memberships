
class share.StripePaymentGateway extends share.PaymentGateway

  constructor: (options) ->
    super()
    {
      @secretKey
    } = options
    @client = StripeSync @secretKey

  subscribe: (options = {}, config = {}) ->
    check options, Object
    check config, Match.ObjectIncluding
      customerId: String
    @client.customers.createSubscription config.customerId,
      _.pick options,
        'application_fee_percent',
        'coupon',
        'plan',
        'source',
        'quantity',
        'metadata',
        'tax_percent',
        'trial_end'

  update: (subscriptionId, options = {}, config = {}) ->
    check subscriptionId, String
    check options, Object
    check config, Match.ObjectIncluding
      customerId: String
    @client.customers.updateSubscription config.customerId, subscriptionId,
      _.pick options,
        'application_fee_percent',
        'coupon',
        'plan',
        'prorate',
        'proration_date',
        'source',
        'quantity',
        'metadata',
        'tax_percent',
        'trial_end'

  cancel: (subscriptionId, config = {}) ->
    check subscriptionId, String
    check config, Match.ObjectIncluding
      customerId: String
    @client.customers.cancelSubscription config.customerId, subscriptionId

  establish: (options = {}) ->
    check options, Object
    customer = @client.customers.create _.pick options,
      'account_balance',
      'coupon',
      'description',
      'email',
      'metadata',
      'plan',
      'quantity',
      'shipping',
      'source',
      'tax_percent',
      'trial_end'
    customerId: customer?.id
