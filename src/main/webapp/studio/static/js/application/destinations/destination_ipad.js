application.DestinationIpad = application.DestinationIos.extend({
  dev_resources: null, 
  
  init: function(dest_id){
    this._super(dest_id);   
  }
});