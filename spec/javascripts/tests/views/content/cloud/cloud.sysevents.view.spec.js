describe('test system events view', function () {

  beforeEach(function () {
    loadFixtures('index/apps/swap_select_template.html','index/apps/cloudnotifications.html','index/apps/logdetails.html');
    jasmine.Clock.useMock();
    //override $fw.server.post function so that it will return mock data
    window.$fw = {
      server: {
        post: function(url, data, success, fail){
          setTimeout(function(){
            success(getJSONFixture("cloud_notifications.json"));
          },100);
        }
      },

      data: {
        get: function(){
          return "";
        }
      }
    }
  });

  it('should test table view', function(){

    var collection = new App.Collection.CloudEvents();
    var view = new App.View.CloudNotificationsTable({
      collection:collection
    });
    collection.fetch();
    jasmine.Clock.tick(200);
    spyOn(view, "render").andCallThrough();
    spyOn(view, "showDetails").andCallThrough();
    view.delegateEvents();
    view.render();
    expect(view.render.calls.length).toEqual(1);
    expect(view.$el.find('table tr').length).toBeGreaterThan(0);

    expect(view.showDetails.calls.length).toEqual(0);
    view.$el.find('table tr:eq(1)').trigger("click");
    expect(view.showDetails.calls.length).toEqual(1);
  });

  it('should test system events view', function () {
    // App = App || {};
    // App.collections = App.collections || {};
    // App.collections.event_alerts = new Backbone.Collection();

    var view = new App.View.CloudNotifications({
      el: "#cloud_notifications_pill",
      collection: new App.Collection.CloudEvents()
    });
    spyOn(view, "render").andCallThrough();
    spyOn(view, "renderFilters").andCallThrough();
    expect(view.render.calls.length).toEqual(0);
    expect(view.renderFilters.calls.length).toEqual(0);
    jasmine.Clock.tick(101);
    expect(view.render.calls.length).toEqual(1);
    expect(view.renderFilters.calls.length).toEqual(1);
    expect(view.$el.find('table tr').length).toBeGreaterThan(0);

    spyOn(view, "resetFilters").andCallThrough();
    spyOn(view, "filterEvents").andCallThrough();

    view.delegateEvents();

    expect(view.resetFilters.calls.length).toEqual(0);
    view.$el.find(".filterResetBtn").trigger("click");
    expect(view.resetFilters.calls.length).toEqual(1);

    expect(view.filterEvents.calls.length).toEqual(1);
    view.$el.find(".filterEventsBtn").trigger("click");
    expect(view.filterEvents.calls.length).toEqual(2);


  });
});