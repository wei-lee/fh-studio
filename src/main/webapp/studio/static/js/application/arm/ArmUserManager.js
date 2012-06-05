application.ArmUserManager = application.ArmManager.extend({
	type: 'users',
	url_path: 'user',
	grid_wrapper_id : 'arm_users_grid_wrapper',
	grid_id : 'arm_users_grid',
	grid_pager_id : 'arm_users_grid_pager',
	users_groups_grid : null,
	users_apps_grid: null,
	users_devices_grid: null,
	reset_pass_inited: false,
	updated_app_map : {},
	updated_group_map: {},
	updated_device_map:{},
    getGridConf: function(){
        var grid_conf = {
            pager: this.grid_pager_id,
            viewrecords: true, 
            recordtext: 'Total Users : {2}',
            emptyrecords: 'No users',
            colModel : [
              // if there is no id column the guid will not be set as the id of the row
              { 
                index: 'id',
                name: 'id',
                hidden: true
              },
              {                
                index : 'name', 
                name : 'name', 
                editable : false,
                title: false
              },
              {
                index : 'email',
                name : 'email',
                editable : false,
                title: false
              },
              {
              	index : 'groups',
              	name : 'groups',
              	editale : false,
              	title: false
              },
              {
              	index : 'apps',
              	name  : 'apps',
              	editable : false,
              	title : false
              },
              {
              	index : 'devices',
              	name : 'devices',
              	editable: false,
              	title : false
              },
              {                
                index : 'actions', 
                name : 'actions', 
                editable : false,
                sortable : false,
                fixed: true,
                width: 210,
                resizable: false,
                title: false
              }
            ],
            colNames : $fw_manager.client.lang.getLangArray('arm_users_grid_columns')
        };
        return grid_conf;
    },
    
    validateCreateForm: function(form){
          form.validate({
            rules: {
                name: 'required',
                email: {'required': true, 'email':true},
                password:'required',
                cpassword:{
                    'required': true,
                    'equalTo': '#users_add_password'
                }
            }
          });
    },
    
    getCreateData: function(){
    	return {
            userId: $('#users_add_email').val(),
            password: $('#users_add_password').val(),
            name: $('#users_add_name').val()
           }
    },
    
    createFinished: function(){
    	$fw_manager.client.dialog.info.flash("User created");
    },
    
    getReadData: function(user_id){
    	return {
    		userId: user_id
    	}
    },
    
    populateReadData: function(user_data){
    	var data = user_data.user;
    	$fw_manager.state.set('arm_users_data', 'users', data);
    	var user_id = data.userId;
    	var user_name = data.name;
    	var enabled = data.enabled;
    	$('#armusers_edit_email').val(user_id).attr('readonly', 'readonly');
    	$('#armusers_edit_name').val(user_name);
    	if(enabled || enabled == 'true'){
    		$('#armusers_edit_enabled').attr('checked', 'true');
    	} else {
    		$('#armusers_edit_enabled').removeAttr('checked');
    	}
    },
    
    validateUpdateForm: function(form){
    	form.validate({
    	  rules : {
    	  	'name': 'required'
    	  }	
    	})
    },
    
    getUpdateData: function(){
    	var user_id = $('#armusers_edit_email').val();
    	var user_name = $('#armusers_edit_name').val();
    	var enabled = false;
    	if($('#armusers_edit_enabled').is(':checked')){
    		enabled = true;
    	}
    	return {
    		userId : user_id,
    		name: user_name,
    		enabled : enabled
    	}
    },
    
    updateFinished: function(){
    	$fw_manager.client.dialog.info.flash("User updated");
    },
    
    initGroups: function(){
    	var that = this;
    	if(this.users_groups_grid == null){
    		this.users_groups_grid = proto.Grid.load($('#armusers_groups_grid'), {
    		  pager: 'armusers_groups_pager',
              viewrecords: true, 
              recordtext: 'Total groups : {2}',
              emptyrecords: 'No groups',
              multiselect: false,
              colModel:[
              {
              	index: 'id',
              	name: 'id',
              	hidden: true
              },
              {
              	index: 'groupName',
              	name: 'groupName',
              	editable: false,
              	title: false
              }, 
              {
              	index: 'groupDesc',
              	name: 'groupDesc',
              	editable: false,
              	title: false
              }, 
              {
              	index : 'actions', 
                name : 'actions', 
                editable : false,
                sortable : false,
                fixed: true,
                width: 60,
                resizable: false,
                title: false,
                align: 'center'
              }],
              colNames: $fw_manager.client.lang.getLangArray('armusers_groups_grid_columns'),
              loadComplete: function(){
              	that.markSelected(that.users_groups_grid, that.updated_group_map);
              }
    		});
    		that.initSearch('armusers_groups_search_form', function(query){
    		  	that.populateGroupsGrid(query);
    		})
    	}
    	this.populateGroupsGrid();
    },
    
    populateGroupsGrid: function(query){
    	var that = this;
    	var user_id = $fw_manager.state.get('arm_users', 'current_users');
    	var query_data = {userId: user_id, grid: true};
    	if(typeof query === "string" && query.length > 0){
    		query_data.search = query;
    	}
    	this.request('group/list', query_data, function(res){
    	  that.loadGridData(that.users_groups_grid, res);
    	  
          //that.request('user/read', {userId:user_id}, function(res){
          //    var data = res.user;
          //    $fw_manager.state.set('arm_users_data', 'users', data);
          //    that.markSelectedGroups(data);
          //})
    	})
    },
    
    updateUserGroups: function(rowid, checkbox){
    	var that = this;
    	var actions = checkbox.checked ? 'addgroups' : 'removegroups';
    	var act = checkbox.checked ? 'assigned' : 'unassigned';
    	var user_id = $fw_manager.state.get('arm_users', 'current_users');
    	var groups = $.isArray(rowid) ? rowid : [rowid];
    	for(var i=0;i<groups.length;i++){
    		this.updated_group_map[groups[i]] = checkbox.checked;
    	}
    	var data  = {userId: user_id, groups: groups};
    	that.request('user/' + actions, data, function(res){
    	 	$fw_manager.client.dialog.info.flash( ($.isArray(rowid) ? "Groups " : "Group ") + act);
    	})
    },
    
    initApps: function(){
        var that = this;
        if(this.users_apps_grid == null){
            this.users_apps_grid = this.initAppListGrid('armusers_apps_grid', 'armusers_apps_pager', 'armusers_apps_grid_columns');
            that.initSearch('armusers_apps_search_form', function(query){
              that.loadUsersAppsGrid(query);	
            })
        };
        this.loadUsersAppsGrid();
    },
    
    getListQueryData: function(){
    	var user_id = $fw_manager.state.get('arm_users', 'current_users');
    	return {userId : user_id, grid: true};
    },
    
    loadUsersAppsGrid: function(query){
    	var that = this;
        this.populateAppsGrid(this.users_apps_grid, function(){
          //var user_id = $fw_manager.state.get('arm_users', 'current_users');
          //that.request('user/read', {userId:user_id}, function(res){
          //    var data = res.user;
         //     $fw_manager.state.set('arm_users_data', 'users', data);
         //     that.markSelectedApps(data);
        //  })            
        }, query);    	
    },
    
    updateAppsAssign: function(rowid, checkbox){
        var that = this;
        var action = checkbox.checked?'addapps' : 'removeapps';
        var act = checkbox.checked?'assigned' : 'unassigned';
        var user_id = $fw_manager.state.get('arm_users', 'current_users');
        var apps = $.isArray(rowid) ? rowid : [rowid];
        for(var i=0;i<apps.length;i++){
        	this.updated_app_map[apps[i]] = checkbox.checked;
        }
        var data  = {userId: user_id, apps: apps};
        that.request('user/' + action, data, function(res){
            $fw_manager.client.dialog.info.flash(($.isArray(rowid) ? "Apps " : "App ") + act);
        })    	
    },
    
    initDevices: function(){
        var that = this;
        if(this.users_devices_grid == null){
            this.users_devices_grid = proto.Grid.load($('#armusers_devices_grid'), {
              pager: 'armusers_devices_pager',
              viewrecords: true, 
              recordtext: 'Total devices : {2}',
              emptyrecords: 'No devices',
              multiselect: false,
              colModel:[
              {
                index: 'id',
                name: 'id',
                hidden: true
              },
              {
              	index: 'device',
              	name:'device',
              	editable: false,
              	title: false 
              },
              {
                index: 'make',
                name: 'make',
                editable: false,
                title: false
              },
              {
              	index: 'model',
              	name: 'model',
              	editable: false,
              	title: false
              }, 
              {
                index: 'deviceDesc',
                name: 'desc',
                editable: false,
                title: false
              },
              {
              	index : 'actions', 
                name : 'actions', 
                editable : false,
                sortable : false,
                fixed: true,
                width: 60,
                resizable: false,
                title: false,
                align: 'center'
              }],
              colNames: $fw_manager.client.lang.getLangArray('armusers_devices_grid_columns'),
              loadComplete: function(){
              	that.markSelected(that.users_devices_grid, that.updated_device_map);
              }
            });
            that.initSearch('armusers_devices_search_form', function(query){
              that.populateDevicesGrid(query);
            })
        };
        that.populateDevicesGrid();    	
    },
    
    populateDevicesGrid: function(query){
        var that = this;
        var user_id = $fw_manager.state.get('arm_users', 'current_users');
        var query_data = {userId: user_id, grid: true};
        if(typeof query === "string" && query.length > 0){
        	query_data.search = query;
        }
        this.request('device/list', query_data, function(res){
          that.loadGridData(that.users_devices_grid, res);
          //var user_id = $fw_manager.state.get('arm_users', 'current_users');
          //that.request('user/read', {userId:user_id}, function(res){
          //    var data = res.user;
          //    $fw_manager.state.set('arm_users_data', 'users', data);
          //    that.markSelectedDevices(data);
          //})
        })          	
    },
    
    updateUserDevices: function(rowid, checkbox){
        var that = this;
        var action = checkbox.checked? 'adddevices' : 'removedevices';
        var act = checkbox.checked? 'assigned' : 'unassigned';
        var user_id = $fw_manager.state.get('arm_users', 'current_users');
        var devices = $.isArray(rowid) ? rowid : [rowid];
        for(var i=0;i<devices.length;i++){
        	this.updated_device_map[devices[i]] = checkbox.checked;
        }
        var data  = {userId: user_id, devices: devices};
        that.request('user/' + action, data, function(res){
            $fw_manager.client.dialog.info.flash( ($.isArray(rowid) ? "Devices " : "Device ") + act);
        })          	
    },
    
    resetUserPass: function(){
    	var that = this;
    	if(!this.reset_pass_inited){
    	  $('#armusers_resetpass_form').validate({
    	  	rules:{
    	  		'oldpass': 'required',
    	  		'newpass': 'required',
    	  		'cnewpass': {
    	  			'required' : true,
    	  			'equalTo': '#armusers_resetpass_new_password'
    	  		}
    	  	}
    	  });
    	  $('#armusers_resetpass_save_btn').click(function(){
    	  	if(!$('#armusers_resetpass_form').valid()){
    	  		return false;
    	  	};
    	  	var user_id = $fw_manager.state.get('arm_users', 'current_users');
    	  	var oldpass = $('#armusers_resetpass_old_password').val();
    	  	var newpass = $('#armusers_resetpass_new_password').val();
    	  	that.request('user/resetpass', {userId: user_id, oldPass: oldpass, newPass: newpass}, function(res){
    	  	  	$fw_manager.client.dialog.info.flash("User password updated");
    	  	})
    	  });
    	  this.reset_pass_inited = true;
    	} else {
    	  $('#armusers_resetpass_form').find('input').val('');
    	}
    }
})