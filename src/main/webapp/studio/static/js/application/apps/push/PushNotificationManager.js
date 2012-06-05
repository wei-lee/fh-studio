application.PushNotificationManager = Class.extend({
  	
  	init: function(){
  		this.inited = false;
  		this.options = ['ua_push_dev_app_key', 'ua_push_dev_app_secret', 'ua_push_dev_master_secret', 'ua_push_prod_app_key', 'ua_push_prod_app_secret', 'ua_push_prod_master_secret', 'ua_push_transport', 'ua_push_c2dm_sender'];
  	},
  	
  	loadSettings: function(){
  		var inst_config = {ua_push:$fw_manager.data.get('inst').config.ua_push};
  		
  		if(inst_config.ua_push){
  			var push_config = inst_config.ua_push;
  			for(var key in push_config){
  				if(key == "ua_push_enabled"){
  				    if(push_config[key]){
  				    	$('#' + key)[0].checked = true;
  				    } else {
  				    	$('#' + key)[0].checked = false;
  				    }
  				}else {
  					$('#' + key).val(push_config[key]);
  				}
  			}
  			if(push_config.ua_push_enabled){
  				$('#push_urbanairship_settings').find('.push_settings').show();
  			} else {
  				$('#push_urbanairship_settings').find('.push_settings').hide();
  			}
  			$('#app_android_id').val(this.getPackageName());
  		}
  		var that = this;
  		if(!this.inited){
  			$('#push_urbanairship_save_button').bind('click', function(){
  				that.saveSettings();
  			});
  			$('#ua_push_enabled').bind('change', function(){
  			  if(this.checked){
  			  	$('#push_urbanairship_settings').find('.push_settings').show();
  			  	$('#app_android_id').val(that.getPackageName());
  			  }	else {
  			  	$('#push_urbanairship_settings').find('.push_settings').hide();
  			  }
  			});
  			this.inited = true;
  		}
  	},
  	
  	saveSettings: function(){
  		var ua_config = {'ua_push_enabled': $('#ua_push_enabled')[0].checked? true: false};
  		for(var i=0;i<this.options.length;i++){
  			ua_config[this.options[i]] = $('#' + this.options[i]).val();
  		}
  		var inst = $fw_manager.data.get('inst');
  		inst.config = $.extend({}, true, inst.config, {ua_push: ua_config});
  		$fw_manager.data.set('inst', inst);
  		$fw_manager.client.app.doUpdate(function(){
  		  
  		}) 
  	},
  	
  	
  	getPackageName: function(){
  		var guid = 'fh' + $fw_manager.data.get('inst').guid;
  		var packageName = "com.feedhenry." + guid.replace(/\W/g, '_');
  		return packageName;
  	}
	
})