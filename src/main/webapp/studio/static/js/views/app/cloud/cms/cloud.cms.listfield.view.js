var App = App || {};
App.View = App.View || {};

App.View.CMSListField = App.View.CMSSection.extend({
  events : {
    'click .btn-listfield-save' : 'onListFieldSave',
    'click .btn-listfield-change-data' : 'setModeData',
    'click .btn-listfield-change-structure' : 'setModeStructure',
    'click table tbody tr' : 'onRowClick',
    'click table tbody tr input[type=checkbox]' : 'onRowSelect'
  },
  initialize: function(options){
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
      this.table = new App.View.CMSTable({ checkboxes : true, fields : this.fieldList.fields, data : this.fieldList.data });
      this.table.render().$el.insertAfter(afterEl);
      this.table.$el.find('table').removeClass('table-striped');

      $(this.templates.$cms_editListDataInstructions()).insertAfter(afterEl);
    }

    this.$el.find('.middle').append(this.templates.$cms_listfieldsavecancel());

    return this;
  },
  onListFieldSave : function(){
    var self = this;
    self.trigger('back', true);

    //TODO: POST to server
    //NOTE: all actions need to be qued in order to ensure consistency and processed in order on save.
  },
  setModeData : function(){
    this.options.mode = 'data';
    this.options.editStructure = false;
    this.render();
  },
  setModeStructure : function(){
    this.options.mode = 'structure';
    this.options.editStructure = true;
    this.render();
  },
  onRowClick : function(e){
    // Uncheck all other rows
    this.table.$el.find('tr.info input[type=checkbox]').attr('checked', false);
    this.table.$el.find('tr.info').removeClass('info');

    // Trigger selection action for this item
    this.onRowSelect(e);

    // Trigger a selection event which will update the data on the formbuilder of section view
    var tr = (e.target.nodeName === "tr") ? $(e.target) : $(e.target).parents('tr');
    this.trigger('listfieldRowSelect', tr.data('index'));

  },
  onRowSelect : function(e){
    e.stopPropagation();
    var el = $(e.target),
    row = el.parents('tr');

    if (row.hasClass('info')){
      row.removeClass('info');
      row.find('input[type=checkbox]').attr('checked', false);
    }else{
      row.addClass('info');
      row.find('input[type=checkbox]').attr('checked', true);
    }

  },
  updateFormData : function(){

  }
});