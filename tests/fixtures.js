
if (Meteor.isServer) {

  Meteor.methods({

    'test.before': function () {
      Meteor.users.remove({});
      Memberships.clear()

      Memberships.registerPaymentGateway('stripe',
        {secretKey: "sk_test_21akDbAqWvh9nb5U49dIdIbQ"}
      )

      Memberships.define('free', {
        default: true
      });

      Memberships.define('basic', {
        inherit: ['free'],
        plans: [
          {
            id: 'basic-p1m',
            //amount: 900,
            //freq: 'P1M',
            //description: '$9.00 USD/month'
          },
          {
            id: 'basic-p3m',
            //amount: 1599,
            //freq: 'P3M',
            //description: '$15.99 USD every 3 months'
          }
        ]
      });

      Memberships.define('pro', {
        inherit: ['free','basic'],
        plans: [
          {
            id: 'pro-p1m',
            //amount: 500,
            //freq: 'P1M',
            //description: '$5.00 USD/month'
          },
          {
            id: 'pro-p3m',
            //amount: 1199,
            //freq: 'P3M',
            //description: '$11.99 USD every 3 months'
          },
          {
            id: 'pro-p1y',
            //amount: 2999,
            //freq: 'P1Y',
            //description: '$29.99 USD/year'
          }
        ],
      });
    },

    'test.on': function () {
      Memberships.on('paymentGateway.establish', function (userId, name, done) {
        user = Meteor.users.findOne(userId)
        if (name === 'stripe') {
            done(null,
              _.extend(options, {
                email: user.emails[0].address,
                metadata: {
                  userId: user._id
                }
              })
            );
        }
      });

      Memberships.on('paymentGateway.established', function (userId, name, config) {
        //console.log(userId, name, config)
      });

      Memberships.on('subscription.create', function (userId, config, done) {
        user = Meteor.users.findOne(userId)
        if (config.group == 'default') {
          subscription = _.findWhere(
            user.subscriptions || [],
            {group: config.group}
          )
          if (subscription) {
            config.subscription.id = subscription.id
            return done(null,config)
          }
        }
        done(null, config)
      });

      Memberships.on('subscription.created', function (userId, config, subscription) {
        user = Meteor.users.findOne(userId)
        if (config.group == 'default') {
          Meteor.users.update(userId,
            {
              $push: {
                subscriptions: {
                  group: config.group, // important
                  id: subscription.id,
                  paymentGateway: config.options.paymentGateway,
                  plan: config.subscription.plan
                }
              }
            },
            {validate: false}
          );
        }
      });

      Memberships.on('subscription.update', function (userId, config, done) {
        user = Meteor.users.findOne(userId)
        if (config.group == 'default') {
          if (!config.subscription.plan) {
            subscription = _.findWhere(Meteor.users.findOne(userId).subscriptions, {group: config.group})
            config.subscription.plan = subscription.plan
          }
        }
        done(null, config)
      });

      Memberships.on('subscription.updated', function (userId, config, subscription) {
        user = Meteor.users.findOne(userId)
        if (config.group == 'default') {
          Meteor.users.update({_id: userId, 'subscriptions.id': subscription.id},
            {
              $set: {
                'subscriptions.$.group': config.group, // important
                'subscriptions.$.paymentGateway': config.options.paymentGateway,
                'subscriptions.$.plan': config.subscription.plan
              }
            },
            {validate: false}
          );
        }
      });

      Memberships.on('subscription.cancel', function (userId, config, done) {
        user = Meteor.users.findOne(userId)
        if (config.group == 'default') {
        }
        done(null, config)
      });

      Memberships.on('subscription.canceled', function (userId, config, subscription) {
        user = Meteor.users.findOne(userId)
        if (config.group == 'default') {
          Meteor.users.update(user._id, {
            $pull: {
              subscriptions: {
                id: config.subscription.id
              }
            }
          }, {validate: false})
        }
      });
    },

    'test.off': function () {
      Memberships.removeAllListeners('paymentGateway.establish');
      Memberships.removeAllListeners('paymentGateway.established');
      Memberships.removeAllListeners('subscription.create');
      Memberships.removeAllListeners('subscription.created');
      Memberships.removeAllListeners('subscription.update');
      Memberships.removeAllListeners('subscription.updated');
      Memberships.removeAllListeners('subscription.cancel');
      Memberships.removeAllListeners('subscription.canceled');
    },

    'test.after': function () {
      stripe = Memberships.paymentGateway('stripe').client;
      Meteor.users.find().forEach((user) => {
        if (user.paymentGateways && user.paymentGateways.stripe) {
          try {
            stripe.customers.del(user.paymentGateways.stripe.customerId);
          } catch (e) {}
        }
      })
      /*
      try {
        //Memberships.service('stripe').stripe.plans.del('test');
        //Memberships.service('stripe').stripe.plans.del('test2');
      } catch (e) {}
      */
      Meteor.users.remove({});
      Memberships.clear()
    }

  })

  Meteor.call('test.on');

  Meteor.publish(null, function() {
    return Meteor.users.find();
  })

}

if (Meteor.isClient) {

}
