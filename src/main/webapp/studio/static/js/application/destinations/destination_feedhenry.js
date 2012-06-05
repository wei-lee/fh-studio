application.DestinationFeedhenry = application.DestinationGeneral.extend({
    
    init: function(dest_id){
        this._super(dest_id);
    },
    
    'export': function(){
        Log.append("Feedhenry :: Export");
        var url = Constants.EXPORT_APP_URL + "?guid=" + $fw_manager.data.get("app").guid;
        $fw_manager.app.startDownload(url);
    },
    
    'publish': function(){
        //not supported yet
    }
})