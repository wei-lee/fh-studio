application.DestinationFeedhenry = application.DestinationGeneral.extend({
    
    init: function(dest_id){
        this._super(dest_id);
    },
    
    'export': function(){
        console.log("Feedhenry :: Export");
        var url = Constants.EXPORT_APP_URL + "?guid=" + $fw.data.get("app").guid;
        $fw.app.startDownload(url);
    },
    
    'publish': function(){
        //not supported yet
    }
});