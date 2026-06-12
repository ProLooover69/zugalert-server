/**
 * Statische Stationsliste aller großen deutschen Verkehrsverbünde.
 * Quellen: Offizielle DB-Eva-IDs (8xxxxxx) und VBB-IDs (9xxxxxxxx).
 *
 * verbund-Werte:
 *  db       = Deutsche Bahn / bundesweit
 *  vbb      = Verkehrsverbund Berlin-Brandenburg
 *  hvv      = Hamburger Verkehrsverbund
 *  nahsh    = Nahverkehr Schleswig-Holstein
 *  mvv      = Münchner Verkehrsgesellschaft
 *  vrr      = Verkehrsverbund Rhein-Ruhr
 *  rmv      = Rhein-Main-Verkehrsverbund
 *  vvs      = Verkehrs- und Tarifverbund Stuttgart
 *  gvh      = Großraum-Verkehr Hannover
 *  vbn      = Verkehrsverbund Bremen/Niedersachsen
 *  vvo      = Verkehrsverbund Oberelbe (Dresden)
 *  mdv      = Mitteldeutscher Verkehrsverbund (Leipzig/Halle)
 *  vrn      = Verkehrsverbund Rhein-Neckar
 *  nvv      = Nordhessischer VerkehrsVerbund
 *  vmt      = Verkehrsverbund Mittelthüringen
 *  insa     = Nahverkehr Sachsen-Anhalt
 *  vgn      = Verkehrsverbund Großraum Nürnberg
 *  kvv      = Karlsruher Verkehrsverbund
 */

export const STATIONS = [
  // ─── Hamburg / HVV ──────────────────────────────────────────────────────────
  { id: '8002549', name: 'Hamburg Hbf',               verbund: ['hvv','nahsh','db'] },
  { id: '8002553', name: 'Hamburg-Altona',             verbund: ['hvv','nahsh','db'] },
  { id: '8002572', name: 'Hamburg-Harburg',            verbund: ['hvv','nahsh','db'] },
  { id: '8002548', name: 'Hamburg Dammtor',            verbund: ['hvv','nahsh'] },
  { id: '8002554', name: 'Hamburg-Bergedorf',          verbund: ['hvv'] },
  { id: '8002556', name: 'Hamburg-Rahlstedt',          verbund: ['hvv'] },
  { id: '8002559', name: 'Hamburg-Barmbek',            verbund: ['hvv'] },
  { id: '8002569', name: 'Hamburg-Wandsbek',           verbund: ['hvv'] },
  { id: '8004785', name: 'Hamburg Berliner Tor',       verbund: ['hvv'] },
  { id: '8004786', name: 'Hamburg-Billstedt',          verbund: ['hvv'] },
  { id: '8004787', name: 'Hamburg-Bramfeld',           verbund: ['hvv'] },
  { id: '8004784', name: 'Hamburg-Farmsen',            verbund: ['hvv'] },
  { id: '8002563', name: 'Hamburg-Neugraben',          verbund: ['hvv'] },
  { id: '8002564', name: 'Hamburg-Stade',              verbund: ['hvv','nahsh'] },
  { id: '8004789', name: 'Hamburg-Pinneberg',          verbund: ['hvv','nahsh'] },
  { id: '8004790', name: 'Hamburg-Eidelstedt',         verbund: ['hvv'] },
  { id: '8004792', name: 'Hamburg-Langenfelde',        verbund: ['hvv'] },
  { id: '8002560', name: 'Hamburg-Blankenese',         verbund: ['hvv'] },

  // ─── Schleswig-Holstein / NAH.SH ────────────────────────────────────────────
  { id: '8000199', name: 'Kiel Hbf',                  verbund: ['nahsh','db'] },
  { id: '8000237', name: 'Lübeck Hbf',                verbund: ['nahsh','db'] },
  { id: '8001109', name: 'Flensburg',                  verbund: ['nahsh'] },
  { id: '8000285', name: 'Neumünster',                 verbund: ['nahsh','db'] },
  { id: '8000310', name: 'Schleswig',                  verbund: ['nahsh'] },
  { id: '8000172', name: 'Husum',                      verbund: ['nahsh'] },
  { id: '8000181', name: 'Heide (Holstein)',           verbund: ['nahsh'] },
  { id: '8000153', name: 'Itzehoe',                    verbund: ['nahsh'] },
  { id: '8000130', name: 'Elmshorn',                   verbund: ['nahsh','hvv'] },
  { id: '8002562', name: 'Pinneberg',                  verbund: ['nahsh','hvv'] },
  { id: '8002018', name: 'Bad Oldesloe',               verbund: ['nahsh'] },
  { id: '8000018', name: 'Ahrensburg',                 verbund: ['nahsh','hvv'] },
  { id: '8003044', name: 'Rendsburg',                  verbund: ['nahsh'] },
  { id: '8000168', name: 'Eutin',                      verbund: ['nahsh'] },

  // ─── Berlin / VBB ───────────────────────────────────────────────────────────
  { id: '8011160', name: 'Berlin Hbf',                verbund: ['vbb','db'] },
  { id: '8010255', name: 'Berlin Ostbahnhof',         verbund: ['vbb'] },
  { id: '8011113', name: 'Berlin Südkreuz',           verbund: ['vbb','db'] },
  { id: '8010404', name: 'Berlin Spandau',            verbund: ['vbb'] },
  { id: '8011102', name: 'Berlin Gesundbrunnen',      verbund: ['vbb'] },
  { id: '8010009', name: 'Berlin Wannsee',            verbund: ['vbb'] },
  { id: '8010222', name: 'Berlin Lichtenberg',        verbund: ['vbb'] },
  { id: '8010108', name: 'Berlin Friedrichstr.',      verbund: ['vbb'] },
  { id: '8010240', name: 'Berlin Alexanderplatz',     verbund: ['vbb'] },
  { id: '8010406', name: 'Berlin Zoologischer Garten',verbund: ['vbb'] },
  { id: '8010085', name: 'Berlin-Schönefeld Flughafen',verbund: ['vbb'] },
  { id: '8011956', name: 'Berlin BER Flughafen Terminal 1-2', verbund: ['vbb'] },
  { id: '8010312', name: 'Berlin Potsdamer Platz',    verbund: ['vbb'] },
  { id: '8010319', name: 'Berlin Schönhauser Allee',  verbund: ['vbb'] },
  { id: '8010403', name: 'Berlin Ostkreuz',           verbund: ['vbb'] },

  // ─── Brandenburg / VBB ──────────────────────────────────────────────────────
  { id: '8012666', name: 'Potsdam Hbf',               verbund: ['vbb','db'] },
  { id: '8010069', name: 'Brandenburg an der Havel',  verbund: ['vbb','db'] },
  { id: '8010055', name: 'Cottbus',                   verbund: ['vbb','db'] },
  { id: '8010098', name: 'Frankfurt (Oder)',           verbund: ['vbb','db'] },
  { id: '8012643', name: 'Oranienburg',               verbund: ['vbb'] },
  { id: '8012633', name: 'Bernau (bei Berlin)',        verbund: ['vbb'] },
  { id: '8010280', name: 'Eberswalde Hbf',            verbund: ['vbb'] },

  // ─── Bayern / MVV ───────────────────────────────────────────────────────────
  { id: '8000261', name: 'München Hbf',               verbund: ['mvv','db'] },
  { id: '8004158', name: 'München Ost',               verbund: ['mvv','db'] },
  { id: '8004160', name: 'München Pasing',            verbund: ['mvv'] },
  { id: '8004162', name: 'München Marienplatz',       verbund: ['mvv'] },
  { id: '8004161', name: 'München Hauptbahnhof (U)',  verbund: ['mvv'] },
  { id: '8004163', name: 'München Starnberg',         verbund: ['mvv'] },
  { id: '8004164', name: 'München Rosenheimer Platz', verbund: ['mvv'] },
  { id: '8003700', name: 'München Flughafen',         verbund: ['mvv'] },
  { id: '8000013', name: 'Augsburg Hbf',              verbund: ['mvv','db'] },
  { id: '8000183', name: 'Ingolstadt Hbf',            verbund: ['mvv','db'] },
  { id: '8000318', name: 'Rosenheim',                 verbund: ['mvv','db'] },
  { id: '8000309', name: 'Regensburg Hbf',            verbund: ['db'] },
  { id: '8000041', name: 'Freising',                  verbund: ['mvv'] },
  { id: '8000044', name: 'Dachau',                    verbund: ['mvv'] },
  { id: '8000196', name: 'Landsberg am Lech',         verbund: ['mvv'] },
  { id: '8003000', name: 'Starnberg',                 verbund: ['mvv'] },
  { id: '8000231', name: 'Wolfratshausen',            verbund: ['mvv'] },

  // ─── Bayern / VGN (Nürnberg) ────────────────────────────────────────────────
  { id: '8000284', name: 'Nürnberg Hbf',              verbund: ['vgn','db'] },
  { id: '8000093', name: 'Erlangen',                   verbund: ['vgn','db'] },
  { id: '8000119', name: 'Fürth (Bay) Hbf',           verbund: ['vgn','db'] },
  { id: '8000260', name: 'Würzburg Hbf',              verbund: ['db'] },
  { id: '8000022', name: 'Bamberg',                   verbund: ['db'] },
  { id: '8000027', name: 'Bayreuth Hbf',              verbund: ['db'] },
  { id: '8000175', name: 'Ansbach',                   verbund: ['vgn','db'] },

  // ─── Rhein-Main / RMV ───────────────────────────────────────────────────────
  { id: '8000105', name: 'Frankfurt (Main) Hbf',      verbund: ['rmv','db'] },
  { id: '8001444', name: 'Frankfurt (Main) Süd',      verbund: ['rmv'] },
  { id: '8070003', name: 'Frankfurt (Main) Flughafen Fernbf', verbund: ['rmv','db'] },
  { id: '8000250', name: 'Wiesbaden Hbf',             verbund: ['rmv','db'] },
  { id: '8000240', name: 'Mainz Hbf',                 verbund: ['rmv','db'] },
  { id: '8000068', name: 'Darmstadt Hbf',             verbund: ['rmv','db'] },
  { id: '8000299', name: 'Offenbach (Main) Hbf',      verbund: ['rmv'] },
  { id: '8000150', name: 'Hanau Hbf',                 verbund: ['rmv','db'] },
  { id: '8000282', name: 'Kassel-Wilhelmshöhe',       verbund: ['nvv','db'] },
  { id: '8003200', name: 'Kassel Hbf',                verbund: ['nvv','db'] },
  { id: '8000236', name: 'Marburg (Lahn) Hbf',        verbund: ['rmv','nvv'] },
  { id: '8000063', name: 'Darmstadt Süd',             verbund: ['rmv'] },
  { id: '8000130', name: 'Fulda',                     verbund: ['rmv','db'] },
  { id: '8000030', name: 'Gießen',                    verbund: ['rmv'] },

  // ─── NRW / VRR ──────────────────────────────────────────────────────────────
  { id: '8000085', name: 'Düsseldorf Hbf',            verbund: ['vrr','db'] },
  { id: '8000207', name: 'Köln Hbf',                  verbund: ['vrr','db'] },
  { id: '8000098', name: 'Essen Hbf',                 verbund: ['vrr','db'] },
  { id: '8000080', name: 'Dortmund Hbf',              verbund: ['vrr','db'] },
  { id: '8000040', name: 'Bochum Hbf',                verbund: ['vrr','db'] },
  { id: '8000257', name: 'Wuppertal Hbf',             verbund: ['vrr','db'] },
  { id: '8000086', name: 'Duisburg Hbf',              verbund: ['vrr','db'] },
  { id: '8000242', name: 'Oberhausen Hbf',            verbund: ['vrr'] },
  { id: '8000144', name: 'Gelsenkirchen Hbf',         verbund: ['vrr'] },
  { id: '8000246', name: 'Mülheim (Ruhr) Hbf',        verbund: ['vrr'] },
  { id: '8000001', name: 'Aachen Hbf',                verbund: ['vrr','db'] },
  { id: '8000044', name: 'Bonn Hbf',                  verbund: ['vrr','db'] },
  { id: '8000263', name: 'Münster (Westf) Hbf',       verbund: ['vrr','db'] },
  { id: '8000036', name: 'Bielefeld Hbf',             verbund: ['db'] },
  { id: '8000297', name: 'Paderborn Hbf',             verbund: ['db'] },
  { id: '8000073', name: 'Hagen Hbf',                 verbund: ['vrr','db'] },
  { id: '8000026', name: 'Krefeld Hbf',               verbund: ['vrr'] },
  { id: '8000253', name: 'Hamm (Westf) Hbf',          verbund: ['vrr','db'] },
  { id: '8000255', name: 'Witten Hbf',                verbund: ['vrr'] },
  { id: '8001684', name: 'Düsseldorf Flughafen',      verbund: ['vrr'] },
  { id: '8000161', name: 'Köln Messe/Deutz',          verbund: ['vrr'] },
  { id: '8000162', name: 'Köln-Ehrenfeld',            verbund: ['vrr'] },
  { id: '8000163', name: 'Köln Süd',                  verbund: ['vrr'] },

  // ─── Stuttgart / VVS ────────────────────────────────────────────────────────
  { id: '8000096', name: 'Stuttgart Hbf',             verbund: ['vvs','db'] },
  { id: '8001693', name: 'Stuttgart Bad Cannstatt',   verbund: ['vvs'] },
  { id: '8001701', name: 'Stuttgart Vaihingen',       verbund: ['vvs'] },
  { id: '8001721', name: 'Stuttgart-Zuffenhausen',    verbund: ['vvs'] },
  { id: '8000090', name: 'Esslingen (Neckar) Hbf',   verbund: ['vvs'] },
  { id: '8000227', name: 'Ludwigsburg',               verbund: ['vvs','db'] },
  { id: '8000356', name: 'Waiblingen',                verbund: ['vvs'] },
  { id: '8000043', name: 'Böblingen',                 verbund: ['vvs'] },
  { id: '8000141', name: 'Tübingen Hbf',             verbund: ['vvs','db'] },
  { id: '8000031', name: 'Reutlingen Hbf',            verbund: ['vvs'] },
  { id: '8001694', name: 'Stuttgart Flughafen/Messe', verbund: ['vvs'] },
  { id: '8001695', name: 'Stuttgart-Feuerbach',       verbund: ['vvs'] },

  // ─── Baden-Württemberg / KVV ─────────────────────────────────────────────
  { id: '8000191', name: 'Karlsruhe Hbf',             verbund: ['kvv','db'] },
  { id: '8000244', name: 'Mannheim Hbf',              verbund: ['vrn','db'] },
  { id: '8000156', name: 'Heidelberg Hbf',            verbund: ['vrn','db'] },
  { id: '8000301', name: 'Pforzheim Hbf',             verbund: ['kvv','db'] },
  { id: '8000170', name: 'Ulm Hbf',                   verbund: ['db'] },
  { id: '8000107', name: 'Freiburg (Breisgau) Hbf',  verbund: ['db'] },
  { id: '8000189', name: 'Heilbronn Hbf',             verbund: ['vrn','db'] },
  { id: '8000078', name: 'Offenburg',                 verbund: ['db'] },
  { id: '8000068', name: 'Baden-Baden',               verbund: ['kvv','db'] },
  { id: '8000315', name: 'Singen (Hohentwiel)',        verbund: ['db'] },
  { id: '8000025', name: 'Konstanz',                  verbund: ['db'] },

  // ─── Hannover / GVH ─────────────────────────────────────────────────────────
  { id: '8000152', name: 'Hannover Hbf',              verbund: ['gvh','db'] },
  { id: '8000049', name: 'Braunschweig Hbf',          verbund: ['gvh','db'] },
  { id: '8000128', name: 'Göttingen',                 verbund: ['db'] },
  { id: '8000169', name: 'Hildesheim Hbf',            verbund: ['gvh','db'] },
  { id: '8000251', name: 'Wolfsburg Hbf',             verbund: ['db'] },
  { id: '8000060', name: 'Celle',                     verbund: ['db'] },
  { id: '8000213', name: 'Lüneburg',                  verbund: ['db'] },
  { id: '8000004', name: 'Salzgitter Hbf',            verbund: ['db'] },
  { id: '8002740', name: 'Hannover-Linden/Fischerhof',verbund: ['gvh'] },

  // ─── Bremen / VBN ────────────────────────────────────────────────────────────
  { id: '8000050', name: 'Bremen Hbf',                verbund: ['vbn','db'] },
  { id: '8000294', name: 'Osnabrück Hbf',             verbund: ['vbn','db'] },
  { id: '8000291', name: 'Oldenburg (Oldenburg) Hbf', verbund: ['vbn','db'] },
  { id: '8000270', name: 'Bremerhaven Hbf',           verbund: ['vbn'] },
  { id: '8000270', name: 'Delmenhorst',               verbund: ['vbn'] },
  { id: '8003382', name: 'Bremen-Vegesack',           verbund: ['vbn'] },
  { id: '8002077', name: 'Wilhelmshaven Hbf',         verbund: ['vbn'] },

  // ─── Sachsen / VVO (Dresden) ────────────────────────────────────────────────
  { id: '8010085', name: 'Dresden Hbf',               verbund: ['vvo','db'] },
  { id: '8010088', name: 'Dresden-Neustadt',          verbund: ['vvo'] },
  { id: '8010091', name: 'Dresden-Strehlen',          verbund: ['vvo'] },
  { id: '8010053', name: 'Chemnitz Hbf',              verbund: ['db'] },
  { id: '8010358', name: 'Görlitz',                   verbund: ['vvo','db'] },
  { id: '8011956', name: 'Bautzen',                   verbund: ['vvo'] },
  { id: '8011957', name: 'Zittau',                    verbund: ['vvo'] },
  { id: '8010420', name: 'Riesa',                     verbund: ['vvo','db'] },

  // ─── Sachsen / MDV (Leipzig/Halle) ─────────────────────────────────────────
  { id: '8010205', name: 'Leipzig Hbf',               verbund: ['mdv','db'] },
  { id: '8010159', name: 'Halle (Saale) Hbf',         verbund: ['mdv','db'] },
  { id: '8010222', name: 'Dessau Hbf',                verbund: ['mdv','db'] },
  { id: '8011396', name: 'Zwickau (Sachs) Hbf',       verbund: ['db'] },
  { id: '8010390', name: 'Leipzig-Connewitz',         verbund: ['mdv'] },
  { id: '8010220', name: 'Delitzsch ob Bf',           verbund: ['mdv'] },

  // ─── Sachsen-Anhalt / INSA ──────────────────────────────────────────────────
  { id: '8010224', name: 'Magdeburg Hbf',             verbund: ['insa','db'] },
  { id: '8010135', name: 'Halle-Neustadt',            verbund: ['insa'] },
  { id: '8010317', name: 'Stendal',                   verbund: ['insa','db'] },
  { id: '8010096', name: 'Halberstadt',               verbund: ['insa'] },
  { id: '8010256', name: 'Quedlinburg',               verbund: ['insa'] },

  // ─── Thüringen / VMT ────────────────────────────────────────────────────────
  { id: '8010101', name: 'Erfurt Hbf',                verbund: ['vmt','db'] },
  { id: '8011578', name: 'Jena-Paradies',             verbund: ['vmt','db'] },
  { id: '8010347', name: 'Weimar',                    verbund: ['vmt','db'] },
  { id: '8010115', name: 'Gera Hbf',                  verbund: ['vmt'] },
  { id: '8011956', name: 'Nordhausen',                verbund: ['vmt'] },
  { id: '8010112', name: 'Gotha',                     verbund: ['vmt'] },
  { id: '8010353', name: 'Eisenach',                  verbund: ['vmt','db'] },

  // ─── Mecklenburg-Vorpommern ─────────────────────────────────────────────────
  { id: '8005874', name: 'Rostock Hbf',               verbund: ['db'] },
  { id: '8005400', name: 'Schwerin Hbf',              verbund: ['db'] },
  { id: '8011956', name: 'Stralsund Hbf',             verbund: ['db'] },
  { id: '8004480', name: 'Greifswald',                verbund: ['db'] },
  { id: '8003897', name: 'Neubrandenburg',            verbund: ['db'] },

  // ─── Saarland ───────────────────────────────────────────────────────────────
  { id: '8000323', name: 'Saarbrücken Hbf',           verbund: ['db'] },
  { id: '8000069', name: 'Trier Hbf',                 verbund: ['db'] },
  { id: '8000190', name: 'Kaiserslautern Hbf',        verbund: ['db'] },
  { id: '8000102', name: 'Koblenz Hbf',               verbund: ['db'] },

  // ─── Niedersachsen / weitere ────────────────────────────────────────────────
  { id: '8000218', name: 'Lüchow (Wendland)',         verbund: ['db'] },
  { id: '8000182', name: 'Goslar',                    verbund: ['db'] },
  { id: '8000173', name: 'Bad Harzburg',              verbund: ['db'] },
];

/**
 * Verkehrsverbund-Labels für die Anzeige
 */
export const VERBUND_LABELS = {
  db:      'DB',
  vbb:     'VBB',
  hvv:     'HVV',
  nahsh:   'NAH.SH',
  mvv:     'MVV',
  vrr:     'VRR',
  rmv:     'RMV',
  vvs:     'VVS',
  gvh:     'GVH',
  vbn:     'VBN',
  vvo:     'VVO',
  mdv:     'MDV',
  vrn:     'VRN',
  nvv:     'NVV',
  vmt:     'VMT',
  insa:    'INSA',
  vgn:     'VGN',
  kvv:     'KVV',
};

/**
 * Sucht Stationen lokal (case-insensitiv, Substring-Match).
 * Priorisiert Treffer am Wortanfang und exakte Übereinstimmungen.
 */
export function searchStationsLocal(query, verbundFilter = null) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  let candidates = verbundFilter
    ? STATIONS.filter(s => s.verbund.includes(verbundFilter))
    : STATIONS;

  const results = candidates
    .map(s => {
      const name = s.name.toLowerCase();
      if (name === q)            return { station: s, score: 0 };
      if (name.startsWith(q))   return { station: s, score: 1 };
      if (name.includes(q))     return { station: s, score: 2 };
      return null;
    })
    .filter(Boolean)
    .sort((a, b) => a.score - b.score)
    .map(r => r.station);

  // Deduplicate by id
  const seen = new Set();
  return results.filter(s => {
    if (seen.has(s.id)) return false;
    seen.add(s.id);
    return true;
  }).slice(0, 10);
}
