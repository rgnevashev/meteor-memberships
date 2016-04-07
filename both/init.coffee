###
[
  new SimpleSchema
    id:
      type: String
    service:
      type: String
    plan:
      type: String
    group:
      type: String
    data:
      type: Object
      optional: true
      blackbox: true
]
###

schema =
  subscriptions:
    type: [Object]
    optional: true
    blackbox: true
  paymentGateways:
    type: new SimpleSchema
      stripe:
        type: [Object]
        optional: true
        blackbox: true
      paypal:
        type: [Object]
        optional: true
        blackbox: true
    optional: true

@MembershipsSchema = new SimpleSchema schema


#Meteor.users.attachSchema?(schema)

#console.log Meteor.users.simpleSchema().objectKeys()

