define([
    "jquery",
    "underscore",
    "backbone",
    "models/user-model",
    "services/APIServices"
], function($, _, Backbone,UserModel, api){
    var Users = Backbone.Collection.extend({
        defaults: {
            isReady:false
        },

        initialize: function(){
            api.getAllUsers(_.bind(this.fillCollection, this));
        },

        fillCollection: function(result, status, message){
            if (status == "OK") {
                if(result && result.length > 0){
                    _.each(result,function(element){
                        this.add(this.initializeUserModel(element));
                    }, this);
                }
                this.isReady = true;
                this.trigger('ready');
            } else if (message=="NO_RIGHTS") {
                Backbone.trigger('NO_RIGHTS');
            } else {
                console.log(message);
            }
        },

        initializeUserModel: function(user){
            return new UserModel({
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                username: user.username,
                fullName: user.lastName + ", " + user.firstName
            });
        }
    });

    return Users;

});