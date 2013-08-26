App.View.DataBrowserDataViewPagination = App.View.DataBrowserView.extend({
  templates : {
    dataviewPagination : '#dataviewPagination'
  },
  events : {
    'change #rowsPerPageDiv select' : 'onPageCountChange',
    'click .pagination a' : 'onPageChange'
  },
  initialize : function(options){
    this.collection = options.collection;
    this.compileTemplates();
  },
  render: function() {
    this.$el.empty();
    var pages = [],
    // Total rows divided by no. rows per page
    noPages = Math.floor(this.collection.count / this.collection.limit) + 1,
    curPageLessThree = this.collection.page - 3,
    startPage = (curPageLessThree<=0) ? 0 : curPageLessThree,
    noPagesShown = Math.min(noPages, 6);
    for (var i=startPage; i<startPage+noPagesShown; i++){
      var cls = (i === this.collection.page) ? 'active' : '';
      pages.push('<li class="' + cls + '"><a data-page="' + i + '" href="#">' + (i+1) + '</a></li>');
    }

    this.$el.append(this.templates.$dataviewPagination( { pages : pages.join('') }));
    // Set the value of the rows per page select box
    this.$el.find('#rowsPerPageDiv select').val(this.collection.limit);
    return this;
  },
  onPageCountChange : function(e){
    var el = $(e.target);
    this.collection.limit = parseInt(el.val(), 10);
    this.collection.fetch({reset : true});
    this.render(); // also need to redraw the pagination..!
  },
  onPageChange : function(e){
    var el = $(e.target);
    this.collection.page = parseInt(el.data('page'), 10);
    if (isNaN(this.collection.page)){
      this.collection.page = 0;
    }
    this.collection.fetch({reset : true});
  }
});