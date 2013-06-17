var Apps = Apps || {};

Apps.Plugins = Apps.Plugins || {};

Apps.Plugins.Controller = Apps.Cloud.Controller.extend({

  model: {
    log: new model.CloudLog()
  },

  views: {
    cloudplugins_container: "#cloudplugins_container"
  },

  container: null,
  templates : {
    pluginPaneTabTpl: '.pluginPaneTabTpl',
    pluginPaneTabBody: '.pluginPaneTabBody',
    pluginPaneImage: '.pluginPaneImage',
    pluginPaneItemTpl: '.pluginPaneItemTpl',
    pluginConfigRow: '.pluginConfigRow',
    packageTemplate: '.packageTemplate',
    pluginsCode : '.pluginsCode',
    pluginToolCode : '.pluginToolCode'
  },
  plugins: [
    {
      name: 'Twilio',
      desc: 'Connects to the Twilio telephony API',
      image: 'twilio.png',
      category: 'Communication',
      version : 'git://github.com/cianclarke/twilio-node.git',
      config : [
        {
          name : 'accountSID',
          desc : 'Twilio account SID',
          varName : 'TWILIO_SID'
        },
        {
          name : 'authToken',
          desc : 'Twilio Auth Token',
          varName : 'TWILIO_AUTH'
        },
        {
          name : 'number',
          desc : 'Your Twilio number you\'ve been assigned',
          varName : 'TWILIO_NUMBER'
        }
      ]
    },
    {
      name: 'Sendgrid',
      desc: 'Connects to the Sendgrid emailer API',
      image: 'sendgrid.png',
      category: 'Communication',
      version : '0.2.5',
      config : [
        {
          name : 'username',
          desc : 'Your SendGrid username',
          varName : 'SENDGRID_USERNAME'

        },
        {
          name : 'password',
          desc : 'Your SendGrid password',
          varName : 'SENDGRID_PASSWORD',
          field : 'password'
        },
        {
          name : 'from',
          desc : 'From email address',
          varName : 'SENDGRID_FROM'
        },
        {

          name : 'fromName',
          desc : 'From descriptive name',
          varName : 'SENDGRID_FROMNAME'
        }
      ]
    },
    {
      name: 'Amazon S3',
      desc: 'Connector to S3 bucket storage',
      image: 's3.png',
      category: 'Storage',
      npmName : 'knox',
      version : '0.5.2',
      config : [
        {
          name : 'key',
          desc : 'Your S3 key',
          varName : 'S3_KEY'
        },
        {
          name : 'secret',
          desc : 'Your S3 secret',
          varName : 'S3_SECRET',
          field : 'password'
        },
        {
          name : 'bucket',
          desc : 'Your S3 bucket name',
          varName : 'S3_BUCKET'
        }
      ]
    },
    {
      name: 'OpenStack',
      desc: 'Connect to any OpenStack data storage platform',
      image: 'openstack.png',
      version : '0.1.0',
      npmName : 'openstack-storage',
      category: 'Storage',
      config : [
        {
          name : 'instanceUrl',
          desc : 'Your OpenStack instance URL - e.g. storage.openstack.com',
          varName : 'OPENSTACK_INSTANCE'
        },
        {
          name : 'apiKey',
          desc : 'API Key',
          varName : 'OPENSTACK_APIKEY'
        }
      ]
    },
    {
      name: 'Rackspace',
      desc: 'Rackspace Cloud Open Stack storage provider',
      image: 'rackspace.png',
      category: 'Storage',
      version : '0.1.0',
      npmName : 'openstack-storage',
      config : [
        {
          name : 'instanceUrl',
          desc : 'Your OpenStack instance URL - e.g. storage.openstack.com',
          varName : 'OPENSTACK_INSTANCE'
        },
        {
          name : 'apiKey',
          desc : 'API Key',
          varName : 'OPENSTACK_APIKEY'
        }
      ]
    },
    {
      name: 'MongoDB',
      desc: 'Connector to MongoDB Database',
      image: 'mongodb.png',
      category: 'DB',
      version : '~1.3.9',
      config : [
        {
          name : 'hostname',
          desc : 'Your MongoDB hostname',
          varName : 'MONGODB_HOSTNAME'
        },
        {
          name : 'username',
          desc : 'Your MongoDB Username',
          varName : 'MONGODB_USER'
        },
        {
          name : 'password',
          desc : 'Your MongoDB Password',
          varName : 'MONGODB_PASSWORD',
          field : 'password'
        },
        {
          name : 'port',
          desc : 'Your MongoDB Port Number',
          varName : 'MONGODB_PORT',
          field : 'number'
        }
      ]
    },
    {
      name: 'Oracle 11g',
      desc: 'Connector to an Oracle database',
      image: 'oracle.png',
      category: 'DB',
      version : '~0.3.1',
      config : [
        {
          name : 'hostname',
          desc : 'Your Oracle 11g hostname',
          varName : 'ORACLE_HOSTNAME'
        },
        {
          name : 'database',
          desc : 'The Oracle 11g database you want to connect to',
          varName : 'ORACLE_DATABASE'
        },
        {
          name : 'username',
          desc : 'Your Oracle 11g Username',
          varName : 'ORACLE_USER'
        },
        {
          name : 'password',
          desc : 'Your Oracle 11g Password',
          varName : 'ORACLE_PASSWORD',
          field : 'password'
        },
        {
          name : 'port',
          desc : 'Your Oracle 11g Port Number',
          varName : 'ORACLE_PORT',
          field : 'number'
        }
      ]
    },
    {
    name: 'Salesforce',
    desc: 'Connects to the SalesForce CRM Api',
    image: 'salesforce.png',
    category: 'APIs',
    version : '0.5.1',
    npmName : 'node-salesforce',
    config : [
      {
        name : 'instanceURL',
        desc : 'Your salesforce instance URL - e.g. http://na1.salesforce.com',
        varName : 'SALESFORCE_INSTANCE_URL'
      },
      {
        name : 'username',
        desc : 'Your salesforce.com login',
        varName : 'SALESFORCE_USERNAME'
      },
      {
        name : 'password',
        desc : 'Your salesforce.com password',
        varName : 'SALESFORCE_PASSWORD'
      }
    ]
  },
    {
      name: 'Twitter',
      desc: 'Connects to the Twitter social network',
      image: 'twitter.png',
      category: 'Social',
      config : [
        {
          name : 'username',
          desc : 'Your twitter username',
          varName : 'TWITTER_USERNAME'
        }
      ]
    },
    {
      name: 'Facebook',
      desc: 'Facebook OAuth connector',
      image: 'facebook.png',
      category: 'Social',
      config : [
        {
          name : 'apiKey',
          desc : 'Your facebook API key - you can find this in...',
          varName : ''
        },
        {
          name : 'OAuthToekn',
          desc : 'OAuth token - you can',
          varName : ''
        }
      ]
    },
    {
      name: 'Request',
      desc: 'The de facto standard for doing all HTTP requests in Node.js - recommended over using the HTTP module standalone.',
      category: 'Tools',
      version : '2.11.4',
      docs : 'https://github.com/mikeal/request'
    },
    {
      name: 'Async',
      desc: 'Callback hell? Async helps you overcome this',
      category: 'Tools',
      version : '0.2.5',
      docs : 'https://github.com/caolan/async'
    }

  ], // TODO: Ajax these in..

  init: function () {
    this._super();
    this.initFn = _.once(this.initBindings);
    this.compileTemplates();
    this.renderPluginsPane();
    this.container = this.views.cloudplugins_container;

  },

  /*
   * Initialise any UI components required for logging.
   * Once-off initialisation
   */
  initBindings: function () {
    var self = this;
    $('a.addButton').unbind().on('click', function(){
      var el = this;
      self.onPluginAdd.apply(self, [el]);
    });
    $('#plugins-cancel').unbind().on('click', self.onPluginCancel);

    // Setup the slider events on the carousel
    $('.carousel.plugin-carousel').carousel({
      interval: false, pause : false
    });

    $('#pluginTabContent .plugin').on('hover', function(){
      var self = this;
      $(this).find('.carousel').carousel(1);
    });
    $('#pluginTabContent .plugin').on('mouseleave', function(){
      $(this).find('.carousel').carousel(0);
    });


  },

  show: function(){
    var self = this;
    this._super(this.views.cloudplugins_container);
    this.initFn();
    this.hide();
    this.container = this.views.cloudplugins_container;
    $(this.container).show();
  },
  /*
   Renders a grid of plugins on the front plugins screen from this.plugins
   First builds the categories from every tab seen, then creates tab pane bodies
   */
  renderPluginsPane: function(){
    var categories = [];
    for (var i=0; i<this.plugins.length; i++){
      var p = this.plugins[i];
      if (categories.indexOf(p.category)===-1){
        // Add the top tab, and the container for this categories tab body


        var tab = $(this.templates.$pluginPaneTabTpl(p)),
        tabBody = this.templates.$pluginPaneTabBody(p);
        $('#plugins-tabs').append(tab);
        $('#pluginTabContent').append(tabBody);

        categories.push(p.category);


      }
      // At this point, we deffo have a container to put the plugin in

      // Setup the version so it's blank if git backed, or else "v 1.0" style
      p.versionLabel = (!p.version || p.version === "" || p.version.indexOf("git")>-1) ? "Custom version" : "v" + p.version;
      p.title = (p.image) ? this.templates.$pluginPaneImage(p) : '<h2>' + p.name +'</h2>';
      var pluginItem = this.templates.$pluginPaneItemTpl(p);

      $('#tab-body-' + p.category + ' .row-fluid').append(pluginItem);
    }
    $('#plugins-tabs li:first').addClass('active');
    $('#pluginTabContent div.tab-pane:first').addClass('active');
  },
  /*
    Get the config of a plugin from this.plugins by name
   */
  getPlugin: function(name){
    for (var i=0; i<this.plugins.length; i++){
      var p = this.plugins[i];
      if (p.name.toLowerCase() === name.toLowerCase()){
        return p;
      }
    }
    return -1;
  },
  onPluginCancel: function(){
    $('#plugins-configure').fadeOut('fast', function() {
      $('#plugins-intro').fadeIn('fast');
    });
  },
  onPluginSave: function(el, name){
    var self = this,
    plugin = this.getPlugin(name),
    formValues = this.getConfigFormValues();

    if (plugin.config){
      // Instruct which env. variables to add
      $('#plugin-env-variables').show();
      _.each(plugin.config, function(f){
        var value = formValues[f.varName];
        $('#plugin-env-variables').append(f.varName + " : " + value + "<br />");
      });
    }


    for (var i=0; plugin.config && i<plugin.config.length; i++){
      var configEntry = plugin.config[i],
      envVar = configEntry.varName,
      envVal = formValues[configEntry.name];
      console.log(envVar + " : " + envVal);
    }
    //TODO: Post the env variables to the server
    //$fw.data.get('inst').guid;


    $('#plugins-configure').fadeOut('fast', function() {
      $('#plugins-code').fadeIn('fast');
    });
  },
  onPluginDone: function(){
    $('#plugins-code').fadeOut('fast', function() {
      $('#plugins-intro').fadeIn('fast');
    });

  },
  /*
   After adding a plugin, draw the config screen
   @param el : The add button clicked
   */
  onPluginAdd: function(el){
    var self = this,
    pluginName = $(el).attr('data-plugin'),
    plugin = this.getPlugin(pluginName),
    config = plugin.config,
    pluginname = plugin.name.toLowerCase().replace(" ", ""),
    fieldset = $('#plugins-configure form fieldset');

    // Optionally override the package name that it's published under in NPM
    plugin.npmName = plugin.npmName || pluginname;


    // For tools, skip the middle page straight to the code
    if (!plugin.config){
      $('#plugins-intro').fadeOut('fast');
      this.setupGiveMeTheCodePage(plugin);
      $('#plugin-env-variables').hide(); // No ENV Variables for tools
      return self.onPluginSave.apply(self, [this, pluginname]);
    }



    /*
      Setup the plugin configuration page
     */

    // Clear out any previous plugin's form configure content
    fieldset.empty();

    for (var i=0; plugin.config && i<plugin.config.length; i++){
      var field = plugin.config[i];
      field.type = field.field || 'text';

      var row = this.templates.$pluginConfigRow(field);
      fieldset.append(row);
    }

    // Setup the H3 and image on the configure page, and the image on the code page
    $('#plugins-configure h3').html('Configure ' + plugin.name);
    $('#plugins-configure img.pluginConfigureImage').attr('src', '/studio/static/themes/default/img/cloud_plugins/' + plugin.image);


    this.setupGiveMeTheCodePage(plugin);

    // Transition pages
    $('#plugins-intro').fadeOut('fast', function(){
      $('#plugins-configure').fadeIn('fast');
    });

    // Bind the save event
    $('#plugins-save').unbind().on('click', function(){
      self.onPluginSave.apply(self, [this, pluginname]);
    });

  },
  /*
   Setup the following 'give me the code' page
   */
  setupGiveMeTheCodePage : function(plugin){
    var self = this,
    pluginname = plugin.name.toLowerCase().replace(" ", ""),
    packageJsonTpl = this.templates.$packageTemplate(plugin);

    // Add the entries to the package.json template on the following page
    plugin.packageJsonString = packageJsonTpl;
    plugin.envVariablesString = "";

    var tpl = (!plugin.config || plugin.category.toLowerCase() === "tools") ? this.templates.$pluginToolCode(plugin) : this.templates.$pluginsCode(plugin);
    $('#plugins-code').html(tpl);

    // Add the code snippet
    $('.pluginSnippet').hide();
    $('#snippet-' + pluginname).show();

    // Bind the done event
    $('.plugins-done').unbind().on('click', function(){
      self.onPluginDone.apply(self, this);
    });
  },
  getConfigFormValues : function(){
    var fields = $('#plugins-configure form fieldset').serializeArray(),
      obj = {};
    for (var i=0; i<fields.length; i++){
      var f = fields[i];
      obj[f.name] = f.value;
    }
    return obj;
  },
  /**
   compile all templates
   */
  compileTemplates: function() {

    for (var key in this.templates){
      if (this.templates.hasOwnProperty(key)){
        var tpl = this.templates[key],
        compiled = _.template($(tpl, this.$container).html());
        // Compiled templates get added to same prop with a $ infront
        this.templates['$' + key] = compiled;
      }
    }
  }
});