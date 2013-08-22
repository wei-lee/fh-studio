App.View.DataBrowserFilters = App.View.DataBrowserView.extend({
  templates : {
    databrowserFilters: '#databrowserFilters'
  },
  events : {
    'click .filters .dropdown-menu a' : 'onComparatorSelection',
    'click .add-filter' : 'onFilterAdd'
  },
  initialize : function(){
    this.compileTemplates();
  },
  render: function() {
    this.$el.empty();
    var filters = this.templates.$databrowserFilters();
    this.$el.append($(filters));
    return this;
  },
  onComparatorSelection : function(e){
    var el = $(e.target),
    ul = el.parents('ul'),
    btn = ul.siblings('.btn'),
    symbolSpan = btn.children('span.smybol'),
    filter = el.data('filter'),
    symbol = el.find('.badge').html();

    symbolSpan.html(symbol);
    btn.data('filter', 'filter');
  },
  onFilterAdd : function(e){
    //TODO: Why do none of these get called?
  }
});