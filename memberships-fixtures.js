
Memberships.define('free', {
  group: 'default',
  asDefault: true
});

Memberships.define('pro', {
  group: 'default',
  includedRoles: ['free','basic'],
  plans: [
    {
      id: 'test',
      amount: 100,
      freq: 'P1M',
      description: '$1.00 USD/month'
    },
    {
      id: 'test2',
      amount: 150,
      freq: 'P1M',
      description: '$1.50 USD/month'
    },
    {
      id: 'pro-p1m',
      amount: 500,
      freq: 'P1M',
      description: '$5.00 USD/month'
    },
    {
      id: 'pro-p3m',
      amount: 1199,
      freq: 'P3M',
      description: '$11.99 USD every 3 months'
    },
    {
      id: 'pro-p1y',
      amount: 2999,
      freq: 'P1Y',
      description: '$29.99 USD/year'
    }
  ]
});

Memberships.define('basic', {
  group: 'default',
  includedRoles: ['free'],
  plans: [
    {
      id: 'basic-p1m',
      amount: 900,
      freq: 'P1M',
      description: '$9.00 USD/month'
    },
    {
      id: 'basic-p3m',
      amount: 1599,
      freq: 'P3M',
      description: '$15.99 USD every 3 months'
    }
  ]
});


if (Meteor.isServer) {

  Memberships.on('customer.create', function (user, options, done) {
    if (options.service === 'stripe') {
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


  Meteor.methods({

    'test.before': function () {
      Meteor.users.remove({});
      stripe = Memberships.service('stripe').stripe;
      try {
        stripe.plans.retrieve('test');
      } catch (e) {
        stripe.plans.create({
          amount: 100,
          interval: "month",
          name: "Tinytest",
          currency: "usd",
          id: "test"
        });
      }
      try {
        stripe.plans.retrieve('test2');
      } catch (e) {
        stripe.plans.create({
          amount: 150,
          interval: "month",
          name: "Tinytest",
          currency: "usd",
          id: "test2"
        });
      }
    },

    'test.after': function () {
      stripe = Memberships.service('stripe').stripe;
      Meteor.users.find().forEach((user) => {
        if (user.memberships && user.memberships.services && user.memberships.services.stripe && user.memberships.services.stripe.customerId) {
          try {
            stripe.customers.del(user.memberships.services.stripe.customerId);
          } catch (e) {}
        }
      })
      try {
        //Memberships.service('stripe').stripe.plans.del('test');
        //Memberships.service('stripe').stripe.plans.del('test2');
      } catch (e) {}
      Meteor.users.remove({});
    }

  })

  Meteor.publish(null, function() {
    return Meteor.users.find();
  })

}

if (Meteor.isClient) {

}
