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
	$routeProvider.when("/group/:accessKey", {
		templateUrl : "template/group.html",
		controller : "groupController"
	});
	$routeProvider.when("/group/:accessKey/edit", {
		templateUrl : "template/editGroup.html",
		controller : "editGroupController"
	});
	$routeProvider.when("/group/:groupAccessKey/channel/:channelAccessKey/messages", {
		templateUrl : "template/message.html",
		controller : "messageController"
	});
	$routeProvider.when("/invitation", {
		templateUrl : "template/invitation.html",
		controller : "invitationController"
	});
	$routeProvider.when("/account/:id", {
		templateUrl : "template/account.html",
		controller : "accountController"
	});
	$routeProvider.when("/signout", {
		templateUrl : "template/signouted.html"
	});
	$routeProvider.when("/:page", {
		templateUrl : "template/indexView.html",
		controller : "indexController"
	});
	$routeProvider.otherwise({
		templateUrl : "template/indexView.html",
		controller : "indexController"
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
	$rootScope.showToast = function(message) {
		toastr.info(message);
	}
	$rootScope.showErrorWithStatus = function(status, otherFunc) {
		if (otherFunc && otherFunc(status)) {
			// DO Nothing
		} else if (403 == status) {
			$rootScope.showError($rootScope.messages.error.notAccessible);
		} else if (404 == status) {
			$rootScope.showError($rootScope.messages.error.notFound);
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
				expires : expires,
				secure : "https" == $location.protocol()
			})
		} else {
			$cookies.putObject(SESSION_KEY, sessionKey, {
				secure : "https" == $location.protocol()
			});
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
			$rootScope.socket = io.connect({
				'forceNew' : true
			});
			initSocket();
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
	var contentSocketListeners;
	$rootScope.listenComment = function(contentKey, callback) {
		if (contentSocketListeners.has(contentKey)) {
			return;
		}
		$rootScope.socket.emit('listenComment', contentKey);
		$rootScope.socket.on(contentKey, callback);
		contentSocketListeners.set(contentKey, callback);
	};
	$rootScope.unListenComment = function(contentKey, callback) {
		$rootScope.socket.emit('unListenComment', contentKey);
		$rootScope.socket.removeListener(contentKey, callback);
		contentSocketListeners["delete"](contentKey);
	};
	var channelSocketListeners;
	$rootScope.listenChannel = function(accessKey, callback) {
		if (channelSocketListeners.has(accessKey)) {
			return;
		}
		$rootScope.socket.emit('listenChannel', accessKey);
		$rootScope.socket.on(accessKey, callback);
		channelSocketListeners.set(accessKey, callback);
	};
	$rootScope.requestMessage = function(params) {
		if (!channelSocketListeners.has(params.channelAccessKey)) {
			return;
		}
		$rootScope.socket.emit('requestMessage', JSON.stringify(params));
	};
	$rootScope.sendHello = function(params) {
		if (!channelSocketListeners.has(params.channelAccessKey)) {
			return;
		}
		$rootScope.socket.emit('hello', JSON.stringify(params));
	};
	$rootScope.unListenChannel = function(accessKey, callback) {
		$rootScope.socket.emit('unListenChannel', accessKey);
		$rootScope.socket.removeListener(accessKey, callback);
		channelSocketListeners["delete"](accessKey);
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
	var initSocket = function() {
		channelSocketListeners = new Map();
		contentSocketListeners = new Map();
		$rootScope.disconnected = false;
		$rootScope.socket.on('connect', function(data) {
			$rootScope.socket.emit('authorize', $rootScope.getSessionKey());
			if (!$rootScope.disconnected) {
				return;
			}
			$rootScope.disconnected = false;
			contentSocketListeners.forEach(function(value, key) {
				$rootScope.socket.emit('listenComment', key);
			});
			channelSocketListeners.forEach(function(value, key) {
				$rootScope.socket.emit('listenChannel', key);
			})
		});
		$rootScope.socket.on('disconnect', function(data) {
			$rootScope.disconnected = true;
		});
	}
	initSocket();
	var authorizationImageUrls = [ "", "/images/viewer.png", "/images/editor.png", "/images/admin.png" ];
	$rootScope.getAccountImageUrlInGroup = function(accountInGroup) {
		if (1 == accountInGroup.inviting) {
			return "/images/inviting.png"
		} else if (2 == accountInGroup.inviting) {
			return "/images/request_invitation.png"
		} else if (3 == accountInGroup.inviting) {
			return authorizationImageUrls[accountInGroup.authorization]
		}
	}
	$rootScope.createTitleImage = function(text) {
		var canvas = com.ukiuni.ImageUtil.createTextImage(100, 50, 40, 30, 5, text);
		return canvas.toDataURL('image/png');
	}
} ]);
var openWithBrowser = function(url, event) {
	if (isElectron) {
		require('shell').openExternal(url);
	} else {
		window.open(url);
	}
	event.preventDefault();
}

var indexController = [ "$rootScope", "$scope", "$modal", "$location", "$http", "$window", "$resource", "$routeParams", function($rootScope, $scope, $modal, $location, $http, $window, $resource, $routeParams) {
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
			$dialogScope.isNameDuplicateName = false;
			$dialogScope.$watch("name", function() {
				if ($dialogScope.name && $dialogScope.name.length >= 4) {
					$resource("/api/account/nameNotDuplicate").get({
						name : $dialogScope.name
					}, function(contents) {
						$dialogScope.isNameDuplicateName = false;
					}, function(error) {
						$dialogScope.isNameDuplicateName = true;
					});
				}
			});
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
					var responseData = JSON.stringify(response.data);
					if (responseData.error = "name") {
						$rootScope.showError($rootScope.messages.accounts.error.duplicateName);
					} else {
						$rootScope.showError($rootScope.messages.accounts.error.aleadyHaveAccount);
					}
					return true;
				}
				return false;
			});
		});
	}
	$resource("/api/content/").query({
		page : $routeParams.page
	}, function(contents) {
		$scope.contents = contents;
	}, function(error) {
		$rootScope.showErrorWithStatus(error.status);
	});
	$scope.page = $routeParams.page ? parseInt($routeParams.page) : 0;
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
			$rootScope.socket.emit('authorize', $rootScope.getSessionKey());
			$location.path("/home");
		}, function(error) {
			$rootScope.showError($rootScope.messages.signin.error);
		})
	}
} ];
var invitationController = [ "$rootScope", "$scope", "$resource", "$location", "$http", function($rootScope, $scope, $resource, $location, $http) {
	var invitationKey = $location.search()["key"];
	var Invitation = $resource('/api/account/invitation?key=:key');
	Invitation.get({
		key : invitationKey
	}, function(account) {
		$scope.account = account;
		$scope.signinAccount.mail = $scope.account.mail;
		$scope.signupAccount.mail = $scope.account.mail;
	}, function(error) {
		$rootScope.showErrorWithStatus(error.status);
	});
	$scope.signinAccount = {}
	$scope.signin = function() {
		var Signin = $resource('/api/account/signin');
		Signin.get({
			mail : $scope.signinAccount.mail,
			password : $scope.signinAccount.password,
			invitationKey : invitationKey
		}, function(loginInfo) {
			$rootScope.myAccount = loginInfo.account;
			$rootScope.sessionKey = loginInfo.sessionKey.secret;
			if ($scope.persist) {
				$rootScope.setSessionKey($rootScope.sessionKey, "Tue, 1-Jan-2030 00:00:00 GMT;");
			} else {
				$rootScope.setSessionKey($rootScope.sessionKey);
			}
			$rootScope.socket.emit('authorize', $rootScope.getSessionKey());
			$location.path("/home");
		}, function(error) {
			$rootScope.showError($rootScope.messages.signin.error);
		})
	}
	$scope.signupAccount = {}
	$scope.signup = function() {
		$scope.signupAccount.invitationKey = invitationKey;
		post($http, '/api/account', $scope.signupAccount).then(function(data, status, headers, config) {
			$location.path("/signin");
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
	if (!$rootScope.getSessionKey()) {
		$location.path("/home");
		return;
	}
	$scope.targetGroupId = $rootScope.pullTargetGroupId();
	$scope.save = function(func, successCallback, errorCallback) {
		var url;
		if (!func) {
			func = put;
			url = '/api/content/' + $scope.editingContent.contentKey
		}
		if (!$scope.editingContent.contentKey) {
			func = post;
			url = '/api/content';
		}
		var tags
		if ($scope.editingContent.tags) {
			tags = $scope.editingContent.tags.map(function(val) {
				return val.text
			}).filter(function(val) {
				return "" != val && val.indexOf(",") < 0;
			}).join(",");
		}
		func($http, url, {
			title : $scope.editingContent.title,
			article : $scope.editingContent.article,
			contentKey : $scope.editingContent.contentKey,
			sessionKey : $rootScope.getSessionKey(),
			status : $scope.editingContent.status.keyNumber,
			topImageUrl : $scope.editingContent.topImageUrl,
			groupId : $scope.contentGroup && 0 != $scope.contentGroup.id ? $scope.contentGroup.id : null,
			tags : tags
		}).success(function(content) {
			if (successCallback) {
				successCallback(content);
			} else {
				alertOnLeave = false;
				if ($scope.contentGroup && 0 != $scope.contentGroup.id) {
					$location.path("/group/" + $scope.contentGroup.accessKey);
				} else {
					$location.path("/home");
				}
			}
		}).error(function(error) {
			if (errorCallback) {
				errorCallback();
			} else {
				$rootScope.showError($rootScope.messages.error.withServer);
			}
		});
	}
	var parseContentToEdit = function(content) {
		var editingContent = {}
		if ($scope.editingContent) {
			var contentImageFile = $scope.editingContent.contentImageFile;
		}
		editingContent.status = $rootScope.statuses[content.ContentBodies[0].status - 1];
		editingContent.contentKey = content.accessKey;
		editingContent.title = content.ContentBodies[0].title;
		editingContent.article = content.ContentBodies[0].article;
		editingContent.topImageUrl = content.ContentBodies[0].topImageUrl;
		if (content.Tags) {
			editingContent.tags = content.Tags.map(function(val) {
				return {
					text : val.name
				}
			});
		}
		editingContent.contentImageFile = contentImageFile;
		return editingContent;
	}
	$scope.currentTime = new Date().getTime();
	if ($routeParams.contentKey) {
		$resource('/api/content/:contentKey?sessionKey=:sessionKey').get({
			contentKey : $routeParams.contentKey,
			sessionKey : $rootScope.getSessionKey()
		}, function(content) {
			$scope.editingContent = parseContentToEdit(content);
			if (content.Group) {
				$scope.targetGroupId = content.Group.id;
			}
			initGroupSelect();
		}, function(error) {
			$rootScope.showError($rootScope.messages.error.withServer);
		});
	} else {
		$scope.editingContent = {}
		$scope.editingContent.status = $scope.targetGroupId ? $rootScope.statuses[3] : $rootScope.statuses[0]
		$scope.editingContent.tags = []
		$scope.contentGroup = {
			id : 0,
			name : ""
		}
		$scope.editingContent.article = "";
		$scope.save(post, function(content) {
			$scope.editingContent = parseContentToEdit(content);
			if (content.Group) {
				$scope.targetGroupId = content.Group.id;
			}
			initGroupSelect();
		}, function(error) {
			$rootScope.showError($rootScope.messages.error.withServer);
		})
	}
	var upload = function(data, name, success, fail) {
		$uploader.upload({
			url : '/api/image/' + $scope.editingContent.contentKey,
			fields : {
				sessionKey : $rootScope.getSessionKey(),
				name : name
			},
			file : data,
			fileFormDataName : "imageFile",
			sendFieldsAs : "form",
			method : "POST"
		}).success(function(response) {
			if (success) {
				success(response);
			}
		}).error(function(error) {
			if (fail) {
				fail(error);
			}
		});
	};
	var articleTextArea = document.getElementById("article");
	var insertImageToTextarea = function(tumbUrl, fileUrl, name, clazz) {
		var text = "[![" + name + "](" + tumbUrl + " \"" + name + "\"){col-xs-12}](" + fileUrl + ")" + (clazz ? "{" + clazz + " col-xs-12 col-sm-3}" : "");
		var index = articleTextArea.selectionStart;
		if ($scope.editingContent) {
			$scope.editingContent.article = $scope.editingContent.article.substr(0, index) + text + $scope.editingContent.article.substr(index);
		}
	}
	$scope.$watch('articleAppendsImage', function() {
		if (!$scope.articleAppendsImage) {
			return;
		}
		var image = new Image();
		image.onload = function() {
			var trimmedImage = com.ukiuni.ImageUtil.trim(image, 500, 500);
			var updloadFileName = $scope.articleAppendsImage.name;
			upload(trimmedImage, updloadFileName, function(response) {
				var tumbnailImageUrl = response.url;
				upload($scope.articleAppendsImage, updloadFileName, function(response) {
					insertImageToTextarea(tumbnailImageUrl, response.url, $scope.articleAppendsImage.name, "targetOverray");
				}, function(error) {
					$rootScope.showError($rootScope.messages.error.withServer);
				})
			}, function(error) {
				$rootScope.showError($rootScope.messages.error.withServer);
			})
		}
		image.onerror = function(error) {
			var contentType = $scope.articleAppendsImage.type ? $scope.articleAppendsImage.type : "file/unknown";
			var iconCanvas = com.ukiuni.ImageUtil.createIconImage(500, 500, contentType);
			var iconData = com.ukiuni.ImageUtil.canvasToPingBlob(iconCanvas);
			var updloadFileName = $scope.articleAppendsImage.name;
			upload(iconData, updloadFileName, function(response) {
				var tumbnailImageUrl = response.url;
				upload($scope.articleAppendsImage, updloadFileName, function(response) {
					insertImageToTextarea(tumbnailImageUrl, response.url + "/" + updloadFileName, $scope.articleAppendsImage.name, "targetBlank");
				}, function(error) {
					$rootScope.showError($rootScope.messages.error.withServer);
				})
			}, function(error) {
				$rootScope.showError($rootScope.messages.error.withServer);
			})
		}
		image.src = URL.createObjectURL($scope.articleAppendsImage);
	});
	$scope.clearImagePaneSrc = function() {
		$scope.imagePaneSrc = null;
	}
	$scope.$watch('editingContent.article', function(value) {
		if (value) {
			setTimeout(function() {
				$("#articlePreview").find(".targetBlank").attr("target", "_blank");
				$("#articlePreview").find(".targetOverray").click(function(event) {
					var imageSource = $(this).attr('href');
					$scope.$apply(function() {
						$scope.imagePaneSrc = imageSource;
					})
					return false;
				});
			});
		}
	});
	$scope.$watch('editingContent.contentImageFile', function() {
		if ($scope.editingContent && $scope.editingContent.contentImageFile) {
			var uploadFunc = function() {
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
			if ($scope.editingContent.contentKey) {
				uploadFunc();
			} else {
				$scope.save("POST", function(content) {
					$scope.editingContent = parseContentToEdit(content);
					$scope.editingContent.article = "";
					initGroupSelect();
					uploadFunc();
				})
			}
		}
	});
	$scope.loadTags = function(query) {
		return $resource('/api/tags/q/:query').query({
			query : query
		}).$promise;
	}
	function initGroupSelect() {
		if ($scope.myGroups && $scope.targetGroupId) {
			$scope.myGroups.forEach(function(group) {
				if ($scope.targetGroupId == group.id) {
					$scope.contentGroup = group;
				}
			})
		}
	}
	$resource('/api/groups/self').query({
		sessionKey : $rootScope.getSessionKey()
	}, function(groups) {
		groups = groups.filter(function(group) {
			return group.AccountInGroup.authorization >= 2;
		});
		groups.unshift({
			id : 0,
			name : ""
		})
		$scope.myGroups = groups;
		initGroupSelect();
	}, function(error) {
		$rootScope.showErrorWithStatus(error.status);
	});
	var alertOnLeave = true;
	$scope.$on('$locationChangeStart', function(event) {
		if (!alertOnLeave) {
			return;
		}
		var answer = confirm($rootScope.messages.alertOnLeave);
		if (!answer) {
			event.preventDefault();
		}
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
		if (error.data.groupAccessKey) {
			$scope.groupAccessKey = error.data.groupAccessKey;
			if (error.data.accountInGroup) {
				$scope.accountInGroup = error.data.accountInGroup;
				$scope.join = function() {
					put($http, "/api/groups/" + $scope.groupAccessKey + "/join", {
						sessionKey : $rootScope.getSessionKey()
					}).then(function(response) {
						delete $scope.accountInGroup;
						delete $scope.groupAccessKey;
						$resource('/api/content/:contentKey?sessionKey=:sessionKey').get({
							contentKey : $routeParams.contentKey,
							sessionKey : $rootScope.getSessionKey()
						}, function(content) {
							$scope.content = content;
							$rootScope.title = content.ContentBodies[0].title;
						});
					})["catch"](function(response) {
						$rootScope.showErrorWithStatus(response.status);
					});
				}
			} else {
				if ($rootScope.myAccount) {
					$scope.requestInvitationMail = $rootScope.myAccount.mail
				}
				$scope.sendInvitationRequest = function() {
					post($http, "/api/groups/" + $scope.groupAccessKey + "/invitaionRequest", {
						mail : $scope.requestInvitationMail,
						sessionKey : $rootScope.getSessionKey()
					}).then(function(response) {
						$rootScope.showToast($rootScope.messages.groups.invitationRequestSended);
						delete $scope.groupAccessKey;
					})["catch"](function(response) {
						$rootScope.showErrorWithStatus(response.status, function(status) {
							if (409 == status) {
								$rootScope.showError($rootScope.messages.groups.error.aleadyIn);
								return true;
							} else if (412 == status) {
								$rootScope.showError($rootScope.messages.accounts.error.aleadyHaveAccount);
								return true;
							}
							return false;
						});
					});
				}
			}
		} else {
			$rootScope.showErrorWithStatus(error.status);
		}
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
	$scope.$watch('content.ContentBodies[0].article', function(value) {
		if (value) {
			setTimeout(function() {
				$("#article").find(".targetBlank").attr("target", "_blank");
				$("#article").find(".targetOverray").click(function(event) {
					var imageSource = $(this).attr('href');
					$scope.$apply(function() {
						$scope.imagePaneSrc = imageSource;
					})
					return false;
				});
			});
		}
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
	var contentKey = $routeParams.contentKey;
	$scope.$on('$destroy', function() {
		$rootScope.unListenComment(contentKey, listenComment);
	});
	$scope.clearImagePaneSrc = function() {
		$scope.imagePaneSrc = null;
	}
} ];
var tagsController = [ "$rootScope", "$scope", "$resource", "$location", "$http", function($rootScope, $scope, $resource, $location, $http) {
	$resource('/api/tags/listAll').query({}, function(tags) {
		$scope.tags = tags;
	}, function(error) {
		$rootScope.showErrorWithStatus(error.status);
	});
} ];
var tagController = [ "$rootScope", "$scope", "$resource", "$location", "$http", "$routeParams", function($rootScope, $scope, $resource, $location, $http, $routeParams) {
	try {
		$scope.page = parseInt($location.search()["page"]);
	} catch (e) {
	}
	if (!$scope.page) {
		$scope.page = 0;
	}
	$resource('/api/tags/' + $routeParams.id + "/contents").get({
		page : $scope.page
	}, function(tag) {
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
var groupController = [ "$rootScope", "$scope", "$resource", "$location", "$http", "$routeParams", "$modal", function($rootScope, $scope, $resource, $location, $http, $routeParams, $modal) {
	var initGroup = function(callback) {
		$resource('/api/groups/:accessKey').get({
			accessKey : $routeParams.accessKey,
			sessionKey : $rootScope.getSessionKey()
		}, function(group) {
			$scope.group = group;
			$scope.group.visibility = $rootScope.groupVisibilities[group.visibility - 1];
			$scope.visible = ((1 == $scope.group.visibility.keyNumber) || $scope.isMember()) ? 'YES' : 'NO';
			if (callback) {
				callback();
			}
		}, function(error) {
			$rootScope.showErrorWithStatus(error.status, function(status) {
				if (403 == status) {
					$scope.visible = 'NO'
					return true;
				}
				return false;
			});
			if (callback) {
				callback();
			}
		});
	}
	initGroup();
	$scope.gotoEdit = function() {
		$location.path("/group/" + $routeParams.accessKey + "/edit");
	}
	$scope.invite = function() {
		post($http, '/api/groups/' + $routeParams.accessKey + "/invite", {
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
	$scope.inviteWithRequest = function(targetMail, authorization) {
		post($http, '/api/groups/' + $routeParams.accessKey + "/invite", {
			sessionKey : $rootScope.getSessionKey(),
			mail : targetMail,
			authorization : authorization
		}).then(function(response) {
			for ( var i in $scope.group.Accounts) {
				if ($scope.group.Accounts[i].id == response.data.id) {
					$scope.group.Accounts[i].AccountInGroup = response.data.AccountInGroup;
					return;
				}
			}
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
		put($http, "/api/groups/" + $routeParams.accessKey + "/join", {
			sessionKey : $rootScope.getSessionKey()
		}).then(function(response) {
			initGroup(function() {
				for ( var i in $scope.group.Accounts) {
					if ($scope.group.Accounts[i].id == $rootScope.myAccount.id) {
						$scope.group.Accounts[i].AccountInGroup = response.data;
						return;
					}
				}
			});
		})["catch"](function(response) {
			$rootScope.showErrorWithStatus(response.status);
		});
	}
	$rootScope.$watch("myAccount", function(oldValue, newValue) {
		$scope.requestInvitationMail = $rootScope.myAccount ? $rootScope.myAccount.mail : "";
		if ($scope.group) {
			$scope.visible = ((1 == $scope.group.visibility.keyNumber) || $scope.isMember()) ? 'YES' : 'NO';
		}
	});
	$scope.sendInvitationRequest = function() {
		post($http, "/api/groups/" + $routeParams.accessKey + "/invitaionRequest", {
			mail : $scope.requestInvitationMail,
			sessionKey : $rootScope.getSessionKey()
		}).then(function(response) {
			if (!$scope.group) {
				$scope.group = {};
				$scope.group.Accounts = [];
			}
			$scope.group.Accounts.push(response.data);
			$scope.currentInvited = true;
			$rootScope.showToast($rootScope.messages.groups.invitationRequestSended);
		})["catch"](function(response) {
			$rootScope.showErrorWithStatus(response.status, function(status) {
				if (409 == status) {
					$rootScope.showError($rootScope.messages.groups.error.aleadyIn);
					return true;
				} else if (412 == status) {
					$rootScope.showError($rootScope.messages.accounts.error.aleadyHaveAccount);
					return true;
				}
				return false;
			});
		});
	}
	$scope.isInviting = function() {
		if (!$rootScope.myAccount || !$scope.group) {
			return false;
		}
		for ( var i in $scope.group.Accounts) {
			if ($scope.group.Accounts[i].id === $rootScope.myAccount.id && 1 == $scope.group.Accounts[i].AccountInGroup.inviting) {
				return true;
			}
		}
		return false;
	}
	$scope.isNotMember = function() {
		if (!$rootScope.myAccount || !$scope.group) {
			return true;
		}
		for ( var i in $scope.group.Accounts) {
			if ($scope.group.Accounts[i].id === $rootScope.myAccount.id) {
				return false;
			}
		}
		return true;
	}
	$scope.isMember = function() {
		if (!$rootScope.myAccount || !$scope.group) {
			return false;
		}
		for ( var i in $scope.group.Accounts) {
			if ($scope.group.Accounts[i].id === $rootScope.myAccount.id) {
			}
			if ($scope.group.Accounts[i].id === $rootScope.myAccount.id || 3 == $scope.group.Accounts[i].AccountInGroup.inviting) {
				return true;
			}
		}
		return false;
	}
	$scope.isMemberOrInviting = function() {
		if (!$rootScope.myAccount || !$scope.group) {
			return false;
		}
		for ( var i in $scope.group.Accounts) {
			if ($scope.group.Accounts[i].id === $rootScope.myAccount.id) {
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
			if ($scope.group.Accounts[i].id === $rootScope.myAccount.id && 3 == $scope.group.Accounts[i].AccountInGroup.inviting && 2 <= $scope.group.Accounts[i].AccountInGroup.authorization) {
				return true;
			}
		}
		return false;
	}
	$scope.isAdmin = function() {
		if (!$rootScope.myAccount || !$scope.group) {
			return false;
		}
		for ( var i in $scope.group.Accounts) {
			if ($scope.group.Accounts[i].id === $rootScope.myAccount.id && 3 == $scope.group.Accounts[i].AccountInGroup.inviting && 3 == $scope.group.Accounts[i].AccountInGroup.authorization) {
				return true;
			}
		}
		return false;
	}
	$scope.createNewContent = function() {
		$rootScope.setTargetGroupId($scope.group.id);
		$location.path("/editContent");
	}
	$scope.createNewChannel = function() {
		var dialogController = [ "$scope", "$modalInstance", function($dialogScope, $modalInstance) {
			$dialogScope.create = function() {
				var account = {};
				if ("" == $dialogScope.text) {
					return;
				}
				$modalInstance.close($dialogScope.text);
			};
			$dialogScope.text = "";
			$dialogScope.message = $rootScope.messages.channels["new"];
			$dialogScope.placeholder = $rootScope.messages.channels.name;
		} ];
		var modalInstance = $modal.open({
			templateUrl : 'template/confirmWithTextDialog.html',
			controller : dialogController
		});
		modalInstance.result.then(function(channelName) {
			post($http, '/api/groups/' + $routeParams.accessKey + "/channels", {
				sessionKey : $rootScope.getSessionKey(),
				name : channelName
			}).then(function(response) {
				$scope.group.Channels.push(response.data);
			})["catch"](function(response) {
				$rootScope.showErrorWithStatus(response.status);
				sendingMessage = null;
			});
		}, function() {
		});
	}
	$scope.deleteContent = function($index, title, accessKey) {
		var dialogController = [ "$scope", "$modalInstance", function($dialogScope, $modalInstance) {
			$dialogScope["delete"] = function() {
				$modalInstance.close();
			};
			$dialogScope.message = $rootScope.messages.contents.confirmDelete + "\n\n" + title;
		} ];
		var modalInstance = $modal.open({
			templateUrl : 'template/confirmDialog.html',
			controller : dialogController
		});
		modalInstance.result.then(function() {
			$resource("/api/content/:accessKey").remove({
				accessKey : accessKey,
				sessionKey : $rootScope.getSessionKey()
			}, function() {
				$scope.group.Contents.splice($index, 1);
			});
		}, function() {
		});
	}
	$scope.inviteUserAuthorization = $rootScope.groupAuthorizations[0];
} ];
var editGroupController = [ "$rootScope", "$scope", "$resource", "$location", "$http", "$routeParams", function($rootScope, $scope, $resource, $location, $http, $routeParams) {
	if (!$routeParams.accessKey || $routeParams.accessKey == 0) {
		$scope.group = {};
		$scope.group.visibility = $rootScope.groupVisibilities[0];
	} else {
		$resource('/api/groups/:accessKey').get({
			accessKey : $routeParams.accessKey,
			sessionKey : $rootScope.getSessionKey()
		}, function(group) {
			$scope.group = group;
			$scope.group.visibility = $rootScope.groupVisibilities[group.visibility - 1];
		}, function(error) {
			$rootScope.showErrorWithStatus(error.status);
		});
	}
	$scope.cancel = function() {
		if (!$routeParams.accessKey || $routeParams.accessKey == 0) {
			$location.path("/groups");
		} else {
			$location.path("/group/" + $routeParams.accessKey);
		}
	}
	$scope.save = function() {
		var execFunc;
		if (!$routeParams.accessKey || $routeParams.accessKey == 0) {
			execFunc = post;
		} else {
			execFunc = put;
		}
		execFunc($http, '/api/groups', {
			sessionKey : $rootScope.getSessionKey(),
			accessKey : $routeParams.accessKey,
			name : $scope.group.name,
			description : $scope.group.description,
			imageUrl : $scope.imageUrl,
			visibility : $scope.group.visibility.keyNumber
		}).success(function(group) {
			$location.path("/group/" + group.accessKey);
		}).error(function(error) {
			$rootScope.showErrorWithStatus(error.status, function(status) {
				if (409 == status) {
					$rootScope.showError($rootScope.messages.groups.error.aleadyThisName);
					return true;
				}
				return false;
			});
		});
	}
} ];
var messageController = [ "$rootScope", "$scope", "$resource", "$location", "$http", "$routeParams", function($rootScope, $scope, $resource, $location, $http, $routeParams) {
	$resource('/api/groups/:groupAccessKey/:channelAccessKey').get({
		groupAccessKey : $routeParams.groupAccessKey,
		channelAccessKey : $routeParams.channelAccessKey,
		sessionKey : $rootScope.getSessionKey()
	}, function(channel) {
		$scope.channel = channel;
		$scope.channel.Group.visibility = $rootScope.groupVisibilities[channel.Group.visibility - 1];
		$scope.channel.messages = [];
		var jqScrollPane = $("#messageScrollPane");
		var jqScrollInner = $("#messageScrollInner");
		var listenComment = function(event) {
			event = JSON.parse(event);
			if ("message" == event.type || "historicalMessage" == event.type) {
				var message = event.message;
				$scope["$apply"](function() {
					$scope.channel.messages.push(message);
					if (jqScrollPane.scrollTop() > jqScrollInner.height() - jqScrollPane.height() - 30) {
						jqScrollPane.animate({
							scrollTop : jqScrollInner.height()
						}, 50);
					}
				});
				if (!$rootScope.myAccount) {
					return;
				}
				if (0 <= message.body.indexOf($rootScope.myAccount.name) && !document.hasFocus()) {
					var n = new Notification($rootScope.messages.message, {
						body : message.body
					});
					n.onclick = function() {
						$("#messageInput").focus();
					};
				}
			} else if ("join" == event.type || "hello" == event.type) {
				var joinedAccount = event.account;
				if (channel.Group.Accounts) {
					channel.Group.Accounts.forEach(function(account) {
						if (account.id == joinedAccount.id) {
							$scope["$apply"](function() {
								account.now = true;
							});
						}
					});
				}
				if ("join" == event.type) {
					$rootScope.sendHello({
						channelAccessKey : $routeParams.channelAccessKey
					})
				}
			} else if ("reave" == event.type) {
				var reaveAccount = event.account;
				if (channel.Group.Accounts) {
					channel.Group.Accounts.forEach(function(account) {
						if (account.id == reaveAccount.id) {
							$scope["$apply"](function() {
								account.now = false;
							});
						}
					});
				}
				if ($rootScope.myAccount.id == reaveAccount.id) {
					$rootScope.sendHello({
						channelAccessKey : $routeParams.channelAccessKey
					})
				}
			}
		}
		$rootScope.listenChannel($routeParams.channelAccessKey, listenComment);
		$rootScope.requestMessage({
			channelAccessKey : $routeParams.channelAccessKey
		})
		var channelAccessKey = $routeParams.channelAccessKey;
		$scope.$on('$destroy', function() {
			$rootScope.unListenChannel(channelAccessKey, listenComment);
		});
	}, function(error) {
		$rootScope.showErrorWithStatus(error.status, function(status) {
			if (403 == status) {
				$rootScope.showErrorWithStatus(error.status);
				$location.path("/group/" + $routeParams.groupAccessKey);
				return true;
			}
			return false;
		});
	});
	var sendingMessage;
	$scope.sendMessage = function() {
		if (sendingMessage != $scope.text) {
			if ("" == $scope.text) {
				return;
			}
			sendingMessage = $scope.text;
			post($http, '/api/groups/' + $routeParams.groupAccessKey + "/channels/" + $routeParams.channelAccessKey + "/messages", {
				sessionKey : $rootScope.getSessionKey(),
				body : $scope.text
			}).then(function(response) {
				$scope.text = "";
				sendingMessage = null;
			})["catch"](function(response) {
				$rootScope.showErrorWithStatus(response.status);
				sendingMessage = null;
			});
			return true;
		}
		return false;
	}
	$scope.handleKeydown = function(e) {
		if (e.which == 13 && $scope.sendWithEnter) {
			var executed = $scope.sendMessage();
			if (executed || "" == $scope.text) {
				e.preventDefault();
			}
		}
	}
	$scope.text = "";
	$scope.sendWithEnter = true;
} ];
var accountController = [ "$rootScope", "$scope", "$resource", "$location", "$http", "$modal", "$routeParams", function($rootScope, $scope, $resource, $location, $http, $modal, $routeParams) {
	var id = $routeParams.id;
	$resource("/api/account/:id").get({
		id : id
	}, function(account) {
		$scope.account = account;
	}, function(error) {
		$rootScope.showErrorWithStatus(error.status);
	});
} ];
var homeController = [ "$rootScope", "$scope", "$resource", "$location", "$http", "$modal", function($rootScope, $scope, $resource, $location, $http, $modal) {
	if (!$rootScope.getSessionKey()) {
		$location.path("/");
		return;
	}
	$resource("/api/content/").query({
		sessionKey : $rootScope.getSessionKey()
	}, function(contents) {
		$scope.myContents = contents;
	}, function(error) {
		$rootScope.showErrorWithStatus(error.status);
	});
	$resource("/api/groups/self").query({
		sessionKey : $rootScope.getSessionKey()
	}, function(groups) {
		$scope.myGroups = groups;
	}, function(error) {
		$rootScope.showErrorWithStatus(error.status);
	});
	$scope.createNewContent = function() {
		$location.path("/editContent");
	}
	$scope.deleteContent = function($index, title, accessKey) {
		var dialogController = [ "$scope", "$modalInstance", function($dialogScope, $modalInstance) {
			$dialogScope["delete"] = function() {
				$modalInstance.close();
			};
			$dialogScope.message = $rootScope.messages.contents.confirmDelete + "\n\n" + title;
		} ];
		var modalInstance = $modal.open({
			templateUrl : 'template/confirmDialog.html',
			controller : dialogController
		});
		modalInstance.result.then(function() {
			$resource("/api/content/:accessKey").remove({
				accessKey : accessKey,
				sessionKey : $rootScope.getSessionKey()
			}, function() {
				$scope.myContents.splice($index, 1);
			});
		}, function() {
		});
	}
} ];
myapp.controller('indexController', indexController);
myapp.controller('activationController', activationController);
myapp.controller('signinController', signinController);
myapp.controller('invitationController', invitationController);
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
myapp.controller('messageController', messageController);
myapp.controller('accountController', accountController);
myapp.controller('homeController', homeController);