
StripeService = class share.StripeService

  constructor: (options) ->
    {
      @secretKey
    } = options
    @stripe = StripeSync @secretKey

  subscribe: (customerId, options = {}) ->
    check customerId, String
    check options, Object
    subscription = @stripe.customers.createSubscription customerId,
      _.pick options,
        'application_fee_percent',
        'coupon',
        'plan',
        'source',
        'quantity',
        'metadata',
        'tax_percent',
        'trial_end'
    subscription.id

  update: (customerId, subscriptionId, options = {}) ->
    check customerId, String
    check subscriptionId, String
    check options, Object
    subscription = @stripe.customers.updateSubscription customerId, subscriptionId,
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
    subscription.id

  cancel: (customerId, subscriptionId) ->
    check customerId, String
    check subscriptionId, String
    subscription = @stripe.customers.cancelSubscription customerId, subscriptionId
    subscription.id

  createCustomer: (options = {}) =>
    check options, Object
    customer = @stripe.customers.create _.pick options,
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
    customer.id

  customer: (customerId) ->
    check customerId, String
    @stripe.customers.retrieve customerId
