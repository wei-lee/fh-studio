App.View.DataBrowserFilters = App.View.DataBrowserView.extend({
  templates : {
    databrowserFilters: '#databrowserFilters',
    databrowserFilterItem : '#databrowserFilterItem'
  },
  events : {
    'click .filters .dropdown-menu a' : 'onComparatorSelection',
    'click .add-filter' : 'onFilterAdd',
    'click .aFilter' : 'onFilterRemove'
  },
  filters : [
    {
      name : 'Equals',
      entity: '=',
      operator : 'eq'
    },
    {
      name : 'Not Equals',
      entity: '!=',
      operator : 'ne'
    },
    {
      name : 'Less Than',
      entity: '&le;',
      operator : 'le'
    },
    {
      name : 'Less or Equals',
      entity: '&le;',
      operator : 'eq'
    },
    {
      name : 'Greater Than',
      entity: '&gt;',
      operator : 'gt'
    },
    {
      name : 'Greater or Equals',
      entity: '&ge;',
      operator : 'ge'
    }
  ],
  initialize : function(options){
    this.collection = options.collection;
    this.compileTemplates();
  },
  render: function() {
    this.$el.empty();
    var filters = [];

    for (var i=0; i<this.filters.length; i++){
      var f = this.filters[i],
      cls = (i===0) ? 'active' : '';
      filters.push('<li class="' + cls + '"><a data-filter-index="' + i + '" data-filter-operator="' + f.operator + '" href="#"><span class="badge">' + f.entity + '</span> ' + f.name + '</a></li>');
    }

    var filtersTpl = this.templates.$databrowserFilters( { filters : filters.join('') } )
    this.$el.append($(filtersTpl));
    return this;
  },
  onComparatorSelection : function(e){
    var el = e.target.tagName.toLowerCase()==='a' ?  $(e.target) : $(e.target).parent('a'),
    li = el.parent(),
    ul = el.parents('ul'),
    btn = ul.siblings('.btn'),
    symbolSpan = btn.children('span.symbol'),
    filterIndex = parseInt(el.data('filter-index'), 10),
    symbol = this.filters[filterIndex].entity;

    symbolSpan.html(symbol);
    ul.children('li').removeClass('active');
    li.addClass('active');
  },
  onFilterAdd : function(e){
    e.preventDefault();
    var el = (e.target.tagName.toLowerCase() === 'button') ? $(e.target) : $(e.target).parents('button'),
    form = el.parent(),
    key = form.children('#data-filter-key').val(),
    val = form.children('#data-filter-value').val(),
    a = form.find('.btn-group ul li.active a'),
    operator = a.data('filter-operator'),
    operatorIndex = a.data('filter-index'),
    entity = this.filters[operatorIndex].entity,
    f = this.collection.filters,
    filterEl;

    if (!key || !val || key.trim()==='' || val.trim()===''){
      return this.alertbox('You must specify a field name and value to create a filter');
    }

    if (['ge', 'gt', 'le', 'lt'].indexOf(operator)>-1){
      if (isNaN(parseInt(val, 10)) || /[A-Z]/i.test(val)){
        return this.alertbox('Greater than or less than filters require a number value');
      }
    }

    if (!f.hasOwnProperty(operator)){
      f[operator] = {};
    }
    f[operator][key] = val;
    this.collection.page = 0; // reset pagecount to 0 when filtering
    this.collection.fetch({reset : true, filters : f});

    filterEl = this.templates.$databrowserFilterItem( { key : key, entity : entity, value : val, operator : operator } );
    this.$el.find('.filterList').append(filterEl);
  },
  onFilterRemove : function(e){
    e.preventDefault();
    var el = $(e.target);
    el = (el.hasClass('badge')) ? el : el.parents('.badge');
    var operator = el.data('operator'),
    key = el.data('key'),
    val = el.data('value'),
    f = this.collection.filters;

    el.remove();
    if (f.hasOwnProperty(operator)){
      delete f[operator][key];
      this.collection.fetch({reset : true, filters : f});
    }
  }
});
