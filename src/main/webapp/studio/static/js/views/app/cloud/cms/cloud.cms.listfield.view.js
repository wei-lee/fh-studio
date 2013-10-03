var App = App || {};
App.View = App.View || {};

App.View.CMSListField = App.View.CMSSection.extend({
  events : {
    'click .btn-listfield-save' : 'onListFieldSave',
    'click .btn-listfield-change-data' : 'setModeData',
    'click .btn-listfield-change-structure' : 'setModeStructure',
    'click table tbody tr' : 'onRowClick',
    'click table tbody tr input[type=checkbox]' : 'onRowSelect',
    'click .btn-fieldlist-add' : 'onAddNewRow',
    'click .btn-fieldlist-delete' : 'onDeleteRow',
    'click .btn-fieldlist-duplicate' : 'onDuplicateRow'
  },


  initialize: function(options){
    this.title = (options.mode === 'data') ? "Edit List Data" : "Edit List Structure"
    this.templates = _.extend(this.constructor.__super__.templates, {
      'cms_listfieldsavecancel' : '#cms_listfieldsavecancel',
      'cms_editListDataInstructions' : '#cms_editListDataInstructions'
    });
    this.constructor.__super__.initialize.apply(this, arguments);
  },
  render : function(){
    this.$el.empty();
    this.constructor.__super__.render.apply(this, arguments);

    // remove unused tabs
    this.$el.find('.fb-tabs li.configuresection').remove();
    if (this.options.mode === "data"){
      this.$el.find('.fb-tabs li.addfield').remove();
      this.$el.find('.fb-tabs li.configurefield').remove();
      // Make our only left tab the active one
      this.$el.find('.apppreview').addClass('active');
      this.$el.find('#cmsAppPreview').addClass('active');
    }

    var top = new App.View.CMSListFieldTopBar(this.options);
    top.render().$el.insertAfter(this.$el.find('.middle .breadcrumb'));

    if (this.options.mode === "data"){
      var afterEl = $(this.$el.find('.middle .fb-no-response-fields'));
      console.log("fields set to ", this.fieldList.fields);
      this.table = new App.View.CMSTable({ checkboxes : true, fields : this.fieldList.fields, data : this.fieldList.data });
      this.table.render().$el.insertAfter(afterEl);
      this.table.$el.find('table').removeClass('table-striped');

      $(this.templates.$cms_editListDataInstructions()).insertAfter(afterEl);

    }
    this.$el.find('.middle').append(this.templates.$cms_listfieldsavecancel({"listid":this.fieldList.hash}));

    this.$el.find('.btn-listfield-change-' + this.options.mode).addClass('active');



    return this;
  },

  onAddNewRow : function () {

    console.log("add new row ",this.fieldList.fields);
    //add an empty row
    if(this.fieldList.fields){
      var blank = {};
      for(var i=0; i < this.fieldList.fields.length; i++){
        var f = this.fieldList.fields[i];
        blank[f.name] = "";

      }
      //we add a temp hash to use as a ref and remove these on save may be a better way of doing this.
      blank.hash = self.getTempHash();

      this.fieldList.data.push(blank);

      this.render();

      var tr = this.$el.find("tr[data-hash='"+blank.hash+"'] ");
      this.trigger('listfieldRowSelect', tr.data('index'));
      this.rowSetState(tr);
    }
  },

  onDuplicateRow : function (){
    var self = this;
     var checked = self.getCheckedRows();
    //get data obs change hases to tmp hashes and push into data and re render
    self.getFieldsData(checked, function (data){
      console.log("got row data ",data);
      _.each(data, function (it){
        var clone = _.clone(it);
        clone.hash =  self.getTempHash();
        self.fieldList.data.push(clone);
      });
    });
    self.render();
  },

  getFieldsData : function (hashes,cb){
    var self = this;
    async.filter(self.fieldList.data, function (it, cb){
      if(it && hashes.indexOf(it.hash) != -1){
        cb(it);
      }else cb();
    }, cb);
  },

  getCheckedRows : function (){
    var checked = this.table.$el.find('tr input:checked');
    var trParents = checked.parents('tr');
    console.log("found " + trParents.length + " trs");
    var hashes = [];
    trParents.each(function (){
       hashes.push($(this).data("hash"));
    });
    return hashes;
  },

  onListFieldSave : function(e){
    e.stopPropagation();
    var self = this;

    var checked = this.table.$el.find('tr.info input:checked').parents('tr');
    console.log("checked length ", checked.length);
    if(checked.length > 1){
      //error only one save at a time
    }
    var hash = checked.first().data("hash");

    var params = self.fb.mainView.collection.toJSON();
    console.log("saving params ", params);
    for(var i=0; i < self.fieldList.data.length; i++){
      var d = self.fieldList.data[i];
      if(d.hash === hash){

        for(var pr in params){
          if(params.hasOwnProperty(pr)){
            d[params[pr].label] = params[pr].value;
          }
        }
        self.fieldList.data[i] = d;
      }

    }
    self.render();
    App.dispatch.trigger("cms.audit", "CMS List saved",self.fb);
    //TODO: POST to server
    //NOTE: all actions need to be qued in order to ensure consistency and processed in order on save.
  },

  "getTempHash" :function(){
    return "temp-" + ( new Date().getTime() + Math.random() * 10000);
  },

  onDeleteRow : function (){

    var self = this;
    var activeRows = self.getCheckedRows();
    console.log("active rows",activeRows);
    async.filter(self.fieldList.data,function (ob,cb){
      if(activeRows.indexOf(ob.hash) == -1){
        cb(ob);
      }
      else cb();
    },function (res){
      self.fieldList.data = res;
    });

    this.render();
  },
  setModeData : function(){
    this.options.mode = 'data';
    this.title = 'Edit List Data';
    this.options.editStructure = false;
    this.render();
    this.$el.find('.btn-listfield-change-data').addClass('active');
  },
  setModeStructure : function(){
    this.options.mode = 'structure';
    this.title = 'Edit List Structure';
    this.options.editStructure = true;
    this.render();
    this.$el.find('.btn-listfield-change-structure').addClass('active');
  },
  onRowClick : function(e){
    console.log("row click called");
    // Uncheck all other rows
    this.table.$el.find('tr.info input[type=checkbox]').attr('checked', false);
    this.table.$el.find('tr.info').removeClass('info');

    // Trigger selection action for this item
    this.onRowSelect(e);

    // Trigger a selection event which will update the data on the formbuilder of section view
    var tr = (e.target.nodeName === "tr") ? $(e.target) : $(e.target).parents('tr');
    this.trigger('listfieldRowSelect', tr.data('index'));

  },

  rowSetState: function(row){
    console.log("row set state ", row);
    if (row.hasClass('info')){
      row.removeClass('info');
      row.find('input[type=checkbox]').attr('checked', false);
      var checked = this.getCheckedRows();
      if(checked.length <= 0){
        this.deavtivateDestructiveButtons();
      }
    }else{
      row.addClass('info');
      row.find('input[type=checkbox]').attr('checked', true);
      this.activateDestuctiveButtons();
    }
  },

  onRowSelect : function(e){
    e.stopPropagation();
    var el = $(e.target),
    row = el.parents('tr');
    this.rowSetState(row);
  },

  "activateDestuctiveButtons" : function () {
    $('.btn-fieldlist-duplicate').removeClass("disabled");
    $('.btn-fieldlist-delete').removeClass('disabled');
  },

  "deavtivateDestructiveButtons": function (){
    $('.btn-fieldlist-duplicate').addClass("disabled");
    $('.btn-fieldlist-delete').addClass('disabled');
  },

  updateFormData : function(){

  }
});