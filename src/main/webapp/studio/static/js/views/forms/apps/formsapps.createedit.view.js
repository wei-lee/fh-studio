var App = App || {};
App.View = App.View || {};

App.View.FormAppsCreateEdit = App.View.Forms.extend({
  templates : {
    'formsApps' : '#formsApps',
    'fullpageLoading' : '#fullpageLoading'
  },
  events : {
    'click .btn-success' : 'onFormSave',
    'click .btn-app-submissions' : 'onAppSubmissions'
  },
  initialize: function(options){
    var self = this;
    this.model = options.model;
    this.collection = options.collection;
    this.forms = new App.Collection.Form();
    this.themes = new App.Collection.FormThemes();
    this.mode = options.mode || 'create';


    // Fetch on the forms and themes - only once these are done can we finish..
    var getters = [
      function(cb){
        self.forms.fetch({
          success : function(res){
            cb(null, res);
          },
          error : function(err){
            cb(err);
          }
        });
      },
      function(cb){
        self.themes.fetch({
          success : function(res){
            cb(null, res);
          },
          error : function(err){
            cb(err);
          }
        });
      }
    ];

    if (this.mode === 'existing'){
      this.apps = new App.Collection.Apps();
      getters.push(function(cb){
        self.apps.fetch({
          success : function(res){
            return cb(null, res);
          },
          error : function(err){
            return cb(err);
          }
        });
      });
    }

    async.parallel(getters, function(err, res){
      if (err){
        //TODO: Err handling
        self.trigger("error",err);
        return;

      }
      self.loaded = true;
      self.render();
      self.trigger("rendered");

    });

    this.loaded = false;


    this.compileTemplates();
  },
  render : function(){

    var self = this,
    name = '';



    if (!this.loaded){
      this.$el.height(134);
      return this;
    }

    if (this.mode === 'update'){
      name = this.model.get(this.CONSTANTS.FORMSAPP.NAME);
    }

    this.$el.append(this.templates.$formsApps({ name : name }));

    if (this.mode === 'existing'){
      var appSelect = $('<select id="existingAppSelect"></select>');
      this.apps.each(function(a){
        appSelect.append('<option value="' + a.get('id') + '">' + a.get('title') + '</option>');
      });
      this.$el.find('.appname').html(appSelect);
    }

    var themesSelect = this.$el.find('#formAppTheme'),
    formsSelect = this.$el.find('#formAppForms');

    this.forms.each(function(f){
      formsSelect.append('<option value="' + f.get('_id') + '">' + f.get(self.CONSTANTS.FORM.NAME) + '</option>');
    });
    this.themes.each(function(f){
      themesSelect.append('<option value="' + f.get('_id') + '">' + f.get(self.CONSTANTS.THEME.NAME) + '</option>');
    });

    formsSelect.select2({});
    if (this.mode === 'update'){
      var vals = _.pluck(this.model.get(self.CONSTANTS.FORMSAPP.FORMS), '_id');
      formsSelect.select2('val', vals);
      themesSelect.val(this.model.get('theme')._id);
    }else{
      // A create operation - remove the save buttons
      this.$el.find('.btn-group').remove();
    }
    return this;
  },
  onFormSave : function(e){
    console.log(e.target);
    var create = $(e.target).hasClass("btn-add-formsapp");
    console.log("is create ", create);
    var self = this,
    forms = this.$el.find('form.formsApps #formAppForms').val() || [], //TODO: Theme and name?
    theme = this.$el.find('form.formsApps #formAppTheme').val(),
    name = this.$el.find('form.formsApps #inputFormAppName').val(),
    id;

    if (!this.model){

      // Associating with an existing formapp, or creating from scratch
      id = this.$el.find('form.formsApps select#existingAppSelect').val();
      if(id){
        console.log("the id is ", id);
        this.model = this.collection.findWhere({"_id":id});
        console.log("found model ", this.model);
        name = this.$el.find('form.formsApps select#existingAppSelect option:selected').html();
      }
    }
    if(! this.model){
      this.model = new App.Model.FormApp({
        _id : id
      });
    }
    this.model.set(this.CONSTANTS.FORMSAPP.UPDATED, new Date());

    this.model.set(this.CONSTANTS.FORMSAPP.FORMS, forms);
    this.model.set(this.CONSTANTS.FORMSAPP.THEMENAME, theme);
    this.model.set(this.CONSTANTS.FORMSAPP.NAME, name);

    // We use model.save rather than our usual update on a collection - bit inconsistant..?
    var cacheKey;
    this.model.save({},
    {
      success : function(res){
        console.log("response ", res);
        if(res && res.get("cacheKey")){
          self.progressModal = $('#generic_progress_modal').clone();
          self.progressModal.find('h3').text("Deploying App").end().find('h4').text("info").end().appendTo($("body")).one('shown', trackCreate).modal();
          self.collection.fetch({reset : true});
          cacheKey = res.get('cacheKey');
        }
        App.View.Forms.prototype.message("completed");
      },
      error : function(){
        self.message('Error creating or updating app');
      }
    });

    function trackCreate (){
      var new_guid;
      self.current_progress = 0;
      this.active_async_task = new ASyncServerTask({
        cacheKey: cacheKey
      }, {
        updateInterval: Properties.cache_lookup_interval,
        maxTime: Properties.cache_lookup_timeout,
        // 5 minutes
        maxRetries: Properties.cache_lookup_retries,
        timeout: function(res) {
          self.updateProgressBar(100);
          if (typeof fail != 'undefined') {
            fail();
          }
        },
        update: function(res) {
          for (var i = 0; i < res.log.length; i++) {
            if (typeof res.action.guid != 'undefined') {
              new_guid = res.action.guid;
              console.log('GUID for new app > ' + new_guid);
            }
            self.appendProgressLog(res.log[i]);
            console.log("Current progress> " + self.current_progress);
          }
          self.updateProgressBar(self.current_progress + 1);
        },
        complete: function(res) {

          self.updateProgressBar(75);
        },
        error: function(res) {
          console.log('clone error > ' + JSON.stringify(res));
          self.updateProgressBar(100);
          $fw.client.dialog.error('App generation failed.' + "<br /> Error Message:" + res.error);

          if (typeof fail != 'undefined') {
            fail();
          }
        },
        retriesLimit: function() {
          console.log('retriesLimit exceeded: ' + Properties.cache_lookup_retries);
          $fw.client.dialog.error('App generation failed.');
          self.updateProgressBar(100);
          if (typeof fail != 'undefined') {
            fail();
          }
        },
        end: function() {
          self.destroyProgressModal();
          $('.btn-apps').trigger("click");
        }
      });
     this.active_async_task.run();

    }
  },
  onAppSubmissions : function(){
    // TODO in view.controller really..
  }
});
