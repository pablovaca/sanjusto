/*globant define*/
define([ 
        'jquery', 
        'underscore', 
        'backbone',
		'text!templates/rolesAdministration-template.html',
		'text!templates/rolesAdministrationFilter-template.html',
		'text!templates/searchUsers-template.html', 
		'text!templates/remove-role-modal.html',
		'text!templates/modal-template.html',
		'config',		
		'services/StarMeUpServices',
		'typeahead'				
		],

function($, _, Backbone, rolesTemplate, rolesFilterTemplate, searchUsersTemplate, RemoveRoleModal, ModalTemplate, Config, smuServices) {

	'use strict';

	Config.setUp();
	var RolesAdministrationView = Backbone.View.extend({		
		el : '#app',
        className : 'row',
        $filterContainer : '',
		template : _.template(rolesTemplate),
		filterTemplate : _.template(rolesFilterTemplate),
		searchTemplate : _.template(searchUsersTemplate),
		modalTemplate : _.template(ModalTemplate),
		modalBodyTemplate : _.template(RemoveRoleModal),
		currentUser : {},
		availableRoles : {},
		availableOrganizations : {},
		currentUserIsSuperAdmin : false,
		filterByOrg : true,
		usersRoles : {},
		allRolesId : [],
		selectedUsers : [],
		allSelectedUsersId : [],
        roles : [],
        orgId : 0,		
		
		initialize : function(container, filterContainer, currentUser, currentUserIsSuperAdmin) {		
			this.$main = this.$('#' + container);
			this.$filterContainer = this.$('#' + filterContainer);
			this.currentUser = currentUser;
			this.currentUserIsSuperAdmin = currentUserIsSuperAdmin;
			this.filterByOrg = true;
			this.selectedUsers = [];
			this.allRolesId = [];
			this.allSelectedUsersId = [];
            this.roles = [];
			this.initCallbacks();	
			this.listenTo(this,'change', this.render);
			this.$main.html('');
			this.usersRoles = {};            							
		},

		initCallbacks : function(){
			smuServices.getAvailableRoles(_.bind(this.callbackRoles, this));
			if (this.currentUserIsSuperAdmin)
				smuServices.getAvailableOrganizations(_.bind(this.callbackOrganizations, this));
		},

		render : function(){
			if(!this.usersRoles){				
				this.usersRoles = {};
				this.selectedUsers = [];
				this.$main.html('');				
				return;
			}
			
			var model = {
				usersRoles : this.usersRoles,
				currentUserIsSuperAdmin : this.currentUserIsSuperAdmin							
			};						

			this.$main.html(this.template({
				model : model
			}));
			this.$main.i18n($.i18n.options);
			this.$main.find('.js-removeRoles').on('click', _.bind(this.removeRole, this));										
		},
		
		renderFilter : function() {

			var filterModel = {
				availableRoles : this.availableRoles,
				selectedUsers : this.selectedUsers,
				currentUserIsSuperAdmin : this.currentUserIsSuperAdmin,
				availableOrganizations : this.availableOrganizations
			};				
			
			this.$filterContainer.html(this.filterTemplate({
                model : filterModel
            }));

            if(this.currentUserIsSuperAdmin)
            	this.filterByOrg = false;

            this.$filterContainer.i18n($.i18n.options);
            this.$filterContainer.find('#searchUsers').typeahead({				
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
                		},this)
				}
			});

            this.roles = new Array();            

            this.$filterContainer.find('#searchUsers').on('typeahead:selected',_.bind(this.userIsSelected,this));
            this.$filterContainer.find('.js-removeUser').on('click', _.bind(this.removeUser, this));
            this.$filterContainer.find('#filterOrganizations').change(_.bind(function(){                
                this.orgId = this.$filterContainer.find('#filterOrganizations').val();
                smuServices.getRoles(_.bind(this.callbackRolesForUsers, this), this.allSelectedUsersId, this.roles, this.orgId)
            }, this));

            this.callAction();

            this.$filterContainer.find('#saveRoles').on('click', _.bind(function(event){                
                event.preventDefault();
                event.stopPropagation();            
                if(this.allSelectedUsersId.length > 0 && this.roles.length > 0){                                                             
                    smuServices.assignRoles(_.bind(this.callbackAssingRoles, this), this.allSelectedUsersId, this.roles);                    
                } else {
                    this.$filterContainer.find('#errorMsg').text($.t("translation:rolesAdministration.errorMsg")).show();
                }
            },this))
        },

        callAction : function (){ 
            var noFilterSelected = false;
            var roleSelected = [];      
			
			this.$filterContainer.find('input[name=roles]:checkbox').off('change').on('change', _.bind(function(){
                roleSelected = [];                	
				this.$filterContainer.find('#errorMsg').hide();			
				this.$filterContainer.find('input[name=roles]:checked').each(function(){					
					roleSelected.push(this.value);
				})
				this.roles = roleSelected;                           
				smuServices.getRoles(_.bind(this.callbackRolesForUsers, this), this.allSelectedUsersId, this.roles, (this.orgId) ? this.orgId : 0);							
				noFilterSelected = true;
			}, this));           

			if(!noFilterSelected || this.selectedUsers.length === 0){                
                this.$filterContainer.find('input[name=roles]:checked').each(function(){              
                    roleSelected.push(this.value);
                })                
                this.roles = roleSelected;        		
				smuServices.getRoles(_.bind(this.callbackRolesForUsers, this), this.allSelectedUsersId, (this.roles.length > 0) ? this.roles : this.allRolesId, (this.orgId) ? this.orgId : 0);				
			}								
			this.allRolesId = [];            
		},

        callbackAssingRoles : function(result, status, message){            
            if (status == "OK") {                                       
                if(result.length > 0){                              
                    _.each(result, function(opt){
                        opt.user.profileImageId = smuServices.getProfileImage(opt.user.profileImageId);                     
                    }, this);
                    this.usersRoles = result;
                    this.callAction();
                }                
            } else if (message=="NO_RIGHTS") {
                Backbone.trigger('NO_RIGHTS');
            } else {
                console.log(message);
            }
        },

		callbackRolesForUsers : function(result, status, message){			
			if (status == "OK") {
                this.usersRoles = {};									
				if(result.length > 0){								
					_.each(result, function(opt){
						opt.user.profileImageId = smuServices.getProfileImage(opt.user.profileImageId);						
					}, this);
					this.usersRoles = result;                    
				}                
				this.trigger('change'); 
			} else if (message=="NO_RIGHTS") {
				Backbone.trigger('NO_RIGHTS');
			} else {
				console.log(message);
			}
		},

		callbackRoles : function(result, status, message){
			if (status == "OK") {
				this.availableRoles = result;
				_.each(result, function(role){
					this.allRolesId.push(role.id);		
				}, this)				
				this.renderFilter();				
			} else if (message=="NO_RIGHTS") {
				Backbone.trigger('NO_RIGHTS');
			} else {
				console.log(message);
			}
		},

		callbackOrganizations : function(result, status, message){
			if (status == "OK") {
				this.availableOrganizations = result;								
				this.renderFilter();				
			} else if (message=="NO_RIGHTS") {
				Backbone.trigger('NO_RIGHTS');
			} else {
				console.log(message);
			}
		},

		searchUsers : function(query,callback){
			this.typeaheadCallback = callback;
			smuServices.locateUsersFilterByOrg(_.bind(this.usersAreLocated, this), '%' + query + '%', this.filterByOrg);
		},

		usersAreLocated : function(result, status, message){
			if (status == "OK") {                
				this.typeaheadCallback(result);
			} else if (message=="NO_RIGHTS") {
				Backbone.trigger('NO_RIGHTS');
			} else {
				console.log(message);
			}
		},

		userIsSelected : function(jqobj, item, srcname){
            var find = false;
            if(this.allSelectedUsersId.length > 0){                
                _.each(this.allSelectedUsersId, function(i){
                    if(i === item.id){
                        find = true;
                        return false;
                    }
                },this);                
            }
            if(!find){
    			var image = smuServices.getProfileImage(item.profileImageId);
    			this.$filterContainer.find('#errorMsg').hide();			
    			this.selectedUsers.push(item);
    			this.allSelectedUsersId.push(item.id);
                this.renderFilter();
            }            
		},

		removeUser : function(event){
			event.preventDefault();
            var userId = $(event.target).data('id');

            if(userId == null){
                userId = $(event.target).parent().data('id');
            }
            _.each(this.selectedUsers, function(u, index){
            	if(u.id == userId){
            		this.selectedUsers.splice(index, 1);
            	}
            }, this);

            _.each(this.allSelectedUsersId, function(u, index){
            	if(u == userId){
            		this.allSelectedUsersId.splice(index, 1);
            	}
            }, this);
            this.renderFilter();
		},

		removeRole : function(event){
			event.preventDefault();
            var userRoleId = $(event.target).data('id');
            var roleToRemove = {};

            if(userRoleId == null){
                userRoleId = $(event.target).parent().data('id');
            }

            _.each(this.usersRoles, function(usrRol){
            	if(usrRol.id == userRoleId){
            		roleToRemove = usrRol;	            		
            	}
            }, this);

            var $modal = this.$filterContainer.find('#removeRoleModal');			
			var modalModel = {
                    prefix : 'removeRole'                    
            };
            $modal.html(this.modalTemplate({
                model : modalModel
            }));

            var modalBodyModel = {
            	roleToRemove : roleToRemove
            }
           
            //prevent scroll hide
            _.beautifyModal('#removeRoleModal');

            $modal.find('#removeRoleModalTitle').hide();
            $modal.find('#removeRoleModalAcceptButton').text($.t("admin.mainStarPage.accept")).attr('data-dismiss', 'modal');
            $modal.find('#removeRoleModalCancelButton').text($.t("admin.createStarPopUp.cancel")).show();
            $modal.find('#removeRoleModalBody').html(this.modalBodyTemplate({
            	model : modalBodyModel
            }));
            $modal.find('#removeRoleModal').modal('show');         
            $modal.find('#removeRoleModalAcceptButton').on('click', _.bind(function(){
            	smuServices.removeRole(_.bind(this.callAction, this),roleToRemove.user.id, roleToRemove.role.id);            	
            }, this));
		}		
	});
	return RolesAdministrationView;
});