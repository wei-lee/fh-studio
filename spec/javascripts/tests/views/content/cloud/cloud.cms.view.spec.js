describe("test CMS view", function(){
  beforeEach(function () {
    loadFixtures('../common.html','index/apps/cms.html');
    jasmine.Clock.useMock();
    //override $fw.server.post function so that it will return mock data
    window.$fw = {
      server: {
        post: function(url, data, success, fail){
          success(getJSONFixture("cms_sections.json"));
        }
      },
      userProps : {
        roles : ['cmsadmin']
      }
    };
  });

  it('should have a full populated JSTree', function () {
//    var container = $('<div></div>'),
//    view = new App.View.CMSController({ container : container });
//    view.render();
//
//
//    spyOn(view, "render").andCallThrough();
//
//    view.collection.bind('reset', function(){
//      // Now our view is loaded, make sure our collection has as many entries as we mocked
//      expect(view.collection.length).toEqual(5);
//
//      expect(view.$el.find('.jstree li').length).toEqual(5);
//    });
//
//  });
});