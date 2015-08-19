define([
    "jquery",
    "underscore",
    "backbone",
    "models/user-model",
    "services/StarMeUpServices"
], function($, _, Backbone, UserModel, smuServices){
    var UserCollection = Backbone.Collection.extend({
        defaults: {
            isReady:false
        },

        initialize: function(){
            smuServices.getUsersToGiveStar(_.bind(this.fillCollection, this), true);
        },

        fillCollection: function(result, status, message){
            if (status = "OK") {
                if(result && result.length > 0){
                    _.each(result,function(element,index){
                        this.add(new UserModel({
                            id: element.id,
                            firstName: element.firstName,
                            lastName: element.lastName,
                            nickname: element.nickname,
                            seniority: element.seniority,
                            profileImageId: element.profileImageId,
                            email: element.email,
                            job: element.job,
                            office: element.office,
                            phoneNumber: element.phoneNumber,
                            area: element.area,
                            account: element.account,
                            project: element.project,
                            birthDate: element.birthDate,
                            orgEntryDate: element.orgEntryDate,
                            enabled: element.enabled,
                            profileImage : smuServices.getProfileImage(element.profileImageId)
                        }))
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

        getMockedOrganizationUsers: function(){
            return [{id:1, firstName:'Facundo', nickname:'fanky10'},{id:2, firstName:'David'},{id:3, firstName:'Pablo'}];
        }
    });
      
    return UserCollection;
});