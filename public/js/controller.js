toastr.options = {
	"positionClass" : "toast-top-center"
}
var myapp = angular.module('app', [ 'ui.bootstrap', 'ngRoute', 'ngResource', "ngCookies", 'ngFileUpload', 'ngTagsInput' ]);
myapp.config([ "$locationProvider", "$httpProvider", "$routeProvider", function($locationProvider, $httpProvider, $routeProvider, $rootScope, $location) {
	$locationProvider.html5Mode(true);
	$httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
	$httpProvider.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
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
	$routeProvider.when("/signout", {
		templateUrl : "template/signouted.html"
	});
	$routeProvider.otherwise({
		redirectTo : "/"
	});
} ]);
myapp.run([ "$rootScope", "$location", "$resource", "$cookies", function($rootScope, $location, $resource, $cookies) {
	$resource('/api/resource/messages?lang=:lang').get({
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
	}, function() {
		$rootScope.showError("Fail to load message resource.");
	});
	$rootScope.showError = function(message) {
		toastr.error(message);
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
		$resource('/api/account/accessKey?key=:sessionKey').remove({
			sessionKey : $rootScope.sessionKey
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
	if (sessionKey) {
		$resource('/api/account?sessionKey=:sessionKey').get({
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
		post($http, '/api/account', account).success(function(data, status, headers, config) {
			if (callback) {
				callback();
			}
		}).error(function(data, status, headers, config) {
			$scope.error = "Load error";
		});
	}
} ];
var post = function($http, url, object, successFunc, errorFunc) {
	return httpRequest($http, "POST", url, object, successFunc, errorFunc);
}
var put = function($http, url, object, successFunc, errorFunc) {
	return httpRequest($http, "PUT", url, object, successFunc, errorFunc);
}
var httpRequest = function($http, method, url, object, successFunc, errorFunc) {
	var http = $http({
		url : url,
		method : method,
		data : JSON.stringify(object),
		headers : {
			'Content-Type' : 'application/json'
		}
	})
	if (successFunc) {
		http.success(successFunc)
	}
	if (errorFunc) {
		http.error(errorFunc)
	}
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
		var Signin = $resource('/api/account/signin?mail=:mail&password=:password');
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
		}).success(function(account) {
			$location.path("/resetPasswordRequested");
		}).error(function(error) {
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
			key : $rootScope.sessionKey
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
				key : $rootScope.sessionKey
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
		var tags = $scope.editingContent.tags.map(function(val) {
			return val.text
		}).filter(function(val) {
			return "" != val && val.indexOf(",") < 0;
		}).join(",");
		func($http, '/api/content', {
			title : $scope.editingContent.title,
			article : $scope.editingContent.article,
			contentKey : $scope.editingContent.contentKey,
			sessionKey : $rootScope.sessionKey,
			status : $scope.editingContent.status.keyNumber,
			topImageUrl : $scope.editingContent.topImageUrl,
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
			if (content.Tags) {
				$scope.editingContent.tags = content.Tags.map(function(val) {
					return {
						text : val.name
					}
				});
			}
		}, function(error) {
			$rootScope.showError($rootScope.messages.error.withServer);
		});
	} else {
		$scope.editingContent = {}
		$scope.editingContent.status = $rootScope.statuses[0]
		$scope.editingContent.tags = []
		$scope.save(post, function(content) {
			$scope.editingContent.contentKey = content.accessKey;
		});
	}
	$scope.$watch('editingContent.contentImageFile', function() {
		if ($scope.editingContent && $scope.editingContent.contentImageFile) {
			$scope.fileName = $scope.editingContent.contentImageFile.name;
			$uploader.upload({
				url : '/api/image/' + $scope.editingContent.contentKey,
				fields : {
					sessionKey : $rootScope.sessionKey
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
		return $resource('/api/tags/:query').query({
			query : query
		}).$promise;
	}
} ];
var contentController = [ "$rootScope", "$scope", "$resource", "$location", "$http", "$routeParams", function($rootScope, $scope, $resource, $location, $http, $routeParams) {
	$resource('/api/content/:contentKey?sessionKey=:sessionKey').get({
		contentKey : $routeParams.contentKey,
		sessionKey : $rootScope.getSessionKey()
	}, function(content) {
		$scope.content = content;
	}, function(error) {
		if (403 == error.status) {
			$rootScope.showError($rootScope.messages.error.notAccessible);
		} else if (404 == error.status) {
			$rootScope.showError($rootScope.messages.error.notFound);
		} else {
			$rootScope.showError($rootScope.messages.error.withServer);
		}
	});
	$resource('/api/content/comment/:contentKey?sessionKey=:sessionKey').query({
		contentKey : $routeParams.contentKey,
		sessionKey : $rootScope.getSessionKey()
	}, function(comments) {
		$scope.comments = comments;
	}, function(error) {
		if (403 == error.status) {
			$rootScope.showError($rootScope.messages.error.notAccessible);
		} else if (404 == error.status) {
			$rootScope.showError($rootScope.messages.error.notFound);
		} else {
			$rootScope.showError($rootScope.messages.error.withServer);
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
		}).success(function(data, status, headers, config) {
			$scope.newComment = {};
		}).error(function(data, status, headers, config) {
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
var homeController = [ "$rootScope", "$scope", "$resource", "$location", "$http", function($rootScope, $scope, $resource, $location, $http) {
	if (!$rootScope.myAccount) {
		$location.path("/signin");
		return;
	}
	$resource('/api/content/?sessionKey=:sessionKey').query({
		sessionKey : $rootScope.sessionKey
	}, function(contents) {
		$scope.myContents = contents;
	}, function(error) {
	});
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
myapp.controller('homeController', homeController);