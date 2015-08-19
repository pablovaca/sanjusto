define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone){
    var OrganizationOfficeModel = Backbone.Model.extend({
        defaults: {
            id:null,
            organizationId:null,
            name:'',
            enabled:false
        }
    });

    return OrganizationOfficeModel;
  
});


