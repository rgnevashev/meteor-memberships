
#amount: Match.Optional(Number)
#freq: Match.Optional(String)
#name: Match.Optional(String)
#description: Match.Optional(String)
#upfront: Match.Optional(Number)
#payOptions: Match.Optional(Object)
#permissions: Match.Optional(Object)
#paymentGateway: name: String, options: Object

class MembershipsServer extends share.MembershipsCommon

  constructor: ->
    super()

    @_payment_gateways = {}

    @on 'paymentGateway.established', (userId, name, config) ->
      switch name
        when 'stripe'
          Meteor.users.update userId,
            $set:
              "paymentGateways.#{name}": config
          , validate: false

    @on 'system.subscription.create', (userId, subscription, options, done) ->
      self = @
      _.defaults options,
        group: 'default'
        paymentGateway: 'stripe'
      unless _.contains(_.keys(@_payment_gateways), options.paymentGateway)
        done 'Payment Gateway not found'
      unless user = Meteor.users.findOne(userId)
        done 'User not found'
      options.group = @groupByPlan(subscription.plan) if subscription.plan
      if prevSub = _.findWhere(user.subscriptions or [], options)
        subscription.id = prevSub.id
      config =
        subscription: subscription
        options: _.extend options,
          paymentGatewayConfig: @paymentGatewayConfig(userId, options.paymentGateway)
      listenerCount = @listeners('subscription.create').length
      if listenerCount == 1
        @emit 'subscription.create', userId, config,
          (err, config) ->
            done err, config
      else if listenerCount > 1
        done 'Event "subscription.create" only one'
      else
        done 'Event "subscription.create" require'

    @on 'system.subscription.created', (userId, config, subscription) ->
      Meteor.users.update userId,
        $push:
          subscriptions:
            _.extend _.clone(config.options),
              id: subscription.id
              plan: config.subscription.plan
              role: @roleByPlan(config.subscription.plan)
      , validate: false

    @on 'system.subscription.update', (userId, subscription, options, done) ->
      self = @
      _.defaults options,
        paymentGateway: 'stripe'
      unless _.contains(_.keys(@_payment_gateways), options.paymentGateway)
        done 'Payment Gateway not found'
      unless user = Meteor.users.findOne(userId)
        done 'User not found'
      if not subscription.plan and prevSub = _.findWhere(user.subscriptions or [], id: subscription.id)
        subscription.plan = prevSub.plan
      options.group = @groupByPlan(subscription.plan) if subscription.plan
      config =
        subscription: subscription
        options: _.extend options,
          paymentGatewayConfig: @paymentGatewayConfig(userId, options.paymentGateway)
      listenerCount = @listeners('subscription.update').length
      if listenerCount == 1
        @emit 'subscription.update', userId, config,
          (err, config) ->
            done err, config
      else if listenerCount > 1
        done 'Event "subscription.update" only one'
      else
        done 'Event "subscription.update" require'

    @on 'system.subscription.updated', (userId, config, subscription) ->
      modifier = $set: {}
      _.each config.options, (value, key) ->
        modifier.$set["subscriptions.$.#{key}"] = value
      modifier.$set['subscriptions.$.plan'] = config.subscription.plan
      modifier.$set['subscriptions.$.role'] = @roleByPlan(config.subscription.plan)
      Meteor.users.update _id: userId, 'subscriptions.id': subscription.id, modifier, validate: false

    @on 'system.subscription.cancel', (userId, subscriptionId, options, done) ->
      self = @
      _.defaults options,
        paymentGateway: 'stripe'
      unless _.contains(_.keys(@_payment_gateways), options.paymentGateway)
        done 'Payment Gateway not found'
      config =
        subscription:
          id: subscriptionId
        options: _.extend options,
          group: options.group
          paymentGatewayConfig: @paymentGatewayConfig(userId, options.paymentGateway)
      listenerCount = @listeners('subscription.cancel').length
      if listenerCount == 1
        @emit 'subscription.cancel', userId, config,
          (err, config) ->
            done err, config
      else if listenerCount > 1
        done 'Event "subscription.cancel" only one'
      else
        done 'Event "subscription.cancel" require'

    @on 'system.subscription.canceled', (userId, config, subscription) ->
      Meteor.users.update userId,
        $pull:
          subscriptions:
            id: config.subscription.id


  define: (role, definition = {}, group = 'default') ->
    _.defaults definition,
      group: group
      role: role
      plans: []
      inherit: []
      permissions: {}
      default: false

    check definition,
      group: String
      role: String
      plans: Match.Optional [
        Match.ObjectIncluding
          id: String
      ]
      inherit: Match.Optional([String])
      permissions: Match.Optional(Object)
      default: Match.Optional(Boolean)

    @Roles.upsert group: definition.group, role: definition.role,
      $set:
        _.omit(definition, 'group', 'role')

  clear: ->
    @Roles.remove({})


  get: (userId, group = 'default') ->
    check userId, String
    check group, String
    subscription = @subscription userId, group: group
    unless subscription then @defaultRole(group) else @roleByPlan(subscription.plan)

  has: (userId, role, options = {}) ->
    check userId, String
    check role, String
    group = @groupByRole(role)
    throw new Meteor.Error 'Role not found' unless group
    subscription = @subscription userId, group: group
    unless subscription
      if role == @defaultRole(group) then true else false
    else
      if role == @roleByPlan(subscription.plan) then true else false

  hasAccess: (userId, role, options = {}) ->
    check userId, String
    check role, String
    group = @groupByRole(role)
    throw new Meteor.Error 'Role not found' unless group
    subscription = @subscription userId, group: group
    unless subscription
      if role == @defaultRole(group) then true else false
    else
      userRole = @roleByPlan(subscription.plan)
      if _.contains(_.union([userRole], @role(userRole, group).inherit), role) then true else false


  ###
  # userId
  # subscription:
  #   - plan, source, etc
  # options:
  #   - paymentGateway String
  #   - selector Object
  ###
  subscribe: (userId, subscription = {}, options = {}, self = @) ->
    try
      Meteor.wrapAsync((userId, subscription, options, done) ->
        self.emit 'system.subscription.create', userId, subscription, options,
          (err, config) ->
            unless err
              unless config.subscription.id
                subscription = self.paymentGateway(config.options.paymentGateway).subscribe(config.subscription, config.options.paymentGatewayConfig)
                self.emit 'system.subscription.created', userId, config, subscription
                self.emit 'subscription.created', userId, config, subscription
                done null, _.extend(config, subscription: subscription)
              else
                done null, self.update(userId, subscription, options)
            else
              done err
      )(userId, subscription, options)
    catch e
      throw new Meteor.Error 'memberships:subscribe', e


  ###
  # userId
  # subscription:
  #   - id, plan, source, etc
  # options:
  #   - group String
  #   - paymentGateway String
  #   - selector Object
  ###
  update: (userId, subscription = {}, options = {}, self = @) ->
    try
      Meteor.wrapAsync((userId, subscription, options, done) ->
        self.emit 'system.subscription.update', userId, subscription, options,
          (err, config) ->
            unless err
              subscription = self.paymentGateway(config.options.paymentGateway).update(config.subscription.id, config.subscription, config.options.paymentGatewayConfig)
              self.emit 'system.subscription.updated', userId, config, subscription
              self.emit 'subscription.updated', userId, config, subscription
              done null, _.extend(config, subscription: subscription)
            else
              done err
      )(userId, subscription, options)
    catch e
      throw new Meteor.Error 'memberships:update', e


  ###
  # userId
  # subscriptionId
  # options:
  #   - group String
  #   - paymentGateway String
  #   - selector Object
  ###
  cancel: (userId, subscriptionId, options = {}, self = @) ->
    try
      Meteor.wrapAsync((userId, subscriptionId, options, done) ->
        self.emit 'system.subscription.cancel', userId, subscriptionId, options,
          (err, config) ->
            unless err
              subscription = self.paymentGateway(config.options.paymentGateway).cancel(config.subscription.id, config.options.paymentGatewayConfig)
              self.emit 'system.subscription.canceled', userId, config, subscription
              self.emit 'subscription.canceled', userId, config, subscription
              done null, _.extend(config, subscription: subscription)
            else
              done err
      )(userId, subscriptionId, options)
    catch e
      throw new Meteor.Error 'memberships:cancel', e

  subscription: (userId, options = {}) ->
    _.defaults options,
      paymentGateway: 'stripe'
    check userId, String
    check options,
      Match.ObjectIncluding
        paymentGateway: String
    user = Meteor.users.findOne userId
    throw new Meteor.Error 'User not found' unless user
    _.findWhere user.subscriptions or [], _.pick(options, 'paymentGateway', 'group', 'id', 'plan')

  registerPaymentGateway: (name, options = {}) ->
    check name, String
    check options, Object
    @_payment_gateways[name] = new share[s("#{name}_payment_gateway").classify().value()]?(options)

  paymentGateway: (name) ->
    check name, String
    throw new Meteor.Error 'payment-gateway-not-found', "Memberships: Payment Gateway does not exist" unless @_payment_gateways[name]
    @_payment_gateways[name]

  paymentGatewayConfig: (userId, name) ->
    self = @
    check userId, String
    check name, String
    user = Meteor.users.findOne userId
    throw new Meteor.Error 'User not found' unless user
    config = user.paymentGateways?[name]
    if _.isEmpty(config)
      @emit 'paymentGateway.establish', userId, name,
        (err, options) ->
          unless err
            config = self.paymentGateway(name).establish(options)
            self.emit 'paymentGateway.established', userId, name, config
          else
            throw new Meteor.Error err
    config
