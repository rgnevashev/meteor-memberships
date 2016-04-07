
class MembershipsServer extends share.MembershipsCommon

  constructor: ->
    super()

    @_services = {}

    # Stripe
    unless Meteor.settings.Stripe?.secretKey
      throw new Meteor.Error 'Memberships: No settings'
    @registerService 'stripe', Meteor.settings.Stripe

    # Paypal
    # @todo

    # Events
    @on 'system.subscription.create', (user, options, done) ->
      self = @
      _.extend options,
        customerId: @customer(user._id, options.service)
      listenerCount = @listeners('subscription.create').length
      if listenerCount == 1
        @emit 'subscription.create', user, options,
          (err, options) ->
            done err, options
      else if listenerCount > 1
        done 'Only one listener'
      else
        done null, options

    @on 'subscription.created', (user, options) ->
      @createSubscription user, options


    @on 'system.subscription.update', (user, subscriptionId, options, done) ->
      self = @
      _.extend options,
        customerId: @customer(user._id, options.service)
        subscription: @subscription(user._id, service: options.service, id: subscriptionId)
      listenerCount = @listeners('subscription.update').length
      if listenerCount == 1
        @emit 'subscription.update', user, subscriptionId, options,
          (err, subscriptionId, options) ->
            done err, subscriptionId, options
      else if listenerCount > 1
        done 'Only one listener'
      else
        done null, subscriptionId, options

    @on 'subscription.updated', (user, subscriptionId, options) ->
      @updateSubscription user, subscriptionId, options


    @on 'system.subscription.cancel', (user, subscriptionId, options, done) ->
      self = @
      _.extend options,
        customerId: @customer(user._id, options.service)
        subscription: @subscription(user._id, service: options.service, id: subscriptionId)
      listenerCount = @listeners('subscription.cancel').length
      if listenerCount == 1
        @emit 'subscription.cancel', user, subscriptionId, options,
          (err, subscriptionId, options) ->
            done err, subscriptionId, options
      else if listenerCount > 1
        done 'Only one listener'
      else
        done null, subscriptionId, options

    @on 'subscription.canceled', (user, subscriptionId, options) ->
      @cancelSubscription user, subscriptionId, options


    @on 'system.customer.create', (user, options, done) ->
      listenerCount = @listeners('customer.create').length
      if listenerCount == 1
        @emit 'customer.create', user, options,
          (err, options) ->
            done err, options
      else if listenerCount > 1
        done 'Only one listener'
      else
        done null, options

    @on 'customer.created', (user, options) ->
      @createCustomer user, options

  get: (userId, group = 'default') ->
    check userId, String
    check group, String
    subscription = @subscription userId, group: group
    unless subscription then @defaultRole() else @roleByPlan(subscription.plan)

  has: (userId, role, options = {}) ->
    check userId, String
    check role, String
    group = @groupByRole(role)
    throw new Meteor.Error 'Role not found' unless group
    subscription = @subscription userId, group: group
    unless subscription
      if role == @defaultRole() then true else false
    else
      if role == @roleByPlan(subscription.plan) then true else false

  hasAccess: (userId, role, options = {}) ->
    check userId, String
    check role, String
    group = @groupByRole(role)
    throw new Meteor.Error 'Role not found' unless group
    subscription = @subscription userId, group: group
    unless subscription
      if role == @defaultRole() then true else false
    else
      userRole = @roleByPlan(subscription.plan)
      if _.contains(_.union([userRole], @_plans[userRole].includedRoles), role) then true else false


  subscribe: (userId, options = {}) ->
    self = @
    subscriptionId = null
    _.defaults options,
      service: 'stripe'
    check userId, String
    check options,
      Match.ObjectIncluding
        plan: String
        service: String
    user = Meteor.users.findOne userId
    throw new Meteor.Error 'User not found' unless user
    subscription = @subscription user._id,
      service: options.service
      group: @groupByPlan(options.plan)
    if subscription
      subscriptionId = @update user._id, subscription.id, options
    else
      @emit 'system.subscription.create', user, options,
        (err, options) ->
          unless err
            subscriptionId = self.service(options.service).subscribe options.customerId, options
            self.emit 'subscription.created', user,
              _.extend options,
                subscriptionId: subscriptionId
          else
            throw new Meteor.Error err
    subscriptionId

  update: (userId, subscriptionId, options = {}) ->
    self = @
    _.defaults options,
      service: 'stripe'
    check userId, String
    check subscriptionId, String
    check options, Match.ObjectIncluding
      service: String
    user = Meteor.users.findOne userId
    throw new Meteor.Error 'User not found' unless user
    @emit 'system.subscription.update', user, subscriptionId, options,
      (err, subscriptionId, options) ->
        unless err
          subscriptionId = self.service(options.service).update options.customerId, subscriptionId, options
          self.emit 'subscription.updated', user, subscriptionId, options
        else
          throw new Meteor.Error err
    subscriptionId

  cancel: (userId, subscriptionId, options = {}) ->
    self = @
    _.defaults options,
      service: 'stripe'
    check userId, String
    check subscriptionId, String
    check options, Match.ObjectIncluding
      service: String
    user = Meteor.users.findOne userId
    throw new Meteor.Error 'User not found' unless user
    @emit 'system.subscription.cancel', user, subscriptionId, options,
      (err, subscriptionId, options) ->
        unless err
          subscriptionId = self.service(options.service).cancel options.customerId, subscriptionId
          self.emit 'subscription.canceled', user, subscriptionId, options
        else
          throw new Meteor.Error err
    subscriptionId

  subscription: (userId, options = {}) ->
    _.defaults options,
      service: 'stripe'
    check userId, String
    check options,
      Match.ObjectIncluding
        service: String
    user = Meteor.users.findOne userId
    throw new Meteor.Error 'User not found' unless user
    _.findWhere user.memberships?.subscriptions or [], _.pick(options, 'service', 'group', 'id', 'plan')

  customer: (userId, serviceName) ->
    self = @
    check userId, String
    check serviceName, String
    user = Meteor.users.findOne userId
    throw new Meteor.Error 'User not found' unless user
    customerId = user.memberships?.services?[serviceName]?.customerId
    unless customerId
      options =
        service: serviceName
      @emit 'system.customer.create', user, options,
        (err, options) ->
          unless err
            customerId = self.service(options.service).createCustomer options
            self.emit 'customer.created', user,
              _.extend options,
                customerId: customerId
          else
            throw new Meteor.Error err
    customerId



  createCustomer: (user, options = {}) ->
    _.defaults options,
      service: 'stripe'
    check options, Match.ObjectIncluding
      service: String
      customerId: String
    Meteor.users.update user._id,
      $set:
        "memberships.services.#{options.service}": _.pick(options, 'customerId')
    , validate: false

  createSubscription: (user, options) ->
    _.defaults options,
      service: 'stripe'
    check options, Match.ObjectIncluding
      plan: String
      service: String
      subscriptionId: String
    check group = @groupByPlan(options.plan), String
    user = Meteor.users.findOne user._id
    throw new Meteor.Error 'User not found' unless user
    prevSubscription = @subscription user._id,
      service: options.service
      group: group
    if prevSubscription
      Meteor.users.update user._id,
        $pull:
          'memberships.subscriptions':
            id: prevSubscription.id
      , validate: false
    Meteor.users.update user._id,
      $push:
        'memberships.subscriptions':
          group: @groupByPlan(options.plan)
          service: options.service
          plan: options.plan
          id: options.subscriptionId
    , validate: false

  updateSubscription: (user, subscriptionId, options) ->
    _.defaults options,
      service: 'stripe'
    check subscriptionId, String
    check options, Match.ObjectIncluding
      service: String
    user = Meteor.users.findOne user._id
    throw new Meteor.Error 'User not found' unless user
    prevSubscription = @subscription user._id,
      service: options.service
      id: subscriptionId
    throw new Meteor.Error 'Subscription not found' unless prevSubscription
    Meteor.users.update user._id,
      $pull:
        'memberships.subscriptions':
          id: prevSubscription.id
    , validate: false
    Meteor.users.update user._id,
      $push:
        'memberships.subscriptions':
          group: @groupByPlan(options.plan or prevSubscription.plan)
          service: options.service
          plan: options.plan or prevSubscription.plan
          id: subscriptionId
    , validate: false

  cancelSubscription: (user, subscriptionId, options) ->
    _.defaults options,
      service: 'stripe'
    check subscriptionId, String
    user = Meteor.users.findOne user._id
    throw new Meteor.Error 'User not found' unless user
    subscription = @subscription user._id,
      service: options.service
      id: subscriptionId
    throw new Meteor.Error 'Subscription not found' unless subscription
    Meteor.users.update user._id,
      $pull:
        'memberships.subscriptions':
          id: subscriptionId
    , validate: false



  registerService: (name, options = {}) ->
    check name, String
    check options, Object
    @_services[name] = new share[s("#{name}_service").classify().value()]?(options)

  service: (name) ->
    check name, String
    unless @_services[name]
      throw new Meteor.Error 'Memberships: No service'
    @_services[name]


###
# @emit 'subscribe', userId, planName, options
###
