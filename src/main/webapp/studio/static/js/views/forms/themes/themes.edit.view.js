var App = App || {};
App.View = App.View || {};

App.View.FormThemesEdit = App.View.Forms.extend({
  templates : {
    formSaveCancel : '#formSaveCancel',
    form_back : '#form_back',
    themeName : '#themeName',
    themePreviewButton : '#themePreviewButton',
    themeColourRow : '#themeColourRow',
    themeFontRow : '#themeFontRow',
    themeBorderRow : '#themeBorderRow',
    themeBorderRowReadOnly : '#themeBorderRowReadOnly',
    themeFontRowReadOnly : '#themeFontRowReadOnly',
    'themeLogo' : '#themeLogo'
  },
  events : {
    'click .btn-form-save' : 'onThemeSave',
    'click .btn-form-cancel' : 'back',
    'click .btn-forms-back' : 'back',
    'click .btn-preview-theme' : 'onPreviewTheme'
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

    if (!this.readOnly){
      this.$el.append(this.templates.$form_back());
      this.$el.append(this.templates.$themeName( { name : this.theme.get(this.CONSTANTS.THEME.NAME) }));
      this.$el.append(this.templates.$themePreviewButton());
      this.$el.addClass('preview');
    }


    this.$themesInnerContainer = $('<div class="themesInnerContainer"></div>');
    this.$left = $('<div class="span4"></div>');
    this.$right = $('<div class="span7"></div>');
    this.$themesInnerContainer.append(this.$left, this.$right);

    this.$logo = this.renderLogo();
    this.$left.append(this.$logo);

    this.$colours = this.renderColours();
    this.$left.append(this.$colours);

    this.$typography = this.renderTypography();
    this.$right.append(this.$typography);

    this.$borders = this.renderBorders();
    this.$right.append(this.$borders);

    this.$el.append(this.$themesInnerContainer);

    if (!this.readOnly){
      this.$el.append(this.templates.$formSaveCancel());
    }

    return this;
  },
  renderLogo : function(){
    var self = this,
    typogEl = $('<div class="logo"></div>'),
    logoBase64 = this.theme.get(this.CONSTANTS.THEME.LOGO);
    typogEl.append('<h4>Logo</h4>');
    typogEl.append(this.templates.$themeLogo({ logoBase64 : logoBase64}));
    if (!this.readOnly){
      var fileBrowse = $('<br /><input type="file" name="logo"><br />');
      typogEl.append(fileBrowse);
    }

    return typogEl;
  },
  renderColours : function(){
    var self = this,
    coloursEl = $('<div class="colours"></div>'),
    colours = this.theme.get(this.CONSTANTS.THEME.COLOURS);
    _.each(colours, function(subheadings, heading){
      coloursEl.append('<h4>' + heading + '</h4>');
      var colourSection = $('<div class="coloursection" data-section="' + heading + '"></div>');
      _.each(subheadings, function(colorHex, name){
        var colourInput = $(self.templates.$themeColourRow( { name : name, value : colorHex } )),
        input = $(colourInput.find('input'));
        self.spectrumify(input, { color : colorHex }, 'color');
        colourSection.append( colourInput );
      });
      coloursEl.append(colourSection);
    });
    return coloursEl;
  },
  renderTypography : function(){
    var self = this,
    typogEl = $('<div class="typography"></div>'),
    typog = this.theme.get(this.CONSTANTS.THEME.TYPOGRAPHY);
    typogEl.append('<h4>Typography</h4>');
    _.each(typog, function(fontAttributes, heading){
      var fontRow = self.selectsRow('Font', heading, fontAttributes);
      typogEl.append(fontRow);
    });

    return typogEl;
  },
  renderBorders : function(){
    var self = this,
    bordersEl = $('<div class="Borders"></div>'),
    borders = this.theme.get(this.CONSTANTS.THEME.BORDERS);
    bordersEl.append('<h4>Borders</h4>');
    _.each(borders, function(borderAttributes, heading){
      var row = self.selectsRow('Border', heading, borderAttributes);

      bordersEl.append(row);
    });
    return bordersEl;
  },
  selectsRow : function(type, heading, attributes){
    var tplBaseName = '$theme' + type + 'Row',
    tplIncReadOnlyName = (this.readOnly) ? tplBaseName + 'ReadOnly' : tplBaseName, // Now includes the "ReadOnly" string if it's needed
    tpl = this.templates[tplIncReadOnlyName],
    row = $(tpl({r : attributes, name : heading})),
    input = $(row.find('input.colour'));
    this.spectrumify(input, attributes, 'colour');

    // Make sure the right select dropdown has the selected attribute to begin with
    row.find('select').each(function(){
      var selectName = $(this).attr('name'),
      selectedValue = attributes[selectName],
      selectedEl = $(this).find('option[value=' + selectedValue + ']');
      selectedEl.attr('selected', 'selected');
    });
    return row;
  },
  onThemeSave : function(){
    var self = this,
    name = this.$el.find('input[name=themename]').val(),
    colourSections = this.$el.find('.coloursection'),
    fontRows = this.$el.find('.fontrow'),
    borderRows = this.$el.find('.borderrow'),
    colours = {},
    typog = {},
    borders = {};

    /*
      Colours
      iterate over every colour section dom node - we use these to separate section titles
     */

    $(colourSections).each(function(){
      var el = $(this),
      sectionName = el.data('section');
      colours[sectionName] = {};
      // Iterate over every specific colour input in this section - key value parts here
      el.find('input').each(function(){
        var inputName = $(this).attr('name'),
        value = $(this).val();
        colours[sectionName][inputName] = value;
      });
    });
    this.theme.set(this.CONSTANTS.THEME.COLOURS, colours);


    /*
      Typography
     */
    $(fontRows).each(function(){
      var name = $(this).data('name'),
      row = {};
      $($(this).find('input, select').serializeArray()).each(function(){
        row[this.name] = this.value;
      });
      typog[name] = row;
    });
    this.theme.set(this.CONSTANTS.THEME.TYPOGRAPHY, typog);

    /*
      Borders
     */
    $(borderRows).each(function(){
      var name = $(this).data('name'),
      row = {};
      $($(this).find('input, select').serializeArray()).each(function(){
        row[this.name] = this.value;
      });
      borders[name] = row;
    });
    this.theme.set(this.CONSTANTS.THEME.BORDERS, borders);

    //TODO: Get logo file
    this.$el.find('input[type="file"]');

    this.collection.sync('update', this.theme.toJSON(), { success : function(){
      self.back();
      self.message('Theme updated successfully');
    }, error : function(){
      self.message('Error updating theme', 'danger');
    }});
  },
  spectrumify : function(input, attrs, attrVal){
    //TODO: Original input is not being updated at present :(
    input.spectrum({
      //showButtons: false,
      disabled: this.readOnly,
      color : attrs[attrVal]
    });
  },
  back : function(){
    this.trigger('back');
  },
  onPreviewTheme : function(){
    //TODO...
  }
});