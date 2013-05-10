describe('test', function () {
  beforeEach(function () {
    loadFixtures('index/apps/cloudnotifications.html');
  });

  it('should fail', function () {
    // App = App || {};
    // App.collections = App.collections || {};
    // App.collections.event_alerts = new Backbone.Collection();
    var view = new App.View.EventAlerts();

    expect(false).toBe(true);
  });
});