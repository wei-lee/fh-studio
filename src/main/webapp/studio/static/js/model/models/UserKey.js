model.UserKey = model.Model.extend({
  all: null,

  init: function() {},

  update: function(key, label, cb) {
    var self = this;
    var url = Constants.KEY_UPDATE_URL;
    var params = {
      "key": key,
      "fields": {
        "label": label
      }
    };

    $fw.server.post(url, params, function(res) {
      cb(res);
    });
  },

  create: function(key_label, cb) {
    var self = this;
    var url = Constants.KEY_CREATE_URL;
    var params = {
      type: "user",
      label: key_label
    };

    $fw.server.post(url, params, function(res) {
      cb(res);
    });
  },

  revoke: function(key, cb) {
    var self = this;
    var url = Constants.KEY_REVOKE_URL;
    var params = {
      key: key
    };

    $fw.server.post(url, params, function(res) {
      cb(res);
    });
  },

  load: function(cb) {
    var self = this;
    console.log('Keys model loading');
    var url = Constants.KEY_LIST_URL;
    var params = {
      type: "user"
    };

    $fw.server.post(url, params, function(res) {
      if (res.status === "ok") {
        self.all = self._transform(res.list);
      }
      cb(res);
    });
  },

  _transform: function(list) {
    var self = this;
    $.each(list, function(i, item) {
      item.revoked = self._formatTimestamp(item.revoked);
    });
    return list;
  },

  _formatTimestamp: function(ts) {
    if (!ts) {
      return null;
    }

    var timestamp = moment(ts).format('DD/MM/YYYY, HH:mm:ss');
    return timestamp;
  }
});