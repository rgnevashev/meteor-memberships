###
# Group -> Role -> Plans -> Services
###

class share.MembershipsCommon extends EventEmitter

  constructor: ->
    super()

    # Mongo Collection
    @Roles = new Mongo.Collection 'memberships'


  groups: ->
    groups = []
    @Roles.find().forEach (role) ->
      unless _.contains(groups, role.group)
        groups.push role.group
    groups

  groupByPlan: (plan) ->
    check plan, String
    @Roles.findOne('plans.id': plan)?.group

  groupByRole: (role) ->
    check role, String
    @Roles.findOne('role': role)?.group


  plans: (group = 'default') ->
    @plansByGroup group

  plansByGroup: (group = 'default') ->
    check group, String
    plans = []
    @Roles.find(group: group).forEach (role) ->
      _.each role.plans or [], (plan) ->
        plans.push plan
    plans

  plansByRoles: (roles = []) ->
    check roles, Match.OneOf(Array, String)
    unless _.isArray(roles)
      roles = [roles]
    plans = []
    selector = {}
    if roles.length
      selector.role = $in: roles
    @Roles.find(selector).forEach (role) ->
      _.each role.plans or [], (plan) ->
        plans.push plan
    plans

  plan: (plan) ->
    check plan, String
    role = @Roles.findOne('plans.id': plan)
    _.findWhere role.plans or [], id: plan


  roleByPlan: (plan) ->
    check plan, String
    @Roles.findOne('plans.id': plan)?.role

  rolesByGroup: (group = 'default') ->
    check group, String
    @Roles.find(group: group)
      .map (role) ->
        role.role

  defaultRole: (group = 'default') ->
    @Roles.findOne(group: group, default: true)?.role

  role: (role, group = 'default') ->
    @Roles.findOne(role: role, group: group)

  permissions: (role = 'free', group = 'default') ->
    role = @Roles.findOne(role: role, group: group)
    permissions = role?.permissions or {}
    _.each role.inherit or [], (name) =>
      _.extend @Roles.findOne(role: name, group: group)?.permissions or {}, permissions
    permissions
