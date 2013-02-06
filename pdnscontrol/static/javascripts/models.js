//// Models

App.Store = DS.Store.extend({
  revision: 11,
  adapter: DS.RESTAdapter.create({
    namespace: 'api'
  })
});

App.Server = DS.Model.extend({
  primaryKey: 'name',
  name: DS.attr('string'),
  kind: DS.attr('string'),
  stats_url: DS.attr('string'),
  manager_url: DS.attr('string'),

  flush_cache: function() {
    console.log('flushing cache of ', this, this.get('name'));
  },

  graphite_name: function() {
    var suffix = Config.graphite_suffixes[this.get('kind')];
    return 'pdns.'+this.get('name').replace(/\./gm,'-')+'.'+suffix;
  },

  get_stats: function(from, cb) {
    var metric = {'Authoritative': 'udp-queries', 'Recursor': 'questions'}[this.get('kind')];

    $.ajax({
      dataType: 'jsonp',
      jsonp: 'jsonp',
      url: Config.graphite_server,
      data: {
        format: 'json',
        areaMode: 'first',
        from: from,
        target: 'nonNegativeDerivative(' + this.get('graphite_name') + '.' + metric + ')'
      },
      success: function(data) {
        cb(data[0]);
      }
    });
  }

});
