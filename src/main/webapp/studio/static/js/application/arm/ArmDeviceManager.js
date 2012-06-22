application.ArmDeviceManager = application.ArmManager.extend({
    type: 'devices',
    url_path: 'device',
    grid_wrapper_id : 'arm_devices_grid_wrapper',
    grid_id : 'arm_devices_grid',
    grid_pager_id : 'arm_devices_grid_pager',
    devices_users_grid: null,
    devices_approve_grid: null,
    updated_user_map: {},
    getGridConf: function(){
        var grid_conf = {
            pager: this.grid_pager_id,
            viewrecords: true, 
            recordtext: 'Total Devices : {2}',
            emptyrecords: 'No devices',
            colModel : [
              // if there is no id column the guid will not be set as the id of the row
              {
                index: 'id',
                name: 'id',
                hidden: true
              },
              {
                index: 'deviceId',
                name: 'deviceId',
                editable: false,
                title: false
              },
              {
                index: 'description',
                name: 'description',
                editable: false,
                title: false
              },
              {                
                index : 'make', 
                name : 'make', 
                editable : false,
                title: false
              },
              {
                index : 'model',
                name : 'model',
                editable : false,
                title: false
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
            colNames : $fw_manager.client.lang.getLangArray('arm_devices_grid_columns')
        };
        return grid_conf;
    },
    
    validateCreateForm: function(form){
          form.validate({
            rules: {
                did: 'required'
            }
          });
    },
    
    getCreateData: function(){
        return {
            device: $('#devices_add_id').val(),
            deviceDesc: $('#devices_add_desc').val(),
            make: $('#devices_add_make').val(),
            model : $('#devices_add_model').val()
           };
    },
    
    createFinished: function(){
        $fw_manager.client.dialog.info.flash("Device created");
    },
    
    getReadData: function(device_id){
        return {
            device: device_id
        };
    },
    
    populateReadData: function(device_data){
        var data = device_data.device;
        $fw_manager.state.set('arm_devices_data', 'devices', data);
        var device_id = data.device;
        var device_desc = data.deviceDesc;
        var device_make = data.make;
        var device_model = data.model;
        var enabled = data.enabled;
        var blocked = data.blocked;
        $('#armdevices_edit_id').val(device_id).attr('readonly', 'readonly');
        $('#armdevices_edit_desc').val(device_desc);
        $('#armdevices_edit_make').val(device_make);
        $('#armdevices_edit_model').val(device_model);
        if(enabled){
          $('#armdevices_edit_enabled').attr('checked', 'checked');
        } else {
          $('#armdevices_edit_enabled').removeAttr('checked');
        }
        if(blocked){
          $('#armdevices_edit_blocked').attr('checked', 'checked');
        } else {
          $('#armdevices_edit_blocked').removeAttr('checked');
        }
    },
    
    validateUpdateForm: function(form){
        form.validate({
          rules : {
          } 
        });
    },
    
    getUpdateData: function(){
        var device_id = $('#armdevices_edit_id').val();
        var device_desc = $('#armdevices_edit_desc').val();
        var device_make = $('#armdevices_edit_make').val();
        var device_model =$('#armdevices_edit_model').val();
        var enabled = $('#armdevices_edit_enabled').is(':checked');
        var blocked = $('#armdevices_edit_blocked').is(':checked');
        return {
            device : device_id,
            deviceDesc: device_desc,
            make : device_make,
            model: device_model,
            enabled: enabled,
            blocked : blocked
        };
    },
    
    updateFinished: function(){
        $fw_manager.client.dialog.info.flash("Device updated");
    },
    
    initUsers: function(){
        var that = this;
        if(this.devices_users_grid == null){
            this.devices_users_grid = this.initUsersListGrid('armdevices_users_grid', 'armdevices_users_pager', 'armdevices_users_grid_columns');
            this.initSearch('armdevices_users_search_form', function(query){
              that.loadDevicesUsersGrid(query);
            });
        }
        this.loadDevicesUsersGrid();
    },
    
    getListQueryData: function(){
        var device_id = $fw_manager.state.get('arm_devices', 'current_devices');
        return {deviceId : device_id, grid: true};
    },
    
    loadDevicesUsersGrid: function(query){
      var that = this;
        this.populateUsersGrid(this.devices_users_grid, function(){
          //var device_id = $fw_manager.state.get('arm_devices', 'current_devices');
          //that.request('device/read', {device:device_id}, function(res){
          //    var data = res.device;
          //    $fw_manager.state.set('arm_devices_data', 'devices', data);
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
        var device_id = $fw_manager.state.get('arm_devices', 'current_devices');
        var data  = {device: device_id, owner: users};
        that.request('device/' + action, data, function(res){
            $fw_manager.client.dialog.info.flash( ($.isArray(rowid) ? "Users " : "User ") + act );
        });              
    },
    
    initApproveGrid: function(){
      var that = this;
      if(null == this.devices_approve_grid){
        this.devices_approve_grid = proto.Grid.load($('#arm_devices_approve_grid'), {
            pager: 'arm_devices_approve_grid_pager',
                viewrecords: true, 
                recordtext: 'Total Requests : {2}',
                emptyrecords: 'No requests',
                colModel: [
                  {
                    index: 'id',
                    name : 'id',
                    hidden: true
                  },
                  {
                    index: 'userId',
                    name : 'userId',
                    editable: false,
                    title : false
                  },
                  {
                    index: 'deviceId',
                    name: 'deviceId',
                    editable: false,
                    title: false
                  },
                  {
                    index: 'attemptedDate',
                    name: 'attemptedDate',
                    editable: false,
                    title: false
                  },
                  {
                    index: 'attempts',
                    name: 'attempts',
                    editable: false,
                    title: false
                  },
                  {
                    index: 'actions',
                    name: 'actions',
                    editable: false,
                    title: false
                  }
                ],
                colNames : $fw_manager.client.lang.getLangArray('arm_devices_approve_grid_columns')
        });
        this.initSearch('arm_devicesapprove_search_form', function(query){
            that.loadApproveGrid(query);
        });
      }
       this.loadApproveGrid();
    },
    
    loadApproveGrid: function(query){
      var that = this;
      var query_data = {grid: true};
      if(typeof query === "string" && query.length > 0){
        query_data.search = query;
      }
      this.request(this.url_path + "/listApprovals", query_data, function(res){
          that.loadGridData(that.devices_approve_grid, res);
      });
    },
    
    deviceOps: function(act, id){
      var that = this;
      this.request(this.url_path + "/manageApprovals", {approvalId: id, action: act}, function(res){
        that.devices_approve_grid.jqGrid('delRowData', id);
      });
    },
    
    approveDevice: function(id){
      this.deviceOps('approve', id);
    },
    
    blockDevice: function(id){
      this.deviceOps('block', id);
    },
    
    ignoreDevice: function(id){
      this.deviceOps('ignore', id);
    }
    
   
});