/*global define*/
'use strict';
define([
	'jquery', 
	'underscore', 
	'backbone',
	'config'       
], function ($, _, Backbone, Config) {
	
	Config.setUp();
	
	return {
		callBackComments:function(result, status, message) {
			if (status == "OK") {
				alert("Comment Added");
			}
		},

		callBackLikes:function(result, status, message) {
			if (status == "OK") {
				alert("Like Added");
			}
		}
	};

});