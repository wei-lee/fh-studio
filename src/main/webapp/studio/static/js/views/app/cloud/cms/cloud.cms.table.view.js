var App = App || {};
App.View = App.View || {};

App.View.CMSTable = App.View.CMS.extend({
  initialize: function(options){
    this.options = options;
  },
  render : function(){
    var columns = [],
    fields = this.options.fields,
    data = this.options.data;

    if (this.options.checkboxes){
      // Add the checkbox column
      columns.push({
        "sTitle": "",
        "mDataProp": function(source){
          return '<input type="checkbox">';
        }
      });
    }


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
      "bInfo": true,
      "bFilter": false
    });
    this.$el.html(this.table.render().$el);
    return this;
  }
});