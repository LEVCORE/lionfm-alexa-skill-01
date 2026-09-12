const Alexa = require('ask-sdk-core');
const axios = require('axios');

/*
 * LionFM Multi-Stream Alexa Skill
 * Standard beim Öffnen: LIONFM
 * Weitere Streams werden über den Slot "station" ausgewählt.
 */

const DEFAULT_STATION = 'lionfm';

const STATIONS = {
    lionfm: { display: 'LIONFM', spoken: 'Lion F M', slogan: 'Your music, your lifestyle!' },
    topchartsfm: { display: 'TOPCHARTSFM', spoken: 'Top Charts F M', slogan: 'Charts' },
    dancefm: { display: 'DANCEFM', spoken: 'Dance F M', slogan: 'EDM' },
    hollyfm: { display: 'HOLLYFM', spoken: 'Holly F M', slogan: '2010er' },
    schlagerparadies: { display: 'SCHLAGERPARADIES', spoken: 'Schlagerparadies', slogan: 'Schlager' },
    servfm: { display: 'SERVFM', spoken: 'Serv F M', slogan: 'Sommer' },
    nightlifefm: { display: 'NIGHTLIFEFM', spoken: 'Nightlife F M', slogan: 'Nightlife' },
    remixfm: { display: 'REMIXFM', spoken: 'Remix F M', slogan: 'Remixe' },
    '80s90sfm': { display: '80S90SFM', spoken: 'Achtziger Neunziger F M', slogan: '80er und 90er' },
    malleparadies: { display: 'MALLEPARADIES', spoken: 'Malleparadies', slogan: 'Mallorca und Party' },
    xmasfm: { display: 'XMASFM', spoken: 'X Mas F M', slogan: 'Christmas' },
    citymusicfm: { display: 'CITYMUSICFM', spoken: 'City Music F M', slogan: 'Club' },
    rewindfm: { display: 'REWINDFM', spoken: 'Rewind F M', slogan: '2000er' }
};

function escapeSsml(text = '') {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function streamUrl(stationId) {
    return `https://stream.laut.fm/${stationId}?ref=alexa-own-lionfm`;
}

function streamToken(stationId) {
    return `lionfm|${stationId}|${Date.now()}`;
}

function stationImage(stationId) {
    return `https://api.laut.fm/station/${stationId}/images/station`;
}

function currentStationFromContext(handlerInput) {
    const token = handlerInput.requestEnvelope?.context?.AudioPlayer?.token || '';
    const match = token.match(/^lionfm\|([^|]+)\|/);
    if (match && STATIONS[match[1]]) return match[1];
    return DEFAULT_STATION;
}

function resolveStation(handlerInput) {
    const slot = Alexa.getSlot(handlerInput.requestEnvelope, 'station');
    if (!slot) return currentStationFromContext(handlerInput);

    // Entity Resolution hat Vorrang.
    const authority = slot.resolutions?.resolutionsPerAuthority?.find(
        item => item.status?.code === 'ER_SUCCESS_MATCH'
    );
    const resolved = authority?.values?.[0]?.value?.id;
    if (resolved && STATIONS[resolved]) return resolved;

    // Fallback, falls Alexa nur den Rohwert liefert.
    const raw = (slot.value || '').toLowerCase().replace(/[^a-z0-9äöüß]/g, '');
    const aliases = {
        lionfm: 'lionfm', lion: 'lionfm', hauptsender: 'lionfm', main: 'lionfm',
        topchartsfm: 'topchartsfm', topcharts: 'topchartsfm', charts: 'topchartsfm',
        dancefm: 'dancefm', dance: 'dancefm', edm: 'dancefm',
        hollyfm: 'hollyfm', holly: 'hollyfm',
        schlagerparadies: 'schlagerparadies', schlager: 'schlagerparadies',
        servfm: 'servfm', serv: 'servfm', sommer: 'servfm',
        nightlifefm: 'nightlifefm', nightlife: 'nightlifefm',
        remixfm: 'remixfm', remix: 'remixfm',
        '80s90sfm': '80s90sfm', achtzigerneunzigerfm: '80s90sfm', achtzigerneunziger: '80s90sfm',
        malleparadies: 'malleparadies', malle: 'malleparadies',
        xmasfm: 'xmasfm', xmas: 'xmasfm', christmas: 'xmasfm', weihnachten: 'xmasfm',
        citymusicfm: 'citymusicfm', citymusic: 'citymusicfm', city: 'citymusicfm',
        rewindfm: 'rewindfm', rewind: 'rewindfm', zweitausender: 'rewindfm'
    };
    return aliases[raw] || null;
}

async function apiGet(path) {
    try {
        const { data } = await axios.get(`https://api.laut.fm/station/${path}`, { timeout: 5000 });
        return data;
    } catch (error) {
        console.error('laut.fm API error:', error.message);
        return null;
    }
}

function playStationResponse(handlerInput, stationId, announce = true) {
    const station = STATIONS[stationId];
    const speak = announce ? `Ich starte ${station.spoken}.` : '';

    return handlerInput.responseBuilder
        .speak(escapeSsml(speak))
        .addAudioPlayerPlayDirective(
            'REPLACE_ALL',
            streamUrl(stationId),
            streamToken(stationId),
            0,
            null,
            {
                title: station.display,
                subtitle: station.slogan,
                art: { sources: [{ url: stationImage(stationId) }] },
                backgroundImage: { sources: [{ url: stationImage(stationId) }] }
            }
        )
        .getResponse();
}

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        return playStationResponse(handlerInput, DEFAULT_STATION, true);
    }
};

const PlayStationIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
            Alexa.getIntentName(handlerInput.requestEnvelope) === 'PlayStationIntent';
    },
    handle(handlerInput) {
        const stationId = resolveStation(handlerInput);
        if (!stationId) {
            return handlerInput.responseBuilder
                .speak('Diesen Lion F M Stream habe ich nicht gefunden. Sage zum Beispiel: spiele Dance F M, Top Charts F M oder Rewind F M.')
                .reprompt('Welchen Lion F M Stream möchtest du hören?')
                .getResponse();
        }
        return playStationResponse(handlerInput, stationId, true);
    }
};

const CurrentSongHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
            Alexa.getIntentName(handlerInput.requestEnvelope) === 'CurrentSongIntent';
    },
    async handle(handlerInput) {
        const stationId = resolveStation(handlerInput) || currentStationFromContext(handlerInput);
        const songs = await apiGet(`${stationId}/last_songs`);
        const song = Array.isArray(songs) ? songs[0] : null;
        if (!song) {
            return handlerInput.responseBuilder.speak('Die aktuellen Titelinformationen sind gerade nicht verfügbar.').getResponse();
        }
        const artist = song.artist?.name || song.artist || '';
        const title = song.title || song.name || '';
        return handlerInput.responseBuilder
            .speak(escapeSsml(`Auf ${STATIONS[stationId].spoken} läuft aktuell ${artist} mit ${title}.`))
            .withSimpleCard(`Aktuell auf ${STATIONS[stationId].display}`, `${artist} – ${title}`)
            .getResponse();
    }
};

const LastSongsHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
            Alexa.getIntentName(handlerInput.requestEnvelope) === 'LastSongsIntent';
    },
    async handle(handlerInput) {
        const stationId = resolveStation(handlerInput) || currentStationFromContext(handlerInput);
        const songs = await apiGet(`${stationId}/last_songs`);
        const song = Array.isArray(songs) ? songs[1] : null;
        if (!song) {
            return handlerInput.responseBuilder.speak('Der zuletzt gespielte Titel ist gerade nicht verfügbar.').getResponse();
        }
        const artist = song.artist?.name || song.artist || '';
        const title = song.title || song.name || '';
        return handlerInput.responseBuilder
            .speak(escapeSsml(`Zuletzt lief auf ${STATIONS[stationId].spoken} ${artist} mit ${title}.`))
            .withSimpleCard(`Zuletzt auf ${STATIONS[stationId].display}`, `${artist} – ${title}`)
            .getResponse();
    }
};

const ListStationsIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
            Alexa.getIntentName(handlerInput.requestEnvelope) === 'ListStationsIntent';
    },
    handle(handlerInput) {
        const names = Object.values(STATIONS).map(s => s.spoken);
        return handlerInput.responseBuilder
            .speak(`Zu Lion F M gehören folgende Streams: ${names.join(', ')}. Welchen möchtest du hören?`)
            .reprompt('Sage zum Beispiel: spiele Dance F M.')
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
            Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak('Mit Lion F M kannst du alle Lion F M Streams hören. Sage zum Beispiel: spiele Dance F M, spiele Holly F M oder welche Sender gibt es.')
            .reprompt('Welchen Stream möchtest du hören?')
            .getResponse();
    }
};

const PauseIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
            Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.PauseIntent';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder.addAudioPlayerStopDirective().getResponse();
    }
};

const ResumeIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
            Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.ResumeIntent';
    },
    handle(handlerInput) {
        return playStationResponse(handlerInput, currentStationFromContext(handlerInput), false);
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
            ['AMAZON.CancelIntent', 'AMAZON.StopIntent'].includes(Alexa.getIntentName(handlerInput.requestEnvelope));
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak('Bis bald bei Lion F M.')
            .addAudioPlayerStopDirective()
            .getResponse();
    }
};

const AudioPlayerEventHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope).startsWith('AudioPlayer.');
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder.getResponse();
    }
};

const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
            Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak('Das habe ich leider nicht verstanden. Sage zum Beispiel: spiele Remix F M oder welche Sender gibt es.')
            .reprompt('Welchen Lion F M Stream möchtest du hören?')
            .getResponse();
    }
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder.getResponse();
    }
};

const ErrorHandler = {
    canHandle() { return true; },
    handle(handlerInput, error) {
        console.error(error);
        return handlerInput.responseBuilder
            .speak('Entschuldigung, da ist etwas schiefgelaufen. Bitte versuche es noch einmal.')
            .getResponse();
    }
};

exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        PlayStationIntentHandler,
        CurrentSongHandler,
        LastSongsHandler,
        ListStationsIntentHandler,
        HelpIntentHandler,
        PauseIntentHandler,
        ResumeIntentHandler,
        CancelAndStopIntentHandler,
        AudioPlayerEventHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler
    )
    .addErrorHandlers(ErrorHandler)
    .lambda();
