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
    themeButtons : '#themeButtons'
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

    this.$el.append(this.templates.$themeName( { name : this.theme.get(this.CONSTANTS.THEME.NAME) }));
    this.$el.append(this.templates.$themePreviewButton());
    this.renderLogo();

    this.$themesInnerContainer = $('<div class="themesInnerContainer"></div>');
    this.$left = $('<div class="span4"></div>');
    this.$right = $('<div class="span7"></div>');
    this.$themesInnerContainer.append(this.$left, this.$right);

    this.$colours = this.renderColours();
    this.$left.append(this.$colours);

    this.$typography = this.renderTypography();
    this.$right.append(this.$typography);

    this.$borders = this.renderBorders();
    this.$right.append(this.$borders);

    this.$el.append(this.$themesInnerContainer);

    this.$el.append(this.templates.$formSaveCancel());
    return this;
  },
  renderLogo : function(){
    // TODO
    return this;
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
      var fontRow = $(self.templates.$themeFontRow({f : fontAttributes, name : heading})),
      input = $(fontRow.find('input[name=fontColour]'));
      self.spectrumify(input, fontAttributes, 'fontColour');

      // Make sure the right select dropdown has the selected attribute to begin with
      fontRow.find('select').each(function(){
        var selectName = $(this).attr('name'),
        selectedValue = fontAttributes[selectName],
        selectedEl = $(this).find('option[value=' + selectedValue + ']');
        selectedEl.attr('selected', 'selected');
      });

      typogEl.append(fontRow);
    });

    return typogEl;
  },
  renderBorders : function(){
    var self = this,
    bordersEl = $('<div class="borders"></div>'),
    borders = this.theme.get(this.CONSTANTS.THEME.BORDERS);
    bordersEl.append('<h4>Borders</h4>');
    _.each(borders, function(borderAttributes, heading){
      var row = $(self.templates.$themeBorderRow({b : borderAttributes, name : heading})),
      input = $(row.find('input[name=colour]'));
      self.spectrumify(input, borderAttributes, 'colour');

      // Make sure the right select dropdown has the selected attribute to begin with
      row.find('select').each(function(){
        var selectName = $(this).attr('name'),
        selectedValue = borderAttributes[selectName],
        selectedEl = $(this).find('option[value=' + selectedValue + ']');
        selectedEl.attr('selected', 'selected');
      });

      bordersEl.append(row);
    });
    return bordersEl;
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

    // TODO send to server
    this.trigger('back');
    this.message('Theme saved successfully');
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
  }
});