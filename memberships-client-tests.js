/*
Tinytest.addAsync('memberships - MembershipsClient', (test, done) => {

  const email = 'rgnevashev+test@gmail.com';
  const password = '12345';

  Meteor.call('test.before', () => {
    Meteor.call('createUser', {
      email: email,
      password: password
    }, (err, userId) => {
      if (!err) {
        Meteor.loginWithPassword(email, password, (err) => {
          if (!err) {

            test.throws(function () {
              Memberships.has('foo');
            })
            test.throws(function () {
              Memberships.hasAny('foo');
            })
            test.throws(function () {
              Memberships.hasAccess('foo');
            })

            test.isTrue(Memberships.has('free'));
            test.isFalse(Memberships.has('pro'));
            test.isFalse(Memberships.has('basic'));

            test.isTrue(Memberships.hasAny('free'));
            test.isFalse(Memberships.hasAny('basic'));
            test.isFalse(Memberships.hasAny('pro'));

            test.isTrue(Memberships.hasAny('free,basic'));
            test.isTrue(Memberships.hasAny('basic,free'));
            test.isTrue(Memberships.hasAny(['free','basic']));
            test.isTrue(Memberships.hasAny(['basic','free']));
            test.isTrue(Memberships.hasAny('free,pro'));
            test.isTrue(Memberships.hasAny('pro,free'));
            test.isTrue(Memberships.hasAny(['free','pro']));
            test.isTrue(Memberships.hasAny(['pro','free']));
            test.isFalse(Memberships.hasAny('pro,basic'));
            test.isFalse(Memberships.hasAny('basic,pro'));
            test.isFalse(Memberships.hasAny(['pro','basic']));
            test.isFalse(Memberships.hasAny(['basic','pro']));
            test.isTrue(Memberships.hasAny('free,basic,pro'));
            test.isTrue(Memberships.hasAny('basic,free,pro'));
            test.isTrue(Memberships.hasAny(['free','basic','pro']));
            test.isTrue(Memberships.hasAny(['pro','basic','free']));

            test.isTrue(Memberships.hasAccess('free'));
            test.isFalse(Memberships.hasAccess('pro'));
            test.isFalse(Memberships.hasAccess('basic'));

            // subscribe on test plan
            Memberships.subscribe({
              plan: 'test',
              source: {
                object: 'card',
                number: '4242424242424242',
                exp_month: '11',
                exp_year: '17',
                cvc: '123'
              }
            }, (err, subscriptionId) => {
                if (err) {
                  test.exception(err)
                }
                test.isTrue(Match.test(subscriptionId, String));
                test.isTrue(!!subscriptionId);

                test.isFalse(Memberships.has('free'));
                test.isTrue(Memberships.has('pro'));
                test.isFalse(Memberships.has('basic'));

                test.isFalse(Memberships.hasAny('free'));
                test.isFalse(Memberships.hasAny('basic'));
                test.isTrue(Memberships.hasAny('pro'));

                test.isFalse(Memberships.hasAny('free,basic'));
                test.isFalse(Memberships.hasAny('basic,free'));
                test.isFalse(Memberships.hasAny(['free','basic']));
                test.isFalse(Memberships.hasAny(['basic','free']));
                test.isTrue(Memberships.hasAny('free,pro'));
                test.isTrue(Memberships.hasAny('pro,free'));
                test.isTrue(Memberships.hasAny(['free','pro']));
                test.isTrue(Memberships.hasAny(['pro','free']));
                test.isTrue(Memberships.hasAny('pro,basic'));
                test.isTrue(Memberships.hasAny('basic,pro'));
                test.isTrue(Memberships.hasAny(['pro','basic']));
                test.isTrue(Memberships.hasAny(['basic','pro']));
                test.isTrue(Memberships.hasAny('free,basic,pro'));
                test.isTrue(Memberships.hasAny('basic,free,pro'));
                test.isTrue(Memberships.hasAny(['free','basic','pro']));
                test.isTrue(Memberships.hasAny(['pro','basic','free']));

                test.isTrue(Memberships.hasAccess('free'));
                test.isTrue(Memberships.hasAccess('pro'));
                test.isTrue(Memberships.hasAccess('basic'));

                Memberships.subscribe({plan: 'test2'}, (err, subscriptionId) => {
                  if (err) {
                    test.exception(err)
                  }
                  test.isTrue(Match.test(subscriptionId, String));
                  test.isTrue(!!subscriptionId);

                  test.isFalse(Memberships.has('free'));
                  test.isTrue(Memberships.has('pro'));
                  test.isFalse(Memberships.has('basic'));

                  test.isTrue(Memberships.hasAccess('free'));
                  test.isTrue(Memberships.hasAccess('pro'));
                  test.isTrue(Memberships.hasAccess('basic'));

                  Meteor.call('test.after', () => done());
                })
            });
          } else {
            test.exception(err)
          }
        })
      } else {
        test.exception(err)
      }
    })
  })

})
*/
