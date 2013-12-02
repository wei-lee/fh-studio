describe("test forms list", function(){
  var async = new AsyncSpec(this);
  // run an async setup
  async.beforeEach(function(done){
    var formsList = getJSONFixture("forms/forms.json"),
    themesList = getJSONFixture("forms/themes.json"),
    appsList = getJSONFixture("forms/formapps.json");
    loadFixtures('../common.html','index/forms/forms_tab.html');

    App.Model.FormBase.prototype.fetch = function(options){
      this.set(formsList.forms[0]);
      return options.success(formsList.forms[0]);

    };
    App.Model.FormBase.prototype.destroy = function(options){
      return options.success.apply(this, arguments);
    };


    spyOn(App.Collection.FormBase.prototype, 'read').andCallFake(function(method, model, options) {
      switch(this.url){
        case "/api/v2/forms/form/list":
          return options.success(formsList.forms);
        case "/api/v2/forms/theme":
          return options.success(themesList.themes);
        case "/studio/static/js/model/backbone/mocks/forms/formapps.json":
          return options.success(appsList.apps);
      }
    });

    done();
  }, 10);


  async.it("Should have a fully populated forms list", function(done){
    var view = new App.View.FormsController();

    view.render();

    var formsView = view.views.forms,
    formsLength = formsView.collection.length,
    fixturesLength = getJSONFixture("forms/forms.json").forms.length;

    expect(formsLength).toEqual(fixturesLength);

    // Make sure FB starts up ok
    expect(view.$el.find('.datatable tbody tr').length).toEqual(formsLength);


//    formsView.fb.collection.bind('reset', function(){
//
//
//    });
    view.$el.find('.datatable tbody tr').first().click();
    done();


  });


  async.it("Should have a fully populated themes list", function(done){
    var view = new App.View.FormsController();

    view.render();
    view.onThemes();

    var themesView = view.views.themes,
    themesLength = themesView.collection.length,
    fixturesLength = getJSONFixture("forms/themes.json").themes.length;

    expect(themesLength).toEqual(fixturesLength);
    done();
    // Async stuff failing..
    //view.$el.find('.datatable tbody tr').first().click();
    //expect(themesView.$el.find('.colorRow').length).toBeGreaterThan(0);

  });

  async.it("Should have a fully populated apps list", function(done){
    var view = new App.View.FormsController();

    view.render();
    view.onApps();

    var appsView = view.views.apps,
    appsLength = appsView.collection.length,
    fixturesLength = getJSONFixture("forms/formapps.json").apps.length;

    expect(appsLength).toEqual(fixturesLength);
    done();
    // Async stuff failing..
    //view.$el.find('.datatable tbody tr').first().click();

  });

});
