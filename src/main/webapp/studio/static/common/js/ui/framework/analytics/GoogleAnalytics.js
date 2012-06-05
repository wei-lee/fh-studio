// _gaq shouldn't be namespaced
var _gaq = _gaq || [];
GoogleAnalytics = AnalyticsImpl.extend({

  init: function(pProps) {
    var googleAnalyticsTag = pProps["google-analytics-id"];
    
    if( googleAnalyticsTag && googleAnalyticsTag.length > 0 ) {
			_gaq.push(['_setAccount', googleAnalyticsTag]);
			_gaq.push(['_trackPageview']);
			
			(function() {
			  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
			  ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
			  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
			})();
    }
  },
  
  trackEvent : function(pEventInfo) {
  	//Log.append("GoogleAnalytics.trackEvent::" + pEventInfo);
  }
  
});

