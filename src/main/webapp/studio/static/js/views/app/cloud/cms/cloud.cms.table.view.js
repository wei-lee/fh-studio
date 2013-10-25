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


    for (var i=0; fields && i<fields.length; i++){
      var f = fields[i];
      (function(f){
        var propFn = function(src){
            if (src.hasOwnProperty(f.name)){
              return src[f.name];
            }
            return '';
        };
        columns.push({
          "sTitle": f.name,
          "mDataProp": propFn
        });
      })(f);
    }

    this.table = new App.View.DataTable({
      aaData : data,
      "fnRowCallback": function(nTr, sData, oData, iRow, iCol) {
        $(nTr).attr('data-index', iRow).attr('data-hash', sData.hash);
      },
      "aaSorting" : [],
      "aoColumns": columns,
      "bAutoWidth": false,
      "sPaginationType": 'bootstrap',
      "sDom": "<'row-fluid'<'span4'f>r>t<'row-fluid'<'pull-left'i><'pull-right'p>>",
      "bLengthChange": false,
      "iDisplayLength": 5,
      "bInfo": true,
      "bFilter": false,
      "oLanguage" : {
        "sEmptyTable" : "This list has no data. First, ensure the list has some structure - then add fields using the \"Add Row\" button"
      }
    });
    this.$el.html(this.table.render().$el);

    this.$el.find('.dataTables_wrapper .row-fluid .span4').hide(); // Hide the search row on this
    return this;
  }
});