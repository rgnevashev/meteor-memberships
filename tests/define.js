Tinytest.add('memberships - server - define', function (test) {

  Memberships.clear()
  test.isTrue(Memberships.Roles.find().count() === 0)

  Memberships.define('free',
    {
      default: true
    }
  , 'default');
  test.isTrue(Memberships.Roles.find().count() === 1)
  role = Memberships.Roles.findOne({group: 'default', role: 'free'})
  test.isTrue(!!role)
  test.isTrue(role.default === true)
  test.isTrue(role.plans.length === 0)
  test.isTrue(role.inherit.length === 0)
  test.isTrue(_.isEmpty(role.permissions))
  Memberships.define('free',
    {
      default: true
    }
  );
  test.isTrue(Memberships.Roles.find().count() === 1)
  role = Memberships.Roles.findOne({group: 'default', role: 'free'})
  test.isTrue(!!role)
  test.isTrue(role.default === true)
  test.isTrue(role.plans.length === 0)
  test.isTrue(role.inherit.length === 0)
  test.isTrue(_.isEmpty(role.permissions))

  Memberships.define('basic', {
    plans:
    [
      {
        id: 'basic'
      }
    ],
    inherit: ['free']
  })
  role = Memberships.Roles.findOne({group: 'default', role: 'basic'})
  test.isTrue(!!role)
  test.isTrue(role.default === false)
  test.isTrue(role.plans.length === 1)
  test.isTrue(role.plans[0].id === 'basic')
  test.isTrue(role.inherit.length === 1)
  test.isTrue(role.inherit[0] === 'free')
  test.isTrue(_.isEmpty(role.permissions))


  Memberships.define('advanced', {
    plans:
    [
      {
        id: 'advanced'
      }
    ],
    inherit: ['free','basic']
  })
  role = Memberships.Roles.findOne({group: 'default', role: 'advanced'})
  test.isTrue(!!role)
  test.isTrue(role.default === false)
  test.isTrue(role.plans.length === 1)
  test.isTrue(role.plans[0].id === 'advanced')
  test.isTrue(role.inherit.length === 2)
  test.isTrue(role.inherit[0] === 'free')
  test.isTrue(role.inherit[1] === 'basic')
  test.isTrue(_.isEmpty(role.permissions))


  Memberships.define('pro', {
    plans:
    [
      {
        id: 'pro-weekly'
      },
      {
        id: 'pro-monthly'
      },
      {
        id: 'pro-yearly'
      }
    ],
    inherit: ['free','basic','advanced']
  })
  role = Memberships.Roles.findOne({group: 'default', role: 'pro'})
  test.isTrue(!!role)
  test.isTrue(role.default === false)
  test.isTrue(role.plans.length === 3)
  test.isTrue(role.plans[0].id === 'pro-weekly')
  test.isTrue(role.plans[1].id === 'pro-monthly')
  test.isTrue(role.plans[2].id === 'pro-yearly')
  test.isTrue(role.inherit.length === 3)
  test.isTrue(role.inherit[0] === 'free')
  test.isTrue(role.inherit[1] === 'basic')
  test.isTrue(role.inherit[2] === 'advanced')
  test.isTrue(_.isEmpty(role.permissions))

  Memberships.clear()
  test.isTrue(Memberships.Roles.find().count() === 0)

});
