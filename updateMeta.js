const SoundCloudAPI = require('soundcloud-nodejs-api-wrapper');
const credentials = require('./.soundcloud.json');
const sc = new SoundCloudAPI(credentials);
const url = require('url');
const path = require('path');

const trackUrl = 'https://soundcloud.com/user-859739632/testbadoom';
const description = `Слушайте на SoundCloud — https://soundcloud.com/web-standards/episode-N
Обсуждайте в Слаке — https://web-standards.slack.com/messages/podcast/

00:00 Тема 1

Статья — ссылка
Статья — ссылка`;


function authorize() {
    return new Promise((resolve, reject) => {
        const client = sc.client();

        client.exchange_token((err,...args) => {
            const access_token = args[2].access_token;

            if (err) {
                throw err;
            }
            resolve(sc.client({access_token: access_token}));
        });
    })
}

function resolveTrackId(client, trackUrl) {
    return new Promise((resolve, reject) => {
        client.get('/resolve', {url: trackUrl}, (err, result) => {
            if (err) {
                throw err;
            }

            const parsedUrl = url.parse(result.location);
            const trackId = path.basename(parsedUrl.pathname);
            resolve(trackId);
        })
    });
}

function updateTrackDescription(client, trackId, description) {
    return new Promise((resolve, reject) => {
        client.put(`/tracks/${trackId}`, JSON.stringify({track: {description: description}}), (err, result) => {
            if (err) {
                throw err;
            }

            resolve(result);
        })
    });
}

authorize()
    .then((client) => {
        resolveTrackId(client, trackUrl)
            .then((trackId) => {
                return updateTrackDescription(client, trackId, description);
            })
            .then((data) => {
                console.log(data['description']);
            })
    });
