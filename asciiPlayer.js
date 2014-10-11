var AsciiPlayer = (function () {
	// Append SoundCloud SDK
	var js = document.createElement('script');
	js.type = 'text/javascript';
	js.src = '//connect.soundcloud.com/sdk.js';
	document.head.appendChild(js);

	return {
		init: function (config) {
			var trackIDs = [];
			var tracksOnPage, playerWrapper, secretToken;

			if (!config.clientID) {
				return console.log('ERROR: clientID was not found.')
			}
			
			SC.initialize({
				client_id: config.clientID
			});

			tracksOnPage = document.getElementsByClassName('ascii-player');
			if (!tracksOnPage.length) {
				return console.log('WARNING: No tracks were identified.');
			}

			for (var i = 0; i < tracksOnPage.length; i++) {
				var trackID = tracksOnPage[i].getAttribute('id');
				playerWrapper = window.document.getElementById(trackID);
				secretToken = playerWrapper.getAttribute('secret-token');

				this.getTrack(trackID, secretToken, function (track) {
					var player = new Player(track);
					player.render(playerWrapper);
				});
			}
		},
		getTrack: function (trackID, secretToken, callback) {
			var trackUrl = '/tracks/' + trackID + ((secretToken) ? '?secret_token=' + secretToken : '');
			SC.get(trackUrl, function (track) {
				if (track.errors) {
					return console.log('ERROR: Unable to load track');
				}
				callback(track);
			});
		}
	}

	function Player (track) {
		var self = this;

		this.player = [];
		this.borderChar = '#';
		this.playerPadding = 3;
		this.playerWidth = 60 - this.playerPadding;
		this.playerStyle = {
			backgroundColor: '#ffffff',
			fontFamily: 'monospace',
			fontSize: '13px',
			fontWeight: 'normal',
			fontStyle: 'normal',
			letterSpacing: 'normal',
			lineHeight: 'normal',
			color: '#000000',
			textTransform: 'uppercase'
		};

		this.render = function (wrapper) {
			// Start Rendering Player
			renderLines();

			// create element with player contents + player style
			this.$player = document.createElement('div');
			this.$player.innerHTML = this.player.join('');
			for (style in self.playerStyle) {
				self.$player.style[style] = self.playerStyle[style];
			}

			// bind events
			this.$player.querySelector('.playPause').addEventListener('click', this.togglePlayPause);
			// TODO: Add ability to skip in progress bar
			// $player.querySelector('.progressBar').addEventListener('click', changeProgress);

			wrapper.appendChild(this.$player);

			function renderLines () {
				// TODO: Clean the way progress bar + play btn + progress are being rendered/calcuated
				var progressBarLength = 0;
				self.progressBar = [];
				self.progressBar.push('|');
				progressBarLength++;
				for (var i = 0; i < (self.playerWidth - ((self.playerPadding + 1) * 2)); i++) {
					self.progressBar.push('-');
					progressBarLength++;
				}

				var playBtn = '<span class="playPause">[play ]</span>';
				var timeElapsed = '<span class="timeElapsed">00:00:00</span> / ' + formatTime(track.duration);
				var playTimeLength = ('[play ]' + '00:00:00 / ' + formatTime(track.duration)).length;

				var credit = '<a href="' + track.user.permalink_url + '">' + track.user.username + '</a> via <a href="http://soundcloud.com">soundcloud</a>';
				var creditLength = (track.user.username + ' via soundcloud').length;

				var renderLinez = [
					'horizontal',
					'vertical',
					['text', track.title],
					'vertical',
					'vertical',
					['text', playBtn + timeElapsed, playTimeLength],
					'vertical',
					['text', '<span class="progressBar">' + self.progressBar.join('') + '</span>', progressBarLength],
					'vertical',
					'vertical',
					['text', credit, creditLength],
					'vertical',
					'horizontal'
				];
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
						self.player.push(self.borderChar);

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
		this.togglePlayPause = function (e) {
			var $target = e.target;
			var playText = '[play ]';
			var pauseText = '[pause]';

			if ($target.innerHTML.toLowerCase().trim() === playText) {
				$target.innerHTML = pauseText;

				if (self.sound) {
					return self.sound.resume();
				}

				SC.stream('/tracks/' + track.id, function (sound) {
					self.sound = sound;
					sound.play({
						whileplaying: function () {
							var timeElapsed = formatTime(this.position);
							self.$player.querySelector('.timeElapsed').innerHTML = timeElapsed;
							self.updateProgressBar(this.position / track.duration);
						}
					});
				});

				return;
			}

			self.sound.pause();
			$target.innerHTML = playText;
		}
		this.updateProgressBar = function (percent) {
			var positionElapsed = Math.floor(percent * self.progressBar.length);
			for (var i = 0; i < self.progressBar.length; i++) {
				self.progressBar[positionElapsed] = '=';
				self.progressBar[positionElapsed + 1] = '|';
			}
			self.$player.querySelector('.progressBar').innerHTML = self.progressBar.join('');
		}
		// TODO: Add ability to skip in progress bar
		// this.changeProgress = function (e) {
		//
		// }
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