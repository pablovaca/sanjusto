define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone){
    var UserPreferencesModel = Backbone.Model.extend({
        defaults: {
        	id: null,
        	user: null,
        	facebookAccount: '',
        	googlePlusAccount: '',
        	twitterAccount: ''
        }
    });

    return UserPreferencesModel;
  
});

