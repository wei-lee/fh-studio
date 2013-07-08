describe("test alerts view", function(){
  beforeEach(function(){
    loadFixtures('index/apps/swap_select_template.html','index/apps/cloudnotifications.html','index/apps/logdetails.html');
    jasmine.Clock.useMock();
    //override $fw.server.post function so that it will return mock data
    window.$fw = {
      server: {
        post: function(url, data, success, fail){
          var mockData = {
            "/box/srv/1.1/cm/eventlog/alert/list": "event_alerts.json",
            "/box/srv/1.1/cm/eventlog/alert/listOptions": "event_options.json",
            "/box/srv/1.1/app/eventlog/listEvents": "cloud_notifications.json",
            "/box/srv/1.1/cm/eventlog/alert/create": "event_alert.json",
            "/box/srv/1.1/cm/eventlog/alert/read": "event_alert.json",
            "/box/srv/1.1/cm/eventlog/alert/update": "event_alert.json",
            "/box/srv/1.1/cm/eventlog/alert/delete": "event_alert.json",
            "/box/srv/1.1/cm/eventlog/alert/testEmails" : {"status":"ok"}
          }
          setTimeout(function(){
            if(typeof mockData[url] === "string"){
              success(getJSONFixture(mockData[url]));
            } else if(typeof mockData[url] === "object"){
              success(mockData[url]);
            }
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

  it("should load alerts and events tables", function(){

    var view = new App.View.EventAlerts({
      el: "#event_alerts_container",
      collection: new App.Collection.EventAlerts(),
      alertFilter: new App.Model.AlertFilter(),
      sysEvents: new App.Collection.CloudEvents()
    });

    spyOn(view, "render").andCallThrough();
    spyOn(view, "renderNotifications").andCallThrough();
    spyOn(view, "renderFilters").andCallThrough();

    expect(view.render.calls.length).toEqual(0);
    expect(view.renderNotifications.calls.length).toEqual(0);
    expect(view.renderFilters.calls.length).toEqual(0);

    jasmine.Clock.tick(200);

    expect(view.render.calls.length).toEqual(1);
    expect(view.renderNotifications.calls.length).toEqual(1);
    expect(view.renderFilters.calls.length).toEqual(1);

    expect(view.$el.find(".event_alerts").find("table tr").length).toBeGreaterThan(1);

    spyOn(view, "showAlertDetails").andCallThrough();
    view.delegateEvents();

    expect(view.showAlertDetails.calls.length).toEqual(0);
    view.$el.find(".event_alerts").find("table td:not(.controls)").first().trigger("click");
    expect(view.showAlertDetails.calls.length).toEqual(1);

    spyOn(view, "createAlert").andCallThrough();
    view.delegateEvents();
    expect(view.createAlert.calls.length).toEqual(0);
    view.$el.find('.alert_create_btn').trigger("click");
    expect(view.createAlert.calls.length).toEqual(1);

    spyOn(view, "alertSelected").andCallThrough();
    view.delegateEvents();
    expect(view.alertSelected.calls.length).toEqual(0);
    view.$el.find("table td input").trigger("click").trigger("click");
    expect(view.alertSelected.calls.length).toEqual(2);

  });

  it("should test single alert details view", function(){

    var filters = getJSONFixture("event_options.json");
    App.collections.categoryFilters = new App.Collection.AlertFilters(filters.eventCategories);
    App.collections.eventNameFilters = new App.Collection.AlertFilters(filters.eventNames);
    App.collections.severityFilters = new App.Collection.AlertFilters(filters.eventSeverities);

    var mockEvent = new App.Model.EventAlert({
      "alertName": "",
      "eventCategories" :"",
      "eventNames":"",
      "eventSeverities" : "",
      "emails" : ""
    });

    var collection = new App.Collection.CloudEvents([]);

    var view = new App.View.Alert({model: mockEvent, collection:collection});
    spyOn(view, "render").andCallThrough();
    spyOn(view, "saveAlert").andCallThrough();
    spyOn(view, "showError").andCallThrough();
    spyOn(view, "showInfo").andCallThrough();
    spyOn(view, "testEmail").andCallThrough();
    view.delegateEvents();

    expect(view.render.calls.length).toEqual(0);
    view.render();
    expect(view.render.calls.length).toEqual(1);

    expect(view.saveAlert.calls.length).toEqual(0);
    expect(view.showError.calls.length).toEqual(0);
    view.$el.find(".save_alert_btn").trigger("click");
    expect(view.saveAlert.calls.length).toEqual(1);
    expect(view.showError.calls.length).toEqual(1);

    view.$el.find('#input_alertName').val("Test Alert");
    view.$el.find('#input_eventSeverities').val("ERROR");
    view.$el.find('#input_emails').val("test@example.com");
    view.$el.find(".save_alert_btn").trigger("click");
    jasmine.Clock.tick(100);
    expect(collection.length).toEqual(1);

    expect(view.testEmail.calls.length).toEqual(0);
    expect(view.showInfo.calls.length).toEqual(0);

    view.$el.find(".test_emails_btn").trigger("click");
    jasmine.Clock.tick(200);
    expect(view.testEmail.calls.length).toEqual(1);
    expect(view.showInfo.calls.length).toEqual(1);

    mockEvent = new App.Model.EventAlert({
      "alertName": "TestAlert",
      "eventCategories" :"",
      "eventNames":"",
      "eventSeverities" : "ERROR",
      "emails" : "test@example.com",
      "guid":"testGuid"
    });

    view = new App.View.Alert({model: mockEvent, collection:collection});
    spyOn(view, "cloneAlert").andCallThrough();
    view.delegateEvents();
    view.render();

    expect(view.cloneAlert.calls.length).toEqual(0);
    view.$el.find(".clone_alert_btn").trigger("click");
    jasmine.Clock.tick(600);
    expect(view.cloneAlert.calls.length).toEqual(1);


  });
});