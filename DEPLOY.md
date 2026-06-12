# Deployment – ZugAlert (0 €)

**Gewählt:** alles auf **Vercel** in **einem** Projekt – Frontend statisch + Backend als
Serverless-Function. Gleiche Domain → `/api` relativ, kein CORS, keine zweite URL.
Nutzer/Accounts laufen später über Firebase (noch nicht verdrahtet).

```
Browser ──► Vercel  (ein Projekt)
              ├─ /            client/dist  (statisch)
              └─ /api/*,/health  api/index.js → src/server.js  (Serverless)
                                     │ db-vendo-client direkt (Fallback db-rest)
                                     ▼
                               Deutsche Bahn / transport.rest
```

Relevante Dateien:
- `vercel.json` – baut `client/` statisch **und** `api/index.js` als Node-Function; routet `/api/*` + `/health` dorthin.
- `api/index.js` – exportiert die Express-App aus `src/server.js` (kein `listen` dank Guard).
- Frontend nutzt `VITE_API_URL || '/api'` → **ohne** gesetzte Env-Var automatisch same-origin `/api`.

## Deploy

Über die Vercel-Integration (von Claude gesteuert) oder manuell:
1. [vercel.com](https://vercel.com) → **Add New… → Project** → Repo `ProLooover69/zugalert-server`.
2. **Root Directory = Repo-Wurzel** (nicht `client/`), `vercel.json` übernimmt den Rest.
3. **Wichtig – Environment Variables:** `VITE_API_URL` **leer lassen / nicht setzen**
   (sonst zeigt das Frontend nicht auf die mitdeployte Function). Falls eine alte
   `VITE_API_URL` (z. B. Railway) im Projekt steht → **entfernen**.
4. Deploy → URL z. B. `https://zugalert.vercel.app`.

### Nach dem Deploy testen
```bash
curl https://<deine-app>.vercel.app/health
curl "https://<deine-app>.vercel.app/api/trains/search?query=Hamburg"       # geht von Cloud-IPs immer
curl "https://<deine-app>.vercel.app/api/trains/departures?station=8002549"  # 403-Test (siehe unten)
```

## Bekannte offene Punkte
- **Cloud-IP-403:** `journeys`/`departures` gehen lokal direkt über `db-vendo-client`. Vom Vercel-Host
  (Cloud-IP) kann die Bahn das mit 403 blocken → dann greift der db-rest-Fallback (zeitweise 503).
  Der Test in Schritt „Nach dem Deploy" zeigt, was zutrifft. Search geht von Cloud-IPs ohnehin.
- **Community-Chat** ruft `/api/chat` – Endpoint existiert nicht (Backend ist auth-/chat-frei). Kommt mit Firebase.

---

## Alternative: Backend auf Render (statt Serverless)

Falls der Cloud-IP-403 zuschlägt und du eine andere Host-IP testen willst: `render.yaml` liegt bei.
Render (free) als Web-Service, Frontend separat auf Vercel mit `VITE_API_URL=https://<app>.onrender.com/api`.
Nachteil: 2 Dienste, CORS-Setup, Cold-Start (~50 s) nach Inaktivität.
