Stats.Model.Live = Stats.Model.Historical.extend({

  init: function(params) {
    this._super(params);
    this.last_updated = null;
    this.isLive = false;
    this.onReceiveData = [];
    this.pollingInterval = 5000;
    this.pollingTimer = null;
  },

  getDataSinceLastUpdate: function(){
    var self = this;
    self.load({
      loaded: function(res){
        if(res.status === "ok"){
          var results = res.results;
          var newdata = results;
          if(self.last_updated){
            //TODO: optimise me!!
            var index=0;
            for(var i=results.length - 1;i>=0; i--){
              if(results[i].ts === self.last_updated){
                index = i + 1;
                break;
              }
            }
            newdata = results.slice(index);
          }
          if(newdata.length > 0){
            self.notify(self._convertData(newdata));
          }
        }
      }
    });
  },

  addListener: function(listener){
    if(!this.isLive){
      this.beginPolling();
      this.isLive = true;
    }
    this.onReceiveData.push(listener);
  },

  removeListener: function(listener){
    var index = this.onReceiveData.indexOf(listener);
    if(index > -1){
      this.onReceiveData.splice(index, 1);
    }
    if(this.onReceiveData.length === 0){
      this.stopPolling();
    }
  },

  beginPolling: function(){
    var self = this;
    if(!this.pollingTimer){
      this.pollingTimer = setInterval(function(){
        if(self.onReceiveData.length === 0){
          //nobody is interested in the live data anymore, stop polling
          self.stopPolling();
        } else {
          self.getDataSinceLastUpdate();
        }
      }, self.pollingInterval);
    }
  },

  stopPolling: function(){
    if(this.pollingTimer){
      clearInterval(this.pollingTimer);
      this.isLive = false;
      this.onReceiveData = [];
      this.pollingTimer = null;
    }
  },

  notify: function(data){
    for(var i=0;i<this.onReceiveData.length;i++){
      if(typeof this.onReceiveData[i] === "function"){
        this.onReceiveData[i](data);
      }
    }
  },

  lastUpdated: function(){
    return this.last_updated;
  }

});
