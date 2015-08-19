/*global define*/
define([ 
    'jquery',
    'underscore',
    'backbone',
    'text!templates/giveStarPanel-template.html',
    'text!templates/giveStarModal-template.html',
    'text!templates/giveStarToggle-template.html',
    'text!templates/modal-template.html',
    'text!templates/searchSkills-template.html',
    'text!templates/searchUsers-template.html',
    'config',
    'collections/star-collection',
    'services/StarMeUpServices',
    'typeahead'
    ], function($, _, Backbone, giveStarPanelTemplate, giveStarModalTemplate, giveStarToggleTemplate, modalTemplate, searchSkillsTemplate, searchUsersTemplate, Config, StarsCollection, smuServices) {
    'use strict';

    Config.setUp();

    var GiveStarView = Backbone.View.extend({
        el : '#app',
        className : 'row',
        template : _.template(giveStarPanelTemplate),
        modalTemplate : _.template(modalTemplate),
        modalContentTemplate : _.template(giveStarModalTemplate),
        toggleTemplate : _.template(giveStarToggleTemplate),
        searchTemplate : _.template(searchUsersTemplate),
        searchTalentTemplate : _.template(searchSkillsTemplate),
        starsCollection : {},
        selectedStar : {},
        selectedUser : {},
        selectedSkill : {},
        typeaheadCallback : {},
        currentUser : {},
        remainingStars : 0,
        onlyModal : false,
        skillStar : false,
        starInProcess : false,
        talentModule : false,
        orgVal : 0,

        initialize : function(container, currentUser, onlyModal, remainingStars, organizationValues) {
            this.$main = this.$('#' + container);
            this.$modal = this.$('#genericModalContainer');
            this.currentUser = currentUser;
            this.starsCollection = new StarsCollection(null, organizationValues);
            this.onlyModal = onlyModal;
            this.listenTo(this.starsCollection, 'ready', _.bind(this.render,this));
            this.remainingStars = remainingStars;
            this.talentModule = smuServices.isTalentModuleEnabled();
            this.orgVal = organizationValues.length;
        },
        events : {
            'click #toggleChangeStar .js-starInToggle': 'starSelectedInToggle',
            'click #toggleChangeStar .js-skillInToggle': 'switchToSkillsModal',
            'typeahead:selected #usertoGiveStar': 'userIsSelected',
            'typeahead:selected #skillToGiveStar': 'skillIsSelected',
            'click #backToCore' : 'backToCore'
        },
        render : function() {
            if (!(this.starsCollection.isReady)) {
                return;
            }

            if(!this.onlyModal){
                var category ="";

                if(this.talentModule){
                    this.orgVal+=1;
                }

                if(this.orgVal >= 10 ){
                    category ="li-5";
                } else if(this.orgVal === 7){
                    category ="li-7";
                } else if(this.orgVal > 7 || this.starsCollection < 10){
                    category ="li-8";
                }

                var model = {
                        stars : this.starsCollection.toJSON(),
                        remainingStars : this.remainingStars,
                        talentModule : this.talentModule,
                        category : category
                };

                this.$main.html(this.template({
                    model : model
                }));

                this.$main.find('.js-star').on('click',_.bind(this.starSelected,this));
                this.$main.find('.js-skill').on('click',_.bind(this.skillSelected,this));
            }
            else{
                this.$main.find('#mainStarPanel').hide();
                this.$main.find('#mainStarPanel').prev().hide();
            }
            $(this.$main).i18n($.i18n.options);


        },

        backToCore : function(){
            this.switchToCoreModal();
            this.selectedStar=null;
            this.selectedSkill=null;
            this.$modal.find('#collapseSelectStar').collapse('show');
            this.$modal.find('#selectedStarPanel').hide();
        },

        switchToCoreModal : function (){
            this.skillStar = false;
            $('#coreStar').removeClass('inactive');
            $('#skillStar').addClass('inactive');
            $('#giveSkillStar').hide();
            $('#giveCoreStar').show();
            this.$modal.find('#giveStarModalErrorMessage').hide();
        },

        switchToSkillsModal : function (event){
            this.selectedSkill=null;
            this.changeSkill(event);
            this.skillStar = true;
            $('#skillStar').removeClass('inactive');
            $('#coreStar').addClass('inactive');
            $('#giveSkillStar').show();
            $('#giveCoreStar').hide();
            this.$modal.find('#giveStarModalErrorMessage').hide();

            if(this.selectedSkill && this.selectedSkill.id != null){
                $('#selectedSkillSection').show();
                $('#skillToGiveStarSection').hide();
            } else {
                $('#selectedSkillSection').hide();
                $('#skillToGiveStarSection').show();
            }

            this.$modal.find('#skillToGiveStar').typeahead({
                      hint: true,
                      highlight: true,
                      minLength: 2
                    },
                    {
                          name: 'skills',
                          source: _.bind(this.searchSkills, this),
                          engine: _,
                          templates: {
                              empty: [
                                      '<div class="empty-message">',
                                      $.t("translation:home.giveStarModal.unableFind"),
                                      '</div>'
                                    ].join('\n'),
                              suggestion: _.bind(function(data){
                                var image = smuServices.getStarImage(data.imageId);
                                var model = {
                                    id : data.id,
                                    image : image,
                                    name : data.name,
                                    level : data.level
                                };

                                return this.searchTalentTemplate({model:model});
                              },this)
                    }
            });

            this.$modal.find('#skillStarSelected').on('click', _.bind(this.changeSkill, this));
        },

        renderModal : function(starSelected){

            var modalModel = {
                        prefix : 'giveStar'
                    };
                this.$modal.html(this.modalTemplate({
                    model : modalModel
                }));

                //Fix scroll bar when modal is closed and prevent body sliding
                _.beautifyModal('#giveStarModal');

                // prevent double-click
                this.$modal.find('#giveStarModalAcceptButton').on('click', _.debounce(_.bind(this.giveStar, this), 1000, true));
                this.selectedSkill = null;

                var modalModel ={
                        selectedStar : starSelected,
                        domain : smuServices.getDomain(),
                        talentModule : this.talentModule
                };

                this.$modal.find('#giveStarModalTitle').text('');
                this.$modal.find('#giveStarModalAcceptButton').text($.t("translation:home.giveStarModal.send"));
                this.$modal.find('#giveStarModalBody').html(this.modalContentTemplate({
                    model : modalModel
                }));


                this.$modal.find('#usertoGiveStar').typeahead({
                      hint: true,
                      highlight: true,
                      minLength: 2
                    },
                    {
                      name: 'users',
                      source: _.bind(this.searchUsers, this),
                      engine: _,
                      templates: {
                          empty: [
                                  '<div class="empty-message">',
                                  $.t("translation:home.giveStarModal.unableFind"),
                                  '</div>'
                                ].join('\n'),
                          suggestion : _.bind(function(data){
                            var image = smuServices.getProfileImage(data.profileImageId);
                            var model = {
                                image : image,
                                firstName : data.firstName,
                                lastName : data.lastName,
                                email : data.email
                            };

                            return this.searchTemplate({model:model});
                          }, this)
                    }
                });

                this.$modal.find('#usertoGiveStar').on('typeahead:selected',_.bind(this.userIsSelected,this));
                var category ="";

                if(!this.talentModule){
                    this.orgVal-=1;
                }

                if(this.orgVal >= 10 ){
                    category ="li-5";
                } else if(this.orgVal === 7){
                    category ="li-7";
                } else if(this.orgVal > 7 || this.starsCollection < 10){
                    category ="li-8";
                }
                var model = {
                        stars : this.starsCollection.toJSON(),
                        talentModule : this.talentModule,
                        category : category
                };

                this.$modal.find('#toggleChangeStar').html(this.toggleTemplate({
                    model : model
                }));

                if(starSelected != null){
                    this.$modal.find('#selectedStarPanel').show();
                }
                if(!this.talentModule){
                    this.$modal.find('#talentModule').hide();
                }
                this.$modal.find('#selectedUserSection').hide();
                this.$modal.find('#giveSkillStar').hide();
                this.$modal.find('#giveStarModalErrorMessage').hide();

                this.$modal.find('#selectedUserSection').on('click',_.bind(this.changeSelectedUser,this));
                this.$modal.find('#giveStarModal').modal('show');

                this.$modal.find('#coreStar').on('click', _.bind(this.switchToCoreModal, this));
                this.$modal.find('#skillStar').on('click', _.bind(this.switchToSkillsModal, this));

                this.$modal.find('#usertoGiveStar').on('blur', _.bind(this.usertoGiveStarBlur, this));
                this.$modal.i18n($.i18n.options);
        },

        showModalWithUser : function(user){
            this.renderModal();
            this.$modal.find('#giveSkillStar').hide();

            if(this.remainingStars == 0){
                alert('Cannot give more stars.');
                return;
            }
            this.$modal.find('#collapseSelectStar').collapse('show');
            this.selectedUser = user;
            this.$modal.find('#selectedUserSection').show();
            this.$modal.find('#selectedStarPanel').hide();
            this.$modal.find('#headingSelectStar').hide();
            this.userIsSelected({}, user, {});
            this.$modal.find('#giveStarModalErrorMessage').hide();
            this.$modal.find('#notesToGiveStar').val('');
            this.selectedStar = {};

            this.$modal.find('#selectedUserSection').on('click',_.bind(this.changeSelectedUser,this));
        },

        skillSelected : function(event){
            this.starSelected(event);
            this.switchToSkillsModal(event);
        },
        
        starSelected : function(event){
            if(event.currentTarget == null){
                return;
            }

            if(this.remainingStars == 0){
                alert('Cannot give more stars.');
                return event.preventDefault();
            }

            this.selectedUser = null;

            var id = $(event.currentTarget).data('id').replace('panelStar','');

            _.each(this.starsCollection.toJSON(),function(element,index){
                if(element.id == id){
                    this.selectedStar = element;
                }
            }, this);

            this.renderModal(this.selectedStar);
        },

        starSelectedInToggle : function(event){
            this.switchToCoreModal();
            var id = $(event.target).data('id');

            if(id == null){
                id = $($(event.target).parent().parent()).data('id')
            }

            var starId = id.replace('toggleStar','');

            _.each(this.starsCollection.toJSON(),function(element,index){
                if(element.id == starId){
                    this.selectedStar = element;}
            }, this);

            this.$modal.find('#selectedStarLabel').text(this.selectedStar.nameShowed);
            this.$modal.find('#selectedStarImage').attr('src',this.selectedStar.imageUrl);
            this.$modal.find('#collapseSelectStar').collapse('hide');
            this.$modal.find('#selectedStarPanel').show();
            this.$modal.find('#headingSelectStar').show();
            this.$modal.find('#giveStarModalErrorMessage').hide();
        },

        showErrorMessage : function(message){
            this.$modal.find('#giveStarModalErrorMessage').show();
            this.$modal.find('#giveStarModalErrorMessage').text(message);
        },

        giveStar : function(){
            if(this.starInProgress){
                return;
            }

            this.starInProgress = true;

            this.$modal.find('#giveStarModalErrorMessage').hide();

            if(!this.skillStar){
                if(this.selectedStar == null || this.selectedStar.id == null){
                    this.showErrorMessage($.t("translation:home.giveStarModal.messageSelectStar"));
                    this.starInProgress = false;
                    return;
                }
            } else {
                if(this.selectedSkill == null || this.selectedSkill.id == null){
                    this.showErrorMessage($.t("translation:home.giveStarModal.messageSelectSkill"));
                    this.starInProgress = false;
                    return;
                }
            }

            if(this.selectedUser == null || this.selectedUser.id == null){
                this.showErrorMessage($.t("translation:home.giveStarModal.messageSelectUser"));
                this.starInProgress = false;
                return;
            }

            if(this.currentUser != null && this.currentUser.id == this.selectedUser.id){
                this.showErrorMessage($.t("translation:home.giveStarModal.messageCannotAssignStarHimself"));
                this.starInProgress = false;
                return;
            }

            var comment = this.$modal.find('#notesToGiveStar').val();

            if(!this.skillStar){
                smuServices.assignStar(_.bind(this.starGiven, this), this.selectedUser.email, this.selectedStar.id, comment);
            } else if(this.skillStar){
                smuServices.assignTalentStar(_.bind(this.starGiven, this), this.selectedUser.email, this.selectedSkill.id, comment);
            }
        },

        starGiven : function(result, status, message){
            this.starInProgress = false;

            if (status == "OK") {
                this.$modal.find('#giveStarModal').modal('hide');
                this.remainingStars--;
                this.trigger("starGivenEvent");
            } else if (message=="NO_RIGHTS") {
                Backbone.trigger('NO_RIGHTS');
            } else {
                this.showErrorMessage('');
                this.showErrorMessage(message);
                console.log(message);
            }
        },
        searchUsers : function(query,callback){
            this.typeaheadCallback = callback;
            smuServices.locateUsers(_.bind(this.usersAreLocated, this), '%' + query + '%');
        },
        searchSkills : function(query, callback){
            this.typeaheadCallback = callback;
            var result = smuServices.searchInTalentsTree(query);
            this.typeaheadCallback(result);
        },

        usersAreLocated : function(result, status, message){
            if (status == "OK") {
                //Remove current logged user from result
                var currentUserIndex = -1;

                _.each(result, function(item,index){
                    if(item.id == this.currentUser.id){
                        currentUserIndex = index;
                    }
                }, this);

                if(currentUserIndex > -1){
                    result.splice(currentUserIndex, 1);
                }

                this.typeaheadCallback(result);
            } else if (message=="NO_RIGHTS") {
                Backbone.trigger('NO_RIGHTS');
            } else {
                console.log(message);
            }
        },
        userIsSelected : function(jqobj, item, srcname){
            var image = smuServices.getProfileImage(item.profileImageId);

            this.selectedUser = item;
            this.$modal.find('#modalSelectedUserImage').attr('src', image);
            this.$modal.find('#modalSelectedUserNameLabel').text(item.firstName + ' ' + item.lastName);
            this.$modal.find('#modalSelectedUserSeniorityLabel').text(item.email);
            this.$modal.find('#selectedUserSection').show();
            this.$modal.find('#giveStarModalErrorMessage').hide();
            this.$modal.find('#usertoGiveStarSection').hide();
        },
        skillIsSelected : function (jqobj, item, srcname){

            var image = smuServices.getStarImage(item.imageId);
            this.selectedSkill = item;
            this.$modal.find('#selectedSkillLabel').text(item.name);
            this.$modal.find('#modalSelectedSkillImage').attr('src', image);
            this.$modal.find('#skillStarSelected').attr('title', item.path);
            this.$modal.find('#selectedSkillSection').show();
            this.$modal.find('#skillToGiveStarSection').hide();
        },
        changeSelectedUser : function(event){
            event.preventDefault();

            var previousSelection = null;

            if(this.selectedUser != null && this.selectedUser.firstName){
                previousSelection= this.selectedUser.firstName;

                if(this.selectedUser.lastName){
                    previousSelection = previousSelection + ' ' + this.selectedUser.lastName;
                }
            }

            this.$modal.find('#selectedUserSection').hide();
            this.$modal.find('#giveStarModalErrorMessage').hide();
            this.$modal.find('#usertoGiveStarSection').show();

            if(previousSelection != null){
                this.$modal.find('#usertoGiveStar').val(previousSelection).trigger('input').trigger("keypress");
            }

            // This is necessary to IE
            // Multiply by 2 to ensure the cursor always ends up at the end;
            // Opera sometimes sees a carriage return as 2 characters.
            var strLength= this.$modal.find('#usertoGiveStar').val().length * 2;

            this.$modal.find('#usertoGiveStar').focus();
            this.$modal.find('#usertoGiveStar')[0].setSelectionRange(strLength, strLength);
        },

        changeSkill : function (event){
            event.preventDefault();

            var previousSelection = null;

            if(this.selectedSkill != null && this.selectedSkill.name){
                previousSelection = this.selectedSkill.name;
            }

            this.$modal.find('#selectedSkillSection').hide();
            this.$modal.find('#giveStarModalErrorMessage').hide();
            this.$modal.find('#skillToGiveStarSection').show();

            if(previousSelection != null){
                this.$modal.find('#skillToGiveStar').val(previousSelection).trigger('input').trigger("keypress");
            }

            // This is necessary to IE
            // Multiply by 2 to ensure the cursor always ends up at the end;
            // Opera sometimes sees a carriage return as 2 characters.
            var strLength;
            if(this.$modal.find('#skillToGiveStar'))
               strLength= this.$modal.find('#skillToGiveStar').val().length * 2;
            else strLength = "";


            $('#skillToGiveStar').focus();
            $('#skillToGiveStar')[0].setSelectionRange(strLength, strLength);
        },

        skillToGiveBlur : function (){
            $('#resultingSkillsContainer').addClass('hide');

            if(this.selectedSkill != null){
                this.$modal.find('#selectedSkillSection').show();
                this.$modal.find('#giveStarModalErrorMessage').hide();
                this.$modal.find('#skillToGiveStarSection').hide();
            }

        },
        usertoGiveStarBlur : function(){
            if(this.selectedUser != null){
                this.$modal.find('#selectedUserSection').show();
                this.$modal.find('#giveStarModalErrorMessage').hide();
                this.$modal.find('#usertoGiveStarSection').hide();
            }
        }
    });

    return GiveStarView;
});