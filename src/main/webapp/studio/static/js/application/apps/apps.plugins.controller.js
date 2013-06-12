var Apps = Apps || {};

Apps.Plugins = Apps.Plugins || {};

Apps.Plugins.Controller = Apps.Cloud.Controller.extend({

  model: {
    //device: new model.Device()
    log: new model.CloudLog()
  },

  views: {
    cloudplugins_container: "#cloudplugins_container"
  },

  container: null,
  pluginRowTpl:
  '<tr class="pluginRow" data-id="{id}" data-name="{name}">'+
  '<td>{name}</td>'+
  '<td>{desc}</td>'+
  '<td><a class="configure" href="#">Configure &raquo;</a></td>'+
  '<td><a class="connectivity" href="#">Test connectivity &raquo;</a></td>'+
  '<td><a class="delete" href="#">Delete</a></td>'+
  '</tr>',
  pluginModalTabTpl: '<li class="tab-{category}"><a href="#tab-body-{category}" data-toggle="tab">{category}</a></li>',
  pluginModalTabBody: '<div class="tab-pane fade in" id="tab-body-{category}"><div class="row-fluid"></div></div>',
  pluginModalImage: '<img src="/studio/static/themes/default/img/cloud_plugins/{image}">',
  pluginModalItemTpl:
  '<div class="span4 plugin">'+
  '{title}'+
  '<hr />' +
  '<p>{desc}</p>'+
  '<a class="btn btn-success addButton" data-plugin="{name}" href="#">Add '+
  '<i class="icon-white icon-plus-sign"></i>' +
  '</a>'+
  '</div><!--/span4-->',

  plugins: [
    {
      name: 'Twilio',
      desc: 'Connects to the Twilio telephony API',
      image: 'twilio.png',
      category: 'Communication',
      version : 'git://github.com/cianclarke/twilio-node.git',
      config: {
        accountSID : "Twilio account SID",
        authToken: "Twilio Auth Token"
      }
    },
    {
      name: 'Sendgrid',
      desc: 'Connects to the Sendgrid emailer API',
      image: 'sendgrid.png',
      category: 'Communication',
      version : '0.2.5',
      config: {
        username: "Your SendGrid username",
        password: "Your SendGrid password"
      }
    },

    {
    name: 'Salesforce',
    desc: 'Connects to the SalesForce CRM Api',
    image: 'salesforce.png',
    category: 'APIs',
    config: {
      instanceURL : "Your salesforce instance URL - e.g. http://na1.salesforce.com",
      username: "Your salesforce.com login",
      password: "Your salesforce.com password"
    }
  },
    {
      name: 'Twitter',
      desc: 'Connects to the Twitter social network',
      image: 'twitter.png',
      category: 'Social',
      config: {
        username : "The twitter account you want to retrieve tweets from"
      }
    },
    {
      name: 'Facebook',
      desc: 'Facebook OAuth connector',
      image: 'facebook.png',
      category: 'Social',
      config: {
        apiKey: "Your facebook API key - you can find this in...",
        OAuthToekn: 'OAuth token - you can'
      }
    },
    {
      name: 'Amazon S3',
      desc: 'Connector to S3 bucket storage',
      image: 's3.png',
      category: 'Storage',
      config: {
        instanceUrl: "Your S3 instance URL - e.g. s3.aws.com",
        apiKey: 'Your S3 API Key'
      }
    },
    {
      name: 'OpenStack',
      desc: 'Connect to any OpenStack data storage platform',
      image: 'openstack.png',
      category: 'Storage',
      config: {
        instanceUrl: "Your OpenStack instance URL - e.g. storage.openstack.com",
        apiKey: 'Your OpenStack API Key'
      }
    },
    {
      name: 'Rackspace',
      desc: 'Rackspace Cloud Open Stack storage provider',
      image: 'rackspace.png',
      category: 'Storage',
      config: {
        instanceUrl: "Your Racekspace instance URL - e.g. storage.rackspace.com",
        apiKey: 'Your Rackspace API Key'
      }
    },
    {
      name: 'Request',
      desc: 'The de facto standard for doing all HTTP requests in Node.js - recommended over using the HTTP module standalone.',
      category: 'Tools'
    },
    {
      name: 'Async',
      desc: 'Callback hell? Async helps you overcome this',
      category: 'Tools'
    }

  ], // TODO: Ajax these in..

  init: function () {
    this._super();
    this.initFn = _.once(this.initBindings);
    this.renderPluginsModal();
    this.container = this.views.cloudplugins_container;
  },

  /*
   * Initialise any UI components required for logging.
   * Once-off initialisation
   */
  initBindings: function () {
    var self = this;
    var container = $(this.views.cloudplugins_container);

    //$('a.configureSave').unbind().on('click', self.onConfigureSave);
    //$('a.configureCancel').unbind().on('click', self.onConfigureCancel);
    //TODO: Do this bettar, pass scope in jquery event handler rather than silly inline handlers
    $('a.addButton').unbind().on('click', function(){
      var el = this;
      self.onPluginAdd.apply(self, [el]);
    });
    $('#plugins-cancel').unbind().on('click', self.onPluginCancel);
    $('#plugins-save').unbind().on('click', function(){
      self.onPluginSave.apply(self, this);
    });
    $('#plugins-done').unbind().on('click', function(){
      self.onPluginDone.apply(self, this);
    });

  },

  show: function(){
    var self = this;
    this._super(this.views.cloudplugins_container);
    this.initFn();
    this.hide();
    this.container = this.views.cloudplugins_container;
    self.loadPluginList();
    $(this.container).show();
  },

  loadPluginList: function(){
    var self = this;
    var instGuid = $fw.data.get('inst').guid;

    // TODO: Call out to the model this.model.plugins.list()
    var data = this.plugins;
  },
  renderPluginsModal: function(plugins){
    var categories = [];
    for (var i=0; i<this.plugins.length; i++){
      var p = this.plugins[i];
      if (categories.indexOf(p.category)===-1){
        // Add the top tab, and the container for this categories tab body
        var tab = this.pluginModalTabTpl.replace(/\{category\}/g, p.category);
        tabBody = this.pluginModalTabBody.replace(/\{category\}/g, p.category);
        $('#plugins-tabs').append(tab);
        $('#pluginTabContent').append(tabBody);

        categories.push(p.category);


      } // At this point, we deffo have a container to put the plugin in
      //TODO: Add the plugin row itself
      //image name desc
      var pluginItem = this.pluginModalItemTpl.replace(/\{name\}/g, p.name);
      var title = (p.image) ? this.pluginModalImage.replace(/\{image\}/g, p.image) : '<h2>' + p.name +'</h2>';
      pluginItem = pluginItem.replace(/\{desc\}/g, p.desc).replace(/\{title\}/g, title);
      $('#tab-body-' + p.category + ' .row-fluid').append(pluginItem);
    }
    $('#plugins-tabs li:first').addClass('active');
    $('#pluginTabContent div.tab-pane:first').addClass('active');
  },
  getPlugin: function(name){
    for (var i=0; i<this.plugins.length; i++){
      var p = this.plugins[i];
      if (p.name.toLowerCase() === name.toLowerCase()){
        return p;
      }
    }
    return -1;
  },
  onPluginAdd: function(el){

    var self = this,
    pluginName = $(el).attr('data-plugin'),
    // TODO: POST to /plugin, creating a new instance of this plugin.
    // it's config will be returned, along with a unique instance of the plugin specific to this app
    //then, we can...
    plugin = this.getPlugin(pluginName);
    var tpl = this.pluginRowTpl.replace(/\{name\}/g, plugin.name);
    tpl = tpl.replace(/\{desc\}/g, plugin.desc);
    tpl = tpl.replace(/\{id\}/g, ''); // TODO - After POST, we get back this id..
    $('.pluginList tbody').prepend(tpl);
    this.initBindings();
    var pluginsModalEl = $('#pluginsModal');
    pluginsModalEl.on('hidden', function () {
      pluginsModalEl.unbind();
      self.onConfigure(plugin.name);
    });
    pluginsModalEl.modal('hide');
  },
  onPluginCancel: function(){
    $('#plugins-configure').fadeOut('fast', function() {
      $('#plugins-intro').fadeIn('fast');
    });
  },
  onPluginSave: function(){
    var config = $('#plugins-configure form fieldset').serializeArray(); // TODO: Use these as deploy vars or something

    $('#plugins-configure').fadeOut('fast', function() {
      $('#plugins-code').fadeIn('fast');
    });
  },
  onPluginDone: function(){
    $('#plugins-code').fadeOut('fast', function() {
      $('#plugins-intro').fadeIn('fast');
    });

  },
  onConfigure: function(id){
    var fieldset = $('#plugins-configure form fieldset');
    fieldset.empty();

    var plugin = this.getPlugin(id),
    config = plugin.config,
    pluginname = plugin.name.toLowerCase();
    for (var key in config){
      if (config.hasOwnProperty(key)){
        var name = key,
        label = config[key];
        var row = "<label>{label}</label>"+
        '<input name="{name}" type="text" placeholder=""><br />';
        row = row.replace(/\{name\}/g, name).replace(/\{label\}/g, label);
        fieldset.append(row);
      }
    }

    $('#plugins-configure h3').html('Configure ' + id);

    $('#plugins-intro').fadeOut('fast', function(){
      $('#plugins-configure').fadeIn('fast');
    });

    // Add the entries to the package.json template
    var tpl = $('#packageTemplate').html();
    tpl = tpl.replace("{pluginName}", pluginname);
    tpl = tpl.replace("{version}", plugin.version);
    $('#packagejson').html(tpl);

    // Replace the Using string //TODO less nasty
    var h3 = $('#plugins-code h3'),
    h3Replaced = h3.html().replace(/{pluginName}/g, plugin.name); // plugin.name not pluginname as pluginname is .toLowerCase()
    h3.html(h3Replaced);

    // Add the code snippet
    $('.pluginSnippet').hide();
    $('#snippet-' + pluginname).show();
  }
});