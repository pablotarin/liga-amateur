import pandas as pd
import random
from datetime import date, timedelta

random.seed(42)

# ---------------------------------------------------------------------------
# 1. EQUIPOS (Teams)
# ---------------------------------------------------------------------------
ciudades = ["Gandia", "Valencia", "Alicante", "Castellon", "Sagunto", "Xativa",
            "Denia", "Elche", "Cullera", "Ontinyent", "Requena", "Paterna"]
nombres_base = ["Atletico", "Deportivo", "Union", "Real", "CF", "CD", "SC", "Racing"]
apodos = ["Halcones", "Leones", "Tiburones", "Aguilas", "Toros", "Lobos",
          "Panteras", "Dragones", "Titanes", "Centauros", "Vikingos", "Cobras"]

teams = []
for i in range(12):
    tid = f"T{i+1:03d}"
    ciudad = ciudades[i]
    nombre = f"{random.choice(nombres_base)} {apodos[i]}"
    teams.append({
        "teamId": tid,
        "name": nombre,
        "city": ciudad,
        "foundedYear": random.randint(1955, 2015),
        "stadium": f"Campo Municipal de {ciudad}",
        "colorPrimary": random.choice(["#1E3A8A", "#B91C1C", "#065F46", "#78350F", "#4C1D95", "#0F172A"]),
        "colorSecondary": "#FFFFFF",
        "coachName": None,  # se completa tras generar usuarios manager
    })

df_teams = pd.DataFrame(teams)

# ---------------------------------------------------------------------------
# 2. USUARIOS (Users) - admin, managers (1 por equipo), players opcionales
# ---------------------------------------------------------------------------
nombres_pila = ["Marc", "Laura", "Pau", "Nuria", "Alex", "Sara", "Jordi", "Elena",
                 "Victor", "Carla", "Dani", "Marina", "Sergio", "Irene", "Toni",
                 "Paula", "Hugo", "Clara", "Adria", "Julia"]
apellidos = ["Garcia", "Martinez", "Lopez", "Sanchez", "Perez", "Gomez", "Ruiz",
             "Diaz", "Moreno", "Alvarez", "Romero", "Navarro", "Torres", "Domingo"]

users = []
users.append({
    "userId": "U0001", "name": "Admin Liga", "email": "admin@ligaamateur.com",
    "password": "Admin123!", "role": "admin", "teamId": ""
})

for idx, t in enumerate(teams):
    n = random.choice(nombres_pila)
    a = random.choice(apellidos)
    email = f"{n.lower()}.{a.lower()}{idx}@ligaamateur.com"
    users.append({
        "userId": f"U{idx+2:04d}", "name": f"{n} {a}", "email": email,
        "password": "Manager123!", "role": "manager", "teamId": t["teamId"]
    })
    df_teams.loc[df_teams.teamId == t["teamId"], "coachName"] = f"{n} {a}"

df_users = pd.DataFrame(users)

# ---------------------------------------------------------------------------
# 3. JUGADORES (Players) - relacionados con Teams por teamId
# ---------------------------------------------------------------------------
posiciones = ["Portero", "Defensa", "Centrocampista", "Delantero"]
pos_weights = [1, 4, 4, 2]  # jugadores por posicion tipica por plantilla (aprox)
nacionalidades = ["España", "Argentina", "Marruecos", "Colombia", "Brasil",
                   "Francia", "Rumania", "Portugal", "Italia", "Uruguay"]

players = []
pid = 1
for t in teams:
    dorsales = random.sample(range(1, 26), 10)  # 10 jugadores por equipo -> 120 total
    for d in dorsales:
        pos = random.choices(posiciones, weights=pos_weights, k=1)[0]
        birth_year = random.randint(1993, 2006)
        n = random.choice(nombres_pila)
        a = random.choice(apellidos)
        players.append({
            "playerId": f"P{pid:04d}",
            "name": f"{n} {a}",
            "teamId": t["teamId"],
            "position": pos,
            "dorsal": d,
            "birthdate": date(birth_year, random.randint(1, 12), random.randint(1, 28)).isoformat(),
            "nationality": random.choice(nacionalidades),
            "goals": random.randint(0, 18) if pos in ("Delantero", "Centrocampista") else random.randint(0, 4),
            "assists": random.randint(0, 12),
            "yellowCards": random.randint(0, 8),
            "redCards": random.randint(0, 2),
        })
        pid += 1

df_players = pd.DataFrame(players)

# ---------------------------------------------------------------------------
# 4. PARTIDOS (Matches) - relacionados con Teams (homeTeamId / awayTeamId)
#    Liga round-robin simple: cada equipo juega contra todos una vez (11 jornadas)
# ---------------------------------------------------------------------------
team_ids = [t["teamId"] for t in teams]
random.shuffle(team_ids)

# Round robin scheduling (circle method)
n = len(team_ids)
rounds = []
ids = team_ids[:]
for r in range(n - 1):
    pairs = []
    for i in range(n // 2):
        home = ids[i]
        away = ids[n - 1 - i]
        if r % 2 == 1:
            home, away = away, home
        pairs.append((home, away))
    rounds.append(pairs)
    ids = [ids[0]] + [ids[-1]] + ids[1:-1]

start_date = date(2026, 2, 1)
matches = []
mid = 1
for jornada, pairs in enumerate(rounds, start=1):
    match_date = start_date + timedelta(days=7 * (jornada - 1))
    for home, away in pairs:
        played = jornada <= 8  # primeras 8 jornadas ya jugadas, resto programadas
        status = "jugado" if played else "programado"
        home_score = random.randint(0, 4) if played else None
        away_score = random.randint(0, 4) if played else None
        home_city = next(t["city"] for t in teams if t["teamId"] == home)
        matches.append({
            "matchId": f"M{mid:04d}",
            "jornada": jornada,
            "date": match_date.isoformat(),
            "homeTeamId": home,
            "awayTeamId": away,
            "venue": f"Campo Municipal de {home_city}",
            "homeScore": home_score,
            "awayScore": away_score,
            "status": status,
        })
        mid += 1

df_matches = pd.DataFrame(matches)

# ---------------------------------------------------------------------------
# Guardar Excel (multi-hoja) + CSVs individuales
# ---------------------------------------------------------------------------
excel_path = "/home/claude/liga-amateur/database/LigaAmateur_Datos.xlsx"
with pd.ExcelWriter(excel_path, engine="openpyxl") as writer:
    df_teams.to_excel(writer, sheet_name="teams", index=False)
    df_players.to_excel(writer, sheet_name="players", index=False)
    df_matches.to_excel(writer, sheet_name="matches", index=False)
    df_users.to_excel(writer, sheet_name="users", index=False)

df_teams.to_csv("/home/claude/liga-amateur/database/csv/teams.csv", index=False)
df_players.to_csv("/home/claude/liga-amateur/database/csv/players.csv", index=False)
df_matches.to_csv("/home/claude/liga-amateur/database/csv/matches.csv", index=False)
df_users.to_csv("/home/claude/liga-amateur/database/csv/users.csv", index=False)

print("teams:", len(df_teams))
print("players:", len(df_players))
print("matches:", len(df_matches))
print("users:", len(df_users))
print("TOTAL rows:", len(df_teams) + len(df_players) + len(df_matches) + len(df_users))
