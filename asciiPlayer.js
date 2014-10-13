var AsciiPlayer;

(function () {
	// Append SoundCloud SDK
	var js = document.createElement('script');
	js.type = 'text/javascript';
	js.src = '//connect.soundcloud.com/sdk.js';
	document.head.appendChild(js);

	AsciiPlayer = function () {
		function init (config) {
			if (!config.clientID) {
				return console.log('ERROR: clientID was not found.')
			}
			
			SC.initialize({
				client_id: config.clientID
			});

			populateTracksOnpage();
		}

		function populateTracksOnpage () {
			var self = this;
			var $tracksOnPage = document.getElementsByClassName('ascii-player');
			// var trackID, secretToken, $playerWrapper;

			if (!$tracksOnPage.length) {
				return console.log('ERROR: No players were found.');
			}

			for (var i = 0; i < $tracksOnPage.length; i++) {
				getTrack($tracksOnPage[i]);
			}
		};

		function getTrack ($track, callback) {
			var trackID = $track.getAttribute('id');
			var secretToken = $track.getAttribute('secret-token');
			var trackUrl = '/tracks/' + trackID + ((secretToken) ? '?secret_token=' + secretToken : '');

			SC.get(trackUrl, function (track) {
				if (track.errors) {
					return console.log('ERROR: Unable to load track');
				}
				track.secretToken = secretToken || null;
				renderTrack(track, $track);
			});
		}

		function renderTrack (track, $wrapper) {
			var config = {
				displayBorder: $wrapper.getAttribute('border'),
				horizontalBorderChar: $wrapper.getAttribute('border-char-horizontal'),
				verticalBorderChar: $wrapper.getAttribute('border-char-vertical'),
				borderChar: $wrapper.getAttribute('border-char'),
				width: parseInt($wrapper.getAttribute('width')),
				padding: parseInt($wrapper.getAttribute('padding')),
				title: $wrapper.getAttribute('title'),
				displayCredit: $wrapper.getAttribute('display-credit')
			};
			var player = new Player(track, config);
			player.render($wrapper);
		};

		return {
			init: init
		};
	}

	AsciiPlayer = new AsciiPlayer();



	// PLAYER CLASS

	function Player (track, config) {
		var self = this;

		// player characters
		this.player = [];

		// track
		track.title = config.title || track.title;
		this.track = track;

		// border
		this.playerPadding = config.padding || 2;
		this.playerWidth = config.width - this.playerPadding || 60 - this.playerPadding;

		this.displayBorder = ((config.displayBorder === 'false') ? false : true);
		this.borderChar = config.borderChar || '*';
		this.horizontalBorderChar = config.horizontalBorderChar || this.borderChar;
		this.verticalBorderChar = config.verticalBorderChar || this.borderChar;
		this.displayCredit = ((config.displayCredit === 'false') ? false : true);

		// progress bar
		this.positionElapsed = 0;
		this.progressBarLength = this.playerWidth - ((this.playerPadding + 1) * 2);

		// style
		this.playerStyle = {
			fontFamily: 'monospace',
			fontWeight: 'normal',
			fontStyle: 'normal',
			letterSpacing: 'normal',
			lineHeight: 'normal',
			textTransform: 'uppercase',
			cursor: 'default'
		};
	}

	Player.prototype.render = function (wrapper) {
		var self = this;
		renderLines();

		// create element with player contents + player style
		this.$player = wrapper; //document.createElement('div');
		this.$player.innerHTML = this.player.join('');
		for (style in self.playerStyle) {
			self.$player.style[style] = self.playerStyle[style];
		}

		this.$progressBar = this.$player.querySelector('.progressBar');

		// bind events
		this.$player.querySelector('.playPause').addEventListener('click', this.togglePlayPause);
		this.$player.querySelector('.progressBar').addEventListener('click', this.changeProgress);

		// wrapper.appendChild(this.$player);

		function renderLines () {
			// TODO: Clean the way progress bar + play btn + progress are being rendered/calcuated
			self.progressBar = [];
			var progressChar;
			for (var i = 0; i <= self.progressBarLength; i++) {
				if (i === 0) {
					progressChar = '|';
				} else {
					progressChar = '-';
				}
				self.progressBar.push('<span index=' + i + '>' + progressChar + '</span>');
			}

			var playBtn = '<span class="playPause">[play ]</span>';
			var timeElapsed = '<span class="timeElapsed">00:00:00</span> / ' + formatTime(self.track.duration);
			var playTimeLength = ('[play ]' + '00:00:00 / ' + formatTime(self.track.duration)).length;

			var credit = '<a href="' + self.track.user.permalink_url + '">' + self.track.user.username + '</a> via <a href="http://soundcloud.com">soundcloud</a>';
			var creditLength = (self.track.user.username + ' via soundcloud').length;

			var renderLinez = [
				'horizontal',
				'vertical',
				['text', self.track.title],
				'vertical',
				'vertical',
				['text', playBtn + timeElapsed, playTimeLength],
				'vertical',
				['text', '<span class="progressBar">' + self.progressBar.join('') + '</span>', self.progressBarLength+1],
				'vertical',
				'vertical'
			]

			if (self.displayCredit) {
				renderLinez.push(['text', credit, creditLength]);
			}

			renderLinez.push(
				'vertical',
				'horizontal'
			);
			// end TODO

			for (var i = 0; i < renderLinez.length; i++) {
				if (typeof renderLinez[i] === 'string') {
					renderLine(renderLinez[i]);
				} else if (typeof renderLinez[i] === 'object' && renderLinez[i][0] === 'text') {
					var type = renderLinez[i][0];
					var value = renderLinez[i][1];
					var valueLength = renderLinez[i][2];
					renderLine(type, value, valueLength);
				}
			}
		}

		function renderLine (type, text, textLength) {
			if (!type) {
				return console.log('ERROR: Must identify type in renderLine()');
			}

			for (var i = 0; i <= self.playerWidth; i++) {
				if (i === 0 || i === self.playerWidth || type === 'horizontal') {
					if (self.displayBorder) {
						if (type === 'horizontal' && self.horizontalBorderChar) {
							self.player.push(self.horizontalBorderChar);
						} else if (self.verticalBorderChar) {
							self.player.push(self.verticalBorderChar);
						} else {
							self.player.push(self.borderChar);
						}
					}

				} else if (type === 'text' && i === self.playerPadding + 1) {
					self.player.push(text);
					i = i + ((textLength) ? textLength - 1 : text.length - 1);

				} else {
					self.player.push('&nbsp;');
				}
			}

			self.player.push('<br/>');
		}
	}

	Player.prototype.togglePlayPause = function (e) {
		var $target = e.target;
		var playText = '[play ]';
		var pauseText = '[pause]';

		if ($target.innerHTML.toLowerCase().trim() === playText) {
			$target.innerHTML = pauseText;

			if (self.sound) {
				return self.sound.resume();
			}

			SC.stream('/tracks/' + track.id + ((track.secretToken) ? '?secret_token=' + track.secretToken: ''), function (sound) {
				self.sound = sound;
				sound.play({
					whileplaying: function () {
						var timeElapsed = formatTime(this.position);
						var percent = this.position / track.duration;

						self.$player.querySelector('.timeElapsed').innerHTML = timeElapsed;

						var positionElapsed = Math.floor(percent * self.progressBarLength);
						if (positionElapsed >= self.positionElapsed) {
							self.positionElapsed = positionElapsed;
							self.updateProgressBar(self.positionElapsed);
						}
					},
					onfinish: function () {
						self.updateProgressBar(self.progressBarLength);
					}
				});
			});

			return;
		}

		self.sound.pause();
		$target.innerHTML = playText;
	}

	Player.prototype.updateProgressBar = function (positionElapsed) {
		for (var i = positionElapsed; i >= 0; i--) {
			self.$progressBar.childNodes[i].textContent = '=';
		}

		self.$progressBar.childNodes[positionElapsed].textContent = '|';

		for (var i = positionElapsed + 1; i < self.$progressBar.childNodes.length; i++) {
			if (self.$progressBar.childNodes[i].textContent !== '-') {
				self.$progressBar.childNodes[i].textContent = '-';
			} else {
				return;
			}
		}
	}

	Player.prototype.changeProgress = function (e) {
		if (!self.sound) {
			return;
		}

		var selectedPosition = parseInt(e.target.getAttribute('index'));
		var selectedDuration = (selectedPosition / self.progressBarLength) * track.duration;

		self.$player.querySelector('.timeElapsed').innerHTML = formatTime(selectedDuration);
		self.sound.setPosition(selectedDuration);

		self.positionElapsed = Math.floor(selectedPosition / track.duration);
	}

	function formatTime (miliseconds) {
		var hours = Math.floor((miliseconds/(1000*60*60))%24);
		var minutes = Math.floor((miliseconds/(1000*60))%60);
		var seconds = Math.floor((miliseconds/1000)%60);

		if (hours === 0 || hours < 10) {
			hours = '0' + hours;
		}

		if (minutes === 0 || minutes < 10) {
			minutes = '0' + minutes;
		}

		if (seconds === 0 || seconds < 10) {
			seconds = '0' + seconds;
		}

		return hours + ':' + minutes + ':' + seconds;
	}
}());