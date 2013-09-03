App.View.DataBrowserDataView = App.View.DataBrowserView.extend({
  templates : {
    databrowserDataViewBarCollectionMenuItem : '#databrowserDataViewBarCollectionMenuItem',
    databrowserDataViewBarItems: '#databrowserDataViewBarItems',
    databrowserNavbar : '#databrowserNavbar'
  },
  events : {
    'click table.edittable tr .btn-advanced-edit' : 'onRowAdvancedEdit',
    'click .btn-add-row' : 'onAddRow',
    'click .btn-refresh-collection' : 'onRefreshCollection',
    'click .btn-trash-rows' : 'onMultiDelete',
    'click .btn-filter' : 'onFilterToggle',
    'click table.databrowser .td-checkbox input[type=checkbox]' : 'onRowSelection'
  },
  initialize : function(options){
    this.updateCrumb();
    this.options = options;
    this.collection = options.collection;
    this.collections = options.collections;
    this.compileTemplates();
  },
  render: function() {
    // Add in data view navigation
    var collectionsHTML = [];
    for (var i=0; i<this.collections.length; i++){
      var c = this.collections[i];
      collectionsHTML.push(this.templates.$databrowserDataViewBarCollectionMenuItem(c));
    }
    var filters = new App.View.DataBrowserFilters({ collection : this.collection}),
    navItems = this.templates.$databrowserDataViewBarItems({collections : collectionsHTML.join('')});
    this.nav = $(this.templates.$databrowserNavbar({ brand : this.model.get('name'), class : 'databrowsernav', baritems : navItems }));
    this.nav.find('.navbar-inner').append(filters.render().$el); // NB needs to be added in here 'cause otherwise events don't bind
    this.$el.append(this.nav);

    // Add in the table view
    this.table = new App.View.DataBrowserTable(this.options);
    this.table.render();
    this.$el.append(this.table.el);

    // Add in the pagination controls at the bottom of the table
    this.pagination = new App.View.DataBrowserDataViewPagination({collection : this.collection});
    this.$el.append(this.pagination.render().el);


    // Add in a hidden advanced editor behind the scenes
    this.browser = new App.View.DataBrowserAdvancedEditor( {parent : this});
    this.browser.render();
    this.browser.$el.hide();
    this.$el.append(this.browser.el);
    return this;
  },
  onRowAdvancedEdit : function(e){
    e.stopPropagation();
    // Clone the old view
    var el = $(e.target),
    guid = el.parents('td').data('id'),
    tr = this.table.$el.find('#' + guid),
    model = this.table.collection.get(guid);

    this.browser.update(model);

    this.table.$el.hide();
    this.nav.hide();
    this.pagination.$el.hide();
    this.browser.$el.show();

    this.breadcrumb(['Data Browser', 'Collections', this.model.get('name'), 'Advanced Editor']);
  },
  onRowAdvancedEditDone : function(e){
    this.table.render();
    this.browser.$el.hide();
    this.table.$el.show();
    this.nav.show();
    this.pagination.$el.show();
    this.updateCrumb();
  },
  onRowAdvancedEditCancel : function(e){
    this.browser.$el.hide();
    this.table.$el.show();
    this.updateCrumb();
  },
  onAddRow : function(){
    this.table.onAddRow.apply(this.table, arguments);
  },
  onMultiDelete : function(e){
    e.stopPropagation();
    var trs = this.table.$el.find('tr.info');
    if (trs.length === 0){
      return;
    }
    this.table.onRowOrRowsDelete(trs);
  },
  onFilterToggle : function(e){
    e.preventDefault();
    var filters = this.$el.find('.filters');
    filters.collapse('toggle');

    // Unfortunate hack to allow the dropdown to function, without any glitch in the animation -
    // adding overflow:visible before animation completes screws it up
    if (filters.hasClass('in')){
      setTimeout(function(){
        filters.css({'overflow' : 'visible'});
      }, 300);
    }else{
      filters.css({'overflow' : 'hidden'});
    }
  },
  onRefreshCollection : function(cb){
    this.table.collection.fetch({reset : true, collection : this.model.get('name'), success : function(){
      if (typeof cb === 'function'){
        cb.apply(this, arguments);
      }
    }});
  },
  onRowSelection : function(e){
    var el = e.target;
    if($(el).attr('checked')) {
      this.$el.find('.btn-trash-rows').removeClass('disabled');
    }else{
      if (this.table.$el.find('table tr.info').length<1){
        this.$el.find('.btn-trash-rows').addClass('disabled');
      }
    }
  },
  updateCrumb : function(){
    this.breadcrumb(['Data Browser', 'Collections', this.model.get('name')]);
  }
});