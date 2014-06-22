// Append SoundCloud SDK
var js = document.createElement("script");
js.type = "text/javascript";
js.src = '//connect.soundcloud.com/sdk.js';
document.head.appendChild(js);

window.onload = function() {
	var tracks = document.getElementsByClassName('ascii-player');
	if (tracks.length) {
		SC.initialize({
			client_id: '7378a0b12a23988a8fded1ae3044f549'
		});
	}

	for (var i = 0; i < tracks.length; i++) {
		var id = tracks[i].getAttribute('id');
		SC.get('/tracks/' + id, function(track) {
			asciiPlayer(track);
		});
	}
}

function asciiPlayer (track) {
	var duration = formatTime(track.duration);
	console.log(track);

	// markup
	// TODO: automate the way this gets rendered
	var bar = ['|', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-'];
	var player = [
		'###########################################################', '<br/>',
		'#', '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;', '#', '<br/>',
		'#', '&nbsp;&nbsp;&nbsp;', track.title, '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;', '#', '<br/>',
		'#', '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;', '#', '<br/>',
		'#', '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;', '#', '<br/>',
		'#', '&nbsp;&nbsp;&nbsp;', '[<span class="playPause">play </span>]&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="timeElapsed">00:00:00</span> / ', duration, '&nbsp;&nbsp;&nbsp;&nbsp;#', '<br/>',
		'#', '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;', '#', '<br/>',
		'#', '&nbsp;&nbsp;&nbsp;', '<span class="progressBar">', bar.join(''), '</span>', '&nbsp;&nbsp;&nbsp;&nbsp;', '#', '<br/>',
		'#', '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;', '#', '<br/>',
		'#', '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;', '#', '<br/>',
		'#', '&nbsp;&nbsp;&nbsp;', '<a href="' + track.user.permalink_url + '">', track.user.username, '</a>', ' via ', '<a href="http://soundcloud.com">soundcloud</a>', '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;', '#', '<br/>',
		'#', '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;', '#', '<br/>',
		'###########################################################',
		'<br/><br/><br/><br/><br/><br/><br/>'
	];

	// create element
	var $player = document.createElement('div');
	$player.innerHTML = player.join('');

	// events
	$player.querySelector('.playPause').addEventListener('click', togglePlayPause);
	// TODO: add event for when clicking on progress bar

	// functions
	function togglePlayPause (e) {
		var self = this;
		if (e.target.innerHTML.toLowerCase().trim() === 'play') {

			// TODO: probably want to render this when the track actually plays,
			// in case it lags
			e.target.innerHTML = 'pause';

			if (self.sound) {
				self.sound.resume();
				return;
			}

			SC.stream('/tracks/' + track.id, function (sound) {
				self.sound = sound;
				sound.play({
					whileplaying: function () {
						var timeElapsed = formatTime(this.position);
						$player.querySelector('.timeElapsed').innerHTML = timeElapsed;
						updateProgressBar(this.position / track.duration);
					}
				});
			});

		} else {
			this.sound.pause();
			e.target.innerHTML = 'play ';
		}
	}

	function updateProgressBar (percent) {
		var positionElapsed = Math.floor(percent*bar.length);

		for (var i = 0; i < bar.length; i++) {
			bar[positionElapsed] = '=';
			bar[positionElapsed + 1] = '|';
		}

		$player.querySelector('.progressBar').innerHTML = bar.join('');
	}

	function render () {
		window.document.getElementById(track.id).appendChild($player);
	}

	// render
	render();
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