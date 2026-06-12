# Deployment – ZugAlert (0 €)

Architektur: **Backend** (Bahn-Daten-Proxy, Express) auf **Render** · **Frontend** (React/Vite) auf **Vercel**.
Nutzer/Accounts laufen später über Firebase (noch nicht verdrahtet).

```
Browser ──► Vercel (client/dist, statisch)
                │  fetch VITE_API_URL
                ▼
        Render (Express: /api/trains/*, /api/disruptions/*, /health)
                │ db-vendo-client direkt  (Fallback: db-rest)
                ▼
          Deutsche Bahn / transport.rest
```

---

## 1. Backend → Render (free)

1. [render.com](https://render.com) → mit GitHub einloggen.
2. **New +** → **Blueprint** → Repo `ProLooover69/zugalert-server` wählen. Render liest `render.yaml`
   (Web Service `zugalert-backend`, Build `npm install`, Start `npm start`, Healthcheck `/health`, Plan free).
   - Alternativ manuell: **New + → Web Service**, Root = Repo-Wurzel, Build `npm install`, Start `npm start`.
3. Deploy abwarten → URL notieren, z. B. `https://zugalert-backend.onrender.com`.
4. **Testen** (wichtig wegen Cloud-IP-403, siehe unten):
   ```bash
   curl https://zugalert-backend.onrender.com/health
   curl "https://zugalert-backend.onrender.com/api/trains/search?query=Hamburg"      # geht von Cloud-IPs immer
   curl "https://zugalert-backend.onrender.com/api/trains/departures?station=8002549" # 403-Test
   ```
   - `departures`/`connections` `success` → super, `db-vendo-client` direkt geht auch vom Render-Host.
   - `502 db-rest nicht erreichbar` → die Bahn blockt die Render-IP für journeys/departures (403),
     es greift nur der db-rest-Fallback. Dann mehrere `DB_REST_URLS` als Fallback setzen (siehe `render.yaml`).

> **Hinweis Free-Plan:** Der Dienst schläft nach ~15 Min Inaktivität → der erste Aufruf danach dauert ~50 s.
> Das Frontend zeigt solange seinen Ladespinner.

## 2. Frontend → Vercel (free)

1. [vercel.com](https://vercel.com) → mit GitHub einloggen → **Add New… → Project** → dasselbe Repo.
2. **Root Directory** auf **`client`** setzen (wichtig – sonst baut Vercel das Backend).
   Framework wird als **Vite** erkannt (Build `npm run build`, Output `dist`).
3. **Environment Variables**:
   - `VITE_API_URL` = `https://zugalert-backend.onrender.com/api`  (deine Render-URL + `/api`)
   - die `VITE_FIREBASE_*`-Werte aus `client/.env` (für später; schaden jetzt nicht).
4. **Deploy** → URL z. B. `https://zugalert.vercel.app`.

## 3. Feinschliff (optional)

- **CORS einschränken:** in Render `CORS_ORIGIN=https://zugalert.vercel.app` setzen (Standard ist offen – für
  öffentliche Read-only-Daten ok).
- **Custom Domain:** in Vercel unter *Settings → Domains*.

---

## Bekannte offene Punkte

- **Community-Chat** ruft `/api/chat` – dieser Endpoint existiert nicht (Backend ist auth-/chat-frei).
  Kommt mit der Firebase-Stufe (Firestore-Realtime).
- **Cloud-IP-403:** journeys/departures gehen lokal direkt; ob das auch vom Render-Host geht, zeigt der Test in Schritt 1.4.
