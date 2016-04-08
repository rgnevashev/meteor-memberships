Tinytest.add('memberships - PaymentGateways - Stripe', function (test) {

  options = {secretKey: "sk_test_21akDbAqWvh9nb5U49dIdIbQ"}

  Memberships.registerPaymentGateway('stripe', options)
  gateway = Memberships.paymentGateway('stripe')
  test.isTrue(!!gateway)

});
