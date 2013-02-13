Stats.Model.Live = Stats.Model.Historical.extend({

  init: function(params) {
    this._super(params);
    this.last_updated = null;
  },

  getDataSinceLastUpdate: function(callback){
    var self = this;
    self.load({
      loaded: function(res){
        if(res.status === "ok"){
          var results = res.results;
          var newdata = results;
          if(self.last_updated){
            var index=0;
            for(var i=0;i<results.length;i++){
              if(results[i].ts === self.last_updated){
                index = i;
                break;
              }
            }
            newdata = results.slice(index);
          }
          callback(self._convertData(newdata));
        }
      }
    });
  }


});
