App.View.DataBrowserMessageView = App.View.DataBrowserView.extend({
  templates : {
    dataviewEmptyContainer : '#dataviewEmptyContainer',
    dataviewEmptyContent : '#dataviewEmptyContent',
  },
  events : {
    'click button' : 'onButtonClick'
  },
  initialize : function(options){
    this.compileTemplates();
    this.options = options || { message : 'An error has occured with the Data Browser', button : false };
  },
  render: function() {
    this.$el.empty();
    var messageView = this.templates.$dataviewEmptyContent(this.options),
    container = $(this.templates.$dataviewEmptyContainer( { content : messageView } ));
    this.$el.append(container);
    return this;
  },
  onButtonClick : function(e){
    if (this.options && this.options.cb){
      this.options.cb.apply(this, arguments);
    }
  }
});
