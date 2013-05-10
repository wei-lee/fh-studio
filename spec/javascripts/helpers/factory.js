var Factory = {
  app: function() {
    var app = new App.Model.App({
      "apiKey": "5fa09dd5c46724a585f8f99729f8bbcdaf905ca0",
      "keys": {
        "public": "ssh-rsa BAAAB3NzaC1yc2EAAAADA2ABAAABAQCZalZrCFuJGYx9rMTVG5YjHnbkUVYJrwFYWhrTvTaDlNgCy16p3wzJuk6fno1+8hCTv2uQrbaY2CSTAv3MXuQMPbRdq2lrgwBmSYTI9uspjaIqgTB0Lss31ZkNr84AGl/7pLGdFfqN+gSNOkGq9qd3AxozEP0UH6swgdPbXU5LF87ap53VjfIlDZ+fJdukKL4UhjMG6Uqc6A1Ev9N2Z2TcysV+WGoJabkKojjaynrsyum6xqaRICoyNMOdHQk9N6pV4ImFRP0HFX2U3az5gp/tVQRuYodfNvbznvhA9P6su/pk9mJ9yZFUn7n84MNwlyHhCuzScZXO9QL0ZA3pqiGR"
      },
      "scm": {
        "branch": "master",
        "commit": "41e0f0bbd250e1f187fd828f0b65230f478412c4",
        "key": "",
        "type": "EXTERNAL",
        "url": "git@git.feedhenry.com:joebloggs/project-fh-hybrid.git",
        "postReceiveUrl": "https://testing-df.feedhenry.com/box/srv/1.1/pub/app/DfksN0MxIj1y_of2iQ6sTkZ9/refresh"
      },
      "config": {
        "deploy": {
          "policy": {
            "live": "default"
          },
          "url": {
            "dev": "https://testing-df-dfksn7cbqvamm2faj5muzgkn-dev_testing-df.df.dev.e111.feedhenry.net",
            "live": "https://testing-df-dfksn7cbqvamm2faj5muzgkn-live_testing-df.df.live.e111.feedhenry.net"
          }
        },
        "icon": {
          "large": "default",
          "small": "default"
        },
        "notification_email": "joe.bloggs@feedhenry.com",
        "preview": {
          "device": "iphone_4"
        }
      },
      "description": "",
      "domain": "testing-df",
      "email": "joe.bloggs@feedhenry.com",
      "guid": "1fksN7CBQvaMm2FAJ5muzgKN",
      "height": 480,
      "nodejs": "true",
      "title": "FeedHenry HTML5 Hybrid",
      "width": 320,
      "type": "FeedHenry HTML5 Hybrid",
      "icon_class": "icon-html5",
      "build_time": moment().format(),
      "downloads": 3
    });
    return app;
  },

  project: function() {
    var project = new App.Model.Project({
      users: {
        admins: [{
          name: "Joe Drumgoole",
          email: "joe.drumgoole@feedhenry.com"
        }, {
          name: "Joe Bloggs",
          email: "joe.bloggs@feedhenry.com"
        }],
        devs: [{
          name: "Joe Drumgoole",
          email: "joe.drumgoole@feedhenry.com"
        }, {
          name: "Joe Bloggs",
          email: "joe.bloggs@feedhenry.com"
        }],
        end_users: [{
          name: "Joe Bloggs",
          email: "joe.bloggs@feedhenry.com"
        }]
      },
      cloud: [{
        type: "FeedHenry HTML5 Hybrid",
        icon_class: "icon-html5"
      }],
      cloud_code: {
        status_text: "Running",
        status_icon_class: 'icon-ok-sign',
        requests_processed: 561,
        requests_per_minute: 48
      }
    });

    project.get('apps').add(new App.Model.App({
      "apiKey": "5fa09dd5c46724a585f8f99729f8bbcdaf905ca0",
      "keys": {
        "public": "ssh-rsa BAAAB3NzaC1yc2EAAAADA2ABAAABAQCZalZrCFuJGYx9rMTVG5YjHnbkUVYJrwFYWhrTvTaDlNgCy16p3wzJuk6fno1+8hCTv2uQrbaY2CSTAv3MXuQMPbRdq2lrgwBmSYTI9uspjaIqgTB0Lss31ZkNr84AGl/7pLGdFfqN+gSNOkGq9qd3AxozEP0UH6swgdPbXU5LF87ap53VjfIlDZ+fJdukKL4UhjMG6Uqc6A1Ev9N2Z2TcysV+WGoJabkKojjaynrsyum6xqaRICoyNMOdHQk9N6pV4ImFRP0HFX2U3az5gp/tVQRuYodfNvbznvhA9P6su/pk9mJ9yZFUn7n84MNwlyHhCuzScZXO9QL0ZA3pqiGR"
      },
      "scm": {
        "branch": "master",
        "commit": "41e0f0bbd250e1f187fd828f0b65230f478412c4",
        "key": "",
        "type": "EXTERNAL",
        "url": "git@git.feedhenry.com:joebloggs/project-fh-hybrid.git",
        "postReceiveUrl": "https://testing-df.feedhenry.com/box/srv/1.1/pub/app/DfksN0MxIj1y_of2iQ6sTkZ9/refresh"
      },
      "config": {
        "deploy": {
          "policy": {
            "live": "default"
          },
          "url": {
            "dev": "https://testing-df-dfksn7cbqvamm2faj5muzgkn-dev_testing-df.df.dev.e111.feedhenry.net",
            "live": "https://testing-df-dfksn7cbqvamm2faj5muzgkn-live_testing-df.df.live.e111.feedhenry.net"
          }
        },
        "icon": {
          "large": "default",
          "small": "default"
        },
        "notification_email": "joe.bloggs@feedhenry.com",
        "preview": {
          "device": "iphone_4"
        }
      },
      "description": "",
      "domain": "testing-df",
      "email": "joe.bloggs@feedhenry.com",
      "guid": "1fksN7CBQvaMm2FAJ5muzgKN",
      "height": 480,
      "nodejs": "true",
      "title": "FeedHenry HTML5 Hybrid",
      "width": 320,
      "type": "FeedHenry HTML5 Hybrid",
      "icon_class": "icon-html5",
      "build_time": moment().format(),
      "downloads": 3
    }));
    return project;
  }
};