if (!String.prototype.endsWith) {
	Object.defineProperty(String.prototype, 'endsWith', {
		enumerable : false,
		configurable : false,
		writable : false,
		value : function(searchString, position) {
			position = position || this.length;
			position = position - searchString.length;
			return this.lastIndexOf(searchString) === position;
		}
	});
}
function bounce() {
	try {
		if (isElectron) {
			var app = require('remote').require("app");
			app.dock.bounce("critical");
		}
	} catch (ignored) {
	}
}
toastr.options = {
	"positionClass" : "toast-bottom-right"
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
	$routeProvider.when("/manageKey", {
		templateUrl : "template/manageKey.html",
		controller : "manageKeyController"
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
	$routeProvider.when("/content/:contentKey/:date", {
		templateUrl : "template/contentView.html",
		controller : "contentController"
	});
	$routeProvider.when("/editCalendarAlbum", {
		templateUrl : "template/editCalendarAlbum.html",
		controller : "editCalendarAlbumController"
	});
	$routeProvider.when("/editCalendarAlbum/:contentKey", {
		templateUrl : "template/editCalendarAlbum.html",
		controller : "editCalendarAlbumController"
	});
	$routeProvider.when("/editCalendarAlbum/:contentKey/:date", {
		templateUrl : "template/editCalendarAlbum.html",
		controller : "editCalendarAlbumController"
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
	$routeProvider.when("/license", {
		templateUrl : "template/license.html"
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
myapp.run([ "$rootScope", "$location", "$resource", "$cookies", "Upload", function($rootScope, $location, $resource, $cookies, $uploader) {
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
	$rootScope.gotoEditContent = function(content) {
		if ("calendar" == content.type) {
			$rootScope["goto"]("/editCalendarAlbum/" + content.accessKey);
		} else {
			$rootScope["goto"]('/editContent/' + content.accessKey);
		}
	}
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
			var reconnectFunction = function() {
				$rootScope.socket.removeListener('authorized', reconnectFunction);
				contentSocketListeners.forEach(function(value, key) {
					$rootScope.socket.emit('listenComment', key);
				});
				channelSocketListeners.forEach(function(value, key) {
					$rootScope.socket.emit('listenChannel', key);
				})
			};
			$rootScope.socket.on('authorized', reconnectFunction);
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
	var upload = function(contentKey, data, name, success, fail) {
		$uploader.upload({
			url : '/api/image/' + contentKey,
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
	var uploadAsFile = function(contentKey, file, onSuccess, onError) {
		var contentType = file.type ? file.type : "file/unknown";
		var iconCanvas = com.ukiuni.ImageUtil.createIconImage(500, 500, contentType);
		var iconData = com.ukiuni.ImageUtil.canvasToPngBlob(iconCanvas);
		var updloadFileName = file.name;
		upload(contentKey, iconData, updloadFileName, function(response) {
			var thumbnailImageUrl = response.url;
			upload(contentKey, file, updloadFileName, function(response) {
				var contentUrl = response.url;
				if (onSuccess) {
					onSuccess(thumbnailImageUrl, contentUrl, file);
				}
			}, function(error) {
				if (onError) {
					onError(error);
				}
			})
		}, function(error) {
			if (onError) {
				onError(error);
			}
		})
	}
	$rootScope.uploadFile = function(contentKey, srcFile, onSuccess, onSuccessAsFile, onError) {
		if (0 == srcFile.type.lastIndexOf("video", 0)) {
			var video = document.createElement("video");
			video.addEventListener("loadeddata", function() {
				var width = video.videoWidth;
				var height = video.videoHeight;
				var duration = video.duration;
				var canvas = document.createElement("canvas");
				canvas.width = width;
				canvas.height = height;
				var context = canvas.getContext("2d")
				context.drawImage(video, 0, 0, width, height);
				var tumbImage = new Image();
				tumbImage.onload = function() {
					var thumbnailImage = com.ukiuni.ImageUtil.trimAndAppendPlayIcon(tumbImage, 500, 500);
					var updloadFileName = srcFile.name;
					upload(contentKey, thumbnailImage, updloadFileName, function(response) {
						var thumbnailImageUrl = response.url;
						upload(contentKey, srcFile, updloadFileName, function(response) {
							var fileImageUrl = response.url;
							if (onSuccess) {
								onSuccess(thumbnailImageUrl, fileImageUrl, srcFile);
							}
						}, function(error) {
							if (onError) {
								onError(error);
							}
						})
					}, function(error) {
						if (onError) {
							onError(error);
						}
					});
				};
				tumbImage.src = canvas.toDataURL("image/png");
			});
			video.addEventListener("error", function(error) {
				uploadAsFile(contentKey, srcFile, function(thumbnailImageUrl, fileImageUrl, srcFile) {
					onSuccessAsFile(thumbnailImageUrl, fileImageUrl, srcFile);
				}, function() {
					if (onError) {
						onError(error);
					}
				});
			});
			video.setAttribute("src", URL.createObjectURL(srcFile));
			video.currentTime = 0;
		} else if (0 == srcFile.type.lastIndexOf("image", 0)) {
			var image = new Image();
			image.onload = function() {
				var trimmedImage = com.ukiuni.ImageUtil.trim(image, 500, 500);
				var updloadFileName = srcFile.name;
				upload(contentKey, trimmedImage, updloadFileName, function(response) {
					var thumbnailImageUrl = response.url;
					upload(contentKey, srcFile, updloadFileName, function(response) {
						onSuccess(thumbnailImageUrl, response.url, srcFile);
					}, function(error) {
						if (onError) {
							onError(error);
						}
					})
				}, function(error) {
					if (onError) {
						onError(error);
					}
				})
			}
			image.src = URL.createObjectURL(srcFile);
		} else {
			uploadAsFile(contentKey, srcFile, function(thumbnailImageUrl, fileImageUrl, srcFile) {
				onSuccessAsFile(thumbnailImageUrl, fileImageUrl, srcFile);
			}, function() {
				if (onError) {
					onError(error);
				}
			});
		}
	}
	$rootScope.contentIcon = [];
	$rootScope.contentIcon["calendar"] = "/images/calendar_icon.png";
	$rootScope.contentIcon["markdown"] = "/images/article_icon.png";
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
var manageKeyController = [ "$rootScope", "$scope", "$resource", "$location", "$http", "Upload", function($rootScope, $scope, $resource, $location, $http, $uploader) {
	if (!$rootScope.myAccount) {
		$location.path("/home");
		return;
	}
	$resource('/api/account/keys').query({
		sessionKey : $rootScope.getSessionKey()
	}, function(keys) {
		$scope.myKeys = keys;
		$scope.typeMessages = [];
		var initTypeMessage = function() {
			$scope.typeMessages[3] = $rootScope.messages.keys.typeLogin;
			$scope.typeMessages[6] = $rootScope.messages.keys.typeGenerated;
		}
		if ($rootScope.messages) {
			initTypeMessage();
		} else {
			$rootScope.$watch("messages", initTypeMessage);
		}
	}, function(error) {
		$rootScope.showError($rootScope.messages.error.withServer);
	});
	$scope.deleteKey = function(index, key) {
		$resource('/api/account/keys')["delete"]({
			sessionKey : $rootScope.getSessionKey(),
			secret : key.secret
		}, function(key) {
			$scope.myKeys.splice(index, 1)
		}, function(error) {
			$rootScope.showError($rootScope.messages.error.withServer);
		});
	}
	$scope.createKey = function() {
		post($http, '/api/account/keys', {
			sessionKey : $rootScope.getSessionKey(),
		}).success(function(key) {
			$scope.myKeys.unshift(key);
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
		$scope.editingContent.status = $scope.targetGroupId ? $rootScope.statuses[3] : $rootScope.statuses[1]
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
	var articleTextArea = document.getElementById("article");
	var insertImageToTextarea = function(tumbUrl, fileUrl, name, clazz) {
		var text = "[![" + name + "](" + tumbUrl + " \"" + name + "\"){col-xs-12}](" + fileUrl + ")" + (clazz ? "{" + clazz + " col-xs-12 col-sm-3}" : "");
		var index = articleTextArea.selectionStart;
		if ($scope.editingContent) {
			$scope.editingContent.article = $scope.editingContent.article.substr(0, index) + text + $scope.editingContent.article.substr(index);
		}
	}
	$scope.$watch('articleAppendsImage', function() {
		if (!$scope.articleAppendsImage || !$scope.articleAppendsImage.length) {
			return;
		}
		$scope.articleAppendsImage.forEach(function(srcFile) {
			var contentKey = $scope.editingContent.contentKey;
			var onError = function(error) {
				$rootScope.showError($rootScope.messages.error.withServer);
			}
			var onSuccess = function(thumbnailImageUrl, fileImageUrl, srcFile) {
				insertImageToTextarea(thumbnailImageUrl, fileImageUrl, srcFile.name, "targetOverray");
			}
			var onSuccessAsFile = function(thumbnailImageUrl, fileImageUrl, srcFile) {
				insertImageToTextarea(thumbnailImageUrl, fileImageUrl + "/" + srcFile.name, srcFile.name, "targetBlank");
			}
			$rootScope.uploadFile(contentKey, srcFile, onSuccess, onSuccessAsFile, onError);
		});
	});
	$scope.clearImagePaneSrc = function() {
		$scope.imagePaneSrc = null;
		$scope.videoPaneSrc = null;
	}
	$scope.$watch('editingContent.article', function(value) {
		if (value) {
			setTimeout(function() {
				$("#articlePreview").find(".targetBlank").attr("target", "_blank");
				$("#articlePreview").find(".targetOverray").click(function(event) {
					var imageSource = $(this).attr('href');
					if (imageSource.endsWith(".mp4") || imageSource.endsWith(".mov") || imageSource.endsWith(".mpeg4") || imageSource.endsWith(".webm")) {
						$scope.$apply(function() {
							$scope.videoPaneSrc = imageSource;
							var overlayVideo = document.getElementById("overlayVideo");
							if (window.innerWidth > window.innerHeight) {
								overlayVideo.style.height = "100%";
							} else {
								overlayVideo.style.width = "100%";
							}
						})
					} else {
						$scope.$apply(function() {
							$scope.imagePaneSrc = imageSource;
						})
					}
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
				$scope.save(post, function(content) {
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
	var pressingKeyMap = [];
	$scope.keyDown = function(event) {
		if (event.ctrlKey || pressingKeyMap[91] || pressingKeyMap[18]) {// ctrl
			// or
			// command
			// or
			// option
			if (83 == event.which) {// s
				$scope.save(null, function() {
					$rootScope.showToast($rootScope.messages.contents.saved);
				}, function() {
					$rootScope.showError($rootScope.messages.contents.errors.failToSave);
				});
				event.preventDefault();
				return false;
			} else if (69 == event.which) {// e
				alertOnLeave = false;
				if ($scope.contentGroup && 0 != $scope.contentGroup.id) {
					$location.path("/group/" + $scope.contentGroup.accessKey);
				} else {
					$location.path("/home");
				}
				event.preventDefault();
				return false;
			}
		}
		pressingKeyMap[event.which] = true;
		return true;
	}
	$scope.keyUp = function(event) {
		delete pressingKeyMap[event.which];
	}
} ];
var editCalendarAlbumController = [ "$rootScope", "$scope", "$resource", "$location", "$http", "$routeParams", function($rootScope, $scope, $resource, $location, $http, $routeParams) {
	$scope.contentKey = $routeParams.contentKey
	$scope.targetGroupId = $rootScope.pullTargetGroupId();
	$scope.date = $routeParams.date
	if (!$scope.date) {
		$scope.firstDay = new Date();
		$scope.firstDay.setDate(1);
	} else {
		try {
			$scope.firstDay = new Date();
			$scope.firstDay.setFullYear(parseInt($scope.date.substring(0, 4)));
			$scope.firstDay.setMonth(parseInt($scope.date.substring(4, 6)) - 1);
			$scope.firstDay.setDate(1);
		} catch (e) {
			$scope.firstDay = new Date();
			$scope.firstDay.setDate(1);
		}
	}
	var maxDay = new Date($scope.firstDay.getFullYear(), $scope.firstDay.getMonth(), 0).getDate();
	var dayBoxCount = $scope.firstDay.getDay() + maxDay;
	$scope.weekColumn = [ 0, 1, 2, 3 ];
	for (var i = 4; dayBoxCount / (7 * i) > 1; i++) {
		$scope.weekColumn.push(i);
	}
	var prevMonth = new Date($scope.firstDay.getFullYear(), $scope.firstDay.getMonth() - 1, 1);
	var nextMonth = new Date($scope.firstDay.getFullYear(), $scope.firstDay.getMonth() + 1, 1);
	$scope.gotoPrevMonth = function() {
		$location.path("/editCalendarAlbum/" + $scope.editingContent.contentKey + "/" + prevMonth.getFullYear() + "" + (prevMonth.getMonth() + 1))
	}
	$scope.gotoNextMonth = function() {
		$location.path("/editCalendarAlbum/" + $scope.editingContent.contentKey + "/" + nextMonth.getFullYear() + "" + (nextMonth.getMonth() + 1))
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
	$scope.emptyFunction = function() {
		return function() {
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
	var parseContentToEdit = function(content) {
		var editingContent = {}
		if ($scope.editingContent) {
			var contentImageFile = $scope.editingContent.contentImageFile;
		}
		editingContent.status = $rootScope.statuses[content.ContentBodies[0].status - 1];
		editingContent.contentKey = content.accessKey;
		editingContent.title = content.ContentBodies[0].title;
		editingContent.article = JSON.parse(content.ContentBodies[0].article);
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
			article : JSON.stringify($scope.editingContent.article),
			contentKey : $scope.editingContent.contentKey,
			sessionKey : $rootScope.getSessionKey(),
			status : $scope.editingContent.status.keyNumber,
			topImageUrl : $scope.editingContent.topImageUrl,
			groupId : $scope.contentGroup && 0 != $scope.contentGroup.id ? $scope.contentGroup.id : null,
			tags : tags,
			type : "calendar"
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
	if ($scope.contentKey) {
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
		$scope.editingContent.status = $scope.targetGroupId ? $rootScope.statuses[3] : $rootScope.statuses[1]
		$scope.editingContent.tags = []
		$scope.contentGroup = {
			id : 0,
			name : ""
		}
		$scope.editingContent.article = {};
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
	$scope.editingDescription = [];
	$scope.saveDescription = function(keyDate) {
		if (!$scope.editingDescription[keyDate]) {
			return;
		}
		if (!$scope.editingContent.article[keyDate]) {
			$scope.editingContent.article[keyDate] = {};
			$scope.editingContent.article[keyDate].images = [];
		}
		$scope.editingContent.article[keyDate].description = $scope.editingDescription[keyDate].description;
		delete $scope.editingDescription[keyDate];
		changing = true;
		$scope.save(null, function() {
			$rootScope.showToast($rootScope.messages.contents.saved);
			changing = false;
		}, function() {
			$rootScope.showError($rootScope.messages.contents.errors.failToSave);
		});
	}
	$scope.$on('$locationChangeStart', function(event) {
		if (!changing) {
			return;
		}
		var answer = confirm($rootScope.messages.contents.alertLocationChangeOnSaving);
		if (!answer) {
			event.preventDefault();
		}
	});
	var changing = false;
	$scope.uploadFiles = function(keyDate, files) {
		var changing = true;
		var fileLength = 0;
		files.forEach(function(srcFile) {
			var onSuccessAsFile = function(thumbnailImageUrl, fileImageUrl, srcFile) {
				putToArticle(new Date(), thumbnailImageUrl, fileImageUrl);
			}
			var incrementComplete = function() {
				fileLength++;
				if (fileLength) {
					if (files.length <= fileLength) {
						$scope.save(null, function() {
							$rootScope.showToast($rootScope.messages.contents.saved);
							changing = false;
						}, function() {
							$rootScope.showError($rootScope.messages.contents.errors.failToSave);
						});
					}
				}
			}
			var onSuccess = function(thumbnailUrl, fileUrl, srcFile) {
				if (!$scope.editingContent.article[keyDate]) {
					$scope.editingContent.article[keyDate] = {};
					$scope.editingContent.article[keyDate].images = [];
				}
				$scope.editingContent.article[keyDate].images.unshift({
					thumbnail : thumbnailUrl,
					file : fileUrl
				});
				incrementComplete();
			}
			var onError = function() {
				incrementComplete();
			}
			$rootScope.uploadFile($scope.editingContent.contentKey, srcFile, onSuccess, onSuccess, onError);
		})
	}
	$scope.showImagesAt = function(keyDate) {
		$scope.datePaneSrc = $scope.editingContent.article[keyDate];
		$scope.datePaneSrc.keyDate = keyDate;
		$scope.imagesIndex = 0
		document.getElementById("overlayImage").style.height = "100%";
		document.getElementById("overlayVideo").style.height = "100%";
	};
	$scope.isMovie = function(imageSource) {
		if (!imageSource) {
			return false;
		}
		return (imageSource.endsWith(".mp4") || imageSource.endsWith(".mov") || imageSource.endsWith(".mpeg4") || imageSource.endsWith(".webm"))
	}
	$scope.changeDataPaneImage = function(index, event) {
		$scope.imagesIndex = index;
		event.preventDefault();
		event.stopPropagation()
	}
	$scope.hideImages = function() {
		delete $scope.datePaneSrc;
	}
	$scope.$watch('autoDateSetImages', function() {
		if (!$scope.autoDateSetImages || !$scope.autoDateSetImages.length) {
			return;
		}
		var changing = true;
		var fileLength = 0;
		var putToArticle = function(date, thumbnailUrl, fileUrl) {
			var keyDate = date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate();
			$scope.$apply(function() {
				if (!$scope.editingContent.article[keyDate]) {
					$scope.editingContent.article[keyDate] = {};
					$scope.editingContent.article[keyDate].images = [];
				}
				$scope.editingContent.article[keyDate].images.push({
					thumbnail : thumbnailUrl,
					file : fileUrl
				});
			});
			fileLength++;
			if (fileLength) {
				if ($scope.autoDateSetImages.length <= fileLength) {
					$scope.save(null, function() {
						$rootScope.showToast($rootScope.messages.contents.saved);
						changing = false;
					}, function() {
						$rootScope.showError($rootScope.messages.contents.errors.failToSave);
					});
				}
			}
		}
		$scope.autoDateSetImages.forEach(function(srcFile) {
			var contentKey = $scope.editingContent.contentKey;
			var onError = function(error) {
				$rootScope.showError($rootScope.messages.contents.errors.upload + ":" + srcFile.name);
				fileLength++;
				if ($scope.autoDateSetImages.length <= fileLength) {
					$scope.save(null, function() {
						$rootScope.showToast($rootScope.messages.contents.saved);
						changing = false;
					}, function() {
						$rootScope.showError($rootScope.messages.contents.errors.failToSave);
					});
				}
			}
			var onSuccess = function(thumbnailImageUrl, fileImageUrl, srcFile) {
				if (0 == srcFile.type.lastIndexOf("video", 0)) {
					try {
						mp4(srcFile, function(err, tags) {
							if (err) {
								var date = new Date();
							} else {
								var dateSrc = tags.date;
								if (dateSrc) {
									try {
										var dateValues = dateSrc.split(/[-T:Z\s]/)
										var date = new Date(dateValues[0], dateValues[1] - 1, dateValues[2], dateValues[3], dateValues[4]);
									} catch (ignored) {
									}
								}
							}
							if (!date) {
								date = new Date();
							}
							putToArticle(date, thumbnailImageUrl, fileImageUrl);
						});
					} catch (ignored) {
						putToArticle(new Date(), thumbnailImageUrl, fileImageUrl);
					}
				} else if (0 == srcFile.type.lastIndexOf("image", 0)) {
					try {
						EXIF.getData(srcFile, function() {
							var dateSrc = EXIF.getTag(srcFile, "DateTimeOriginal") || EXIF.getTag(srcFile, "DateTime");
							if (dateSrc) {
								try {
									var dateValues = dateSrc.split(/[:\s]/)
									var date = new Date(dateValues[0], dateValues[1] - 1, dateValues[2], dateValues[3], dateValues[4]);
								} catch (ignored) {
								}
							}
							if (!date) {
								date = new Date();
							}
							putToArticle(date, thumbnailImageUrl, fileImageUrl);
						});
					} catch (ignored) {
						putToArticle(new Date(), thumbnailImageUrl, fileImageUrl);
					}
				}
			}
			var onSuccessAsFile = function(thumbnailImageUrl, fileImageUrl, srcFile) {
				putToArticle(new Date(), thumbnailImageUrl, fileImageUrl);
			}
			$rootScope.uploadFile(contentKey, srcFile, onSuccess, onSuccessAsFile, onError);
		});
	});
} ]
var contentController = [ "$rootScope", "$scope", "$resource", "$location", "$http", "$routeParams", function($rootScope, $scope, $resource, $location, $http, $routeParams) {
	$resource('/api/content/:contentKey?sessionKey=:sessionKey').get({
		contentKey : $routeParams.contentKey,
		sessionKey : $rootScope.getSessionKey()
	}, function(content) {
		$scope.content = content;
		$rootScope.title = content.ContentBodies[0].title;
		if ("calendar" == content.type) {
			initCalendar();
		}
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
					if (imageSource.endsWith(".mp4") || imageSource.endsWith(".mov") || imageSource.endsWith(".mpeg4") || imageSource.endsWith(".webm")) {
						$scope.$apply(function() {
							$scope.videoPaneSrc = imageSource;
							var overlayVideo = document.getElementById("overlayVideo");
							if (window.innerWidth > window.innerHeight) {
								overlayVideo.style.height = "100%";
							} else {
								overlayVideo.style.width = "100%";
							}
						})
					} else {
						$scope.$apply(function() {
							$scope.imagePaneSrc = imageSource;
						})
					}
					return false;
				});
			});
		}
	});
	var initCalendar = function() {
		$scope.content.article = JSON.parse($scope.content.ContentBodies[0].article);
		$scope.date = $routeParams.date
		if (!$scope.date) {
			$scope.firstDay = new Date();
			$scope.firstDay.setDate(1);
		} else {
			try {
				$scope.firstDay = new Date();
				$scope.firstDay.setFullYear(parseInt($scope.date.substring(0, 4)));
				$scope.firstDay.setMonth(parseInt($scope.date.substring(4, 6)) - 1);
				$scope.firstDay.setDate(1);
			} catch (e) {
				$scope.firstDay = new Date();
				$scope.firstDay.setDate(1);
			}
		}
		var maxDay = new Date($scope.firstDay.getFullYear(), $scope.firstDay.getMonth(), 0).getDate();
		var dayBoxCount = $scope.firstDay.getDay() + maxDay;
		$scope.weekColumn = [ 0, 1, 2, 3 ];
		for (var i = 4; dayBoxCount / (7 * i) > 1; i++) {
			$scope.weekColumn.push(i);
		}
		var prevMonth = new Date($scope.firstDay.getFullYear(), $scope.firstDay.getMonth() - 1, 1);
		var nextMonth = new Date($scope.firstDay.getFullYear(), $scope.firstDay.getMonth() + 1, 1);
		$scope.gotoPrevMonth = function() {
			$location.path("/content/" + $scope.content.accessKey + "/" + prevMonth.getFullYear() + "" + (prevMonth.getMonth() + 1))
		}
		$scope.gotoNextMonth = function() {
			$location.path("/content/" + $scope.content.accessKey + "/" + nextMonth.getFullYear() + "" + (nextMonth.getMonth() + 1))
		}
		$scope.showImagesAt = function(keyDate) {
			$scope.datePaneSrc = $scope.content.article[keyDate];
			$scope.datePaneSrc.keyDate = keyDate;
			$scope.imagesIndex = 0
			document.getElementById("overlayImage").style.height = "100%";
			document.getElementById("overlayVideo").style.height = "100%";
		};
		$scope.isMovie = function(imageSource) {
			if (!imageSource) {
				return false;
			}
			return (imageSource.endsWith(".mp4") || imageSource.endsWith(".mov") || imageSource.endsWith(".mpeg4") || imageSource.endsWith(".webm"))
		}
		$scope.changeDataPaneImage = function(index, event) {
			$scope.imagesIndex = index;
			event.preventDefault();
			event.stopPropagation()
		}
		$scope.hideImages = function() {
			delete $scope.datePaneSrc;
		}
	}
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
		if ($scope.videoPaneSrc) {
			document.getElementById("overlayVideo").pause();
		}
		$scope.videoPaneSrc = null;
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
var messageController = [ "$rootScope", "$scope", "$resource", "$location", "$http", "$routeParams", "$modal", function($rootScope, $scope, $resource, $location, $http, $routeParams, $modal) {
	$scope.noMarginTop = true;
	$resource('/api/groups/:groupAccessKey/:channelAccessKey').get({
		groupAccessKey : $routeParams.groupAccessKey,
		channelAccessKey : $routeParams.channelAccessKey,
		sessionKey : $rootScope.getSessionKey()
	}, function(channel) {
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
	var loadingHistory = false;
	$scope.loadHistory = function() {
		if ((!$scope.channel.messages[0]) || loadingHistory) {
			return;
		}
		loadingHistory = true;
		var lastLoadId = $scope.channel.messages[0].id;
		$rootScope.requestMessage({
			channelAccessKey : $scope.channel.accessKey,
			idBefore : lastLoadId
		});
	}
	var channelMap = [];
	$resource('/api/account/channels/accessible').query({
		sessionKey : $rootScope.getSessionKey()
	}, function(channels) {
		$scope.joiningChannels = channels;
		$scope.joiningChannels.forEach(function(channel) {
			channel.messages = [];
			channel.unreadCount = 0;
			$rootScope.listenChannel(channel.accessKey, listenComment);
			channelMap[channel.accessKey] = channel;
		});
		$scope.$on('$destroy', function() {
			$scope.joiningChannels.forEach(function(channel) {
				$rootScope.unListenChannel(channel.accessKey, listenComment);
			});
			$rootScope.isSearchable = false;
			$rootScope.search = null;
			$rootScope.searchWord = null;
			$rootScope.searchTimeline = null;
			$rootScope.timelinedMessages = null;
		});
		selectChannel($routeParams.channelAccessKey);
	}, function(error) {
		$rootScope.showErrorWithStatus(error.status);
	});
	var selectChannel = function(channelAccessKey) {
		if ($scope.channel) {
			$scope.channel.scrollTop = jqScrollPane.scrollTop();
		}
		for ( var i in $scope.joiningChannels) {
			if ($scope.joiningChannels[i].accessKey == channelAccessKey) {
				$scope.channel = $scope.joiningChannels[i];
				$scope.channel.unreadCount = 0;
				break;
			}
		}
		delete $scope.channel.notify;
		$scope.channel.Group.visibility = $rootScope.groupVisibilities[$scope.channel.Group.visibility - 1];
		if (0 == $scope.channel.messages.length) {
			$rootScope.requestMessage({
				channelAccessKey : channelAccessKey
			});
		}
		highlightStrongWords(function() {
			if ($scope.channel.scrollTop) {
				jqScrollPane.scrollTop($scope.channel.scrollTop);
				delete $scope.channel.scrollTop;
			}
		});
		delete $scope.sendingMessage;
	}
	$scope.changeChannel = function(channel) {
		selectChannel(channel.accessKey);
	}
	var jqScrollPane = $("#messageScrollPane");
	var jqScrollInner = $("#messageScrollInner");
	var notification;
	var strongWordsParsed;
	var parseStrongWords = function() {
		var strongWordArray
		if ($rootScope.myAccount && $rootScope.myAccount.config && $rootScope.myAccount.config.strongWords) {
			strongWordArray = $rootScope.myAccount.config.strongWords.split(",").map(function(word) {
				return word.replace(/^[\s　]+|[\s　]+$/g, "");
			});
		} else {
			strongWordArray = [ $rootScope.myAccount.name ];
		}
		return strongWordArray;
	}
	var highlightStrongWords = function(onComplete) {
		setTimeout(function() {
			strongWordsParsed.forEach(function(word) {
				$('.messageBody').highlight(word);
			});
			if (onComplete) {
				onComplete();
			}
		}, 0);
	}
	if ($rootScope.myAccount) {
		strongWordsParsed = parseStrongWords();
	} else {
		var unbind = $rootScope.$watch("myAccount", function() {
			strongWordsParsed = parseStrongWords();
			unbind();
			delete unbind;
		})
	}
	var listenComment = function(event) {
		var event = JSON.parse(event);
		var channelAccessKey = event.channelAccessKey;
		var eventTargetChannel = channelMap[channelAccessKey];
		if ("message" == event.type || "historicalMessage" == event.type) {
			var messages = "message" == event.type ? [ event.message ] : event.messages;
			if ("historicalMessage" == event.type) {
				loadingHistory = false;
			}
			messages.forEach(function(message) {
				$scope.$apply(function() {
					if ("message" == event.type) {
						eventTargetChannel.messages.push(message);
						if (message.owner.id == $rootScope.myAccount.id) {
							delete $scope.sendingMessage;
						}
					} else {
						eventTargetChannel.messages.unshift(message);
					}
					if (eventTargetChannel.accessKey == $scope.channel.accessKey) {
						if (jqScrollPane.scrollTop() > jqScrollInner.height() - jqScrollPane.height() - 30) {
							setTimeout(function() {
								jqScrollPane.animate({
									scrollTop : jqScrollInner.height()
								}, 50);
							}, 0);
						}
					} else {
						eventTargetChannel.unreadCount++;
					}
				});
				if (!$rootScope.myAccount) {
					return;
				}
				highlightStrongWords(function() {
					strongWordsParsed.forEach(function(word) {
						if (0 <= message.body.indexOf(word)) {
							if (eventTargetChannel.accessKey != $scope.channel.accessKey) {
								$scope.$apply(function() {
									eventTargetChannel.notify = true;
								});
							}
							if (document.hasFocus()) {
								return;
							}
							if (Notification && "granted" != Notification.permission) {
								Notification.requestPermission(function(status) {
									if (Notification.permission !== status) {
										Notification.permission = status;
									}
								});
							}
							if (notification) {
								notification.close();
							}
							notification = new Notification(message.owner.name + "@" + eventTargetChannel.name, {
								body : message.body,
								iconUrl : "images/application_icon.png",
								icon : "images/application_icon.png"
							});
							notification.onclick = function() {
								$("#messageInput").focus();
								window.focus();
								n.close();
							};
							bounce();
						}
					});
				});
			});
		} else if ("join" == event.type || "hello" == event.type) {
			var joinedAccount = event.account;
			if (eventTargetChannel.Group.Accounts) {
				eventTargetChannel.Group.Accounts.forEach(function(account) {
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
			if (eventTargetChannel.Group.Accounts) {
				eventTargetChannel.Group.Accounts.forEach(function(account) {
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
	var sendingMessage;
	$scope.sendMessage = function() {
		if (sendingMessage != $scope.text) {
			if ("" == $scope.text) {
				return;
			}
			sendingMessage = $scope.text;
			$scope.sendingMessage = {};
			$scope.sendingMessage.body = sendingMessage;
			$scope.text = "";
			setTimeout(function() {
				jqScrollPane.animate({
					scrollTop : jqScrollInner.height()
				}, 50);
			}, 0);
			post($http, '/api/groups/' + $scope.channel.Group.accessKey + "/channels/" + $scope.channel.accessKey + "/messages", {
				sessionKey : $rootScope.getSessionKey(),
				body : sendingMessage
			}).then(function(response) {
				sendingMessage = null;
			})["catch"](function(response) {
				$rootScope.showErrorWithStatus(response.status);
				$scope.text = sendingMessage;
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
	$rootScope.isSearchable = true;
	$rootScope.searchWord = "";
	$rootScope.search = function() {
		if (!$rootScope.searchWord || "" == $rootScope.searchWord) {
			return;
		}
		$rootScope.searchingWord = $rootScope.searchWord;
		$resource("/api/groups/:groupAccessKey/channels/:channelAccessKey/messages/query").query({
			groupAccessKey : $scope.channel.Group.accessKey,
			channelAccessKey : $scope.channel.accessKey,
			searchWord : $rootScope.searchWord,
			sessionKey : $rootScope.getSessionKey()
		}, function(messages) {
			$rootScope.searchedMessages = messages;
			$rootScope.timelinedMessages = null;
		}, function(error) {
			$rootScope.showErrorWithStatus(error.status);
		});
	}
	$rootScope.time = {}
	$rootScope.time.before = 60;
	$rootScope.time.after = 60;
	$rootScope.searchTimeline = function(message) {
		if (!message) {
			message = $rootScope.currentSearchMessage;
		}
		$rootScope.currentSearchMessage = message;
		var targetTime = new Date(message.createdAt).getTime();
		var startTime = new Date(targetTime - (parseInt($rootScope.time.before) * 1000)).getTime();
		var endTime = new Date(targetTime + (parseInt($rootScope.time.after) * 1000)).getTime();
		$rootScope.timelinedMessages = [];
		$rootScope.timelinedMessages.push({
			body : $rootScope.messages.searching
		});
		$resource("/api/groups/:groupAccessKey/channels/:channelAccessKey/messages/queryTimeline").query({
			groupAccessKey : $scope.channel.Group.accessKey,
			channelAccessKey : $scope.channel.accessKey,
			startTime : startTime,
			endTime : endTime,
			sessionKey : $rootScope.getSessionKey()
		}, function(messages) {
			$rootScope.timelinedMessages = messages;
		}, function(error) {
			$rootScope.showErrorWithStatus(error.status);
		});
	}
	$scope.showSettingDialog = function() {
		var dialogController = [ "$scope", "$modalInstance", function($dialogScope, $modalInstance) {
			$dialogScope.save = function() {
				$modalInstance.close($dialogScope.strongWords);
			};
			$dialogScope.message = $rootScope.messages.menu.setting;
			$dialogScope.strongWords = $rootScope.myAccount.config.strongWords;
			if (!$dialogScope.strongWords) {
				$dialogScope.strongWords = $rootScope.myAccount.name;
			}
		} ];
		var modalInstance = $modal.open({
			templateUrl : 'template/messageSetting.html',
			controller : dialogController
		});
		modalInstance.result.then(function(strongWords) {
			put($http, '/api/account/config', {
				sessionKey : $rootScope.getSessionKey(),
				key : "strongWords",
				value : strongWords
			}).then(function() {
				$rootScope.myAccount.config.strongWords = strongWords;
				strongWordsParsed = parseStrongWords();
				highlightStrongWords();
			})["catch"](function(response) {
				$rootScope.showErrorWithStatus(response.status);
			});
		}, function() {
		});
	}
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
myapp.controller('manageKeyController', manageKeyController);
myapp.controller('changePasswordController', changePasswordController);
myapp.controller('editContentController', editContentController);
myapp.controller('editCalendarAlbumController', editCalendarAlbumController);
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