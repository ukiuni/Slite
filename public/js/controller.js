toastr.options = {
	"positionClass" : "toast-top-center"
}
var myapp = angular.module("app", [ "ui.bootstrap", "ngRoute", "ngResource", "ngCookies", "ngFileUpload", "ngTagsInput", "hc.marked" ]);
myapp.config([ "$locationProvider", "$httpProvider", "$routeProvider", "markedProvider", function($locationProvider, $httpProvider, $routeProvider, $markedProvider) {
	$locationProvider.html5Mode(true);
	$httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
	$httpProvider.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
	$httpProvider.defaults.transformRequest = function(data) {
		if (data === undefined) {
			return data;
		}
		return $.param(data);
	}
	$markedProvider.setOptions({
		gfm : true,
		tables : true,
		breaks : false,
		pedantic : false,
		sanitize : true,
		smartLists : true,
		smartypants : false
	});
	$routeProvider.when("/", {
		templateUrl : "template/indexView.html",
		controller : "indexController"
	});
	$routeProvider.when("/signin", {
		templateUrl : "template/signinView.html",
		controller : "signinController"
	});
	$routeProvider.when("/activation", {
		templateUrl : "template/activationView.html",
		controller : "activationController"
	});
	$routeProvider.when("/home", {
		templateUrl : "template/home.html",
		controller : "homeController"
	});
	$routeProvider.when("/requestResetPassword", {
		templateUrl : "template/requestResetPassword.html",
		controller : "requestResetPasswordController"
	});
	$routeProvider.when("/resetPasswordRequested", {
		templateUrl : "template/resetPasswordRequested.html"
	});
	$routeProvider.when("/resetPassword", {
		templateUrl : "template/resetPasswordView.html",
		controller : "resetPasswordController"
	});
	$routeProvider.when("/passwordReseted", {
		templateUrl : "template/passwordResetedView.html"
	});
	$routeProvider.when("/changePassword", {
		templateUrl : "template/changePasswordView.html",
		controller : "changePasswordController"
	});
	$routeProvider.when("/editProfile", {
		templateUrl : "template/editProfileView.html",
		controller : "editProfileController"
	});
	$routeProvider.when("/passwordChanged", {
		templateUrl : "template/passwordChangedView.html"
	});
	$routeProvider.when("/editContent", {
		templateUrl : "template/editContentView.html",
		controller : "editContentController"
	});
	$routeProvider.when("/editContent/:contentKey", {
		templateUrl : "template/editContentView.html",
		controller : "editContentController"
	});
	$routeProvider.when("/content/:contentKey", {
		templateUrl : "template/contentView.html",
		controller : "contentController"
	});
	$routeProvider.when("/tags", {
		templateUrl : "template/tags.html",
		controller : "tagsController"
	});
	$routeProvider.when("/tag/:id", {
		templateUrl : "template/tag.html",
		controller : "tagController"
	});
	$routeProvider.when("/tag/:id/edit", {
		templateUrl : "template/editTag.html",
		controller : "editTagController"
	});
	$routeProvider.when("/groups", {
		templateUrl : "template/groups.html",
		controller : "groupsController"
	});
	$routeProvider.when("/group/:id", {
		templateUrl : "template/group.html",
		controller : "groupController"
	});
	$routeProvider.when("/group/:id/edit", {
		templateUrl : "template/editGroup.html",
		controller : "editGroupController"
	});
	$routeProvider.when("/signout", {
		templateUrl : "template/signouted.html"
	});
	$routeProvider.otherwise({
		redirectTo : "/"
	});
} ]);
myapp.run([ "$rootScope", "$location", "$resource", "$cookies", function($rootScope, $location, $resource, $cookies) {
	$resource('/api/resource/messages').get({
		lang : ((navigator.languages && navigator.languages[0]) || navigator.browserLanguage || navigator.language || navigator.userLanguage).substr(0, 2)
	}, function(messages) {
		$rootScope.messages = messages;
		$rootScope.statuses = [ {
			message : $rootScope.messages.contents.open,
			keyNumber : 1
		}, {
			message : $rootScope.messages.contents.hidden,
			keyNumber : 2
		}, {
			message : $rootScope.messages.contents.urlAccess,
			keyNumber : 3
		}, {
			message : $rootScope.messages.contents.authenticated,
			keyNumber : 4
		} ];
		$rootScope.groupVisibilities = [ {
			message : $rootScope.messages.groups.visibility.open,
			keyNumber : 1
		}, {
			message : $rootScope.messages.groups.visibility.secret,
			keyNumber : 2
		}, {
			message : $rootScope.messages.groups.visibility.secretEvenMember,
			keyNumber : 3
		} ];
		$rootScope.groupAuthorizations = [ {
			message : $rootScope.messages.accounts.authorization.viewer,
			keyNumber : 1
		}, {
			message : $rootScope.messages.accounts.authorization.editor,
			keyNumber : 2
		}, {
			message : $rootScope.messages.accounts.authorization.administrator,
			keyNumber : 3
		} ];
	}, function() {
		$rootScope.showError("Fail to load message resource.");
	});
	$rootScope.showError = function(message) {
		toastr.error(message);
	}
	$rootScope.showErrorWithStatus = function(status, otherFunc) {
		if (403 == status) {
			$rootScope.showError($rootScope.messages.error.notAccessible);
		} else if (404 == status) {
			$rootScope.showError($rootScope.messages.error.notFound);
		} else if (otherFunc && otherFunc(status)) {
			// DO Nothing
		} else {
			$rootScope.showError($rootScope.messages.error.withServer);
		}
	}
	$rootScope.toLogin = function() {
		$location.path("/signin");
	};
	$rootScope.toHome = function() {
		$location.path("/signin");
	};
	$rootScope["goto"] = function(url) {
		$location.path(url);
	};
	var SESSION_KEY = "session_key"
	$rootScope.setSessionKey = function(sessionKey, expires) {
		if (expires) {
			$cookies.putObject(SESSION_KEY, sessionKey, {
				expires : expires
			})
		} else {
			$cookies.putObject(SESSION_KEY, sessionKey);
		}
	}
	$rootScope.removeSessionKey = function() {
		$rootScope.setSessionKey(null);
	}
	$rootScope.getSessionKey = function() {
		var sessionKey = $cookies.getObject(SESSION_KEY);
		return sessionKey;
	}
	$rootScope.signout = function() {
		$resource('/api/account/accessKey').remove({
			key : $rootScope.getSessionKey()
		}, function() {
			$rootScope.removeSessionKey();
			$rootScope.myAccount = null;
			$rootScope.sessionKey = null;
			$location.path("/signout");
		}, function() {
			$rootScope.showError($rootScope.messages.error.withServer);
		})
	}
	var sessionKey = $rootScope.getSessionKey();
	if (!$rootScope.myAccount && sessionKey) {
		$resource('/api/account').get({
			sessionKey : sessionKey
		}, function(account) {
			$rootScope.myAccount = account;
			$rootScope.sessionKey = sessionKey;
			if ("/" == ($location.path()) || "/signin" == ($location.path())) {
				$location.path("/home");
			}
		}, function() {
			$rootScope.removeSessionKey();
		});
	}
	var socketListeners = new Map();
	$rootScope.listenComment = function(contentKey, callback) {
		if (socketListeners.has(contentKey)) {
			return;
		}
		$rootScope.socket.emit('listenComment', contentKey);
		$rootScope.socket.on(contentKey, callback);
		socketListeners.set(contentKey, callback);
	};
	$rootScope.unListenComment = function(contentKey, callback) {
		$rootScope.socket.emit('unListenComment', contentKey);
		$rootScope.socket.removeListener(contentKey, callback);
		socketListeners["delete"](contentKey);
	};
	var targetGroupId = null;
	$rootScope.setTargetGroupId = function(_targetGroupId) {
		targetGroupId = _targetGroupId
	}
	$rootScope.pullTargetGroupId = function() {
		var _targetGroupId = targetGroupId;
		targetGroupId = null;
		return _targetGroupId;
	}
	$rootScope.socket = io.connect();
	$rootScope.disconnected = false;
	$rootScope.socket.on('connect', function(data) {
		$rootScope.socket.emit('authorize', $rootScope.getSessionKey());
		if (!$rootScope.disconnected) {
			return;
		}
		$rootScope.disconnected = false;
		socketListeners.forEach(function(value, key) {
			$rootScope.socket.emit('listenComment', key);
		})
	});
	$rootScope.socket.on('disconnect', function(data) {
		$rootScope.disconnected = true;
	});
	$rootScope.inviteImageUrls = [ "/images/inviting.png", "/images/viewer.png", "/images/editor.png", "/images/admin.png" ];
} ]);
var indexController = [ "$rootScope", "$scope", "$modal", "$location", "$http", "$window", function($rootScope, $scope, $modal, $location, $http, $window) {
	$scope.openCreateAccountDialog = function() {
		var dialogController = [ "$scope", "$modalInstance", function($dialogScope, $modalInstance) {
			$dialogScope.create = function() {
				var account = {};
				account.name = $dialogScope.name;
				account.mail = $dialogScope.mail;
				account.password = $dialogScope.password;
				$modalInstance.close(account);
			};
			$dialogScope.name = "";
			$dialogScope.mail = "";
			$dialogScope.password = "";
		} ];
		var modalInstance = $modal.open({
			templateUrl : 'template/createAccountDialog.html',
			controller : dialogController
		});
		modalInstance.result.then(function(account) {
			$scope.createAccount(account, function() {
				$location.path("/signin");
			});
		}, function() {
		});
	};
	$scope.createAccount = function(account, callback) {
		post($http, '/api/account', account).then(function(data, status, headers, config) {
			if (callback) {
				callback();
			}
		})["catch"](function(response) {
			$rootScope.showErrorWithStatus(response.status, function(status) {
				if (409 == status) {
					$rootScope.showError($rootScope.messages.accounts.error.aleadyHaveAccount);
					return true;
				}
				return false;
			});
		});
	}
} ];
var post = function($http, url, object) {
	return httpRequest($http, "POST", url, object);
}
var put = function($http, url, object) {
	return httpRequest($http, "PUT", url, object);
}
var httpRequest = function($http, method, url, object) {
	var http = $http({
		url : url,
		method : method,
		data : object
	})
	return http;
}
var activationController = [ "$rootScope", "$scope", "$resource", "$location", function($rootScope, $scope, $resource, $location) {
	var activationKey = $location.search()["key"];
	var Account = $resource('/api/account/activation?key=:activationKey');
	Account.get({
		activationKey : activationKey
	}, function(account) {
		$scope.account = account;
		$scope.toLogin = function() {
			$location.path("/signin");
		};
	}, function(error) {
		// TODO switch message with error
		$rootScope.showError($rootScope.messages.error.withServer);
	});
} ];
var signinController = [ "$rootScope", "$scope", "$resource", "$location", function($rootScope, $scope, $resource, $location) {
	$scope.signinAccount = {}
	$scope.signin = function() {
		var Signin = $resource('/api/account/signin');
		Signin.get({
			mail : $scope.signinAccount.mail,
			password : $scope.signinAccount.password
		}, function(loginInfo) {
			$rootScope.myAccount = loginInfo.account;
			$rootScope.sessionKey = loginInfo.sessionKey.secret;
			if ($scope.persist) {
				$rootScope.setSessionKey($rootScope.sessionKey, "Tue, 1-Jan-2030 00:00:00 GMT;");
			} else {
				$rootScope.setSessionKey($rootScope.sessionKey);
			}
			$location.path("/home");
		}, function(error) {
			$rootScope.showError($rootScope.messages.signin.error);
		})
	}
} ];
var requestResetPasswordController = [ "$rootScope", "$scope", "$resource", "$location", "$http", function($rootScope, $scope, $resource, $location, $http) {
	$scope.requestResetPasswordAccount = {}
	$scope.requestResetPassword = function() {
		post($http, '/api/account/sendResetpasswordMail', {
			mail : $scope.requestResetPasswordAccount.mail
		}).then(function(account) {
			$location.path("/resetPasswordRequested");
		})["catch"](function(error) {
			// TODO switch message with error
			$rootScope.showError($rootScope.messages.error.withServer);
		});
	}
} ];
var resetPasswordController = [ "$rootScope", "$scope", "$resource", "$location", "$http", function($rootScope, $scope, $resource, $location, $http) {
	var passwordResetKey = $location.search()["key"];
	$scope.resetPasswordAccount = {}
	$scope.resetPassword = function() {
		put($http, '/api/account/password', {
			password : $scope.resetPasswordAccount.password,
			key : passwordResetKey
		}).success(function(account) {
			$location.path("/passwordReseted");
		}).error(function(error) {
			$rootScope.showError($rootScope.messages.error.withServer);
		});
	}
} ];
var changePasswordController = [ "$rootScope", "$scope", "$resource", "$location", "$http", function($rootScope, $scope, $resource, $location, $http) {
	$scope.changePassword = function() {
		put($http, '/api/account/password', {
			password : $scope.password,
			key : $rootScope.getSessionKey()
		}).success(function(account) {
			$location.path("/passwordChanged");
		}).error(function(error) {
			$rootScope.showError($rootScope.messages.error.withServer);
		});
	}
} ];
var editProfileController = [ "$rootScope", "$scope", "$resource", "$location", "$http", "Upload", function($rootScope, $scope, $resource, $location, $http, $uploader) {
	if (!$rootScope.myAccount) {
		$location.path("/home");
		return;
	}
	$scope.settingAccount = {}
	$scope.settingAccount.name = $rootScope.myAccount.name
	$scope.settingAccount.information = $rootScope.myAccount.information
	$scope.$watch('imageFile', function() {
		if ($scope.imageFile) {
			$scope.fileName = $scope.imageFile.name;
		}
	});
	$scope.save = function() {
		$uploader.upload({
			url : '/api/account',
			fields : {
				name : $scope.settingAccount.name,
				information : $scope.settingAccount.information,
				key : $rootScope.getSessionKey()
			},
			file : $scope.imageFile,
			fileFormDataName : "imageFile",
			sendFieldsAs : "form",
			method : "PUT"
		}).success(function(account) {
			$rootScope.myAccount = account;
			$location.path("/home");
		}).error(function(error) {
			$rootScope.showError($rootScope.messages.error.withServer);
		});
	}
} ];
var editContentController = [ "$rootScope", "$scope", "$resource", "$location", "$http", "Upload", "$routeParams", function($rootScope, $scope, $resource, $location, $http, $uploader, $routeParams) {
	if (!$rootScope.myAccount) {
		$location.path("/home");
		return;
	}
	$scope.save = function(func, successCallback, errorCallback) {
		if (!func) {
			func = put;
		}
		if (!$scope.editingContent.contentKey) {
			func = post;
		}
		var tags = $scope.editingContent.tags.map(function(val) {
			return val.text
		}).filter(function(val) {
			return "" != val && val.indexOf(",") < 0;
		}).join(",");
		func($http, '/api/content', {
			title : $scope.editingContent.title,
			article : $scope.editingContent.article,
			contentKey : $scope.editingContent.contentKey,
			sessionKey : $rootScope.getSessionKey(),
			status : $scope.editingContent.status.keyNumber,
			topImageUrl : $scope.editingContent.topImageUrl,
			groupId : $scope.editingContent.group ? $scope.editingContent.group.id : null,
			tags : tags
		}).success(function(content) {
			if (successCallback) {
				successCallback(content);
			} else {
				$location.path("/home");
			}
		}).error(function(error) {
			if (errorCallback) {
				errorCallback();
			} else {
				$rootScope.showError($rootScope.messages.error.withServer);
			}
		});
	}
	$scope.currentTime = new Date().getTime();
	if ($routeParams.contentKey) {
		$resource('/api/content/:contentKey?sessionKey=:sessionKey').get({
			contentKey : $routeParams.contentKey,
			sessionKey : $rootScope.getSessionKey()
		}, function(content) {
			$scope.editingContent = {}
			$scope.editingContent.status = $rootScope.statuses[content.ContentBodies[0].status - 1];
			$scope.editingContent.contentKey = content.accessKey;
			$scope.editingContent.title = content.ContentBodies[0].title;
			$scope.editingContent.article = content.ContentBodies[0].article;
			$scope.editingContent.topImageUrl = content.ContentBodies[0].topImageUrl;
			$scope.editingContent.group = content.Group;
			if (content.Tags) {
				$scope.editingContent.tags = content.Tags.map(function(val) {
					return {
						text : val.name
					}
				});
			}
			initGroupSelect();
		}, function(error) {
			$rootScope.showError($rootScope.messages.error.withServer);
		});
	} else {
		$scope.editingContent = {}
		$scope.editingContent.status = $rootScope.statuses[0]
		$scope.editingContent.tags = []
		$scope.editingContent.group = {
			id : 0,
			name : ""
		}
	}
	$scope.$watch('editingContent.contentImageFile', function() {
		if ($scope.editingContent && $scope.editingContent.contentImageFile) {
			$scope.fileName = $scope.editingContent.contentImageFile.name;
			$uploader.upload({
				url : '/api/image/' + $scope.editingContent.contentKey,
				fields : {
					sessionKey : $rootScope.getSessionKey()
				},
				file : $scope.editingContent.contentImageFile,
				fileFormDataName : "imageFile",
				sendFieldsAs : "form",
				method : "POST"
			}).success(function(response) {
				$scope.editingContent.topImageUrl = response.url;
			}).error(function(error) {
				$rootScope.showError($rootScope.messages.error.withServer);
			});
		}
	});
	$scope.loadTags = function(query) {
		return $resource('/api/tags/q/:query').query({
			query : query
		}).$promise;
	}
	function initGroupSelect() {
		if ($scope.myGroups && $scope.editingContent && $scope.editingContent.group) {
			$scope.myGroups.forEach(function(group) {
				if ($scope.editingContent.group.id == group.id) {
					$scope.editingContent.group = group;
				}
			})
		}
	}
	$resource('/api/groups/self').query({
		sessionKey : $rootScope.getSessionKey()
	}, function(groups) {
		groups.unshift({
			id : 0,
			name : ""
		})
		$scope.myGroups = groups;
		var targetGroupId = $rootScope.pullTargetGroupId();
		if (targetGroupId) {
			$scope.editingContent.group.id = targetGroupId;
		}
		initGroupSelect();
	}, function(error) {
		$rootScope.showErrorWithStatus(error.status);
	});
} ];
var contentController = [ "$rootScope", "$scope", "$resource", "$location", "$http", "$routeParams", function($rootScope, $scope, $resource, $location, $http, $routeParams) {
	$resource('/api/content/:contentKey?sessionKey=:sessionKey').get({
		contentKey : $routeParams.contentKey,
		sessionKey : $rootScope.getSessionKey()
	}, function(content) {
		$scope.content = content;
		$rootScope.title = content.ContentBodies[0].title;
	}, function(error) {
		$rootScope.showErrorWithStatus(error.status);
	});
	$scope.$on('$routeChangeStart', function(ev, current) {
		$rootScope.title = null;
	});
	$resource('/api/content/comment/:contentKey?sessionKey=:sessionKey').query({
		contentKey : $routeParams.contentKey,
		sessionKey : $rootScope.getSessionKey()
	}, function(comments) {
		$scope.comments = comments;
	}, function(error) {
		$rootScope.showErrorWithStatus(error.status);
	});
	$scope.newComment = {};
	$scope.comment = function() {
		if (!$scope.newComment || null == $scope.newComment.message || "" == $scope.newComment.message) {
			return;
		}
		post($http, '/api/content/comment', {
			contentKey : $routeParams.contentKey,
			sessionKey : $rootScope.getSessionKey(),
			message : $scope.newComment.message
		}).then(function(data, status, headers, config) {
			$scope.newComment = {};
		})["catch"](function(response) {
			$rootScope.showError($rootScope.messages.contents.failToComment);
		});
	}
	var listenComment = function(comment) {
		comment = JSON.parse(comment);
		$scope["$apply"](function() {
			$scope.comments.push(comment);
		});
	}
	$rootScope.listenComment($routeParams.contentKey, listenComment);
	$scope.$on('$destroy', function() {
		$rootScope.unListenComment($routeParams.contentKey, listenComment);
	});
} ];
var tagsController = [ "$rootScope", "$scope", "$resource", "$location", "$http", function($rootScope, $scope, $resource, $location, $http) {
	$resource('/api/tags/listAll').query({}, function(tags) {
		$scope.tags = tags;
	}, function(error) {
		$rootScope.showErrorWithStatus(error.status);
	});
} ];
var tagController = [ "$rootScope", "$scope", "$resource", "$location", "$http", "$routeParams", function($rootScope, $scope, $resource, $location, $http, $routeParams) {
	$resource('/api/tags/' + $routeParams.id + "/contents").get({}, function(tag) {
		$scope.tag = tag;
	}, function(error) {
		$rootScope.showErrorWithStatus(error.status);
	});
	$scope.gotoEdit = function() {
		$location.path("/tag/" + $routeParams.id + "/edit");
	}
} ];
var editTagController = [ "$rootScope", "$scope", "$resource", "$location", "$http", "$routeParams", function($rootScope, $scope, $resource, $location, $http, $routeParams) {
	$resource('/api/tags/:id/contents').get({
		id : $routeParams.id
	}, function(tag) {
		$scope.tag = tag;
	}, function(error) {
		$rootScope.showErrorWithStatus(error.status);
	});
	$scope.save = function() {
		put($http, '/api/tags/' + $routeParams.id, {
			description : $scope.tag.description,
			sessionKey : $rootScope.getSessionKey()
		}).success(function(account) {
			$location.path("/tag/" + $routeParams.id);
		}).error(function(error) {
			$rootScope.showErrorWithStatus(error.status);
		});
	}
} ];
var groupsController = [ "$rootScope", "$scope", "$resource", "$location", "$http", "$routeParams", function($rootScope, $scope, $resource, $location, $http, $routeParams) {
	$resource('/api/groups/self').query({
		sessionKey : $rootScope.getSessionKey()
	}, function(groups) {
		$scope.groups = groups;
	}, function(error) {
		$rootScope.showErrorWithStatus(error.status);
	});
	$scope.gotoCreateNewGroup = function() {
		$location.path("/group/0/edit");
	}
} ];
var groupController = [ "$rootScope", "$scope", "$resource", "$location", "$http", "$routeParams", function($rootScope, $scope, $resource, $location, $http, $routeParams) {
	$resource('/api/groups/:id').get({
		id : $routeParams.id,
		sessionKey : $rootScope.getSessionKey()
	}, function(group) {
		$scope.group = group;
		$scope.group.visibility = $rootScope.groupVisibilities[group.visibility - 1];
	}, function(error) {
		$rootScope.showErrorWithStatus(error.status);
	});
	$scope.gotoEdit = function() {
		$location.path("/group/" + $routeParams.id + "/edit");
	}
	$scope.invite = function() {
		post($http, '/api/groups/' + $routeParams.id + "/invite", {
			sessionKey : $rootScope.getSessionKey(),
			mail : $scope.inviteUserMail,
			authorization : $scope.inviteUserAuthorization.keyNumber
		}).then(function(response) {
			$scope.group.Accounts.push(response.data);
			$scope.inviteUserMail = null;
		})["catch"](function(response) {
			$rootScope.showErrorWithStatus(response.status, function(status) {
				if (409 == status) {
					$rootScope.showError($rootScope.messages.groups.error.aleadyIn);
					return true;
				}
				return false;
			});
		});
	}
	$scope.join = function() {
		put($http, '/api/groups/' + $routeParams.id + "/join", {
			sessionKey : $rootScope.getSessionKey()
		}).then(function(response) {
			for ( var i in $scope.group.Accounts) {
				if ($scope.group.Accounts[i].id == $rootScope.myAccount.id) {
					$scope.group.Accounts[i].AccountInGroup = response.data;
				}
			}
		})["catch"](function(response) {
			$rootScope.showErrorWithStatus(response.status);
		});
	}
	$scope.isInviting = function() {
		if (!$rootScope.myAccount || !$scope.group) {
			return false;
		}
		for ( var i in $scope.group.Accounts) {
			if ($scope.group.Accounts[i].id === $rootScope.myAccount.id && 1 === $scope.group.Accounts[i].AccountInGroup.inviting) {
				return true;
			}
		}
		return false;
	}
	$scope.isEditable = function() {
		if (!$rootScope.myAccount || !$scope.group) {
			return false;
		}
		for ( var i in $scope.group.Accounts) {
			if ($scope.group.Accounts[i].id === $rootScope.myAccount.id && 1 < $scope.group.Accounts[i].AccountInGroup.inviting && 2 <= $scope.group.Accounts[i].AccountInGroup.authorization) {
				return true;
			}
		}
		return false;
	}
	$scope.createNewContent = function() {
		$rootScope.setTargetGroupId($routeParams.id);
		$location.path("/editContent");
	}
	$scope.inviteUserAuthorization = $rootScope.groupAuthorizations[0];
} ];
var editGroupController = [ "$rootScope", "$scope", "$resource", "$location", "$http", "$routeParams", function($rootScope, $scope, $resource, $location, $http, $routeParams) {
	if (!$routeParams.id || $routeParams.id == 0) {
		$scope.group = {};
		$scope.group.visibility = $rootScope.groupVisibilities[0];
	} else {
		$resource('/api/groups/:id').get({
			id : $routeParams.id,
			sessionKey : $rootScope.getSessionKey()
		}, function(group) {
			$scope.group = group;
			$scope.group.visibility = $rootScope.groupVisibilities[group.visibility - 1];
		}, function(error) {
			$rootScope.showErrorWithStatus(error.status);
		});
	}
	$scope.cancel = function() {
		if (!$routeParams.id || $routeParams.id == 0) {
			$location.path("/groups");
		} else {
			$location.path("/group/" + $routeParams.id);
		}
	}
	$scope.save = function() {
		var execFunc;
		if (!$routeParams.id || $routeParams.id == 0) {
			execFunc = post;
		} else {
			execFunc = put;
		}
		execFunc($http, '/api/groups', {
			sessionKey : $rootScope.getSessionKey(),
			id : $routeParams.id,
			name : $scope.group.name,
			description : $scope.group.description,
			imageUrl : $scope.imageUrl,
			visibility : $scope.group.visibility.keyNumber
		}).success(function(group) {
			$location.path("/group/" + group.id);
		}).error(function(error) {
			$rootScope.showErrorWithStatus(error.status);
		});
	}
} ];
var homeController = [ "$rootScope", "$scope", "$resource", "$location", "$http", function($rootScope, $scope, $resource, $location, $http) {
	if (!$rootScope.myAccount) {
		$location.path("/signin");
		return;
	}
	$resource('/api/content/').query({
		sessionKey : $rootScope.getSessionKey()
	}, function(contents) {
		$scope.myContents = contents;
	}, function(error) {
		$rootScope.showErrorWithStatus(error.status);
	});
	$resource('/api/groups/self').query({
		sessionKey : $rootScope.getSessionKey()
	}, function(groups) {
		$scope.myGroups = groups;
	}, function(error) {
		$rootScope.showErrorWithStatus(error.status);
	});
	$scope.createNewContent = function() {
		$location.path("/editContent");
	}
} ];
myapp.controller('indexController', indexController);
myapp.controller('activationController', activationController);
myapp.controller('signinController', signinController);
myapp.controller('requestResetPasswordController', requestResetPasswordController);
myapp.controller('resetPasswordController', resetPasswordController);
myapp.controller('editProfileController', editProfileController);
myapp.controller('changePasswordController', changePasswordController);
myapp.controller('editContentController', editContentController);
myapp.controller('contentController', contentController);
myapp.controller('tagsController', tagsController);
myapp.controller('editTagController', editTagController);
myapp.controller('tagController', tagController);
myapp.controller('groupsController', groupsController);
myapp.controller('groupController', groupController);
myapp.controller('editGroupController', editGroupController);
myapp.controller('homeController', homeController);