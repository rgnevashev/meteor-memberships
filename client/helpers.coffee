
Template.registerHelper 'Memberships',

  plans: (group) ->
    Memberships.plans group

  get: (group) ->
    Memberships.get group

  has: (role) ->
    Memberships.has role

  hasAny: (roles) ->
    Memberships.hasAny roles

  hasAccess: (role) ->
    Memberships.hasAccess role
