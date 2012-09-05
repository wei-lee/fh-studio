Stats.Model.Historical.APICalls = Stats.Model.Historical.Timers.extend({
  /**
   * Model name is required, used by controller for mapping models and views
   */
  name: 'apicalls',

  init: function(params) {
    this._super(params);
  }
});