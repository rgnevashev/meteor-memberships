
Meteor.publish 'Memberships.roles', ->
  Memberships.Roles.find()

Meteor.publish 'Memberships.currentUser', ->
  Meteor.users.find @userId,
    fields:
      paymentGateways: 1
      subscriptions: 1
