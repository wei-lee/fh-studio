var App = App || {};
App.View = App.View || {};

App.View.FormThemesEdit = App.View.Forms.extend({
  templates : {
    formSaveCancel : '#formSaveCancel',
    form_back : '#form_back',
    themeName : '#themeName',
    themePreviewButton : '#themePreviewButton',
    themeColourRow : '#themeColourRow'
  },
  events : {
    'click .btn-form-save' : 'onThemeSave',
    'click .btn-form-cancel' : 'back',
    'click .btn-forms-back' : 'back'
  },
  initialize: function(options){
    this.constructor.__super__.initialize.apply(this, arguments);
    this.options = options;
    this.theme = options.theme;
    this.readOnly = (options.hasOwnProperty('readOnly')) ? options.readOnly : true;
  },
  render : function(){
    this.$el.addClass('span10 themeedit');
    this.breadcrumb(['Forms', 'Themes', 'Edit Theme']);
    this.$el.append(this.templates.$form_back());

    this.$el.append(this.templates.$themeName());
    this.$el.append(this.templates.$themePreviewButton());
    this.renderLogo();
    this.renderColours();
    this.renderTypography();
    return this;
  },
  renderLogo : function(){
    // TODO
    return this;
  },
  renderColours : function(){
    var self = this,
    colours = this.theme.get(this.CONSTANTS.THEME.COLOURS);
    _.each(colours, function(subheadings, heading){
      self.$el.append('<h3>' + heading + '</h3>');
      _.each(subheadings, function(colorHex, name){
        var colourInput = $(self.templates.$themeColourRow( { name : name, value : colorHex } ));
        colourInput.find('input').spectrum({
          showButtons: false,
          disabled: self.readOnly,
          color : colorHex
        });
        self.$el.append( colourInput );
      });
    });
    return this;
  },
  renderTypography : function(){
    var self = this,
    typog = this.theme.get(this.CONSTANTS.THEME.TYPOGRAPHY);
    this.$el.append('<h2>Typography</h2>');
    _.each(typog, function(fontAttributes, heading){
      self.$el.append('<label>' + heading + '</label>');
      self.$el.append('<label>' + name + '</label>');
      self.$el.append(JSON.stringify(fontAttributes));
    });
    return this;
  },
  onThemeSave : function(){

  },
  back : function(){
    this.trigger('back');
  }
});