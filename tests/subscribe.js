
if (Meteor.isServer) {
  Tinytest.add('memberships - server - subscribe', (test) => {

    Meteor.call('test.before');

    gateway = Memberships.paymentGateway('stripe')
    test.isTrue(!!gateway)

    var userId = Accounts.createUser({
      email: 'rgnevashev+tinytest@gmail.com',
      password: '12345'
    });
    var user = Meteor.users.findOne(userId);
    test.instanceOf(user, Object);

    var subscriptionId = null;

    test.throws(function () {
      Memberships.has(userId,'foo');
    })
    test.throws(function () {
      Memberships.hasAccess(userId,'foo');
    })
    test.isTrue(Memberships.has(userId,'free'));
    test.isFalse(Memberships.has(userId,'pro'));
    test.isFalse(Memberships.has(userId,'basic'));
    test.isTrue(Memberships.hasAccess(userId,'free'));
    test.isFalse(Memberships.hasAccess(userId,'pro'));
    test.isFalse(Memberships.hasAccess(userId,'basic'));

    Memberships.subscribe(user._id, {
      plan: 'basic-p1m',
      source: {
        object: 'card',
        number: '4242424242424242',
        exp_month: '11',
        exp_year: '17',
        cvc: '123'
      }
    });
    user = Meteor.users.findOne(user._id);
    test.isTrue(Match.test(user.paymentGateways.stripe, Object));
    test.isTrue(Match.test(user.paymentGateways.stripe.customerId, String));
    test.isTrue(user.subscriptions.length == 1);
    _.each(user.subscriptions, function (sub) {
      test.isTrue(sub.group === 'default');
      test.isTrue(!!sub.id);
      test.isTrue(sub.paymentGateway === 'stripe');
      test.isTrue(sub.plan === 'basic-p1m');
      subscriptionId = sub.id
    });
    test.isFalse(Memberships.has(userId,'free'));
    test.isTrue(Memberships.has(userId,'basic'));
    test.isFalse(Memberships.has(userId,'pro'));
    test.isTrue(Memberships.hasAccess(userId,'free'));
    test.isFalse(Memberships.hasAccess(userId,'pro'));
    test.isTrue(Memberships.hasAccess(userId,'basic'));


    Memberships.update(user._id, subscriptionId, {
      plan: 'basic-p1m',
      source: {
        object: 'card',
        number: '4012888888881881',
        exp_month: '11',
        exp_year: '17',
        cvc: '123'
      }
    });
    user = Meteor.users.findOne(user._id);
    test.isTrue(Match.test(user.paymentGateways.stripe, Object));
    test.isTrue(Match.test(user.paymentGateways.stripe.customerId, String));
    test.isTrue(user.subscriptions.length == 1);
    _.each(user.subscriptions, function (sub) {
      test.isTrue(sub.group === 'default');
      test.isTrue(!!sub.id);
      test.isTrue(sub.paymentGateway === 'stripe');
      test.isTrue(sub.plan === 'basic-p1m');
      subscriptionId = sub.id
    });
    test.isFalse(Memberships.has(userId,'free'));
    test.isTrue(Memberships.has(userId,'basic'));
    test.isFalse(Memberships.has(userId,'pro'));
    test.isTrue(Memberships.hasAccess(userId,'free'));
    test.isFalse(Memberships.hasAccess(userId,'pro'));
    test.isTrue(Memberships.hasAccess(userId,'basic'));


    Memberships.update(user._id, subscriptionId, {
      source: {
        object: 'card',
        number: '4012888888881881',
        exp_month: '11',
        exp_year: '17',
        cvc: '123'
      }
    }, {group: 'default'});
    user = Meteor.users.findOne(user._id);
    test.isTrue(Match.test(user.paymentGateways.stripe, Object));
    test.isTrue(Match.test(user.paymentGateways.stripe.customerId, String));
    test.isTrue(user.subscriptions.length == 1);
    _.each(user.subscriptions, function (sub) {
      test.isTrue(sub.group === 'default');
      test.isTrue(!!sub.id);
      test.isTrue(sub.paymentGateway === 'stripe');
      test.isTrue(sub.plan === 'basic-p1m');
      subscriptionId = sub.id
    });
    test.isFalse(Memberships.has(userId,'free'));
    test.isTrue(Memberships.has(userId,'basic'));
    test.isFalse(Memberships.has(userId,'pro'));
    test.isTrue(Memberships.hasAccess(userId,'free'));
    test.isFalse(Memberships.hasAccess(userId,'pro'));
    test.isTrue(Memberships.hasAccess(userId,'basic'));


    Memberships.subscribe(user._id, {
      plan: 'pro-p1m',
    });
    user = Meteor.users.findOne(user._id);
    test.isTrue(Match.test(user.paymentGateways.stripe, Object));
    test.isTrue(Match.test(user.paymentGateways.stripe.customerId, String));
    test.isTrue(user.subscriptions.length == 1);
    _.each(user.subscriptions, function (sub) {
      test.isTrue(sub.group === 'default');
      test.isTrue(!!sub.id);
      test.isTrue(sub.paymentGateway === 'stripe');
      test.isTrue(sub.plan === 'pro-p1m');
    });
    test.isFalse(Memberships.has(userId,'free'));
    test.isTrue(Memberships.has(userId,'pro'));
    test.isFalse(Memberships.has(userId,'basic'));
    test.isTrue(Memberships.hasAccess(userId,'free'));
    test.isTrue(Memberships.hasAccess(userId,'pro'));
    test.isTrue(Memberships.hasAccess(userId,'basic'));


    Memberships.cancel(user._id, subscriptionId, {
      group: 'default'
    });
    user = Meteor.users.findOne(user._id);
    test.isTrue(Match.test(user.paymentGateways.stripe, Object));
    test.isTrue(Match.test(user.paymentGateways.stripe.customerId, String));
    test.isTrue(user.subscriptions.length == 0);


    Meteor.call('test.after');

  });
}

if (Meteor.isClient) {
  Tinytest.add('memberships - client - subscribe', (test, done) => {
    Meteor.call('test.before', () => {

      const email = 'rgnevashev+test@gmail.com';
      const password = '12345';

      Meteor.call('createUser', {
        email: email,
        password: password
      }, (err, userId) => {
        if (!err) {
          Meteor.loginWithPassword(email, password, (err) => {
            if (!err) {

              Meteor.call('test.after', () => done());

              /*
              Meteor.call('test.on', () => {
                Meteor.call('test.off', () => {
                  Meteor.call('test.after', () => done());
                });
              });
              */

            } else {
              test.exception(err)
            }
          })
        } else {
          test.exception(err)
        }
      })


    });
  });
}
