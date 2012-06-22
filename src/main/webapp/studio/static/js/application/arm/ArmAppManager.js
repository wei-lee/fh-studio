application.ArmAppManager = application.ArmManager.extend({
    type: 'apps',
    url_path: 'app',
    grid_wrapper_id : 'arm_apps_grid_wrapper',
    grid_id : 'arm_apps_grid',
    grid_pager_id : 'arm_apps_grid_pager',
    update_apps_map: {},
    getGridConf: function(){
      var that = this;
      var grid_conf = {
        pager: this.grid_pager_id,
            viewrecords: true, 
            recordtext: 'Total Apps : {2}',
            emptyrecords: 'No apps',
            colModel : [
              // if there is no id column the guid will not be set as the id of the row
              { 
                index: 'id',
                name: 'id',
                hidden: true
              },
              {                
                index : 'title', 
                name : 'title', 
                editible : false,
                title: false
              },
              {
                index : 'description',
                name : 'description',
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
                title: false,
                align: 'center'
              }
            ],
            colNames : $fw_manager.client.lang.getLangArray('arm_apps_grid_columns'),
            loadComplete: function(){
              that.markSelected(that.list_grid, that.update_apps_map);
            }
      };
      return grid_conf;
    },
    
    toggle: function(checkbox, id){
      var enabled = false;
      if(checkbox.checked){
        enabled = true;  
      }
      this.update_apps_map[id] = enabled;
      this.request('app/update', {appId: id, enabled: enabled}, function(res){
        $fw_manager.client.dialog.info.flash("App " + (enabled?"enabled" : "disabled"));  
      });
    }
});