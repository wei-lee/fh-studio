application.ArmManager = Class.extend({
   type: 'none',
   url_path: 'none',
   arm_nav_ul_id: "list_arm_buttons",
   arm_nav_li_prefix: "list_arm_button_",
   list_grid: null,
   add_btn_inited: false,
   update_btn_inited: false,
   
   initGrid: function(){
   	if(this.list_grid == null){
   		this.list_grid = proto.Grid.load($('#' + this.grid_id), this.getGridConf());
   		this.initTools();
   	} 
   	this.doGridList();
   },
   
   initTools: function(){
   	var that = this;
   	this.initSearch('arm_'+this.type+'_search_form', function(query){
   	 that.doGridList(query);
   	})
   },
   
   doGridList: function(query){
   	var that = this;
   	var data = {grid: true};
   	if(typeof query != "undefined" && typeof query === "string" && query.length > 0 ){
   		data.search = query;
   	}
   	this.request(this.url_path + '/list', data, function(res){
   		that.loadGridData(that.list_grid,res);
   	})
   },
   
   loadGridData: function(grid, data){
   	grid.jqGrid('clearGridData');
   	var entries = $.isArray(data) ? data : data.list;
    for (var di=0; di<entries.length; di++) {
      var entry = entries[di];
      grid.jqGrid('addRowData', entry.id, entry);
    }
    grid.trigger('reloadGrid');
    proto.Grid.resizeVisible();
   },
   
    manage: function(id, name){
        $fw_manager.state.set('arm_' + this.type, 'current_' + this.type, id);
        $fw_manager.state.set('arm_' + this.type + '_name', 'current_' + this.type + '_name', name);
        $fw_manager.client.tab.arm.showLayout("arm" + this.type);
    },
   
    initAdd: function(){
        var that = this;
        var form = $('#' + this.type + '_add_form');
        if(!this.add_btn_inited){
          this.validateCreateForm(form);
          $('#' + this.type +'_add_save_btn').bind("click", function(){
           if(!form.valid()){
            return false;
           }
           var user_data = that.getCreateData();
           that.request(that.url_path + '/create', user_data, that.createFinished);
        })
        that.add_btn_inited = true;
     } else {
     	form.find('input').val('');
     }
    },
    
    initEdit: function(){
    	var that = this;
    	var form = $('#arm' + this.type + '_edit_form' );
    	var data_id = $fw_manager.state.get('arm_' + this.type , 'current_' + this.type);
    	var read_data = this.getReadData(data_id);
    	this.request(that.url_path + '/read', read_data, function(res){
    	  that.populateReadData(res);
          if(!that.update_btn_inited){
          	that.validateUpdateForm(form);
            $('#arm' + that.type + '_edit_save_btn').bind('click', function(){
              if(!form.valid()){
              	return false;
              }
              var update_data = that.getUpdateData();
              that.request(that.url_path + '/update', update_data, that.updateFinished);
            });
            that.update_btn_inited = true;
          }
    	})
    	
    },
    
    initAppListGrid: function(grid_id, pager_id, column_names){
    	  var that = this;
          var grid = proto.Grid.load($('#' + grid_id), {
              pager: pager_id,
              viewrecords: true, 
              recordtext: 'Total apps : {2}',
              emptyrecords: 'No apps',
              multiselect: false,
              colModel:[
              {
                index: 'id',
                name: 'id',
                hidden: true
              },
              {
                index: 'name',
                name: 'name',
                editable: false,
                title: false
              }, 
              {
                index: 'desc',
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
              }
              ],
              colNames: $fw_manager.client.lang.getLangArray(column_names),
              loadComplete: function(){
              	that.markSelected(grid, that.updated_app_map);
              }
            });
          return grid;
    },
    
    populateAppsGrid: function(grid, callback, query){
       var that = this;
       var query_data = this.getListQueryData();
       if(typeof query === "string" && query.length > 0){
       	query_data.search = query;
       }
        this.request('app/list', query_data, function(res){
          that.loadGridData(grid, res);
          callback();
        })          	
    },
    
   markSelected: function(grid, update_map){
        for(var rowId in update_map){
          var content = grid.jqGrid('getCell', rowId, "actions");
          if(typeof content === "string"){
            if(update_map[rowId]){
                if(content.indexOf("checked") == -1){
                    content = content.replace(">", "checked>");
                }
            } else {
                if(content.indexOf("checked") != -1){
                    content = content.replace("checked", "");
                }
            }
            grid.jqGrid('setCell', rowId, "actions", content);
          }
        }
        
    }, 
    
    getListQueryData: function(){
    	return {};
    },
    
    initUsersListGrid: function(grid_id, pager_id, columns_names){
    	var that = this;
        var grid = proto.Grid.load($('#' + grid_id), {
              pager: pager_id,
              viewrecords: true, 
              recordtext: 'Total users : {2}',
              emptyrecords: 'No users',
              multiselect: false,
              colModel:[
              {
                index: 'id',
                name: 'id',
                hidden: true
              },
              {
                index: 'userId',
                name: 'userId',
                editable: false,
                title: false
              },
              {
                index: 'name',
                name: 'name',
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
              }
              ],
              colNames: $fw_manager.client.lang.getLangArray(columns_names),
              loadComplete: function(){
              	that.markSelected(grid, that.updated_user_map);
              }
            });
            return grid;    	
    },
    
    populateUsersGrid: function(grid, callback, query){
    	var that = this;
    	var query_data = this.getListQueryData();
    	if(typeof query === "string" && query.length > 0){
    		query_data.search = query;
    	}
        this.request('user/list', query_data, function(res){
          that.loadGridData(grid, res);
          callback();
        })      	
    },
    
    'delete': function(id, type){
    	var that = this;
    	var icon_html = "<span class=\"ui-icon ui-icon-alert content_icon\"></span>";
    	$fw_manager.client.dialog.showConfirmDialog($fw_manager.client.lang.getLangString('caution'), icon_html + $fw_manager.client.lang.getLangString('delete_arm_confirm_text').replace('<TYPE>', type).replace('<ID>', $.trim(id)), function(){
    		that.request(that.url_path + '/delete', that.getReadData(id), function(res){
    			that.list_grid.jqGrid('delRowData', id);
    		})
    	});
    },
    
    request: function(action, data, callback){
    	var url = Constants.ARM_URL_PREFIX + action;
    	$fw_manager.server.post(url, data, function(res){
    	  if(res.status == 'ok'){
    	  	callback(res);
    	  } else {
    	  	$fw_manager.client.dialog.error(res.message);
    	  }
    	})
    },
    
    initSearch: function(search_field_id, callback){
      var search_field = $('#' + search_field_id);
      if(search_field){
        var search_input = search_field.find('input');
        var search_fn = function(){
            var query = search_input.val();
            if(query != search_input.attr('placeholder')){
                callback(query);
            }
        }
        search_input.bind('keyup', function(e){
          if(e.keyCode == 13){
            e.preventDefault();
            search_fn();
            return false;
          } 
        });
        search_field.find('span').bind('click', search_fn);
        search_input.placeholder({className: 'placeholder'});
      }    	
    }
})