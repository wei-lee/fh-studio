describe("test alert notifications view", function(){
  beforeEach(function () {
    loadFixtures('index/apps/swap_select_template.html', 'index/apps/cloudnotifications.html','index/apps/logdetails.html');
    jasmine.Clock.useMock();
    //override $fw.server.post function so that it will return mock data
    window.$fw = {
      server: {
        post: function(url, data, success, fail){
          setTimeout(function(){
            success(getJSONFixture("event_audits.json"));
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

  it('should test alert notifications table view', function () {
    var view = new App.View.EventAlertNotifications({
      el: "#alerts_notifications_container",
      collection: new App.Collection.AlertNotifications()
    });
    spyOn(view, "render").andCallThrough();
    spyOn(view, "showDetails").andCallThrough();
    view.delegateEvents();
    expect(view.render.calls.length).toEqual(0);

    jasmine.Clock.tick(101);
    expect(view.render.calls.length).toEqual(1);
    expect(view.$el.find('table tr').length).toBeGreaterThan(0);

    expect(view.showDetails.calls.length).toEqual(0);
    view.$el.find('table tr:eq(1)').trigger("click");
    expect(view.showDetails.calls.length).toEqual(1);
  });

  it("should test single alert notification view", function(){
     var alertNofication = new App.Model.AlertNotification({
       "alertName": "Test",
       "body": "Hi,\n\nThe following alert has been received by our monitoring systems. You are listed as a recipient for alerts of this type:\n<p>\n<u><b>Application Details:<\/b><\/u><br/>\n\nApplication Name: <b> App3 <\/b><br/>\nUnique Application Id: <b> YXNfpkMh1vI1astjJJjHjYrQ <\/b><br/>\nApplication URL: <a href=\"http://testing-yxnfpkmh1vi1astjjjjhjyrq-dev_testing.feedhenry.me:9080\"> http://testing-yxnfpkmh1vi1astjjjjhjyrq-dev_testing.feedhenry.me:9080 <\/a><br/>\n<\/p>\n\n<p>\n<u><b>Alert Details:<\/b><\/u><br/>\nAlert Name: <b> Test <\/b><br/>\nAlert Date/Time: <b> 2013-05-08 11:44:00:164 <\/b><br/>\nAlert Message: <b> app crashed <\/b><br/>\nAlert Category: <b> APP_STATE <\/b><br/>\nAlert Event: <b> CRASHED <\/b><br/>\nAlert Severity: <b> ERROR <\/b><br/>\nAlert Details:<br/>\n<pre>\n- message : app crashed<br/>- error : This is a uncaught exception!!<br/>- stackTrace : Error: This is a uncaught exception!!\n    at Object.getException (/home/fh/apps/testing-yxnfpkmh1vi1astjjjjhjyrq-dev/src/cloud/main.js:18:9)\n    at /home/fh/apps/testing-yxnfpkmh1vi1astjjjjhjyrq-dev/src/cloud/node_modules/fh-nodeapp-test/lib/hostapp.js:159:21\n    at processAuth (/home/fh/apps/testing-yxnfpkmh1vi1astjjjjhjyrq-dev/src/cloud/node_modules/fh-nodeapp-test/lib/authenticate.js:42:9)\n    at Object.authenticate (/home/fh/apps/testing-yxnfpkmh1vi1astjjjjhjyrq-dev/src/cloud/node_modules/fh-nodeapp-test/lib/authenticate.js:85:9)\n    at /home/fh/apps/testing-yxnfpkmh1vi1astjjjjhjyrq-dev/src/cloud/node_modules/fh-nodeapp-test/lib/hostapp.js:151:36\n    at Object.<anonymous> (/home/fh/apps/testing-yxnfpkmh1vi1astjjjjhjyrq-dev/src/cloud/node_modules/fh-nodeapp-test/lib/hostapp.js:106:14)\n    at nextMiddleware (/home/fh/apps/testing-yxnfpkmh1vi1astjjjjhjyrq-dev/src/cloud/node_modules/fh-nodeapp-test/node_modules/fh-connect/lib/middleware/router.js:175:25)\n    at param (/home/fh/apps/testing-yxnfpkmh1vi1astjjjjhjyrq-dev/src/cloud/node_modules/fh-nodeapp-test/node_modules/fh-connect/lib/middleware/router.js:183:16)\n    at param (/home/fh/apps/testing-yxnfpkmh1vi1astjjjjhjyrq-dev/src/cloud/node_modules/fh-nodeapp-test/node_modules/fh-connect/lib/middleware/router.js:186:15)\n    at pass (/home/fh/apps/testing-yxnfpkmh1vi1astjjjjhjyrq-dev/src/cloud/node_modules/fh-nodeapp-test/node_modules/fh-connect/lib/middleware/router.js:191:10)<br/>\n<\/pre>\n<\/p>\n\n<p>\nRegards,<br/>\nFeedHenry Testing\n<\/p>\n",
       "env": "dev",
       "guid": "ZQqGY_cp2cgYReaVEGzQgfvK",
       "recipients": "wei.li@feedhenry.com",
       "subject": "FeedHenry Testing Alert: Test - App3 (YXNfpkMh1vI1astjJJjHjYrQ)",
       "sysCreated": "2013-05-09 17:16:45",
       "sysModified": "2013-05-09 17:16:45",
       "uid": "YXNfpkMh1vI1astjJJjHjYrQ"
     });

     var view = new App.View.AlertNotification({model: alertNofication});
     spyOn(view, "render").andCallThrough();
     view.delegateEvents();
     expect(view.render.calls.length).toEqual(0);
     view.render();
     expect(view.render.calls.length).toEqual(1);
     expect(view.$el.find(".uneditable-input").length).toBeGreaterThan(1);
  });
});