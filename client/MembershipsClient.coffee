
class MembershipsClient extends share.MembershipsCommon

  constructor: ->
    super()

  subscribe: (subscription = {}, options = {}, done) ->
    Meteor.call 'Memberships/subscribe', subscription, options, done

  update: (subscriptionId, subscription = {}, options = {}, done) ->
    Meteor.call 'Memberships/update', subscriptionId, subscription, options, done

  cancel: (subscriptionId, options = {}, done) ->
    Meteor.call 'Memberships/cancel', subscriptionId, options, done


  get: (group = 'default') ->
    check group, String
    subscription = @subscription group: group
    unless subscription then @defaultRole(group) else @roleByPlan(subscription.plan)

  has: (role, options = {}) ->
    check role, String
    group = @groupByRole(role)
    throw new Meteor.Error 'Role not found' unless group
    subscription = @subscription group: group
    unless subscription
      if role == @defaultRole(group) then true else false
    else
      if role == @roleByPlan(subscription.plan) then true else false

  hasAccess: (role, options = {}) ->
    check role, String
    group = @groupByRole(role)
    throw new Meteor.Error 'Role not found' unless group
    subscription = @subscription group: group
    unless subscription
      if role == @defaultRole(group) then true else false
    else
      userRole = @roleByPlan(subscription.plan)
      if _.contains(_.union([userRole], @role(userRole, group).inherit), role) then true else false

  subscription: (options = {}) ->
    _.defaults options,
      paymentGateway: 'stripe'
    check options,
      Match.ObjectIncluding
        paymentGateway: String
    user = Meteor.users.findOne Meteor.userId()
    throw new Meteor.Error 'User not found' unless user
    _.findWhere user.subscriptions or [], _.pick(options, 'paymentGateway', 'group', 'id', 'plan')
