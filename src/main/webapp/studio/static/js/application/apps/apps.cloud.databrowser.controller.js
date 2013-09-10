var Apps = Apps || {};
Apps.Cloud = Apps.Cloud || {};
Apps.Cloud.Databrowser = Apps.Cloud.Databrowser || {};

Apps.Cloud.Databrowser.Controller = Apps.Cloud.Controller.extend({
  views: {
    container: "#databrowser_container"
  },
  init : function(){
    this._super();
  },
  "models":{
    userkey: new model.UserKey()
  },
  show: function () {
    this._super(this.views.container);
    if (this.guid && this.guid === $fw.data.get('inst').guid
    && this.env && this.env === $fw.data.get('cloud_environment') && this.view && this.view.browsing){
      // Show the same view if we've already got it, and we haven't switched app - then exit completely
      $(this.views.container).show();
      return this.view.onCollectionBack();
    }else if (this.view){
      // otherwise, if we have a view already -> we've switched app, nuke the old one
      this.view.remove();
    }
    // Draw from scratch
    this.guid = $fw.data.get('inst').guid;
    this.env = $fw.data.get('cloud_environment');

    $(this.views.container).find('.fh-box-inner').empty();
    $(this.views.container).show();
    //this.view = new App.View.DataBrowserCollectionsList();
    var self = this;
    async.parallel([
      function (callback){
        self.models.userkey.load(function (keys){
          callback(undefined, keys);
        });
      },
      function (callback){
        $fw.client.model.App.read(self.guid, function (result){
           callback(undefined, result);
        },
        function (err){
          callback(err);
        });
      }
    ], function (err, data){
      console.log(data);

      if(err){
        console.log("error loading data", err);
      }else{
        if(data && data[0] && data[0].list && data[0].list.length > 0){
          var userApiKey = data[0].list[0].key;
          $fw.data.set("userapikey",userApiKey);
        }
        if(data && data[1]){
          var inst = data[1].inst;
          $fw.data.set("inst",inst);
        }

        self.view = new App.View.DataBrowserController();
        self.view.render();
        $(self.views.container).find('.fh-box-inner').append(self.view.el);
      }
    });
    $fw.client.model.App.read(this.guid, function(result) {

    }, function (err){
      //not sure what to do here in backbone
      console.log("error reading app ",err);
    });
  }
});