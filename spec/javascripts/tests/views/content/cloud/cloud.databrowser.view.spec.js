describe("test alert notifications view", function(){
  beforeEach(function () {
    loadFixtures('../common.html','index/apps/data_browser.html');
    jasmine.Clock.useMock();
    //override $fw.server.post function so that it will return mock data
    window.$fw = {
      server: {
        post: function(url, data, success, fail){
          console.log("POST data is");
          console.log(JSON.stringify(data));

          if (data.hasOwnProperty('guid')){
            // HOSTS call
            return success({"hosts":{"development-dyno":"testing","development-name":"testing-v60ttwgovdinr6mylanwld05-dev","development-url":"https://testing-v60ttwgovdinr6mylanwld05-dev_testing.ac.gen.ppa.feedhenry.com","live-dyno":"testing","live-name":"testing-v60ttwgovdinr6mylanwld05-live","live-url":"https://testing-v60ttwgovdinr6mylanwld05-live_testing.ac.gen.ppa.feedhenry.com"},"status":"ok"});
          }else if(data.hasOwnProperty('act') && data.act === 'list' && !data.type){
            console.log("Got collections");
            success(getJSONFixture("collectionsList.json"));
          }else{
            console.log("Got collections data")
            success(getJSONFixture("collectionsData.json"));
          }
        }
      },

      data: {
        get: function(key){
          if (key === "cloud_environment"){
            return "dev";
          }else if (key === "userapikey"){
            return "123abc";
          }else{
            return {"apiKey":"8507e90bbf163a7a0ad952b38c4f315c55453fc1","config":{"app":{"dev":{"hasowndb":"true"}},"appcloud":{"wrapper":{"dev":{"module":"fh-webapp"}}},"deploy":{"policy":{"dev":"default","live":"default"},"url":{"dev":"https://testing-f9jbrhe3kr6yc0x2ehl57rxk-dev_testing.ac.gen.ppa.feedhenry.com","live":"https://testing-ldshbjkmwc70rqext2pwflvy-live_testing.ac.live.meap.networkrail.co.uk"}},"icon":{"large":"default","small":"default"},"nodejs":{"app":{"runtime":{"dev":"node08"}}},"notification_email":"testing.dev@example.com","preview":{"device":"iphone_4"}},"description":"","domain":"testing","email":"feedhenry-testing.cadm@example.com","guid":"f9jBRhe3kr6Yc_x2Ehl57RXK","height":480,"nodejs":"true","title":"FH Test MongoDB","width":320};
          }
        }
      }
    };
  });

  it('should test alert notifications table view', function () {
    var view = new App.View.DataBrowserController();
    view.render();


    $('#databrowser_container .fh-box-inner').append(view.el);
    spyOn(view, "render").andCallThrough();

    view.bind('loaded', function(){
      // Now our view is loaded, make sure our collection has as many entries as we mocked
      expect(view.list.collection.length).toEqual(5);

      view.$el.find('ul.collectionsUl li').click();

      jasmine.Clock.tick(2000);

      expect(view.dataView.collection.length).toEqual(3);



      expect(view.dataView.$el.find('table.databrowser').length).toEqual(1);
      expect(view.dataView.$el.find('table.databrowser tbody tr').length).toEqual(3);

      view.dataView.onAddRow();
      jasmine.Clock.tick(1000);
      expect(view.dataView.$el.find('table.databrowser tbody tr').length).toEqual(4);

      var newRow = view.dataView.$el.find('tr.editing');

//      view.dataView.onRowAdvancedEdit({ target : newRow, stopPropagation : function(){} });
//
//      expect(view.dataView.$el.find('.advancededitorBar').style.display === "none").toBe(false);
//      view.dataView.$el.find('.btn-raw-editor').click();



    });
    jasmine.Clock.tick(501);
  });
});