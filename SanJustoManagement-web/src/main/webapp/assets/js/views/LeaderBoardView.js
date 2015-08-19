/*global define*/
define(
		[ 'jquery', 'underscore', 'backbone',
				'text!templates/leaderBoard-template.html',
				'text!templates/noLeaderBoard-template.html', 'config',
				'collections/userStarsCount-collection',
				'services/StarMeUpServices' ],
		function($, _, Backbone, leaderBoardTemplate, noLeaderBoardTemplate,
				Config, UsersStarsCountCollection, smuServices) {
			'use strict';

			Config.setUp();

			var LeaderBoardView = Backbone.View
					.extend({
						el : '#app',
						className : 'row',
						template : _.template(leaderBoardTemplate),
						usersStarsCountCollection : {},
						topReceiversListSize : 5,
						initialize : function(container) {
							this.$main = this.$('#' + container);
							this.usersStarsCountCollection = new UsersStarsCountCollection();
							this.listenTo(this.usersStarsCountCollection,
									'ready', this.render);
							this.usersStarsCountCollection
									.initializeReceiversCollection(this.topReceiversListSize);
							this.render();
						},
						render : function() {
							if (!this.usersStarsCountCollection.isReady) {
								return;
							}

							var users = this.usersStarsCountCollection.toJSON();

							if (users.length > 0) {
								_
										.each(
												users,
												function(element, index) {
													element.profileImageId = smuServices.getProfileImage(element.profileImageId);
												});

								var leader = users.splice(0, 1)[0];

								var model = {
									leader : leader,
									users : users
								};
								this.$main.html(this.template({
									model : model
								}));
							} else {
								this.template = _
										.template(noLeaderBoardTemplate);
								this.$main.html(this.template());
							}
							this.$main.find('.img-circle').on('click',
									_.bind(this.selectedUser, this));
							$(this.$main).i18n($.i18n.options);
						},
						selectedUser : function(event) {
							var selectedUser = {};
							var selectedId = $(event.target).data('id');
							
							if(selectedId == null){
								selectedId = $(event.target).parent().data('id');
							}
								

							var users = this.usersStarsCountCollection.toJSON();

							_.each(users, function(element, index) {
								if (element.id == selectedId) {
									selectedUser = element;
								}
							});

							this.trigger('userSelection', selectedUser);
						}

					});

			return LeaderBoardView;
		});
