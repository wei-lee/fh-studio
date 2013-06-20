App.View.DataTable = Backbone.View.extend({
  options: null,
  table: null,

  defaults: {
    "bLengthChange": false,
    "fnRowCallback": function(nTr, sData, oData, iRow, iCol) {
      var buttons_html = $("#datatable-edit-delete-controls-template").html();
      var buttons_template = Handlebars.compile(buttons_html);

      // Remove before render
      $('.controls', nTr).remove();

      // Append controls template
      $(nTr).append(buttons_template());

      // Append guid data
      $(nTr).attr('data-guid', sData.guid);
    }
  },

  initialize: function(options) {
    _.bindAll(this);
    this.options = $.extend({}, this.defaults, options);
  },

  render: function() {
    var self = this;
    var template = Handlebars.compile($("#datatable-template").html());
    this.$el.append(template(this.options));
    this.$table = this.$el.find('.datatable');
    this.table = this.$table.dataTable(this.options);
    return this;
  }
});