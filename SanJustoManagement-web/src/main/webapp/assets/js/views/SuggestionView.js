/*global define*/
define(
        ["jquery", "underscore", "backbone",
                "views/GiveStarPanelView",
                "text!templates/suggestion-template.html",
                "config",
                "services/StarMeUpServices"],
        function ($, _, Backbone, GivenStarPanelView, suggestionTemplate, Config, smuServices) {
            "use strict";

            Config.setUp();

            var SuggestionView = Backbone.View.extend({
                        el : '#app',
                        className : 'row',
                        template : _.template(suggestionTemplate),
                        suggestedUsers : {},
                        UserCollection: {},
                        givenStarPanelView : {},
                        currentUser : {},
                        currentLoggedUser : {},
                        remainingStars : 0,
                        renderSuggestions : false,
                        organizationValues : {},
                        initialize : function (container, currentLoggedUser, remainingStars, organizationValues) {
                            this.$main = this.$('#' + container);
                            this.currentLoggedUser = currentLoggedUser;
                            this.remainingStars = remainingStars;
                            this.organizationValues = organizationValues;
                            if(remainingStars > 0){
                                smuServices.getSuggestedUsers(_.bind(this.callBackSuggestions, this));
                            } else {
                                this.render();
                            }
                        },

                        render : function () {
                            if(!this.renderSuggestions){
                                var model ={suggestedUsers : null};
                                this.$main.html(this.template({model : model}));
                            } else {
                                var model = {
                                    suggestedUsers : this.suggestedUsers
                                };
                                this.$main.html(this.template({
                                    model : model
                                }));
                                this.$main.find('.img-circle').on('click',_.bind(this.selectedUser, this));
                                this.$main.find('.js-giveStarFromSuggestion').on('click', _.bind(this.giveStarFromSuggestions, this));
                                this.renderGivenStarPanel();
                                $(this.$main).i18n($.i18n.options);
                            }
                        },

                        callBackSuggestions : function (result,status,message){
                            if(status == 'OK'){
                                if(result != null){
                                    _.each(result, function(element,index){
                                        element.profileImageId = smuServices.getProfileImage(element.profileImageId);
                                    });
                                    this.suggestedUsers = {element:result};
                                    this.renderSuggestions = true;
                                    this.render();
                                }
                            } else if (message=="NO_RIGHTS") {
                                Backbone.trigger('NO_RIGHTS');
                            } else {
                                console.log(message);
                            }
                        },

                        selectedUser : function (event) {
                            var selectedUser = {};
                            var selectedId = $(event.target).data('id');

                            if(selectedId == null){
                                selectedId = $(event.target).parent().data('id');
                            }

                            smuServices.locateUserById(_.bind(this.callBackSelectedUser, this),selectedId);
                        },

                        callBackSelectedUser : function(result,status,message) {
                            if(status == 'OK'){
                                if(result != null){
                                    this.trigger('userSelection', result);
                                }
                            } else if (message=="NO_RIGHTS") {
                                Backbone.trigger('NO_RIGHTS');
                            } else {
                                console.log(message);
                            }
                        },

                        renderGivenStarPanel : function(){
                            this.givenStarPanelView = new GivenStarPanelView('giveStarFromSuggestion', this.currentLoggedUser, true, this.remainingStars, this.organizationValues);
                            this.givenStarPanelView.on('starGivenEvent', this.starGiven, this);
                            this.givenStarPanelView.render();
                        },

                        starGiven : function(){
                            this.trigger('starGiven');
                        },

                        giveStarFromSuggestions : function (event){
                            var selectedUser = {};
                            var selectedId = $(event.target).data('id');

                            if(selectedId == null){
                                selectedId = $(event.target).parent().data('id');
                            }

                            var users = this.suggestedUsers;

                            _.each(users.element, function(opt) {
                                if (opt.id == selectedId) {
                                    selectedUser = opt;
                                }
                            });

                            this.givenStarPanelView.showModalWithUser(selectedUser);
                        }
                    });

            return SuggestionView;
        });