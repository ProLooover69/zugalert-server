# 🚂 ZugAlert Server – API-Dokumentation

Backend-Server für die ZugAlert-App. Liefert Echtzeit-Informationen zu Bahnhöfen, Verbindungen und Störungen über die Deutsche Bahn HAFAS-Schnittstelle.

## Inhaltsverzeichnis

- [Schnellstart](#schnellstart)
- [Bahnhofs-IDs](#bahnhofs-ids)
- [API-Endpoints](#api-endpoints)
  - [Health Check](#1-health-check)
  - [Bahnhof suchen](#2-bahnhof-suchen)
  - [Verbindungen abrufen](#3-verbindungen-abrufen)
  - [Störungen abrufen](#4-störungen-abrufen)
- [Fehlerbehandlung](#fehlerbehandlung)
- [Tech-Stack](#tech-stack)

---

## Schnellstart

```bash
# Dependencies installieren
npm install

# Server starten
node src/server.js
```

Der Server läuft standardmäßig auf **`http://localhost:3001`**.  
Der Port kann über die Umgebungsvariable `PORT` in der `.env`-Datei konfiguriert werden.

---

## Bahnhofs-IDs

Die API nutzt HAFAS-Stations-IDs (EVA-Nummern) zur Identifikation von Bahnhöfen.

| Bahnhof          | Stations-ID |
| ---------------- | ----------- |
| Uelzen            | `8000152`   |
| Hamburg Hbf       | `8002549`   |
| Hamburg-Harburg   | `8002550`   |
| Lüneburg          | `8000156`   |
| Berlin Hbf        | `8011160`   |

> 💡 Weitere Stations-IDs können über den [Search-Endpoint](#2-bahnhof-suchen) ermittelt werden.

---

## API-Endpoints

### 1. Health Check

Prüft, ob der Server erreichbar ist und korrekt läuft.

| Eigenschaft | Wert                          |
| ----------- | ----------------------------- |
| **URL**     | `/health`                     |
| **Methode** | `GET`                         |
| **Auth**    | Keine                         |
| **Cache**   | Kein Caching                  |

#### Beispiel-Request

```bash
curl http://localhost:3001/health
```

#### Beispiel-Response

```json
{
  "status": "ok",
  "timestamp": "2026-05-28T06:17:28.295Z"
}
```

| Feld        | Typ      | Beschreibung                          |
| ----------- | -------- | ------------------------------------- |
| `status`    | `string` | Serverstatus – immer `"ok"`           |
| `timestamp` | `string` | Aktueller Zeitstempel (ISO 8601)      |

---

### 2. Bahnhof suchen

Sucht Bahnhöfe anhand eines Suchbegriffs. Ergebnisse werden 5 Minuten gecacht.

| Eigenschaft | Wert                          |
| ----------- | ----------------------------- |
| **URL**     | `/api/trains/search`          |
| **Methode** | `GET`                         |
| **Auth**    | Keine                         |
| **Cache**   | 5 Minuten (300s)              |

#### Query-Parameter

| Parameter | Typ      | Pflicht | Beschreibung                    |
| --------- | -------- | ------- | ------------------------------- |
| `query`   | `string` | ✅ Ja   | Suchbegriff (Bahnhofsname)      |

#### Beispiel-Request

```bash
curl "http://localhost:3001/api/trains/search?query=Hamburg"
```

#### Beispiel-Response

```json
{
  "success": true,
  "query": "Hamburg",
  "count": 3,
  "data": [
    {
      "id": "8002549",
      "name": "Hamburg Hbf",
      "latitude": 53.552407,
      "longitude": 10.006911
    },
    {
      "id": "8002550",
      "name": "Hamburg-Harburg",
      "latitude": 53.462222,
      "longitude": 9.975278
    },
    {
      "id": "8002557",
      "name": "Hamburg-Altona",
      "latitude": 53.548333,
      "longitude": 9.936111
    }
  ]
}
```

| Feld              | Typ       | Beschreibung                            |
| ----------------- | --------- | --------------------------------------- |
| `success`         | `boolean` | `true` bei Erfolg                       |
| `query`           | `string`  | Der verwendete Suchbegriff              |
| `count`           | `number`  | Anzahl der gefundenen Stationen         |
| `data[].id`       | `string`  | EVA-Stations-ID                         |
| `data[].name`     | `string`  | Name des Bahnhofs                       |
| `data[].latitude` | `number`  | Breitengrad                             |
| `data[].longitude`| `number`  | Längengrad                              |

#### Fehlerfall – fehlender Parameter

```bash
curl "http://localhost:3001/api/trains/search"
```

```json
{
  "error": "Query parameter required"
}
```
**HTTP-Status:** `400 Bad Request`

---

### 3. Verbindungen abrufen

Ruft Zugverbindungen zwischen zwei Bahnhöfen ab. Ergebnisse werden 5 Minuten gecacht.

| Eigenschaft | Wert                              |
| ----------- | --------------------------------- |
| **URL**     | `/api/trains/connections`         |
| **Methode** | `GET`                             |
| **Auth**    | Keine                             |
| **Cache**   | 5 Minuten (300s)                  |

#### Query-Parameter

| Parameter | Typ      | Pflicht | Beschreibung                                    |
| --------- | -------- | ------- | ----------------------------------------------- |
| `from`    | `string` | ✅ Ja   | Stations-ID des Startbahnhofs                   |
| `to`      | `string` | ✅ Ja   | Stations-ID des Zielbahnhofs                    |
| `date`    | `string` | ❌ Nein | Abfahrtsdatum (ISO 8601). Standard: jetzt       |

#### Beispiel-Requests

```bash
# Verbindungen von Uelzen nach Hamburg Hbf (ab jetzt)
curl "http://localhost:3001/api/trains/connections?from=8000152&to=8002549"

# Verbindungen mit bestimmtem Datum
curl "http://localhost:3001/api/trains/connections?from=8000152&to=8002549&date=2026-06-01T08:00:00"
```

#### Beispiel-Response

```json
{
  "success": true,
  "from": "8000152",
  "to": "8002549",
  "count": 2,
  "data": [
    {
      "id": "1",
      "from": "8000152",
      "to": "8002549",
      "departure": "2026-05-28T06:47:44.745Z",
      "arrival": "2026-05-28T07:47:44.745Z",
      "delay": 0,
      "cancelled": false,
      "line": "RE 3",
      "platform": "4"
    },
    {
      "id": "2",
      "from": "8000152",
      "to": "8002549",
      "departure": "2026-05-28T07:17:44.745Z",
      "arrival": "2026-05-28T08:17:44.745Z",
      "delay": 15,
      "cancelled": false,
      "line": "RE 10",
      "platform": "2"
    }
  ]
}
```

| Feld               | Typ       | Beschreibung                                   |
| ------------------ | --------- | ---------------------------------------------- |
| `success`          | `boolean` | `true` bei Erfolg                              |
| `from`             | `string`  | Stations-ID des Startbahnhofs                  |
| `to`               | `string`  | Stations-ID des Zielbahnhofs                   |
| `count`            | `number`  | Anzahl der gefundenen Verbindungen             |
| `data[].id`        | `string`  | Verbindungs-ID                                 |
| `data[].from`      | `string`  | Start-Stations-ID                              |
| `data[].to`        | `string`  | Ziel-Stations-ID                               |
| `data[].departure` | `string`  | Abfahrtszeit (ISO 8601)                        |
| `data[].arrival`   | `string`  | Ankunftszeit (ISO 8601)                        |
| `data[].delay`     | `number`  | Verspätung in Minuten (`0` = pünktlich)        |
| `data[].cancelled` | `boolean` | `true` wenn die Verbindung ausfällt            |
| `data[].line`      | `string`  | Zuglinie (z.B. `"RE 3"`, `"ICE 1507"`)        |
| `data[].platform`  | `string`  | Gleis / Bahnsteig                              |

#### Fehlerfall – fehlende Parameter

```bash
curl "http://localhost:3001/api/trains/connections?from=8000152"
```

```json
{
  "error": "from and to parameters required"
}
```
**HTTP-Status:** `400 Bad Request`

---

### 4. Störungen abrufen

Ruft aktuelle Störungen und Verspätungen für einen bestimmten Bahnhof ab. Ergebnisse werden 1 Minute gecacht (häufigere Updates für aktuelle Störungsinformationen).

| Eigenschaft | Wert                                      |
| ----------- | ----------------------------------------- |
| **URL**     | `/api/trains/disruptions/:stationId`      |
| **Methode** | `GET`                                     |
| **Auth**    | Keine                                     |
| **Cache**   | 1 Minute (60s)                            |

#### URL-Parameter

| Parameter   | Typ      | Pflicht | Beschreibung               |
| ----------- | -------- | ------- | -------------------------- |
| `stationId` | `string` | ✅ Ja   | EVA-Stations-ID            |

#### Beispiel-Request

```bash
curl "http://localhost:3001/api/trains/disruptions/8002549"
```

#### Beispiel-Response

```json
{
  "success": true,
  "stationId": "8002549",
  "count": 2,
  "data": [
    {
      "id": "1",
      "line": "RE 3",
      "direction": "Hamburg-Harburg",
      "departure": "2026-05-28T06:17:48.851Z",
      "delay": 25,
      "cancelled": false,
      "reason": "Signalstörung bei Lüneburg"
    },
    {
      "id": "2",
      "line": "RE 10",
      "direction": "Uelzen",
      "departure": "2026-05-28T07:17:48.851Z",
      "delay": 0,
      "cancelled": true,
      "reason": "Personalmangel"
    }
  ]
}
```

| Feld               | Typ       | Beschreibung                                        |
| ------------------ | --------- | --------------------------------------------------- |
| `success`          | `boolean` | `true` bei Erfolg                                   |
| `stationId`        | `string`  | Die angefragte Stations-ID                          |
| `count`            | `number`  | Anzahl der aktuellen Störungen                      |
| `data[].id`        | `string`  | Störungs-ID                                         |
| `data[].line`      | `string`  | Betroffene Zuglinie                                 |
| `data[].direction` | `string`  | Fahrtrichtung                                       |
| `data[].departure` | `string`  | Geplante Abfahrt (ISO 8601)                         |
| `data[].delay`     | `number`  | Verspätung in Minuten                               |
| `data[].cancelled` | `boolean` | `true` wenn der Zug ausfällt                        |
| `data[].reason`    | `string`  | Grund der Störung (z.B. `"Signalstörung"`)          |

---

## Fehlerbehandlung

Alle Endpoints geben bei Fehlern ein einheitliches JSON-Format zurück:

| HTTP-Status | Bedeutung                     | Beispiel                                     |
| ----------- | ----------------------------- | -------------------------------------------- |
| `400`       | Fehlende/ungültige Parameter  | `{ "error": "Query parameter required" }`    |
| `404`       | Endpoint nicht gefunden       | `{ "error": "Endpoint not found" }`          |
| `500`       | Interner Serverfehler         | `{ "error": "Internal Server Error" }`       |

---

## Tech-Stack

| Technologie        | Version  | Zweck                                 |
| ------------------ | -------- | ------------------------------------- |
| **Express**        | 5.x      | HTTP-Framework                        |
| **hafas-client**   | 6.x      | Deutsche Bahn HAFAS-Anbindung         |
| **Redis**          | 5.x      | Caching                              |
| **Helmet**         | 8.x      | HTTP-Security-Header                  |
| **CORS**           | 2.x      | Cross-Origin Resource Sharing         |
| **dotenv**         | 17.x     | Umgebungsvariablen                    |
| **Mongoose**       | 9.x      | MongoDB-Anbindung                     |
| **node-cron**      | 4.x      | Geplante Aufgaben                     |

---

> **Hinweis:** Alle Zeitangaben in API-Responses sind im ISO 8601 Format (UTC).  
> **Caching:** Stationssuche & Verbindungen werden 5 Min. gecacht, Störungen nur 1 Min. für aktuellere Daten.
