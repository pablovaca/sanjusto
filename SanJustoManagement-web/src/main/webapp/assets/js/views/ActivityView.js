/*global define*/
define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/activity-feed-item-template.html',
    'config',
    'models/activity-model',
    'text!templates/likes-template.html',
    'services/StarMeUpServices'
], function ($, _, Backbone, activityTemplate, Config, ActivityModel, likesTemplate, smuServices) {
    Config.setUp();

    var ActivityView = Backbone.View.extend({
        className : 'row',
        template : _.template(activityTemplate),
        modalTemplate : _.template(likesTemplate),
        activity : {},
        currentUser : {},
        connectedUser :{},
        selectedComment : {},
        textColor:{},
        isAdmin:false,
        lastCommentDate:null,
        additionalInfo:{},

        initialize : function(activity,user,connectedUser,isAdmin,additionalInfo) {
            this.currentUser = user;
            this.connectedUser = connectedUser;
            this.isAdmin = isAdmin;
            this.activity = activity;
            this.activity.likes = 0;
            this.activity.likeGiven = false;
            this.activity.linkLike = true;
            this.activity.likeGivenId = 0;
            this.activity.lineToShow = 0;
            this.countLikes(activity.comments);
            this.countComments(activity.comments);
            this.fullNotes = false;
            this.additionalInfo = additionalInfo;
        },

        events : {
            'click .js-add-like': 'addLike',
            'click .js-add-unlike': 'removeLike',
            'keypress .js-comment-text': 'addComment',
            'click .js-more-comments': 'viewMoreComments',
            'click .js-show-star' : 'showActivity',
            'click .js-hide-star' : 'hideActivity',
            'click .js-more-notes' : 'viewFullNotes',
            'click .js-less-notes' : 'viewSmallNotes',
            'click .js-hide-comment' : 'hideComment',
            'click .js-show-comment' : 'showComment',
            'show.bs.modal .js-likesModal' : 'showLikes'
        },

        render : function() {
            this.activity.from.profileImageId = smuServices.getProfileImage(this.activity.from.profileImageId);
            this.activity.to.profileImageId = smuServices.getProfileImage(this.activity.to.profileImageId);

            _.each(this.activity.comments, function (comment) {
                comment.user.profileImageId = smuServices.getProfileImage(comment.user.profileImageId);
                if(comment.comments && comment.comments.length > 0){
                    comment.comments = comment.comments.replace(/(?:\r\n|\r|\n)/g, '<br/>');
                }
            },this);

            if(this.activity.notes && this.activity.notes.length > 0){
                this.activity.notes = this.activity.notes.replace(/(?:\r\n|\r|\n)/g, '<br/>');
            }
            if (!this.activity.enabled) {
                this.textColor = 'color:#c1c1c1;';
            }

            var tweeterMaxLength = 119;
            var twitterShareText = this.adjustTextByMaxLength(Math.floor((tweeterMaxLength - 19) / 3),this.activity.from.firstName + ' ' + this.activity.from.lastName) + ' sent a ' + this.adjustTextByMaxLength(Math.floor((tweeterMaxLength - 19) / 3),this.activity.star.name) + ' star to ' + this.adjustTextByMaxLength(Math.floor((tweeterMaxLength - 19) / 3),this.activity.to.firstName + ' ' + this.activity.to.lastName);

            if(this.activity.from.id === this.connectedUser.id){
                twitterShareText = 'I gave ' + this.adjustTextByMaxLength(Math.floor((tweeterMaxLength - 28) / 2),this.activity.to.firstName + ' ' + this.activity.to.lastName) + ' a ' + this.adjustTextByMaxLength(Math.floor((tweeterMaxLength - 28) / 2),this.activity.star.name) + ' star, way to go!';
            }
            if(this.activity.to.id === this.connectedUser.id){
                twitterShareText = this.adjustTextByMaxLength(Math.floor((tweeterMaxLength - 21) / 2),this.activity.from.firstName + ' ' + this.activity.from.lastName) + ' awarded me a ' + this.adjustTextByMaxLength(Math.floor((tweeterMaxLength - 21) / 2),this.activity.star.name) + ' star!';
            }

            var model = {
                activity : this.activity,
                isAdmin : this.isAdmin,
                privateMode : this.additionalInfo.organization.privateModeEnabled,
                twitterShareText : twitterShareText
            };

            this.$el.html(this.template({
                model : model
            }));

            this.$el.find('.js-img-activity').on('click', _.bind(this.selectedUser, this));
            $(this.$el).i18n($.i18n.options);
        },

        adjustTextByMaxLength : function(maxLength, text){
            if(text != null){
                text = $.trim(text);
                if(text.length > maxLength){
                    text = $.trim(text.substring(0, maxLength));
                    text = $.trim(text.substring(0, maxLength - 3)) + '...';
                }
            }
            return text;
        },

        viewMoreComments : function(evt) {
            evt.preventDefault();
            smuServices.getOneActivityFeed(_.bind(this.callBackMoreComments,this),this.activity.id);
        },

        viewFullNotes : function(evt) {
            evt.preventDefault();
            this.fullNotes = true;
            this.activity.fullNotes = this.fullNotes;
            this.activity.notesCharsView = this.activity.notes.length;
            this.activity.notesLinesView = this.activity.notes.split('<br/>').length;
            this.render();
        },

        viewSmallNotes : function(evt) {
            evt.preventDefault();
            this.fullNotes = false;
            this.activity.fullNotes = this.fullNotes;
            this.activity.notesCharsView = 140;
            this.activity.notesLinesView = 1;
            this.render();
        },

        addComment : function(evt) {
            if(evt.which!==13){
                return;
            }

            evt.preventDefault();

            var comparissonDate = new Date();
            comparissonDate.setSeconds(comparissonDate.getSeconds() - 2);

            if(this.lastCommentDate == null || this.lastCommentDate < comparissonDate)
            {
                this.lastCommentDate = new Date();

                var texto = $("#comment-"+this.activity.id).val().trim();

                if(texto.length > 0){
                    smuServices.addComment(_.bind(this.callBackAdd,this),this.activity.id,texto);
                }
            }
        },

        addLike : function(evt) {
            evt.preventDefault();
            if (this.activity.linkLike) {
                this.activity.linkLike = false;
                smuServices.addLike(_.bind(this.callBackAddLike,this),this.activity.id);
            }
        },

        removeLike : function(evt) {
            evt.preventDefault();
            if (!this.activity.linkLike) {
                this.activity.linkLike = true;
                smuServices.removeLike(_.bind(this.callBackRemoveLike,this),this.activity.likeGivenId);
            }
        },

        showActivity : function(evt) {
            evt.preventDefault();
            smuServices.showActivity(_.bind(this.callBackAdd,this),this.activity.id);
        },

        hideActivity : function(evt) {
            evt.preventDefault();
            smuServices.hideActivity(_.bind(this.callBackAdd,this),this.activity.id);
        },

        hideComment : function(evt) {
            evt.preventDefault();
            var id=$(evt.target).data('id');
            smuServices.hideComment(_.bind(this.callBackAdd,this),id);
        },

        showComment : function(evt) {
            evt.preventDefault();
            var id=$(evt.target).data('id');
            smuServices.showComment(_.bind(this.callBackAdd,this),id);
        },

        callBackAddLike : function(result,status,message) {
            if (status === "OK") {
                smuServices.getOneActivityFeed(_.bind(this.callBackStar,this),this.activity.id);
            } else {
                this.activity.linkLike = true;
                if (message === "NO_RIGHTS") {
                    Backbone.trigger('NO_RIGHTS');
                }
            }
        },

        callBackRemoveLike : function(result,status,message) {
            if (status === "OK") {
                smuServices.getOneActivityFeed(_.bind(this.callBackStar,this),this.activity.id);
            } else {
                this.activity.linkLike = false;
                if (message === "NO_RIGHTS") {
                    Backbone.trigger('NO_RIGHTS');
                }
            }
        },

        callBackAdd : function(result,status,message) {
            if (status === "OK") {
                smuServices.getOneActivityFeed(_.bind(this.callBackStar,this),this.activity.id);
            } else {
                if (message === "NO_RIGHTS") {
                    Backbone.trigger('NO_RIGHTS');
                }
            }
        },

        callBackMoreComments : function(result,status,message) {
            if (status === "OK") {
                if(result.starMeUpOrganizationStar != null){
                    result.starMeUpOrganizationStar.imageUrl = smuServices.getStarImage(result.starMeUpOrganizationStar.imageId);
                }
                var model = new ActivityModel({
                    id: result.id,
                    from: result.from,
                    to: result.to,
                    star: result.starMeUpOrganizationStar,
                    date: result.date,
                    lastUpdate: result.lastUpdate,
                    comments: result.comments,
                    notes: result.notes,
                    enabled:result.enabled
                });
                this.activity = model.toJSON();
                this.activity.likes = 0;
                this.countLikes(result.comments);
                this.activity.lineToShow = 0;
                this.activity.fullNotes = this.fullNotes;
                this.activity.notesCharsView = 140;
                this.activity.notesLinesView = 1;

                this.render();
            } else if (message === "NO_RIGHTS") {
                Backbone.trigger('NO_RIGHTS');
            } else {
                console.log(message);
            }
        },

        callBackStar : function(result,status,message) {
            if (status === "OK") {
                if(result.starMeUpOrganizationStar != null){
                    result.starMeUpOrganizationStar.imageUrl = smuServices.getStarImage(result.starMeUpOrganizationStar.imageId);
                }
                var model = new ActivityModel({
                    id: result.id,
                    from: result.from,
                    to: result.to,
                    star: result.starMeUpOrganizationStar,
                    date: result.date,
                    lastUpdate: result.lastUpdate,
                    comments: result.comments,
                    notes: result.notes,
                    enabled:result.enabled
                });
                this.activity = model.toJSON();
                this.activity.likes = 0;
                this.activity.lineToShow = 0;
                this.countLikes(result.comments);
                this.countComments(result.comments);
                this.activity.fullNotes = this.fullNotes;
                this.activity.notesCharsView = 140;
                this.activity.notesLinesView = 1;
                this.render();
            } else if (message === "NO_RIGHTS") {
                Backbone.trigger('NO_RIGHTS');
            } else {
                console.log(message);
            }
        },

        countLikes : function(comments) {
            this.activity.linkLike = true;
            _.each(comments, function (comment) {
                if (comment.type === "LIKE") {
                    this.activity.likes++;
                    if (comment.user.id === this.connectedUser.id) {
                        this.activity.likeGiven = true;
                        this.activity.linkLike = false;
                        this.activity.likeGivenId = comment.id;
                    }
                }
            },this);
        },

        countComments : function(comments) {
            var counter = 0;
            _.each(comments, function (comment) {
                if (comment.type === "COMMENT" && (comment.enabled || this.isAdmin)) {
                    counter++;
                }
            },this);
            if (counter > 2) {
                this.activity.lineToShow = counter - 2;
            }
        },

        showLikes : function(evt){
            evt.preventDefault;
            if(evt.relatedTarget == null){
                return;
            }

            var usersLikes = [];
                _.each(this.activity.comments,function(comment){
                    if (comment.type === "LIKE") {
                        usersLikes.push(comment.user);
                        }
            }, this);

             var modalModel={
                usersLikes : usersLikes
             };

             $('#likesModalContent-'+this.activity.id).html(this.modalTemplate({
                smodel : modalModel
            }));

             $('#likesModalContent-'+this.activity.id).find('.js-img-activity').on('click',
                _.bind(this.selectedUser, this));
        },

        selectedUser : function(event) {
            var selectedUser = {};
            var selectedId = $(event.target).data('id');

            if(selectedId == null || selectedId){
                selectedId = $(event.target).parent().data('id');
            }
            if(this.activity.from.id === selectedId){
                selectedUser = this.activity.from;
            }
            else if(this.activity.to.id === selectedId){
                selectedUser = this.activity.to;
            }
            else{
                _.each(this.activity.comments, function (comment) {
                    if (comment.type === "COMMENT") {
                        if (comment.user.id === selectedId) {
                            selectedUser = comment.user;
                            return;
                        }
                    }
                },this);
            }
            $("body").removeClass("modal-open");
            this.trigger('userSelection', selectedUser);
        }
    });
    return ActivityView;
});