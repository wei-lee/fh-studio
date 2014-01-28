/*
  TOOD: This is just a copy-paste placeholder of themes for now, to illustrate it also is a version of FormListBase
 */
var App = App || {};
App.View = App.View || {};

App.View.FormAppsList = App.View.FormListBase.extend({
  templates : {
    'formsListBaseAdd' : '#formsListBaseAdd',
    'fullpageLoading' : '#fullpageLoading',
    'addToExistingApp' : '#addToExistingApp'
  },
  events : {
    'click tr' : 'onRowSelected',
    'click .btn-add-formsapp' : 'onCreate',
    'click .btn-add-existing' : 'onProgress',
    'click .btn-add-existing-app' : 'onProgress'
  },
  initialize: function(){
    var self = this;
    this.collection = new App.Collection.FormApps();

    this.pluralTitle = 'Forms Apps';
    this.singleTitle = 'Forms App';
    this.columns = [{
      "sTitle": 'App Name',
      "mDataProp": this.CONSTANTS.FORMSAPP.NAME
    },/*{
     "sTitle": 'Version',
     "mDataProp": this.CONSTANTS.APP.VERSION
     },*/{
      "sTitle": 'Last Updated',
      "mDataProp": this.CONSTANTS.FORMSAPP.UPDATED
    },{
      "sTitle": '# Forms In This App',
      "mDataProp": this.CONSTANTS.FORMSAPP.FORMS + ".length"
    }
//    },{
//      "sTitle": 'Theme',
//      "mDataProp": this.CONSTANTS.FORMSAPP.THEMENAME
//    }
];

    return self.constructor.__super__.initialize.apply(self, arguments);
  },
  render : function(){
    App.View.FormListBase.prototype.render.apply(this, arguments);
    this.$el.prepend(this.templates.$addToExistingApp);
    return this.renderPreview();

  },
  renderPreview : function(){
    this.$previewEl = $('<div class="app" />');
    this.$el.append(this.$previewEl);
    this.$previewEl.hide();

    // Move the loading to the bottom of this element's dom
    this.loading.remove();
    this.$el.append(this.loading);
    return this;
  },
  updatePreview : function(updatedModel){
    var form = new App.View.FormAppsCreateEdit({ model : updatedModel, mode : 'update', collection : this.collection });
    this.$previewEl.html(form.render().$el);
    this.$previewEl.show();
  },
  onAddExisting: function(){
console.log('App.View.FormAppsList - onAddExisting()');
    var form = new App.View.FormAppsCreateEdit({ mode : 'create', collection : this.collection });
console.log('App.View.FormAppsList - onAddExisting() create appedit returned with:' , form);
  }
});
