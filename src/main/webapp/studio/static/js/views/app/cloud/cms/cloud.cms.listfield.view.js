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
      'cms_listfieldsavecancel' : '#cms_listfieldsavecancel'
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
    }

    var top = new App.View.CMSListFieldTopBar(this.options);
    top.render().$el.insertAfter(this.$el.find('.middle .breadcrumb'));

    if (this.options.mode === "data"){
      var columns = [],
      fields = this.fieldList.fields,
      data = this.fieldList.data;
      for (var i=0; i<fields.length; i++){
        var f = fields[i];
        columns.push({
          "sTitle": f.name,
          "mDataProp": f.name
        });
      }

      this.table = new App.View.DataTable({
        aaData : data,
        "fnRowCallback": function(nTr, sData, oData, iRow, iCol) {
          $(nTr).attr('data-index', iRow).attr('data-hash', sData.hash);
        },
        "aoColumns": columns,
        "bAutoWidth": false,
        "sPaginationType": 'bootstrap',
        "sDom": "<'row-fluid'<'span4'f>r>t<'row-fluid'<'pull-left'i><'pull-right'p>>",
        "bLengthChange": false,
        "iDisplayLength": 5,
        "bInfo": true
      });
      this.table.render().$el.insertAfter(this.$el.find('.middle .fb-no-response-fields'));
    }

    this.$el.find('.middle').append(this.templates.$cms_listfieldsavecancel());

    return this;
  },
  onListFieldSave : function(){
    var self = this;
    setTimeout(function(){
      self.trigger('back');
    }), 1000;
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
    this.onRowSelect(e);
    var tr = (e.target.nodeName === "tr") ? $(e.target) : $(e.target).parents('tr');
    tr.data('index');
    //TODO: More stuffs..
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

  }
});