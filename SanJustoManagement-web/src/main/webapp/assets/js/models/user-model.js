define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone){
    var UserModel = Backbone.Model.extend({
        defaults: {
            id:null,
            firstName: '',
            lastName: '',
            nickname: '',
            profileImageId: '',
            starsCount: 0,
            seniority: null,
            job: null,
            office: null,
            phoneNumber: null
        }
    });

    return UserModel;
  
});


