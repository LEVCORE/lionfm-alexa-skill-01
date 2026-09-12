# LionFM Alexa Multi-Stream Skill

Dieser Skill wurde auf Basis des mehrsprachigen laut.fm Alexa-Skill-Templates erweitert und für **LionFM als Multi-Stream-Skill** angepasst.

Beim normalen Start spielt Alexa immer den Hauptstream **LIONFM**. Weitere zu LionFM gehörende laut.fm-Streams können innerhalb desselben Skills per Sprachbefehl ausgewählt werden.

## Enthaltene Streams

- LIONFM
- TOPCHARTSFM
- DANCEFM
- HOLLYFM
- SCHLAGERPARADIES
- SERVFM
- NIGHTLIFEFM
- REMIXFM
- 80S90SFM
- MALLEPARADIES
- XMASFM
- CITYMUSICFM
- REWINDFM

## Beispielbefehle

```text
Alexa, starte Lion FM
Alexa, frage Lion FM, spiele Dance FM
Alexa, frage Lion FM, spiele Top Charts FM
Alexa, frage Lion FM, spiele Rewind FM
Alexa, frage Lion FM, welche Sender gibt es
Alexa, frage Lion FM, was läuft gerade
Alexa, frage Lion FM, was läuft auf Holly FM
Alexa, frage Lion FM, was zuletzt lief
```

## Skill in der Alexa Developer Console erstellen

1. Öffne die Alexa Developer Console:
   <https://developer.amazon.com/alexa/console/ask/>
2. Klicke auf **Create Skill**.
3. Trage als Skillnamen z. B. **LionFM** ein.
4. Wähle als Standardsprache **German (DE)**.
5. Klicke auf **Next**.
6. Wähle folgende Einstellungen:
   - **Choose a type of experience:** Music and Audio
   - **Choose a model:** Custom
   - **Hosting services:** Alexa-hosted (Node.js)
   - **Hosting region:** EU (Ireland)
7. Klicke auf **Next**.
8. Wähle **Import skill**.
9. Füge dieses Repository ein:

```text
https://github.com/LEVCORE/lionfm-alexa-skill.git
```

10. Klicke auf **Import** und warte, bis Amazon das Repository vollständig importiert hat.

## Invocation Name

Der deutsche Invocation Name ist bereits im Interaction Model auf

```text
lion fm
```

gesetzt.

Damit kann der Skill z. B. mit folgendem Befehl geöffnet werden:

```text
Alexa, starte Lion FM
```

Beim Öffnen wird automatisch der Hauptstream **LIONFM** gestartet.

## Interaction Model

Das deutsche Interaction Model befindet sich unter:

```text
interactionModels/custom/de-DE.json
```

Es enthält bereits die Intents und Slot-Werte für die verschiedenen LionFM-Streams.

Unter anderem sind folgende Funktionen vorbereitet:

- gewünschten Stream starten
- vorhandene Streams auflisten
- aktuell gespielten Titel abfragen
- zuletzt gespielten Titel abfragen
- Titelinformationen für einen bestimmten Stream abfragen

Nach dem Import in der Alexa Developer Console unter **Build** prüfen, ob **German (DE)** aktiv ist, anschließend **Save Model** und **Build Model** ausführen.

## Code

Die Multi-Stream-Logik befindet sich in:

```text
lambda/index.js
```

Die Streams sind dort bereits vorkonfiguriert. Anders als beim ursprünglichen Single-Station-Template muss **kein einzelner `stationName` mehr eingetragen werden**.

Der Standardstream ist:

```javascript
const DEFAULT_STATION = 'lionfm';
```

Die weiteren Streams befinden sich im Objekt:

```javascript
const STATIONS = { ... };
```

Der aktive Stream wird im AudioPlayer-Token gespeichert. Dadurch beziehen sich Abfragen wie **„Was läuft gerade?“** auf den aktuell gestarteten LionFM-Stream.

## Deploy

Nach Änderungen am Code:

1. Öffne in der Alexa Developer Console den Bereich **Code**.
2. Klicke auf **Save**.
3. Klicke anschließend auf **Deploy**.

## Test

1. Öffne den Bereich **Test**.
2. Stelle **Skill testing is enabled in** auf **Development**.
3. Teste zunächst:

```text
Alexa, starte Lion FM
```

Danach z. B.:

```text
Alexa, frage Lion FM, spiele Dance FM
Alexa, frage Lion FM, welche Sender gibt es
Alexa, frage Lion FM, was läuft gerade
```

Für Tests auf einem Echo oder in der Alexa-App muss dasselbe Amazon-Konto verwendet werden, mit dem der Skill in der Developer Console angelegt wurde.

## Distribution – Beispielangaben

### Public Name

```text
LionFM
```

### Example Phrases

```text
Alexa, starte Lion FM
Alexa, frage Lion FM, spiele Dance FM
Alexa, frage Lion FM, welche Sender gibt es
```

### Testing Instructions

```text
Start the default LionFM stream by saying:
"Alexa, open Lion FM"
"Alexa, start Lion FM"

Start another LionFM stream by saying, for example:
"Alexa, ask Lion FM to play Dance FM"
"Alexa, ask Lion FM to play Rewind FM"

List the available streams by saying:
"Alexa, ask Lion FM which stations are available"

Ask for the current song by saying:
"Alexa, ask Lion FM what is playing"
```

## Hinweis zu laut.fm

Die Audiostreams und Titelinformationen werden über laut.fm bereitgestellt. Für die Nutzung und Veröffentlichung des Skills gelten zusätzlich die jeweiligen Vorgaben von Amazon Alexa und laut.fm.

---

**Repository:** <https://github.com/LEVCORE/lionfm-alexa-skill>
