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
var isCordova = (window != parent);
var myapp = angular.module("app", [ "ui.bootstrap", "ngRoute", "ngResource", "ngCookies", "ngFileUpload", "ngTagsInput", "hc.marked", 'ui.bootstrap.contextMenu', "ngStorage" ]);
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
	$routeProvider.when("/manageDevice", {
		templateUrl : "template/manageDevice.html",
		controller : "manageDeviceController"
	});
	$routeProvider.when("/manageBot", {
		templateUrl : "template/manageBot.html",
		controller : "manageBotController"
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
	$routeProvider.when("/messages", {
		templateUrl : "template/message.html",
		controller : "messageController"
	});
	$routeProvider.when("/messageLog/:groupAccessKey/:channelAccessKey/:from/:to", {
		templateUrl : "template/messageLog.html",
		controller : "messageLogController"
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
	$routeProvider.when("/contents/:page", {
		templateUrl : "template/contents.html",
		controller : "contentsController"
	});
	$routeProvider.when("/contents", {
		templateUrl : "template/contents.html",
		controller : "contentsController"
	});
	$routeProvider.otherwise({
		templateUrl : "template/indexView.html",
		controller : "indexController"
	});
} ]);
myapp.run([ "$rootScope", "$location", "$resource", "$cookies", "$route", "$http", "$uibModal", "Upload", function($rootScope, $location, $resource, $cookies, $route, $http, $modal, $uploader) {
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
	$rootScope.showToastr = function(type, message, onClick) {
		if (onClick) {
			var timeOutOrg = toastr.options.timeOut;
			var extendedTimeOutOrg = toastr.options.timeOut;
			toastr.options.timeOut = 0;
			toastr.options.extendedTimeOut = 0;
			toastr.options.closeButton = true;
		}
		var toast = toastr[type](message);
		if (onClick) {
			toastr.options.timeOut = timeOutOrg;
			toastr.options.extendedTimeOut = extendedTimeOutOrg;
			toastr.options.closeButton = false;
			toast.click(onClick);
		}
	}
	$rootScope.showError = function(message, onClick) {
		$rootScope.showToastr("error", message, onClick);
	}
	$rootScope.showWarn = function(message, onClick) {
		$rootScope.showToastr("warning", message, onClick);
	}
	$rootScope.showInfo = function(message, onClick) {
		$rootScope.showToastr("info", message, onClick);
	}
	$rootScope.showProgress = function(percent, message, type) {
		$rootScope.progressing = true;
		$rootScope.progress = {};
		$rootScope.progress.type = type || "success";
		$rootScope.progress.value = percent ? percent.toFixed(2) : 0;
		$rootScope.progress.message = message ? message + " " : "";
	}
	$rootScope.hideProgress = function(percent) {
		delete $rootScope.progressing;
		delete $rootScope.progress;
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
	$rootScope.gotoHomeOrTop = function() {
		if ($rootScope.myAccount) {
			$location.path("/home");
		} else {
			$location.path("/");
		}
	}
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
			});
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
		$resource('/api/accounts/accessKey').remove({
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
		$resource('/api/accounts').get({
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
	var showSystemUpdateWarn = function() {
		$rootScope.showWarn($rootScope.messages.systemUpdatedReload, function() {
			if (isElectron) {
				require("ipc").send("reload", location.href);
			} else {
				$rootScope.$apply(function() {
					$route.reload();
				});
			}
		});
	}
	$rootScope.socket.on("event", function(data) {
		if ("systemUpdated" == data.type) {
			showSystemUpdateWarn();
		} else if ("join" == data.type) {
			if (groupListeners[data.info.group.accessKey]) {
				groupListeners[data.info.group.accessKey](data);
			}
			$rootScope.showInfo($rootScope.messages.groups.memberJoined + " : " + data.info.account.name + " => " + data.info.group.name, function() {
				$rootScope.$apply(function() {
					$location.path("/group/" + data.info.group.accessKey);
				});
			});
		} else if ("invitationRequest" == data.type) {
			if (groupListeners[data.info.group.accessKey]) {
				groupListeners[data.info.group.accessKey](data);
			}
			$rootScope.showInfo($rootScope.messages.groups.invitationRequested + " : " + data.info.account.name + " => " + data.info.group.name, function() {
				$rootScope.$apply(function() {
					$location.path("/group/" + data.info.group.accessKey);
				});
			});
		} else if ("invited" == data.type) {
			if (groupListeners[data.info.group.accessKey]) {
				groupListeners[data.info.group.accessKey](data);
			}
			$rootScope.showInfo($rootScope.messages.groups.invited + " : " + data.info.group.name, function() {
				$rootScope.$apply(function() {
					$location.path("/group/" + data.info.group.accessKey);
				});
			});
		} else if ("remindAppended" == data.type) {
			var targetDate = new Date(parseInt(data.info.time));
			$rootScope.showInfo($rootScope.messages.remindAppended + " : [" + targetDate.getHours() + ":" + targetDate.getMinutes() + "] " + data.info.message);
		}
	});
	var currentVersion;
	$rootScope.socket.on("informVersion", function(data) {
		if (currentVersion && currentVersion != data.hostVersion) {
			showSystemUpdateWarn();
		}
		currentVersion = data.hostVersion;
	});
	var groupListeners = [];
	$rootScope.setGroupListener = function(groupAccessKey, listener) {
		groupListeners[groupAccessKey] = listener;
	}
	$rootScope.removeGroupListener = function(groupAccessKey) {
		delete groupListeners[groupAccessKey];
	}
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
				});
			};
			$rootScope.socket.on('authorized', reconnectFunction);
		});
		$rootScope.socket.on('disconnect', function(data) {
			$rootScope.disconnected = true;
		});
		$rootScope.socket.on('pingListening', function(data) {
			if ($rootScope.nowInChannel) {
				$rootScope.socket.emit('pongListening', data);
			}
		});
		$rootScope.socket.on('channelEvent', function(data) {
			if (channelEventListener) {
				channelEventListener(data);
			}
		});
	}
	var onConnectListener;
	$rootScope.setOnConnectionListener = function(listener) {
		onConnectListener = listener;
	}
	$rootScope.removeOnConnectionListener = function() {
		onConnectListener = null;
	}
	var channelEventListener;
	$rootScope.setChannelEventListener = function(listener) {
		channelEventListener = listener;
	}
	$rootScope.removeChannelEventListener = function() {
		channelEventListener = null;
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
	var upload = function(contentKey, data, name, success, fail, progress) {
		var uploader = $uploader.upload({
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
		if (progress) {
			uploader.progress(function(evt) {
				var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
				progress(progressPercentage, evt.config.file.name);
			});
		}
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
	var notifications = []
	$rootScope.showNotification = function(title, body, param, onclickFunc) {
		if (!param) {
			param = {};
		}
		if (Notification && "granted" != Notification.permission) {
			Notification.requestPermission(function(status) {
				if (Notification.permission !== status) {
					Notification.permission = status;
				}
			});
		}
		var params = {
			body : body
		}
		if (!isElectron) {
			params.iconUrl = "images/application_icon.png";
			params.icon = "images/application_icon.png"
		}
		var notification = new Notification(title, params);
		notification.onclick = function() {
			$("#messageInput").focus();
			window.focus();
			notification.close();
			if (onclickFunc) {
				onclickFunc();
			}
		};
		notification.stay = param.stay;
		if (!notification.stay) {
			notifications.push(notification);
			setTimeout(function() {
				if (!isElectron) {
					notification.close();
				}
				notifications.splice(notifications.indexOf(notification), 1);
			}, 3000);
		}
		if (notifications.length > 3) {
			for ( var i in notifications) {
				if (!isElectron) {
					notifications[i].close();
				}
				notifications.splice(i, 1);
				if (notifications.length <= 3) {
					break;
				}
			}
		}
	}
	$rootScope.openWithBrowser = openWithBrowser;
	$rootScope.strike = function(groupAccessKey, account, onSuccess, away) {
		var strikeAccount = function() {
			put($http, '/api/groups/' + groupAccessKey + "/strike", {
				sessionKey : $rootScope.getSessionKey(),
				targetId : account.id
			}).then(function(response) {
				if (onSuccess) {
					onSuccess(response)
				}
			})["catch"](function(response) {
				$rootScope.showErrorWithStatus(response.status);
			});
		}
		var dialogController = [ "$scope", "$uibModalInstance", function($dialogScope, $modalInstance) {
			$dialogScope["delete"] = function() {
				$modalInstance.close();
			};
			if (away) {
				$dialogScope.message = $rootScope.messages.groups.confirmAway + "\n\n" + account.name;
			} else {
				$dialogScope.message = $rootScope.messages.groups.confirmStrike + "\n\n" + account.name;
			}
		} ];
		var modalInstance = $modal.open({
			templateUrl : 'template/confirmDialog.html',
			controller : dialogController
		});
		modalInstance.result.then(function() {
			strikeAccount();
		}, function() {
		});
	}
	if (isCordova) {
		window.addEventListener("message", function(event) {
			var data = JSON.parse(event.data);
			if ("notificationPushed" == data.action) {
				$rootScope.$apply(function() {
					$location.path("/group/" + data.value.channel.Group.accessKey + "/channel/" + data.value.channel.accessKey + "/messages");
				});
			}
		});
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
var indexController = [ "$rootScope", "$scope", "$uibModal", "$location", "$http", "$window", "$resource", "$routeParams", function($rootScope, $scope, $modal, $location, $http, $window, $resource, $routeParams) {
	$rootScope.noMarginTop = true;
	$rootScope.hideTitle = true;
	$scope.$on('$destroy', function() {
		$rootScope.noMarginTop = false;
		$rootScope.hideTitle = false;
	});
	$scope.openCreateAccountDialog = function() {
		var dialogController = [ "$scope", "$uibModalInstance", function($dialogScope, $modalInstance) {
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
					$resource("/api/accounts/nameNotDuplicate").get({
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
		post($http, '/api/accounts', account).then(function(data, status, headers, config) {
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
} ];
var contentsController = [ "$rootScope", "$scope", "$uibModal", "$location", "$http", "$window", "$resource", "$routeParams", function($rootScope, $scope, $modal, $location, $http, $window, $resource, $routeParams) {
	$resource("/api/contents/").query({
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
	var Account = $resource('/api/accounts/activation?key=:activationKey');
	Account.get({
		activationKey : activationKey
	}, function(account) {
		$scope.account = account;
		$scope.toLogin = function() {
			$location.path("/signin");
		};
	}, function(error) {
		$rootScope.showErrorWithStatus(error.status);
	});
} ];
var signinController = [ "$rootScope", "$scope", "$resource", "$location", function($rootScope, $scope, $resource, $location) {
	$scope.signinAccount = {}
	$scope.signin = function() {
		var Signin = $resource('/api/accounts/signin');
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
	var Invitation = $resource('/api/accounts/invitation?key=:key');
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
		var Signin = $resource('/api/accounts/signin');
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
		post($http, '/api/accounts', $scope.signupAccount).then(function(data, status, headers, config) {
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
		post($http, '/api/accounts/sendResetpasswordMail', {
			mail : $scope.requestResetPasswordAccount.mail
		}).then(function(account) {
			$location.path("/resetPasswordRequested");
		})["catch"](function(error) {
			$rootScope.showErrorWithStatus(error.status, function(status) {
				if (404 == status) {
					$rootScope.showError($rootScope.messages.accounts.error.mailNotRegisted);
					return true;
				}
				return false;
			});
		});
	}
} ];
var resetPasswordController = [ "$rootScope", "$scope", "$resource", "$location", "$http", function($rootScope, $scope, $resource, $location, $http) {
	var passwordResetKey = $location.search()["key"];
	$scope.resetPasswordAccount = {}
	$scope.resetPassword = function() {
		put($http, '/api/accounts/password', {
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
		put($http, '/api/accounts/password', {
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
	$scope.settingAccount.name = $rootScope.myAccount.name;
	$scope.settingAccount.information = $rootScope.myAccount.information;
	$scope.settingAccount.private = !!$rootScope.myAccount.private;
	$scope.$watch('imageFile', function() {
		if ($scope.imageFile) {
			$scope.fileName = $scope.imageFile.name;
		}
	});
	$scope.save = function() {
		$uploader.upload({
			url : '/api/accounts',
			fields : {
				name : $scope.settingAccount.name,
				information : $scope.settingAccount.information,
				private : $scope.settingAccount.private,
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
var manageKeyController = [ "$rootScope", "$scope", "$resource", "$location", "$http", "$uibModal", function($rootScope, $scope, $resource, $location, $http, $modal) {
	if (!$rootScope.myAccount) {
		$location.path("/home");
		return;
	}
	$resource('/api/accounts/keys').query({
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
		var deleteKey = function() {
			$resource('/api/accounts/keys')["delete"]({
				sessionKey : $rootScope.getSessionKey(),
				secret : key.secret
			}, function(key) {
				$scope.myKeys.splice(index, 1)
			}, function(error) {
				$rootScope.showError($rootScope.messages.error.withServer);
			});
		}
		var dialogController = [ "$scope", "$uibModalInstance", function($dialogScope, $modalInstance) {
			$dialogScope["delete"] = function() {
				$modalInstance.close();
			};
			$dialogScope.message = $rootScope.messages.confirmDelete + "\n\n";
		} ];
		var modalInstance = $modal.open({
			templateUrl : 'template/confirmDialog.html',
			controller : dialogController
		});
		modalInstance.result.then(function() {
			deleteKey();
		}, function() {
		});
	}
	$scope.createKey = function() {
		post($http, '/api/accounts/keys', {
			sessionKey : $rootScope.getSessionKey(),
		}).success(function(key) {
			$scope.myKeys.unshift(key);
		}).error(function(error) {
			$rootScope.showError($rootScope.messages.error.withServer);
		});
	}
} ];
var manageDeviceController = [ "$rootScope", "$scope", "$resource", "$location", "$http", "$uibModal", "$localStorage", function($rootScope, $scope, $resource, $location, $http, $modal, $localStorage) {
	$scope.$storage = $localStorage;
	if (!$rootScope.getSessionKey()) {
		$location.path("/home");
		return;
	}
	$resource('/api/accounts/devices').query({
		sessionKey : $rootScope.getSessionKey()
	}, function(devices) {
		$scope.myDevices = devices;
		$scope.typeMessages = [];
		var initTypeMessage = function() {
			$scope.typeMessages[1] = $rootScope.messages.devices.forAndroid;
			$scope.typeMessages[2] = $rootScope.messages.devices.forIOS;
			$scope.typeMessages[3] = $rootScope.messages.devices.forPushbullet;
			$scope.typeMessages[4] = $rootScope.messages.devices.forWebhook;
			$scope.typeMessages[5] = $rootScope.messages.devices.forAndroidCordova;
		}
		if ($rootScope.messages) {
			initTypeMessage();
		} else {
			$rootScope.$watch("messages", initTypeMessage);
		}
	}, function(error) {
		$rootScope.showError($rootScope.messages.error.withServer);
	});
	$scope.deleteDevice = function(index, device) {
		var deleteDevice = function() {
			$resource('/api/accounts/devices')["delete"]({
				sessionKey : $rootScope.getSessionKey(),
				key : device.key
			}, function(key) {
				$scope.myDevices.splice(index, 1)
			}, function(error) {
				$rootScope.showError($rootScope.messages.error.withServer);
			});
		}
		var dialogController = [ "$scope", "$uibModalInstance", function($dialogScope, $modalInstance) {
			$dialogScope["delete"] = function() {
				$modalInstance.close();
			};
			$dialogScope.message = $rootScope.messages.confirmDelete + "\n\n";
		} ];
		var modalInstance = $modal.open({
			templateUrl : 'template/confirmDialog.html',
			controller : dialogController
		});
		modalInstance.result.then(function() {
			deleteDevice();
		}, function() {
		});
	}
	$scope.selfPushRegistationKey = $scope.$storage.pushRegistationKey;
	$scope.isPushable = function() {
		return window.parent && window.parent.window.registPush;
	}
	$scope.isPushing = function() {
		return $scope.$storage.pushRegistationKey;
	}
	$scope.getToggleMessage = function() {
		return $scope.isPushing() ? $rootScope.messages.devices.pushing : $rootScope.messages.devices.notPushing;
	}
	$scope.changePushState = function() {
		if ($scope.isPushing()) {
			$resource("/api/accounts/devices")["delete"]({
				sessionKey : $rootScope.getSessionKey(),
				key : $scope.$storage.pushRegistationKey
			}, function(device) {
				for (var i = 0; i < $scope.myDevices.length; i++) {
					if ($scope.myDevices[i].key == $scope.$storage.pushRegistationKey) {
						$scope.myDevices.splice(i, 1);
					}
				}
				delete $scope.$storage.pushRegistationKey;
			}, function(error) {
				delete $scope.$storage.pushRegistationKey;
				$rootScope.showError($rootScope.messages.error.withServer);
			});
			window.parent.postMessage(JSON.stringify({
				action : "unRegistPush"
			}), "*");
		} else {
			var onRegustPushResult = function(event) {
				var data = JSON.parse(event.data);
				if ("registPushResult" == data.action) {
					if ("success" == data.result) {
						post($http, "/api/accounts/devices", {
							sessionKey : $rootScope.getSessionKey(),
							platform : 5,
							endpoint : data.regid
						}).then(function(response) {
							$scope.myDevices.push(response.data);
							$scope.$storage.pushRegistationKey = response.data.key;
							$rootScope.showInfo($rootScope.messages.devices.pushSetted);
						})["catch"](function(response) {
							$rootScope.showErrorWithStatus(response.status);
						});
					} else {
						$rootScope.showError($rootScope.messages.devices.error.pushSet);
					}
				}
				window.removeEventListener("message", onRegustPushResult);
			}
			window.addEventListener("message", onRegustPushResult);
			window.parent.postMessage(JSON.stringify({
				action : "registPush"
			}), "*");
		}
	}
} ];
var manageBotController = [ "$rootScope", "$scope", "$resource", "$location", "$http", "$uibModal", function($rootScope, $scope, $resource, $location, $http, $modal) {
	if (!$rootScope.getSessionKey()) {
		$location.path("/home");
		return;
	}
	$resource('/api/accounts/bots').query({
		sessionKey : $rootScope.getSessionKey()
	}, function(bots) {
		$scope.myBots = bots;
		$scope.typeMessages = [];
		var initTypeMessage = function() {
			$scope.typeMessages[1] = $rootScope.messages.bots.forGitlab;
			$scope.typeMessages[2] = $rootScope.messages.bots.forGithub;
			$scope.typeMessages[99] = $rootScope.messages.bots.forAPI;
		}
		if ($rootScope.messages) {
			initTypeMessage();
		} else {
			$rootScope.$watch("messages", initTypeMessage);
		}
	}, function(error) {
		$rootScope.showError($rootScope.messages.error.withServer);
	});
	$scope.deleteBot = function(index, bot) {
		var deleteBot = function() {
			$resource('/api/accounts/bots')["delete"]({
				sessionKey : $rootScope.getSessionKey(),
				key : bot.key
			}, function(bot) {
				$scope.myBots.splice(index, 1)
			}, function(error) {
				$rootScope.showError($rootScope.messages.error.withServer);
			});
		}
		var dialogController = [ "$scope", "$uibModalInstance", function($dialogScope, $modalInstance) {
			$dialogScope["delete"] = function() {
				$modalInstance.close();
			};
			$dialogScope.message = $rootScope.messages.confirmDelete + "\n\n";
		} ];
		var modalInstance = $modal.open({
			templateUrl : 'template/confirmDialog.html',
			controller : dialogController
		});
		modalInstance.result.then(function() {
			deleteBot();
		}, function() {
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
			url = '/api/contents/' + $scope.editingContent.contentKey
		}
		if (!$scope.editingContent.contentKey) {
			func = post;
			url = '/api/contents';
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
		$resource('/api/contents/:contentKey?sessionKey=:sessionKey').get({
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
	$scope.selectStatus = function(status) {
		$scope.editingContent.status = status;
	}
	$scope.selectGroup = function(group) {
		$scope.contentGroup = group;
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
					$rootScope.showInfo($rootScope.messages.contents.saved);
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
var editCalendarAlbumController = [ "$rootScope", "$scope", "$resource", "$location", "$http", "$routeParams", "$uibModal", function($rootScope, $scope, $resource, $location, $http, $routeParams, $modal) {
	$scope.contentKey = $routeParams.contentKey
	$scope.targetGroupId = $rootScope.pullTargetGroupId();
	$scope.date = $routeParams.date
	if (!$scope.date) {
		$scope.firstDay = new Date();
		$scope.firstDay.setDate(1);
	} else {
		try {
			$scope.firstDay = new Date();
			$scope.firstDay.setDate(1);
			$scope.firstDay.setFullYear(parseInt($scope.date.substring(0, 4)));
			$scope.firstDay.setMonth(parseInt($scope.date.substring(4, 6)) - 1);
		} catch (e) {
			$scope.firstDay = new Date();
			$scope.firstDay.setDate(1);
		}
	}
	$scope.maxDate = new Date($scope.firstDay.getFullYear(), $scope.firstDay.getMonth() + 1, 0).getDate();
	var dayBoxCount = $scope.firstDay.getDay() + $scope.maxDate;
	$scope.weekColumn = [ 0, 1, 2, 3 ];
	for (var i = 4; dayBoxCount / (7 * i) > 1; i++) {
		$scope.weekColumn.push(i);
	}
	var prevMonth = new Date($scope.firstDay.getFullYear(), $scope.firstDay.getMonth() - 1, 1);
	var nextMonth = new Date($scope.firstDay.getFullYear(), $scope.firstDay.getMonth() + 1, 1);
	$scope.gotoPrevMonth = function() {
		$location.path("/editCalendarAlbum/" + $scope.editingContent.contentKey + "/" + prevMonth.getFullYear() + "" + ("0" + (prevMonth.getMonth() + 1)).slice(-2))
	}
	$scope.gotoNextMonth = function() {
		$location.path("/editCalendarAlbum/" + $scope.editingContent.contentKey + "/" + nextMonth.getFullYear() + "" + ("0" + (nextMonth.getMonth() + 1)).slice(-2))
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
			url = '/api/contents/' + $scope.editingContent.contentKey
		}
		if (!$scope.editingContent.contentKey) {
			func = post;
			url = '/api/contents';
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
		$resource('/api/contents/:contentKey?sessionKey=:sessionKey').get({
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
			$rootScope.showInfo($rootScope.messages.contents.saved);
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
		var uploadedFileLength = 0;
		var chain = new Chain();
		files.forEach(function(srcFile) {
			chain = chain.then(function(next) {
				var calcProgress = function() {
					return uploadedFileLength * 100.0 / files.length
				}
				$rootScope.showProgress(calcProgress(), srcFile.name);
				if ($scope.editingContent.article[keyDate]) {
					for ( var i in $scope.editingContent.article[keyDate].images) {
						if ($scope.editingContent.article[keyDate].images[i].file.endsWith(srcFile.name)) {
							$rootScope.showWarn($rootScope.messages.contents.errors.sameNameFileAleadyAndSkipUpload + " :　" + srcFile.name);
							return;
						}
					}
				}
				var onSuccessAsFile = function(thumbnailImageUrl, fileImageUrl, srcFile) {
					putToArticle(new Date(), thumbnailImageUrl, fileImageUrl);
				}
				var incrementComplete = function() {
					uploadedFileLength++;
					$rootScope.showProgress(calcProgress());
					if (uploadedFileLength && files.length <= uploadedFileLength) {
						$scope.save(null, function() {
							$rootScope.showInfo($rootScope.messages.contents.saved);
							changing = false;
						}, function() {
							$rootScope.showError($rootScope.messages.contents.errors.failToSave);
						});
						$rootScope.hideProgress();
					}
					next();
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
					$rootScope.showWarn($rootScope.messages.contents.errors.failToUploadAndRetry);
					uploadFileWithRetry();
				}
				var onProgress = function(percent, fileName) {
					var totalPercent;
					if (files.length > 1) {
						totalPercent = calcProgress() + (percent / files.length);
					}
					$rootScope.showProgress(totalPercent || percent, fileName);
				}
				var uploadFileWithRetry = function() {
					$rootScope.uploadFile($scope.editingContent.contentKey, srcFile, onSuccess, onSuccess, onError, onProgress);
				}
				uploadFileWithRetry();
			})
		});
		chain.error = function(error) {
			$rootScope.showErrorWithStatus(error);
		}
		chain.fire();
	}
	$scope.deletePictureConfirm = function(event, images, index) {
		var dialogController = [ "$scope", "$uibModalInstance", function($dialogScope, $modalInstance) {
			$dialogScope["delete"] = function() {
				$modalInstance.close();
			};
			$dialogScope.message = $rootScope.messages.contents.confirmDeletePicture + "\n\n";
		} ];
		var modalInstance = $modal.open({
			templateUrl : 'template/confirmDialog.html',
			controller : dialogController
		});
		modalInstance.result.then(function() {
			images.splice(index, 1);
			if (0 == images.length) {
				$scope.hideImages();
			} else {
				$scope.imagesIndex = 0;
			}
		}, function() {
		});
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
		var calcProgress = function() {
			return uploadedFileLength * 100.0 / $scope.autoDateSetImages.length;
		}
		$rootScope.showProgress(calcProgress());
		var changing = true;
		var uploadedFileLength = 0;
		var putToArticle = function(date, thumbnailUrl, fileUrl, fileName, next) {
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
			uploadedFileLength++;
			$rootScope.showProgress(calcProgress(), fileName);
			if (uploadedFileLength) {
				if ($scope.autoDateSetImages.length <= uploadedFileLength) {
					$scope.save(null, function() {
						$rootScope.showInfo($rootScope.messages.contents.saved);
						changing = false;
					}, function() {
						$rootScope.showError($rootScope.messages.contents.errors.failToSave);
					});
					$rootScope.hideProgress();
				}
			}
			next();
		}
		var chain = new Chain();
		$scope.autoDateSetImages.forEach(function(srcFile) {
			chain = chain.then(function(next) {
				var contentKey = $scope.editingContent.contentKey;
				var onError = function(error) {
					$rootScope.showWarn($rootScope.messages.contents.errors.failToUploadAndRetry);
					uploadFile();
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
								putToArticle(date, thumbnailImageUrl, fileImageUrl, srcFile.name, next);
							});
						} catch (ignored) {
							putToArticle(new Date(), thumbnailImageUrl, fileImageUrl, srcFile.name, next);
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
								putToArticle(date, thumbnailImageUrl, fileImageUrl, srcFile.name, next);
							});
						} catch (ignored) {
							putToArticle(new Date(), thumbnailImageUrl, fileImageUrl, srcFile.name, next);
						}
					}
				}
				var onSuccessAsFile = function(thumbnailImageUrl, fileImageUrl, srcFile) {
					putToArticle(new Date(), thumbnailImageUrl, fileImageUrl, next);
				}
				var onProgress = function(percent, fileName) {
					var totalPercent;
					if (files.length > 1) {
						totalPercent = calcProgress() + (percent / $scope.autoDateSetImages.length);
					}
					$rootScope.showProgress(totalPercent || percent, fileName);
				}
				var uploadFile = function() {
					$rootScope.uploadFile(contentKey, srcFile, onSuccess, onSuccessAsFile, onError, onProgress);
				}
				uploadFile();
			});
		});
		chain.error = function(error) {
			$rootScope.showErrorWithStatus(error);
		}
		chain.fire();
	});
	var dateLegex = /^(\d{4})\/(\d{2})$/;
	$scope.$watch("selectingDate", function() {
		if ($scope.dateSelect) {
			if ($scope.selectingDate) {
				var result = $scope.selectingDate.match(dateLegex);
				if (result) {
					$location.path("/editCalendarAlbum/" + $scope.editingContent.contentKey + "/" + result[1] + "" + result[2])
				}
			}
		}
	});
} ]
var contentController = [ "$rootScope", "$scope", "$resource", "$location", "$http", "$routeParams", function($rootScope, $scope, $resource, $location, $http, $routeParams) {
	$resource('/api/contents/:contentKey?sessionKey=:sessionKey').get({
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
						$resource('/api/contents/:contentKey?sessionKey=:sessionKey').get({
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
						$rootScope.showInfo($rootScope.messages.groups.invitationRequestSended);
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
	$resource('/api/contents/comment/:contentKey?sessionKey=:sessionKey').query({
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
				$scope.firstDay.setDate(1);
				$scope.firstDay.setFullYear(parseInt($scope.date.substring(0, 4)));
				$scope.firstDay.setMonth(parseInt($scope.date.substring(4, 6)) - 1);
			} catch (e) {
				$scope.firstDay = new Date();
				$scope.firstDay.setDate(1);
			}
		}
		$scope.maxDate = new Date($scope.firstDay.getFullYear(), $scope.firstDay.getMonth() + 1, 0).getDate();
		var dayBoxCount = $scope.firstDay.getDay() + $scope.maxDate;
		$scope.weekColumn = [ 0, 1, 2, 3 ];
		for (var i = 4; dayBoxCount / (7 * i) > 1; i++) {
			$scope.weekColumn.push(i);
		}
		var prevMonth = new Date($scope.firstDay.getFullYear(), $scope.firstDay.getMonth() - 1, 1);
		var nextMonth = new Date($scope.firstDay.getFullYear(), $scope.firstDay.getMonth() + 1, 1);
		$scope.gotoPrevMonth = function() {
			$location.path("/content/" + $scope.content.accessKey + "/" + prevMonth.getFullYear() + "" + ("0" + (prevMonth.getMonth() + 1)).slice(-2))
		}
		$scope.gotoNextMonth = function() {
			$location.path("/content/" + $scope.content.accessKey + "/" + nextMonth.getFullYear() + "" + ("0" + (nextMonth.getMonth() + 1)).slice(-2))
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
		post($http, '/api/contents/comment', {
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
	var dateLegex = /^(\d{4})\/(\d{2})$/;
	$scope.$watch("selectingDate", function() {
		if ($scope.dateSelect) {
			if ($scope.selectingDate) {
				var result = $scope.selectingDate.match(dateLegex);
				if (result) {
					$location.path("/content/" + $routeParams.contentKey + "/" + result[1] + "" + result[2])
				}
			}
		}
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
var groupController = [ "$rootScope", "$scope", "$resource", "$location", "$http", "$routeParams", "$uibModal", "$route", function($rootScope, $scope, $resource, $location, $http, $routeParams, $modal, $route) {
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
	$scope.selectInviteUserAuthorization = function(authorization) {
		$scope.inviteUserAuthorization = authorization
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
			$rootScope.showInfo($rootScope.messages.groups.invitationRequestSended);
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
		var dialogController = [ "$scope", "$uibModalInstance", function($dialogScope, $modalInstance) {
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
			$dialogScope.onCompleteButtonMessage = $rootScope.messages.channels["new"];
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
		var dialogController = [ "$scope", "$uibModalInstance", function($dialogScope, $modalInstance) {
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
			$resource("/api/contents/:accessKey").remove({
				accessKey : accessKey,
				sessionKey : $rootScope.getSessionKey()
			}, function() {
				$scope.group.Contents.splice($index, 1);
			});
		}, function() {
		});
	}
	$scope.inviteUserAuthorization = $rootScope.groupAuthorizations[0];
	var groupEventListener = function(data) {
		if ("invited" == data.type) {
			$route.reload();
		}
		$scope.$apply(function() {
			for ( var i in $scope.group.Accounts) {
				if ($scope.group.Accounts[i].id === data.info.account.id) {
					$scope.group.Accounts[i] = data.info.account;
					return true;
				}
			}
			$scope.group.Accounts.push(data.info.account);
		});
	}
	$rootScope.setGroupListener($routeParams.accessKey, groupEventListener);
	$scope.$on('$destroy', function() {
		$rootScope.removeGroupListener($routeParams.accessKey);
	});
	$scope.strike = function(account, away) {
		$rootScope.strike($routeParams.accessKey, account, function(response) {
			for ( var i in $scope.group.Accounts) {
				if ($scope.group.Accounts[i].id == account.id) {
					$scope.group.Accounts.splice(i, 1);
					return;
				}
			}
		}, away);
	}
} ];
var messageLogController = [ "$rootScope", "$scope", "$resource", "$location", "$http", "$routeParams", "$uibModal", function($rootScope, $scope, $resource, $location, $http, $routeParams, $modal) {
	$scope.from = $routeParams.from;
	$scope.to = $routeParams.to;
	$resource("/api/groups/:groupAccessKey/channels/:channelAccessKey/messages/queryTimeline").query({
		groupAccessKey : $routeParams.groupAccessKey,
		channelAccessKey : $routeParams.channelAccessKey,
		startTime : $scope.from,
		endTime : $scope.to,
		sessionKey : $rootScope.getSessionKey()
	}, function(messages) {
		$scope.messageLog = messages;
	}, function(error) {
		$rootScope.showErrorWithStatus(error.status);
	});
	$resource("/api/groups/:groupAccessKey/:channelAccessKey").get({
		groupAccessKey : $routeParams.groupAccessKey,
		channelAccessKey : $routeParams.channelAccessKey,
		sessionKey : $rootScope.getSessionKey()
	}, function(channel) {
		$scope.channel = channel;
	}, function(error) {
		$rootScope.showErrorWithStatus(error.status);
	});
} ];
var editGroupController = [ "$rootScope", "$scope", "$resource", "$location", "$http", "$routeParams", "$uibModal", function($rootScope, $scope, $resource, $location, $http, $routeParams, $modal) {
	if (!$routeParams.accessKey || $routeParams.accessKey == 0) {
		$scope.group = {};
		$scope.group.visibility = $rootScope.groupVisibilities[1];
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
	$scope.changeAuthrozation = function(targetId, authorization) {
		put($http, '/api/groups/' + $routeParams.accessKey + "/authorization", {
			sessionKey : $rootScope.getSessionKey(),
			targetId : targetId,
			authorization : authorization
		}).then(function(response) {
			for ( var i in $scope.group.Accounts) {
				if ($scope.group.Accounts[i].id == response.data.AccountId) {
					$scope.group.Accounts[i].AccountInGroup = response.data;
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
	$scope.setVisibility = function(visibility) {
		$scope.group.visibility = visibility;
	}
	$scope.strike = function(account, away) {
		$rootScope.strike($routeParams.accessKey, account, function(response) {
			for ( var i in $scope.group.Accounts) {
				if ($scope.group.Accounts[i].id == account.id) {
					$scope.group.Accounts.splice(i, 1);
					return;
				}
			}
		}, away)
	}
} ];
var messageController = [ "$rootScope", "$scope", "$resource", "$location", "$http", "$routeParams", "$uibModal", "Upload", function($rootScope, $scope, $resource, $location, $http, $routeParams, $modal, $uploader) {
	$scope.noMarginTop = true;
	$rootScope.nowInChannel = true;
	var loadingHistory = false;
	var channelsEventListener = function(event) {
		if ("appendsChannel" == event.type) {
			$scope.joiningChannels.push(event.info.channel);
			prepareChannel(event.info.channel);
			var toastMessage = $rootScope.messages.channels.invited + "[" + event.info.channel.name;
			toastMessage = toastMessage + "]" + $rootScope.messages.channels.inviter + " " + event.info.fromAccount.name;
			$rootScope.showInfo(toastMessage, function() {
				$rootScope.$apply(function() {
					$location.path("/messages");
				});
			});
		}
	}
	var onConnectionListener = function() {
		$scope.joiningChannels.forEach(function(channel) {
			if (0 == channel.messages.length) {
				return;
			}
			var lastLoadId = channel.messages[channel.messages.length - 1].id;
			$rootScope.requestMessage({
				channelAccessKey : channel.accessKey,
				idAfter : lastLoadId
			});
		});
	}
	$rootScope.setOnConnectionListener(onConnectionListener);
	$rootScope.setChannelEventListener(channelsEventListener);
	$scope.$on('$destroy', function() {
		$rootScope.removeChannelEventListener();
		$rootScope.removeOnConnectionListener();
	})
	$scope.accountMenuOptions = [ [ $rootScope.messages.messages.createPrivateChannel, function($itemScope, $event, account) {
		var dialogController = [ "$scope", "$uibModalInstance", function($dialogScope, $modalInstance) {
			$dialogScope.create = function() {
				if ("" == $dialogScope.text) {
					return;
				}
				$modalInstance.close($dialogScope.text);
			};
			$dialogScope.text = $rootScope.myAccount.name + "-" + account.name;
			$dialogScope.message = $rootScope.messages.channels.newPrivate;
			$dialogScope.placeholder = $rootScope.messages.channels.name;
			$dialogScope.onCompleteButtonMessage = $rootScope.messages.channels["new"];
		} ];
		var modalInstance = $modal.open({
			templateUrl : 'template/confirmWithTextDialog.html',
			controller : dialogController
		});
		modalInstance.result.then(function(channelName) {
			post($http, "/api/channels", {
				sessionKey : $rootScope.getSessionKey(),
				name : channelName,
				targetAccountId : account.id
			}).then(function(response) {
				$scope.joiningChannels.push(response.data);
				prepareChannel(response.data)
			})["catch"](function(response) {
				$rootScope.showErrorWithStatus(response.status);
			});
		}, function() {
		});
	}, function($itemScope, $event, account) {
		return account.id != $rootScope.myAccount.id;
	} ], [ $rootScope.messages.channels.invite, function($itemScope, $event, account) {
		var dialogController = [ "$scope", "$uibModalInstance", function($dialogScope, $modalInstance) {
			$dialogScope.selected = function(selecting) {
				if (!selecting) {
					return;
				}
				$modalInstance.close(selecting);
			};
			$dialogScope.select = function(selection) {
				$dialogScope.selecting = selection;
			}
			$dialogScope.message = $rootScope.messages.channels.selectInviteChannel;
			$dialogScope.selections = $scope.joiningChannels.filter(function(channel) {
				return "private" == channel.type;
			})
			$dialogScope.onCompleteButtonMessage = $rootScope.messages.channels.invite;
		} ];
		var modalInstance = $modal.open({
			templateUrl : 'template/selectionDialog.html',
			controller : dialogController
		});
		modalInstance.result.then(function(channel) {
			post($http, "/api/channels/" + channel.accessKey + "/invite", {
				sessionKey : $rootScope.getSessionKey(),
				targetAccountId : account.id
			}).then(function(response) {
				$rootScope.showInfo($rootScope.messages.channels.invited);
			})["catch"](function(response) {
				$rootScope.showErrorWithStatus(response.status, function(status) {
					if (409 == status) {
						$rootScope.showError($rootScope.messages.channels.error.aleadyIn);
						return true;
					}
				});
			});
		}, function() {
		});
	}, function($itemScope, $event, account) {
		return account.id != $rootScope.myAccount.id;
	} ] ]
	$scope.channelMenuOptions = [ [ $rootScope.messages.messages.awayFromchannel, function($itemScope, $event, channel) {
		var dialogController = [ "$scope", "$uibModalInstance", function($dialogScope, $modalInstance) {
			$dialogScope["delete"] = function() {
				$modalInstance.close();
			};
			$dialogScope.message = $rootScope.messages.messages.confirmAwayFromChannel + "\n\n" + channel.name;
			$dialogScope.completeMessage = $rootScope.messages.channels.away;
		} ];
		var modalInstance = $modal.open({
			templateUrl : 'template/confirmDialog.html',
			controller : dialogController
		});
		modalInstance.result.then(function() {
			put($http, "/api/channels/" + channel.accessKey + "/away", {
				accessKey : channel.accessKey,
				sessionKey : $rootScope.getSessionKey()
			}).then(function() {
				for ( var i in $scope.joiningChannels) {
					if ($scope.joiningChannels[i].accessKey == channel.accessKey) {
						$scope.joiningChannels.splice(i, 1);
						var selectToChannel = $scope.joiningChannels[i - 1] || $scope.joiningChannels[0];
						if (selectToChannel) {
							selectChannel(selectToChannel.accessKey);
						}
						break;
					}
				}
			})["catch"](function(response) {
				$rootScope.showErrorWithStatus(response.status);
			});
		});
	}, function($itemScope, $event, channel) {
		return "private" == channel.type;
	} ] ]
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
	var prepareChannel = function(channel) {
		channel.messages = [];
		channel.talkings = [];
		if (channel.Bots) {
			channel.Bots.forEach(function(bot) {
				if (1 == bot.type) {
					channel.hasGitlabBot = true;
				} else if (2 == bot.type) {
					channel.hasGithubBot = true;
				}
			})
		}
		channel.unreadCount = 0;
		if (!channel.Group) {
			channel.Group = {};
			channel.Group.isTemporary = true;
			channel.Group.Accounts = channel.Accounts;
		}
		$rootScope.listenChannel(channel.accessKey, listenComment);
		channelMap[channel.accessKey] = channel;
	}
	var channelMap = [];
	$resource('/api/accounts/channels/accessible').query({
		sessionKey : $rootScope.getSessionKey()
	}, function(channels) {
		$scope.joiningChannels = channels;
		$scope.joiningChannels.forEach(prepareChannel);
		$scope.$on('$destroy', function() {
			$scope.joiningChannels.forEach(function(channel) {
				$rootScope.unListenChannel(channel.accessKey, listenComment);
			});
			$rootScope.isSearchable = false;
			$rootScope.search = null;
			$rootScope.searchWord = null;
			$rootScope.searchTimeline = null;
			$rootScope.timelinedMessages = null;
			$rootScope.timelineLogUrl = null;
			delete $rootScope.nowInChannel;
		});
		selectChannel($routeParams.channelAccessKey || $scope.joiningChannels[0].accessKey);
	}, function(error) {
		$rootScope.showErrorWithStatus(error.status);
	});
	var selectChannel = function(channelAccessKey) {
		if ($scope.channel) {
			$scope.channel.scrollTop = jqScrollPane.scrollTop();
			sendStopTalking();
		}
		for ( var i in $scope.joiningChannels) {
			if ($scope.joiningChannels[i].accessKey == channelAccessKey) {
				$scope.channel = $scope.joiningChannels[i];
				$scope.channel.unreadCount = 0;
				break;
			}
		}
		delete $scope.channel.notify;
		if ($scope.channel.Group) {
			$scope.channel.Group.visibility = $rootScope.groupVisibilities[$scope.channel.Group.visibility - 1];
		}
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
		if ($scope.text && "" != $scope.text) {
			sendStartTalking();
		}
	}
	$scope.changeChannel = function(channel) {
		selectChannel(channel.accessKey);
	}
	var jqScrollPane = $("#messageScrollPane");
	var jqScrollInner = $("#messageScrollInner");
	var scrollBottomIfShowingBottom = function() {
		if (jqScrollPane.scrollTop() > jqScrollInner.height() - jqScrollPane.height() - 50) {
			setTimeout(function() {
				jqScrollPane.animate({
					scrollTop : jqScrollInner.height()
				}, 50);
				$(window).scrollTop($(window).height());
			}, 0);
		}
	}
	$scope.isTalking = function(accountId) {
		console.log(JSON.stringify($scope.channel.talkings));
		for ( var i in $scope.channel.talkings) {
			if ($scope.channel.talkings[i].account.id == accountId) {
				return true;
			}
		}
		return false;
	}
	var removeTalking = function(eventTargetChannel, accountId) {
		for ( var i in eventTargetChannel.talkings) {
			while (eventTargetChannel.talkings[i] && eventTargetChannel.talkings[i].account.id == accountId) {
				$scope["$apply"](function() {
					eventTargetChannel.talkings.splice(i, 1);
					scrollBottomIfShowingBottom();
				});
			}
		}
	}
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
			if (!$rootScope.myAccount) {
				return;
			}
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
				if (0 == messages.length) {
					eventTargetChannel.noMoreHistory = true;
				}
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
						scrollBottomIfShowingBottom();
					} else {
						eventTargetChannel.unreadCount++;
					}
				});
				if (!$rootScope.myAccount) {
					return;
				}
				var hasStrongWord = false;
				strongWordsParsed.forEach(function(word) {
					if (0 <= message.body.indexOf(word)) {
						hasStrongWord = true;
					}
				});
				if (hasStrongWord) {
					if (eventTargetChannel.accessKey != $scope.channel.accessKey) {
						$scope.$apply(function() {
							eventTargetChannel.notify = true;
						});
					}
					if (document.hasFocus()) {
						return;
					}
					bounce();
				}
				if (!document.hasFocus() && (!$rootScope.myAccount.config.notification || "all" == $rootScope.myAccount.config.notification || (hasStrongWord && "strongWordOnly" == $rootScope.myAccount.config.notification))) {
					var text = $(marked(message.body)).text();
					$rootScope.showNotification(message.owner.name + "@" + eventTargetChannel.name, text, {
						stay : hasStrongWord
					}, function() {
						$scope.$apply(function() {
							selectChannel(eventTargetChannel.accessKey);
							setTimeout(function() {
								jqScrollPane.animate({
									scrollTop : jqScrollInner.height()
								}, 50);
							}, 0)
						})
					});
				}
				highlightStrongWords();
			});
		} else if ("join" == event.type || "hello" == event.type) {
			var joinedAccount = event.account;
			var exist = false;
			if (eventTargetChannel.Group.Accounts) {
				eventTargetChannel.Group.Accounts.forEach(function(account) {
					if (account.id == joinedAccount.id) {
						$scope["$apply"](function() {
							account.now = true;
							exist = true;
						});
					}
				});
				if (!exist) {
					$scope["$apply"](function() {
						eventTargetChannel.Group.Accounts.push(joinedAccount);
						joinedAccount.now = true;
					});
				}
			}
			if ("join" == event.type) {
				$rootScope.sendHello({
					channelAccessKey : eventTargetChannel.accessKey
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
					channelAccessKey : eventTargetChannel.accessKey
				})
			}
			removeTalking(eventTargetChannel, event.account.id);
		} else if ("startTalking" == event.type) {
			if ($rootScope.myAccount.id == event.account.id) {
				return;
			}
			$scope.$apply(function() {
				eventTargetChannel.talkings.push({
					account : event.account,
					time : new Date()
				});
			});
			scrollBottomIfShowingBottom();
		} else if ("stopTalking" == event.type) {
			removeTalking(eventTargetChannel, event.account.id)
		}
	}
	var sendStartTalking = function() {
		changeTalking(true);
	}
	var sendStopTalking = function() {
		changeTalking(false);
	}
	var changeTalking = function(start) {
		api = start ? "startTalking" : "stopTalking";
		if ($scope.channel.Group.isTemporary) {
			postUrl = "/api/channels/" + $scope.channel.accessKey + "/messages/" + api;
		} else {
			postUrl = "/api/groups/" + $scope.channel.Group.accessKey + "/channels/" + $scope.channel.accessKey + "/messages/" + api;
		}
		put($http, postUrl, {
			sessionKey : $rootScope.getSessionKey()
		})
	}
	var talking = false;
	$scope.$watch("text", function() {
		currentTalking = $scope.text && "" != $scope.text;
		if (!talking && currentTalking) {
			sendStartTalking();
		} else if (talking && !currentTalking) {
			sendStopTalking();
		}
		talking = currentTalking;
	})
	var sendingMessage;
	$scope.sendMessage = function() {
		if (sendingMessage != $scope.text) {
			if ("" == $scope.text) {
				return;
			}
			var matchToRemind;
			if (matchToRemind = $scope.text.match(/^\/remind[\p{blank}\s]+([0-2]?[0-9]):([0-5]?[0-9])[\p{blank}\s]+([\s\S]+)$/)) {
				var hour = matchToRemind[1];
				var minutes = matchToRemind[2];
				var message = matchToRemind[3];
				var dateToEpoc = new Date();
				dateToEpoc.setHours(parseInt(hour));
				dateToEpoc.setMinutes(parseInt(minutes));
				if (dateToEpoc < new Date()) {
					var time = dateToEpoc.getTime() + 24 * 60 * 60 * 1000;
					dateToEpoc = new Date(time);
				}
				sendingMessage = "/remind " + dateToEpoc.getTime() + " " + message;
				$scope.text = "";
			} else {
				sendingMessage = $scope.text;
				$scope.sendingMessage = {};
				$scope.sendingMessage.body = sendingMessage;
				$scope.text = "";
				setTimeout(function() {
					jqScrollPane.animate({
						scrollTop : jqScrollInner.height()
					}, 50);
				}, 0);
			}
			var postUrl;
			if ($scope.channel.Group.isTemporary) {
				postUrl = "/api/channels/" + $scope.channel.accessKey + "/messages";
			} else {
				postUrl = "/api/groups/" + $scope.channel.Group.accessKey + "/channels/" + $scope.channel.accessKey + "/messages"
			}
			post($http, postUrl, {
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
		$rootScope.timelineLogUrl = $location.protocol() + "://" + location.host + "/messageLog/" + $scope.channel.Group.accessKey + "/" + $scope.channel.accessKey + "/" + startTime + "/" + endTime;
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
		var dialogController = [ "$scope", "$uibModalInstance", function($dialogScope, $modalInstance) {
			$dialogScope.save = function() {
				$modalInstance.close({
					type : "strongWords",
					value : $dialogScope.strongWords,
					notification : $dialogScope.notificationSetting
				});
			};
			$dialogScope.createWebhookUrl = function(target) {
				$modalInstance.close({
					type : "webhook",
					value : target
				});
			};
			$dialogScope.createBot = function() {
				$modalInstance.close({
					type : "createBot"
				});
			};
			$dialogScope.message = $rootScope.messages.menu.setting;
			$dialogScope.strongWords = $rootScope.myAccount.config.strongWords;
			if (!$dialogScope.strongWords) {
				$dialogScope.strongWords = $rootScope.myAccount.name;
			}
			$dialogScope.notificationSetting = $rootScope.myAccount.config.notification;
			if (!$dialogScope.notificationSetting) {
				$dialogScope.notificationSetting = "all";
			}
		} ];
		var modalInstance = $modal.open({
			templateUrl : 'template/messageSetting.html',
			controller : dialogController
		});
		modalInstance.result.then(function(complete) {
			if ("strongWords" == complete.type) {
				put($http, '/api/accounts/config', {
					sessionKey : $rootScope.getSessionKey(),
					key : "strongWords",
					value : complete.value
				}).then(function() {
					$rootScope.myAccount.config.strongWords = complete.value;
					strongWordsParsed = parseStrongWords();
					highlightStrongWords();
				})["catch"](function(response) {
					$rootScope.showErrorWithStatus(response.status);
				});
			} else if ("webhook" == complete.type) {
				post($http, "/api/bots/", {
					sessionKey : $rootScope.getSessionKey(),
					channelAccessKey : $scope.channel.accessKey,
					type : complete.value,
				}).then(function(resp) {
					if ("gitlab" == complete.value) {
						$scope.channel.hasGitlabBot = true;
					} else if ("github" == complete.value) {
						$scope.channel.hasGithubBot = true;
					}
					$scope.showWebhookDialog(resp.data.key);
				})["catch"](function(response) {
					$rootScope.showErrorWithStatus(response.status);
				});
			} else if ("createBot" == complete.type) {
				post($http, "/api/bots", {
					sessionKey : $rootScope.getSessionKey(),
					channelAccessKey : $scope.channel.accessKey,
					type : "api"
				}).then(function(response) {
					showBotCreatedDialog(response.data.key);
				})["catch"](function(response) {
					$rootScope.showErrorWithStatus(response.status);
				});
			}
			if (complete.notification && complete.notification != $rootScope.myAccount.config.notification) {
				put($http, '/api/accounts/config', {
					sessionKey : $rootScope.getSessionKey(),
					key : "notification",
					value : complete.notification
				}).then(function() {
					$rootScope.myAccount.config.notification = complete.notification;
				})["catch"](function(response) {
					$rootScope.showErrorWithStatus(response.status);
				});
			}
		}, function() {
		});
	}
	$scope.showWebhookDialog = function(botkey) {
		var dialogController = [ "$scope", "$uibModalInstance", function($dialogScope, $modalInstance) {
			$dialogScope.text = $location.protocol() + "://" + location.host + "/api/bots/events/webhook/" + botkey;
			$dialogScope.message = $rootScope.messages.messages.forGitlab;
			$dialogScope.onCancelButtonMessage = $rootScope.messages.close;
			$dialogScope.placeholder = "";
			$dialogScope.hideCompleteButton = true;
		} ];
		var modalInstance = $modal.open({
			templateUrl : 'template/confirmWithTextDialog.html',
			controller : dialogController
		});
		modalInstance.result.then(function() {
		}, function() {
		});
	}
	$scope.openHelp = function() {
		var showingMenu = "markdown"
		var dialogController = [ "$scope", "$uibModalInstance", function($dialogScope, $modalInstance) {
			$dialogScope.is = function(type) {
				return type == showingMenu;
			}
			$dialogScope.to = function(type) {
				return showingMenu = type;
			}
		} ];
		var modalInstance = $modal.open({
			templateUrl : 'template/messageHelp.html',
			controller : dialogController
		});
	}
	$scope.$watch("messageImage", function() {
		if (!$scope.messageImage) {
			return;
		}
		var messageInput = document.getElementById("messageInput");
		var uploadApi;
		if ($scope.channel.Group.isTemporary) {
			uploadApi = '/api/image/channels/' + $scope.channel.accessKey;
		} else {
			uploadApi = '/api/image/groups/' + $scope.channel.Group.accessKey;
		}
		$scope.isFileUploading = true;
		var uploader = $uploader.upload({
			url : uploadApi,
			fields : {
				sessionKey : $rootScope.getSessionKey(),
				name : $scope.messageImage.name
			},
			file : $scope.messageImage,
			fileFormDataName : "imageFile",
			sendFieldsAs : "form",
			method : "POST"
		}).success(function(response) {
			var isImage = $scope.messageImage.type && 0 == $scope.messageImage.type.indexOf("image");
			var text = (isImage ? "!" : "") + "[" + $scope.messageImage.name + "](" + response.url + ")";
			var index = messageInput.selectionStart;
			if ($scope.text) {
				$scope.text = $scope.text.substr(0, index) + text + $scope.text.substr(index);
			} else {
				$scope.text = text;
			}
			$scope.isFileUploading = false;
		}).error(function(error) {
			$rootScope.showErrorWithStatus(error.status);
			$scope.isFileUploading = false;
		});
	});
	var showBotCreatedDialog = function(botkey) {
		var dialogController = [ "$scope", "$uibModalInstance", function($dialogScope, $modalInstance) {
			$dialogScope.message = $rootScope.messages.bots.created;
			$dialogScope.messageDetail = $rootScope.messages.bots.keepKeySecret;
			$dialogScope.text = botkey;
			$dialogScope.description = $rootScope.messages.bots.key;
			$dialogScope.onCancelButtonMessage = $rootScope.messages.close;
			$dialogScope.placeholder = "";
			$dialogScope.hideCompleteButton = true;
		} ];
		var modalInstance = $modal.open({
			templateUrl : 'template/confirmWithTextDialog.html',
			controller : dialogController
		});
		modalInstance.result.then(function() {
		}, function() {
		});
	}
	if ($(window).width() < 768) {
		setTimeout(function() {
			$(window).scrollTop($(window).height());
		}, 100);
		$scope.channelToggleShown = false;
		$scope.toggleChannelVisible = function() {
			var animateParam;
			$scope.channelToggleShown = !$scope.channelToggleShown;
			if ($scope.channelToggleShown) {
				animateParam = {
					left : "30%",
					opacity : 100
				}
			} else {
				animateParam = {
					left : "100%",
					opacity : 0.3
				}
			}
			$("#messageChannelsArea").animate(animateParam, 500, "swing")
		}
		var onResize = function() {
			scrollBottomIfShowingBottom();
		}
		$(window).bind('resize', onResize);
		$scope.$on('$destroy', function() {
			$(window).unbind('resize', onResize);
		});
		var element = document.getElementById('messageInput');
		element.focus();
		element.onblur = function() {
			setTimeout(function() {
				element.focus();
			}, 0);
		};
	}
} ];
var accountController = [ "$rootScope", "$scope", "$resource", "$location", "$http", "$uibModal", "$routeParams", function($rootScope, $scope, $resource, $location, $http, $modal, $routeParams) {
	var id = $routeParams.id;
	$resource("/api/accounts/:id").get({
		id : id,
		sessionKey : $rootScope.getSessionKey()
	}, function(account) {
		$scope.account = account;
	}, function(error) {
		$rootScope.showErrorWithStatus(error.status);
	});
} ];
var homeController = [ "$rootScope", "$scope", "$resource", "$location", "$http", "$uibModal", function($rootScope, $scope, $resource, $location, $http, $modal) {
	if (!$rootScope.getSessionKey()) {
		$location.path("/");
		return;
	}
	$resource("/api/contents/").query({
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
		var dialogController = [ "$scope", "$uibModalInstance", function($dialogScope, $modalInstance) {
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
			$resource("/api/contents/:accessKey").remove({
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
myapp.controller('contentsController', contentsController);
myapp.controller('activationController', activationController);
myapp.controller('signinController', signinController);
myapp.controller('invitationController', invitationController);
myapp.controller('requestResetPasswordController', requestResetPasswordController);
myapp.controller('resetPasswordController', resetPasswordController);
myapp.controller('editProfileController', editProfileController);
myapp.controller('manageKeyController', manageKeyController);
myapp.controller('manageDeviceController', manageDeviceController);
myapp.controller('manageBotController', manageBotController);
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
myapp.controller('messageLogController', messageLogController);
myapp.controller('accountController', accountController);
myapp.controller('homeController', homeController);