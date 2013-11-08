describe("test CMS view", function(){
  beforeEach(function () {
    loadFixtures('../common.html','index/apps/cms.html');
    jasmine.Clock.useMock();
    //override $fw.server.post function so that it will return mock data
    window.$fw = {
      client : {
        tab : {
          apps : {
            manageapps : {
              getController : function(){
                return {
                  show : function(){}
                };
              }
            }
          }
        }
      },
      server: {
        post: function(url, data, success, fail){
          console.log("POST data is");
          console.log(JSON.stringify(data));

          if (data.hasOwnProperty('guid')){
            // HOSTS call
            return success({"hosts":{"development-dyno":"testing","development-name":"testing-v60ttwgovdinr6mylanwld05-dev","development-url":"https://testing-v60ttwgovdinr6mylanwld05-dev_testing.ac.gen.ppa.feedhenry.com","live-dyno":"testing","live-name":"testing-v60ttwgovdinr6mylanwld05-live","live-url":"https://testing-v60ttwgovdinr6mylanwld05-live_testing.ac.gen.ppa.feedhenry.com"},"status":"ok"});
          }else{
            console.log("Get CMS Data")
            success(getJSONFixture("cms_sections.json"));
          }
        },
        get : function(url, body, success, fail){
          success(getJSONFixture("cms_sections.json"));
        }
      },
      userProps : {
        roles : ['cmsadmin']
      },
      data: {
        get: function(key){
          if (key === "cloud_environment"){
            return "dev";
          }else if (key === "userapikey"){
            return "123abc";
          }else{
            return {"apiKey":"8507e90bbf163a7a0ad952b38c4f315c55453fc1","config":{"app":{ "cms" : { "enabled": true }, "dev":{"hasowndb":"true"}},"appcloud":{"wrapper":{"dev":{"module":"fh-webapp"}}},"deploy":{"policy":{"dev":"default","live":"default"},"url":{"dev":"https://testing-f9jbrhe3kr6yc0x2ehl57rxk-dev_testing.ac.gen.ppa.feedhenry.com","live":"https://testing-ldshbjkmwc70rqext2pwflvy-live_testing.ac.live.meap.networkrail.co.uk"}},"icon":{"large":"default","small":"default"},"nodejs":{"app":{"runtime":{"dev":"node08"}}},"notification_email":"testing.dev@example.com","preview":{"device":"iphone_4"}},"description":"","domain":"testing","email":"feedhenry-testing.cadm@example.com","guid":"f9jBRhe3kr6Yc_x2Ehl57RXK","height":480,"nodejs":"true","title":"FH Test MongoDB","width":320};
          }
        }
      }
    };
  });

  it('should have a full populated JSTree', function () {
    var container = $('<div></div>'),
    view = new App.View.CMSController({ container : container });
    view.render();

    jasmine.log(view);
    jasmine.log(view.collection.length);
    spyOn(view, "render").andCallThrough();

    view.collection.bind('reset', function(){
      // Now our view is loaded, make sure our collection has as many entries as we mocked
      expect(view.collection.length).toEqual(5);

      expect(view.$el.find('.jstree li').length).toEqual(5);
    });

  });
});