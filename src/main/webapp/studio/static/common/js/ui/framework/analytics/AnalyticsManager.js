/*
 */
AnalyticsManager = Class.extend({	
	
	impls : [],	
	
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
		console.log("START - AnalyticsManager.trackEvent::" + JSON.stringify(pEventInfo));
		for( var i = 0; i < this.impls.length; i++ ) {
			var impl = this.impls[i];
			impl.trackEvent(pEventInfo);
		}
		console.log("END - AnalyticsManager.trackEvent::" + JSON.stringify(pEventInfo));
	},
	
	getAnalyticsImpls: function() {
		return this.impls;
	}
	
});
