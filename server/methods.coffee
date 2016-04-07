
Meteor.methods

  'Memberships/subscribe': (options = {}) ->
    user = Meteor.users.findOne @userId
    throw new Meteor.Error 403, 'Access denied' unless user

    Memberships.subscribe @userId,
      _.omit options, 'application_fee_percent', 'quantity', 'metadata', 'tax_percent', 'trial_end'

  'Memberships/update': (subscriptionId, options = {}) ->
    user = Meteor.users.findOne @userId
    throw new Meteor.Error 403, 'Access denied' unless user

    Memberships.update @userId, subscriptionId,
      _.pick options, 'plan', 'source', 'coupon'


  'Memberships/cancel': (subscriptionId, options = {}) ->
    user = Meteor.users.findOne @userId
    throw new Meteor.Error 403, 'Access denied' unless user

    Memberships.cancel @userId, subscriptionId,
      _.pick options, 'service'
