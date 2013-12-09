var App = App || {};
App.View = App.View || {};
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
    },
    bFilter: true
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
    if(this.options.bFilter){
      this.$el.find('.dataTables_filter').html(new App.View.DataTableSearch({
        search: function(term){
          self.table.fnFilter(term);
        }
      }).render().el).parent("div").addClass("filter_div row-fluid");
    }
    return this;
  }
});

App.View.DataTableSearch = Backbone.View.extend({
   events:{
    'click .btn': "doSearch",
    'keyup input': 'enterSearch'
   },

   render: function(){
     var searchTemp = Handlebars.compile($('#datatable-search-query-template').html());
     this.$el.html(searchTemp());
     return this;
   },

   doSearch: function(e){
     e.preventDefault();
     this.enterSearch();
   },

   enterSearch: function(){
     var term = this.$el.find("input").val();
     this.options.search(term);
   }
});