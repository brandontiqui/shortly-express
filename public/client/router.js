Shortly.Router = Backbone.Router.extend({
  initialize: function(options) {
    this.$el = options.el;
  },

  routes: {
    '': 'index',
    'create': 'create',
    'login': 'login'
  },

  swapView: function(view) {
    this.$el.html(view.render().el);
  },

  index: function() {
    //create new collection of links
    var links = new Shortly.Links();
    //make page for all the links in collection
    var linksView = new Shortly.LinksView({ collection: links });
    //show new page
    this.swapView(linksView);
  },

  create: function() {
    //upon submit new link, show new link.
    this.swapView(new Shortly.createLinkView());
  }
});
