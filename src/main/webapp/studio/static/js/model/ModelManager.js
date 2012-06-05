model.ModelManager = Class.extend({
  
  init: function () {
    this.App = new model.App();
    this.Template = new model.Template();
    this.User = new model.User();
    this.Snippet = new model.Snippet();
    this.Resource = new model.Resource();
  }
});