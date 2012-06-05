Properties = {
  logging_enabled: true,
  logging: {
    'DEBUG': true,
    'ERROR': true,
    'WARNING': true,
    'TRACKING_EVENT': true,
    'SCRIPT': true
  },
  editor_indent_amount: 2,
  cache_lookup_interval: 600,
  cache_lookup_timeout: 120000, // 2 minutes
  cache_lookup_retries: 5,
  
  click_throttle_timeout: 1000 // how long to wait for click events before firing again
};