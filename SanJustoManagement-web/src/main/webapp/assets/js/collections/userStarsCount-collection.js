define([
    "jquery",
    "underscore",
    "backbone",
    "models/user-model",
    "services/StarMeUpServices"
], function($, _, Backbone, UserModel, smuServices){
    var UserStarsCountCollection = Backbone.Collection.extend({
        defaults: {
            isReady:false
        },

        // specify Base Widget model
        // model: Star
        initialize: function(){

        },
        
        initializeReceiversCollection: function(size){
            smuServices.getLeadersBoard(_.bind(this.fillCollection, this), size);
        },
        
        initializeSendersCollection: function(size){
            smuServices.getSenderLeadersBoard(_.bind(this.fillCollection, this), size);
        },
        
        initializeReceiversCollectionFiltered: function(size, from, to, organizationValueId, locationId){
            smuServices.getLeadersBoardCSV(_.bind(this.fillCollection, this),size, from, to, organizationValueId, locationId);
        },
        
        initializeSendersCollectionFiltered: function(size, from, to, organizationValueId, locationId){
            smuServices.getSenderLeadersBoardCSV(_.bind(this.fillCollection, this),size, from, to, organizationValueId, locationId);
        },
        
        fillCollection: function(result, status, message){
            if (status == "OK") {
                this.isReady = false;
                this.reset();
                if(result && result.length > 0){
                    _.each(result,function(element,index){
                        var user= element[0];
                        var starsCount = element[1];

                        this.add(new UserModel({
                            id: user.id,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            nickname: user.nickname,
                            starsCount: starsCount,
                            seniority: user.seniority,
                            profileImageId: user.profileImageId,
                            email: user.email,
                            job: user.job,
                            office: user.office,
                            phoneNumber: user.phoneNumber,
                            area: user.area,
                            account: user.account,
                            project: user.project,
                            birthDate: user.birthDate,
                            orgEntryDate: user.orgEntryDate,
                            enabled: user.enabled
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
        }
    });

    return UserStarsCountCollection;
  
});