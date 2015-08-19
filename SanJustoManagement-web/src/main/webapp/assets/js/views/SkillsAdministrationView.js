define([
    'jquery',
    'underscore',
    'backbone',
    'config',
    'services/StarMeUpServices',
    'text!templates/skillsAdministration-template.html',
    'text!templates/searchSkills-template.html'
], function ($, _, Backbone, Config, smuServices, skillsAdministrationTemplate, searchSkillsTemplate) {
        Config.setUp();
        var SkillsAdministrationView = Backbone.View.extend({
            template : _.template(skillsAdministrationTemplate),
            searchTalentTemplate : _.template(searchSkillsTemplate),
            typeaheadCallback : {},
            callBackAccept : {},
            callBackCancel : {},
            skills : [],
            fullEditionMode : true,

            initialize : function(container, callBackAccept, callBackCancel, initialSkills, fullEditionMode) {
                this.$main = this.$('#' + container);
                this.callBackAccept = callBackAccept;
                this.callBackCancel = callBackCancel;
                this.skills = initialSkills;
                this.skills.sort(function(a,b) {
                    return a.name.localeCompare(b.name);
                });
                this.fullEditionMode = fullEditionMode;
            },

            render : function() {
                var model = {
                    fullEditionMode : this.fullEditionMode,
                    skills : this.skills
                };

                this.$main.html(this.template({
                        model : model
                }));

                $(this.$main).i18n($.i18n.options);

                this.$main.find('.js-checkSkill').on('click',_.bind(this.skillStateChanged,this));
                this.$main.find('.js-deleteSkill').on('click',_.bind(this.deleteSkill,this));
                this.$main.find('.js-checkSelectAll').on('click',_.bind(this.selectAll,this));
                this.$main.find('#acceptChanges').on('click',_.bind(this.acceptChanges,this));
                this.$main.find('#cancelChanges').on('click',_.bind(this.cancelChanges,this));

                this.selectAllCheck();

                if(this.fullEditionMode){
                    this.$main.find('#skillToAdd').typeahead({
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
                                          'Unable to find any user that match the current text',
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
                    this.$main.find('#skillToAdd').on('typeahead:selected', _.bind(this.skillIsSelected, this));
                }
            },

            searchSkills : function(query, callback){
                this.typeaheadCallback = callback;
                var result = smuServices.searchInTalentsTree(query);
                this.typeaheadCallback(result);
            },

            skillIsSelected : function (jqobj, item){
                item.enabled = true;
                item.isNew = true;
                this.skills.push(item);
                this.render();
            },

            selectAllCheck : function(){
                var selectAllChecked = true;
                _.each(this.skills, function(item){
                    if(!item.enabled){
                        selectAllChecked = false;
                        return;
                    }
                }, this);
                this.$main.find('.js-checkSelectAll').prop('checked', selectAllChecked);
            },

            selectAll : function(event){
                var checked = $(event.target).prop('checked');
                _.each(this.skills, function(item){
                    item.enabled = checked;
                }, this);
                this.$main.find('.js-checkSkill').prop('checked', checked);
            },

            deleteSkill : function(event){
                var skillId = $(event.target).parent().parent().data("id");
                var indexToDelete = null;

                _.each(this.skills, function(item, index){
                    if(item.id === skillId){
                        indexToDelete = index;
                        return;
                    }
                }, this);

                if(indexToDelete != null){
                    this.skills.splice(indexToDelete, 1);
                }
                $(event.target).parent().parent().parent().remove();
            },

            skillStateChanged : function(event){
                var skillId = $(event.target).parent().data("id");

                _.each(this.skills, function(item){
                    if(item.id === skillId){
                        item.enabled = !item.enabled;
                        return;
                    }
                }, this);
                this.selectAllCheck();
            },

            acceptChanges : function(){
                $('#skillsErrorMessage').addClass('hide');
                var skillsEnabled = false;

                _.each(this.skills, function(item){
                    if(item.enabled){
                        skillsEnabled = true;
                    }
                }, this);

                if(skillsEnabled){
                    this.callBackAccept(this.skills);
                }
                else{
                    $('#skillsErrorMessage').removeClass('hide');
                }
            },

            cancelChanges : function(){
                $('#skillsErrorMessage').addClass('hide');
                this.callBackCancel();
            }
        });

        return SkillsAdministrationView;
    });