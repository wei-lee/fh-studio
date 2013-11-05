App.View.FormsController = Backbone.View.extend({
  events: {
    'click .plugin .addButton': 'setup'
  },
  initialize : function(){},
  render: function(options) {
    var self = this;

    this.menu = new App.View.FormMenu();
    this.$el.append(this.menu.render().$el);

    this.list = new App.View.FormList();
    this.$el.append(this.list.render().$el);
    return this;
  }
});