describe('test', function () {

  beforeEach(function () {
    loadFixtures('index/apps/cloudnotifications.html','index/apps/logdetails.html');
    jasmine.Clock.useMock();
  });

  it('should test table view', function(){
    var MockEventCollection = App.Collection.CloudEvents.extend({
      sync: function(method, model, options){
        setTimeout(function(){
          options.success(getJSONFixture("cloud_notifications.json"));
        }, 100);

      }
    });
    var view = new App.View.CloudNotificationsTable({
      collection:new MockEventCollection()
    });
    spyOn(view, "render").andCallThrough();
    spyOn(view, "showDetails").andCallThrough();
    view.delegateEvents();
    view.render();
    expect(view.render.calls.length).toEqual(1);
    expect(view.$el.find('table tr').length).toBeGreaterThan(0);

    expect(view.showDetails.calls.length).toEqual(0);
    view.$el.find('table tr:eq(1)').click();
    expect(view.showDetails.calls.length).toEqual(1);
  });

  it('should test system events view', function () {
    // App = App || {};
    // App.collections = App.collections || {};
    // App.collections.event_alerts = new Backbone.Collection();

    var MockEventCollection = App.Collection.CloudEvents.extend({
      sync: function(method, model, options){
        setTimeout(function(){
          options.success(getJSONFixture("cloud_notifications.json"));
        }, 100);

      }
    });

    var view = new App.View.CloudNotifications({
      el: "#cloud_notifications_pill",
      collection: new MockEventCollection()
    });
    spyOn(view, "render").andCallThrough();
    jasmine.Clock.tick(101);
    expect(view.render.calls.length).toEqual(1);
    expect(view.$el.find('table tr').length).toBeGreaterThan(0);
  });
});