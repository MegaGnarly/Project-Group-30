Handlebars.registerHelper('thresholdChecker', function(num, options) {
    if(num < 4.0 || num > 7.8) {
      return options.fn(this);
    }
    return options.inverse(this);
  });