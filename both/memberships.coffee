###
# Group -> Role -> Plans -> Services
###

class share.MembershipsCommon extends EventEmitter

  constructor: ->
    super()
    @_plans = {}

  define: (role, definition = {}) ->
    definition = _.defaults definition,
      group: 'default'
      plans: []
      includedRoles: []

    check role, String
    check definition,
      group: String
      plans: Match.Optional [
        Match.ObjectIncluding
          id: String
          #amount: Match.Optional(Number)
          #freq: Match.Optional(String)
          #name: Match.Optional(String)
          #description: Match.Optional(String)
          #upfront: Match.Optional(Number)
          #payOptions: Match.Optional(Object)
          #permissions: Match.Optional(Object)
      ]
      includedRoles: Match.Optional([String])
      asDefault: Match.Optional(Boolean)

    @_plans[role] = definition

  plans: (group = 'default') ->
    @plansByGroup group

  defaultRole: ->
    role = null
    _.each @_plans or [], (roleObj, name) ->
      if roleObj.asDefault
        role = name
    role

  plansByRoles: (roles = []) ->
    check roles, Match.OneOf(Array, String)
    unless _.isArray(roles)
      roles = [roles]
    plans = []
    _.each @_plans or {}, (roleObj, name) ->
      if (roles.length and _.contains(roles, name)) or !roles.length
        _.each roleObj.plans or [], (plan) ->
          plans.push plan
    plans

  plansByGroup: (group) ->
    check group, String
    plans = []
    _.each @_plans or {}, (roleObj, name) ->
      if roleObj.group == group
        _.each roleObj.plans or [], (plan) ->
          plans.push plan
    plans

  roleByPlan: (planId) ->
    check planId, String
    role = null
    _.each @_plans or {}, (roleObj, roleName) ->
      if _.findWhere(roleObj.plans, id: planId)
        role = roleName
    role

  rolesByGroup: (group) ->
    check group, String
    roles = []
    _.each @_plans or {}, (roleObj, roleName) ->
      if roleObj.group == group
        roles.push roleName
    roles

  groupByPlan: (planId) ->
    check planId, String
    group = null
    _.each @_plans or {}, (roleObj, roleName) ->
      if _.findWhere(roleObj.plans, id: planId)
        group = roleObj.group
    group

  groupByRole: (role) ->
    @_plans[role]?.group

  groups: ->
    groups = []
    _.each @_plans or {}, (roleObj) ->
      unless _.contains(groups, roleObj.group)
        groups.push roleObj.group
    groups

  plan: (planId) ->
    check planId, String
    plans = []
    _.each @_plans or {}, (roleObj) ->
      plans = _.union plans, roleObj.plans
    _.findWhere plans or [], id: planId
