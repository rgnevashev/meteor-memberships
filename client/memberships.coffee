
class MembershipsClient extends share.MembershipsCommon

  constructor: ->
    super()

  subscribe: (options = {}, done) ->
    Meteor.call 'Memberships/subscribe', options, done

  update: (subscriptionId, options = {}, done) ->
    Meteor.call 'Memberships/update', subscriptionId, options, done

  cancel: (subscriptionId, options = {}, done) ->
    Meteor.call 'Memberships/cancel', subscriptionId, options, done

  get: (group = 'default') ->
    check group, String
    subscription = @subscription group: group
    unless subscription then @defaultRole() else @roleByPlan(subscription.plan)

  has: (role, options = {}) ->
    check role, String
    group = @groupByRole(role)
    throw new Meteor.Error 'Role not found' unless group
    subscription = @subscription group: group
    unless subscription
      if role == @defaultRole() then true else false
    else
      if role == @roleByPlan(subscription.plan) then true else false

  hasAny: (roles, options = {}) ->
    check roles, Match.OneOf(Array, String)
    unless _.isArray(roles)
      roles = roles.split(',')
    pass = false
    _.each roles or [], (role) =>
      if @has(role)
        pass = true
    pass

  hasAccess: (role, options = {}) ->
    check role, String
    group = @groupByRole(role)
    throw new Meteor.Error 'Role not found' unless group
    subscription = @subscription group: group
    unless subscription
      if role == @defaultRole() then true else false
    else
      userRole = @roleByPlan(subscription.plan)
      if _.contains(_.union([userRole], @_plans[userRole].includedRoles), role) then true else false

  subscription: (options = {}) ->
    _.defaults options,
      service: 'stripe'
    check options,
      Match.ObjectIncluding
        service: String
    user = Meteor.users.findOne Meteor.userId()
    throw new Meteor.Error 'User not found' unless user
    _.findWhere user.memberships?.subscriptions or [], _.pick(options, 'service', 'group', 'id', 'plan')
