/*
 */
AnalyticsManager = Class.extend({	
	
	impls : new Array(),	
	
	initAnalytics: function(pProps) {
	  if( pProps["mixpanel-enabled"] ) {      
      mixPanelAnalytics = new MixPanelAnalytics(pProps);
	  	this.impls.push(mixPanelAnalytics);
	  }

    if( pProps["google-analytics-enabled"] ) {
      googleAnalytics = new GoogleAnalytics(pProps);
      this.impls.push(googleAnalytics);
    }
	},
		
	trackEvent: function(pEventInfo) {
		Log.append("START - AnalyticsManager.trackEvent::" + JSON.stringify(pEventInfo));
		for( var i = 0; i < this.impls.length; i++ ) {
			var impl = this.impls[i];
			impl.trackEvent(pEventInfo);
		}	
		Log.append("END - AnalyticsManager.trackEvent::" + JSON.stringify(pEventInfo));
	},
	
	getAnalyticsImpls: function() {
		return this.impls;
	}
	
});
