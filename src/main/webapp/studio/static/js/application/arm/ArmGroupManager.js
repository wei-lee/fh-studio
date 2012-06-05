application.ArmGroupManager = application.ArmManager.extend({
    type: 'groups',
    url_path: 'group',
    grid_wrapper_id : 'arm_groups_grid_wrapper',
    grid_id : 'arm_groups_grid',
    grid_pager_id : 'arm_groups_grid_pager',
    groups_apps_grid : null,
    groups_users_grid : null,
    updated_app_map: {},
    updated_user_map: {},
    getGridConf: function(){
        var grid_conf = {
            pager: this.grid_pager_id,
            viewrecords: true, 
            recordtext: 'Total Groups : {2}',
            emptyrecords: 'No groups',
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
                index : 'description',
                name : 'description',
                editable : false,
                title: false
              },
              {
                index : 'users',
                name : 'users',
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
            colNames : $fw_manager.client.lang.getLangArray('arm_groups_grid_columns')
        };
        return grid_conf;
    },
    
    validateCreateForm: function(form){
          form.validate({
            rules: {
                gid: 'required',
                name: 'required',
                desc:'required'
            }
          });
    },
    
    getCreateData: function(){
        return {
            groupId: $('#groups_add_id').val(),
            groupName: $('#groups_add_name').val(),
            groupDesc: $('#groups_add_desc').val()
           }
    },
    
    createFinished: function(){
        $fw_manager.client.dialog.info.flash("Group created");
    },
    
    getReadData: function(group_id){
        return {
            groupId: group_id
        }
    },
    
    populateReadData: function(group_data){
        var data = group_data.group;
        $fw_manager.state.set('arm_groups_data', 'groups', data);
        var group_id = data.groupId;
        var group_name = data.groupName;
        var group_desc = data.groupDesc;
        $('#armgroups_edit_id').val(group_id).attr('readonly', 'readonly');
        $('#armgroups_edit_name').val(group_name);
        $('#armgroups_edit_desc').val(group_desc);
    },
    
    validateUpdateForm: function(form){
        form.validate({
          rules : {
            'name': 'required'
          } 
        })
    },
    
    getUpdateData: function(){
        var group_id = $('#armgroups_edit_id').val();
        var group_name = $('#armgroups_edit_name').val();
        var group_desc = $('#armgroups_edit_desc').val();
        return {
            groupId : group_id,
            groupName: group_name,
            groupDesc : group_desc
        }
    },
    
    updateFinished: function(){
        $fw_manager.client.dialog.info.flash("Group updated");
    },
    
    initApps: function(){
        var that = this;
        if(this.groups_apps_grid == null){
            this.groups_apps_grid = this.initAppListGrid('armgroups_apps_grid', 'armgroups_apps_pager', 'armgroups_apps_grid_columns');
            this.initSearch('armgroups_apps_search_form', function(query){
            	that.loadGroupsAppsGrid(query);
            });
        };
        this.loadGroupsAppsGrid();
    },

    getListQueryData: function(){
        var group_id = $fw_manager.state.get('arm_groups', 'current_groups');
        return {groupId : group_id, grid: true};
    },
    
    loadGroupsAppsGrid: function(query){
    	var that = this;
        that.populateAppsGrid(this.groups_apps_grid, function(){           
        }, query);    	
    },
    
   updateAppsAssign: function(rowid, checkbox){
        var that = this;
        var action = checkbox.checked ? "addapps" : "removeapps";
        var act = checkbox.checked ? "assigned" : "unassigned";
        var group_id = $fw_manager.state.get('arm_groups', 'current_groups');
        var apps = $.isArray(rowid) ? rowid : [rowid];
        for(var i=0;i<apps.length;i++){
            this.updated_app_map[apps[i]] = checkbox.checked;
        }
        var data  = {groupId: group_id, apps: apps};
        that.request('group/' + action, data, function(res){
            $fw_manager.client.dialog.info.flash( ($.isArray(rowid) ? "Apps " : "App ") + act);
        })      
    },
    
    initUsers: function(){
        var that = this;
        if(this.groups_users_grid == null){
            this.groups_users_grid = this.initUsersListGrid('armgroups_users_grid', 'armgroups_users_pager', 'armgroups_users_grid_columns');
            this.initSearch('armgroups_users_search_form', function(query){
              that.loadGroupsUsersGrid(query);	
            })
        }
        this.loadGroupsUsersGrid();
    },
    
    loadGroupsUsersGrid: function(query){
    	var that = this;
        this.populateUsersGrid(this.groups_users_grid, function(){
          //var group_id = $fw_manager.state.get('arm_groups', 'current_groups');
          //that.request('group/read', {groupId:group_id}, function(res){
          //    var data = res.group;
          //    $fw_manager.state.set('arm_groups_data', 'groups', data);
          //    that.markSelectedUsers(data);
          //})        
        }, query);         	
    },
    
    updateUserAssign: function(rowid, checkbox){
        var that = this;
        var action = checkbox.checked ? "addusers" : "removeusers";
        var act = checkbox.checked ? "assigned" : "unassigned";
        var rows = $.isArray(rowid) ? rowid : [rowid];
        var users = [];
        for(var i=0;i<rows.length;i++){
        	this.updated_user_map[rows[i]] = checkbox.checked;
        	users.push(rows[i].replace('_', '@'));
        }
        var group_id = $fw_manager.state.get('arm_groups', 'current_groups');
        var data  = {groupId: group_id, users: users};
        that.request('group/' + action, data, function(res){
            $fw_manager.client.dialog.info.flash( ($.isArray(rowid) ? "Users " : "User ") + act );
        })          	
    },
    
    markSelectedUsers: function(data){
      var users = data.users;
      for(var i=0;i<users.length;i++){
        var user = users[i];
        $('#armgroups_users_grid').jqGrid('setSelection', user.userId.replace('@', '_'), false);  //jqgrid won't check the checkbox if the id has "@"
      }         	
    }
})