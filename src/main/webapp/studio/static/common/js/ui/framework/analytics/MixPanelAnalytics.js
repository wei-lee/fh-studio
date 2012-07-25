
var mpq = [];
MixPanelAnalytics = AnalyticsImpl.extend({
  
  //mpq: [],
  
  mixPanelActive: false,
  
  init: function(pProps) {
    var mixPanelAnalyticsTag = pProps["mixpanel-api-key"];
    
    if( mixPanelAnalyticsTag && mixPanelAnalyticsTag.length > 0 ) {
      this.mixPanelActive = true;
      
      mpq.push(["init", mixPanelAnalyticsTag]);  
        
      // Ensure that seperate cookies are used for sub domains
      mpq.push(["set_config", {'cross_subdomain_cookie': false }]);
      
      if( pProps["mixplanel-test"] ) {
        mpq.push(["set_config", {'test': 1 }]);
      }
      
      //Set up the super properties
      var superProps = {'domain': pProps["domain"], 'account type': pProps["accountType"]};
      mpq.push(["register", superProps]);
      
      // Identify the user by their subscriber id - if there is one
      if( pProps["sub"] ) {
        mpq.push(["identify", pProps["sub"]]);
      }
      
      (function() {
        var ma = document.createElement('script'); ma.type = 'text/javascript'; ma.async = true;
        ma.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + 'api.mixpanel.com/site_media/js/api/mixpanel.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ma, s);
      })();
		
    }
  },
  
  trackEvent : function(pEventInfo) {
    if( this.mixPanelActive ) {
      log("MixPanelAnalytics.trackEvent: active=" + this.mixPanelActive + "; eventInfo=" + pEventInfo);
      var eventId = pEventInfo.id || "";
      var eventProps = pEventInfo.props || {};
      mpq.push(["track", eventId, eventProps]);
    }
  }
});