var AccessDeniedView = Backbone.View.extend({
   className: 'row',
   template: '',
   initialize : function () {
       this.render();
   },
   
   render: function () {
       console.log(this.model);
       this.template = _.template($("#DeniedAccess").html());
       this.$el.html(this.template({model:this.model}));

       return this;
   }
});