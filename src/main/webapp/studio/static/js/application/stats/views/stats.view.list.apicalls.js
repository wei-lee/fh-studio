Stats.View.List.APICalls = Stats.View.List.extend({

  init: function(params) {
    this._super(params);
  },

  formatSeriesName: function (name) {
    // do nothing by default
    // overwrite if needed
    return name.match(/\b\S*_api_(.*?)_request_times\b/)[1];
  }
});