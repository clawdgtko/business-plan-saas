// Filler Tracker - Version avec intégration TMDB API
// Multilangue (FR/EN) avec guides filler et données réelles

const SHOWS_DB = {
  'stargate-sg1': {
    tmdbId: 4629,
    guides: {
      fr: {
        s1: [
          { ep: 1, type: "must-watch", note: "Pilote - Introduction complète" },
          { ep: 2, type: "optional", note: "Kawalsky possédé" },
          { ep: 3, type: "skip", note: "Épisode très faible" },
          { ep: 4, type: "important", note: "Introduction du Dr Fraiser" },
          { ep: 5, type: "optional", note: "Filler planète" },
          { ep: 6, type: "important", note: "Passé familial Jack" },
          { ep: 7, type: "optional", note: "Race ancienne" },
          { ep: 8, type: "must-watch", note: "Excellente histoire" },
          { ep: 9, type: "important", note: "Première mention Thor" },
          { ep: 10, type: "optional", note: "Intéressant" },
          { ep: 11, type: "important", note: "Teal'c famille" },
          { ep: 12, type: "optional", note: "Daniel capturé" },
          { ep: 13, type: "skip", note: "Le pire épisode" },
          { ep: 14, type: "must-watch", note: "Cassandra - arc important" },
          { ep: 15, type: "optional", note: "Procès Teal'c" },
          { ep: 16, type: "optional", note: "Les Tollans" },
          { ep: 17, type: "must-watch", note: "Jack & Carter Antarctique" },
          { ep: 18, type: "important", note: "Équipe dupliquée" },
          { ep: 19, type: "must-watch", note: "Réalité alternative" },
          { ep: 20, type: "skip", note: "Clip show" },
          { ep: 21, type: "must-watch", note: "Finale saison 1" }
        ]
      },
      en: {
        s1: [
          { ep: 1, type: "must-watch", note: "Pilot - Complete introduction" },
          { ep: 21, type: "must-watch", note: "Season 1 finale" }
        ]
      }
    }
  },
  'stargate-atlantis': {
    tmdbId: 2290,
    guides: {
      fr: {
        s1: [
          { ep: 1, type: "must-watch", note: "Rising (Partie 1) - Découverte d'Atlantis" },
          { ep: 2, type: "must-watch", note: "Rising (Partie 2) - L'équipe piégée" },
          { ep: 3, type: "important", note: "Hide and Seek - Premiers pas sur Atlantis" },
          { ep: 4, type: "optional", note: "Thirty-Eight Minutes" },
          { ep: 5, type: "important", note: "Suspicion - Qui espionne ?" },
          { ep: 6, type: "must-watch", note: "Childhood's End - Société de jeunes" },
          { ep: 7, type: "optional", note: "Poisoning the Well - Wraith découvert" },
          { ep: 8, type: "optional", note: "Underground - Alliance Genii" },
          { ep: 9, type: "optional", note: "Home - Illusions sur Terre" },
          { ep: 10, type: "important", note: "The Storm - Tempête menace Atlantis" },
          { ep: 11, type: "must-watch", note: "The Eye - Attaque Genii" },
          { ep: 12, type: "optional", note: "The Defiant One - Wraith solitaire" },
          { ep: 13, type: "optional", note: "Hot Zone - Virus mortel" },
          { ep: 14, type: "important", note: "Sanctuary - Ascension possible" },
          { ep: 15, type: "optional", note: "Before I Sleep - Ancienne Elizabeth" },
          { ep: 16, type: "optional", note: "The Brotherhood - Clé ZPM" },
          { ep: 17, type: "important", note: "Letters from Pegasus - Message vers Terre" },
          { ep: 18, type: "skip", note: "The Gift - Exposition Wraith" },
          { ep: 19, type: "important", note: "The Siege (Partie 1) - Wraith arrivent" },
          { ep: 20, type: "must-watch", note: "The Siege (Partie 2) - Bataille finale" }
        ]
      }
    }
  },
  'breaking-bad': {
    tmdbId: 1396,
    guides: {
      fr: {
        s1: [
          { ep: 1, type: "must-watch", note: "Pilot - Le début de tout" },
          { ep: 2, type: "must-watch", note: "Cat's in the Bag..." },
          { ep: 3, type: "must-watch", note: "...And the Bag's in the River" },
          { ep: 4, type: "important", note: "Cancer Man" },
          { ep: 5, type: "must-watch", note: "Gray Matter" },
          { ep: 6, type: "must-watch", note: "Crazy Handful of Nothin'" },
          { ep: 7, type: "must-watch", note: "A No-Rough-Stuff-Type Deal" }
        ],
        s2: [
          { ep: 1, type: "must-watch", note: "Seven Thirty-Seven" },
          { ep: 2, type: "must-watch", note: "Grilled" },
          { ep: 3, type: "must-watch", note: "Bit by a Dead Bee" },
          { ep: 4, type: "must-watch", note: "Down" },
          { ep: 5, type: "important", note: "Breakage" },
          { ep: 6, type: "must-watch", note: "Peekaboo" },
          { ep: 7, type: "important", note: "Negro y Azul" },
          { ep: 8, type: "must-watch", note: "Better Call Saul" },
          { ep: 9, type: "important", note: "4 Days Out" },
          { ep: 10, type: "must-watch", note: "Over" },
          { ep: 11, type: "must-watch", note: "Mandala" },
          { ep: 12, type: "must-watch", note: "Phoenix" },
          { ep: 13, type: "must-watch", note: "ABQ" }
        ],
        s3: [
          { ep: 1, type: "must-watch", note: "No Más" },
          { ep: 2, type: "must-watch", note: "Caballo Sin Nombre" },
          { ep: 3, type: "must-watch", note: "IFT" },
          { ep: 4, type: "must-watch", note: "Green Light" },
          { ep: 5, type: "must-watch", note: "Más" },
          { ep: 6, type: "must-watch", note: "Sunset" },
          { ep: 7, type: "must-watch", note: "One Minute" },
          { ep: 8, type: "must-watch", note: "I See You" },
          { ep: 9, type: "must-watch", note: "Kafkaesque" },
          { ep: 10, type: "must-watch", note: "Fly" },
          { ep: 11, type: "must-watch", note: "Abiquiu" },
          { ep: 12, type: "must-watch", note: "Half Measures" },
          { ep: 13, type: "must-watch", note: "Full Measure" }
        ],
        s4: [
          { ep: 1, type: "must-watch", note: "Box Cutter" },
          { ep: 2, type: "must-watch", note: "Thirty-Eight Snub" },
          { ep: 3, type: "must-watch", note: "Open House" },
          { ep: 4, type: "must-watch", note: "Bullet Points" },
          { ep: 5, type: "must-watch", note: "Shotgun" },
          { ep: 6, type: "must-watch", note: "Cornered" },
          { ep: 7, type: "must-watch", note: "Problem Dog" },
          { ep: 8, type: "must-watch", note: "Hermanos" },
          { ep: 9, type: "must-watch", note: "Bug" },
          { ep: 10, type: "must-watch", note: "Salud" },
          { ep: 11, type: "must-watch", note: "Crawl Space" },
          { ep: 12, type: "must-watch", note: "End Times" },
          { ep: 13, type: "must-watch", note: "Face Off" }
        ],
        s5: [
          { ep: 1, type: "must-watch", note: "Live Free or Die" },
          { ep: 2, type: "must-watch", note: "Madrigal" },
          { ep: 3, type: "must-watch", note: "Hazard Pay" },
          { ep: 4, type: "must-watch", note: "Fifty-One" },
          { ep: 5, type: "must-watch", note: "Dead Freight" },
          { ep: 6, type: "must-watch", note: "Buyout" },
          { ep: 7, type: "must-watch", note: "Say My Name" },
          { ep: 8, type: "must-watch", note: "Gliding Over All" },
          { ep: 9, type: "must-watch", note: "Blood Money" },
          { ep: 10, type: "must-watch", note: "Buried" },
          { ep: 11, type: "must-watch", note: "Confessions" },
          { ep: 12, type: "must-watch", note: "Rabid Dog" },
          { ep: 13, type: "must-watch", note: "To'hajiilee" },
          { ep: 14, type: "must-watch", note: "Ozymandias" },
          { ep: 15, type: "must-watch", note: "Granite State" },
          { ep: 16, type: "must-watch", note: "Felina" }
        ]
      }
    }
  },
  'the-office': { tmdbId: 2316 },
  'friends': { tmdbId: 1668 },
  'game-of-thrones': { tmdbId: 1399 },
  'stranger-things': { tmdbId: 66732 },
  'the-simpsons': { tmdbId: 456 },
  'sherlock': { tmdbId: 19885 },
  
  // Anime
  'naruto': {
    tmdbId: 46260,
    guides: {
      fr: {
        s1: [
          { ep: 1, type: "must-watch", note: "Pilote - Introduction de Naruto" },
          { ep: 2, type: "must-watch", note: "Introduction de Konohamaru" },
          { ep: 3, type: "optional", note: "Développement relation" },
          { ep: 4, type: "optional", note: "Test de survie" },
          { ep: 5, type: "must-watch", note: "Décision de Kakashi" },
          { ep: 6, type: "must-watch", note: "Début arc Land of Waves" },
          { ep: 7, type: "must-watch", note: "Zabuza apparaît" },
          { ep: 8, type: "must-watch", note: "Combat Naruto vs Zabuza" },
          { ep: 9, type: "must-watch", note: "Kakashi Sharingan" },
          { ep: 10, type: "must-watch", note: "Suite combat" },
          { ep: 11, type: "must-watch", note: "Histoire de Haku" },
          { ep: 12, type: "must-watch", note: "Combat final" },
          { ep: 13, type: "must-watch", note: "Secret de Haku" },
          { ep: 14, type: "must-watch", note: "Naruto se bat" },
          { ep: 15, type: "must-watch", note: "Suite combat" },
          { ep: 16, type: "must-watch", note: "Kyubi se réveille" },
          { ep: 17, type: "must-watch", note: "Passé de Haku" },
          { ep: 18, type: "must-watch", note: "Mort de Haku et Zabuza" },
          { ep: 19, type: "must-watch", note: "Fin arc Land of Waves" },
          { ep: 20, type: "must-watch", note: "Début examen Chunin" },
          { ep: 21, type: "must-watch", note: "Nouveaux rivaux" },
          { ep: 22, type: "must-watch", note: "Lee vs Sasuke" },
          { ep: 23, type: "must-watch", note: "9 rookies" },
          { ep: 24, type: "must-watch", note: "Début épreuve écrite" },
          { ep: 25, type: "must-watch", note: "Question 10" },
          { ep: 26, type: "must-watch", note: "Début épreuve forêt" },
          { ep: 27, type: "must-watch", note: "Forêt de la mort" },
          { ep: 28, type: "must-watch", note: "Orochimaru apparaît" },
          { ep: 29, type: "must-watch", note: "Naruto vs Orochimaru" },
          { ep: 30, type: "must-watch", note: "Sasuke vs Orochimaru" },
          { ep: 31, type: "must-watch", note: "Lee protège Sakura" },
          { ep: 32, type: "must-watch", note: "Sakura se bat" },
          { ep: 33, type: "must-watch", note: "Formation Ino-Shika-Cho" },
          { ep: 34, type: "must-watch", note: "Gaara cruel" },
          { ep: 35, type: "must-watch", note: "Secret du parchemin" },
          { ep: 36, type: "optional", note: "Filler" },
          { ep: 37, type: "must-watch", note: "9 survivants" },
          { ep: 38, type: "must-watch", note: "Elimination" },
          { ep: 39, type: "optional", note: "Filler" },
          { ep: 40, type: "must-watch", note: "Confrontation" },
          { ep: 41, type: "must-watch", note: "Combat filles" },
          { ep: 42, type: "must-watch", note: "Sakura vs Ino" },
          { ep: 43, type: "must-watch", note: "Temari vs Tenten" },
          { ep: 44, type: "optional", note: "Filler" },
          { ep: 45, type: "must-watch", note: "Secret Naruto" },
          { ep: 46, type: "must-watch", note: "Hinata vs Neji" },
          { ep: 47, type: "must-watch", note: "Discours Naruto" },
          { ep: 48, type: "must-watch", note: "Combat légendaire Gaara vs Lee" },
          { ep: 49, type: "must-watch", note: "8 portes" },
          { ep: 50, type: "must-watch", note: "Lee utilise les 8 portes" },
          { ep: 51, type: "must-watch", note: "Gaara terrifiant" },
          { ep: 52, type: "optional", note: "Filler" },
          { ep: 53, type: "must-watch", note: "Jiraiya arrive" },
          { ep: 54, type: "must-watch", note: "Invocation" },
          { ep: 55, type: "optional", note: "Filler" },
          { ep: 56, type: "must-watch", note: "Entraînement" },
          { ep: 57, type: "must-watch", note: "Gamabunta" },
          { ep: 58, type: "optional", note: "Filler" },
          { ep: 59, type: "must-watch", note: "Début finales" },
          { ep: 60, type: "must-watch", note: "Hinata vs Neji début" },
          { ep: 61, type: "must-watch", note: "Byakugan complet" },
          { ep: 62, type: "must-watch", note: "Naruto soutient Hinata" },
          { ep: 63, type: "must-watch", note: "Tirage au sort" },
          { ep: 64, type: "skip", note: "Filler - Arc Hokage Battle Royale" },
          { ep: 65, type: "skip", note: "Filler - Arc Hokage Battle Royale" },
          { ep: 66, type: "skip", note: "Filler - Arc Hokage Battle Royale" },
          { ep: 67, type: "skip", note: "Filler - Arc Hokage Battle Royale" },
          { ep: 68, type: "skip", note: "Filler - Arc Hokage Battle Royale" },
          { ep: 69, type: "skip", note: "Filler - Arc Hokage Battle Royale" },
          { ep: 70, type: "skip", note: "Filler - Arc Hokage Battle Royale" },
          { ep: 71, type: "skip", note: "Filler - Arc Hokage Battle Royale" },
          { ep: 72, type: "skip", note: "Filler - Arc Hokage Battle Royale" },
          { ep: 73, type: "skip", note: "Filler - Arc Hokage Battle Royale" },
          { ep: 74, type: "skip", note: "Filler - Arc Hokage Battle Royale" },
          { ep: 75, type: "skip", note: "Filler - Arc Hokage Battle Royale" },
          { ep: 76, type: "skip", note: "Filler - Arc Hokage Battle Royale" },
          { ep: 77, type: "skip", note: "Filler - Arc Hokage Battle Royale" },
          { ep: 78, type: "skip", note: "Filler - Arc Hokage Battle Royale" },
          { ep: 79, type: "must-watch", note: "Retour canon important" },
          { ep: 80, type: "must-watch", note: "Troisième Hokage scellé" },
          { ep: 81, type: "must-watch", note: "Retour au canon" },
          { ep: 82, type: "must-watch", note: "Kakashi vs Itachi" },
          { ep: 83, type: "must-watch", note: "Jiraiya entraîne Naruto" },
          { ep: 84, type: "must-watch", note: "Sasuke vs Itachi" },
          { ep: 85, type: "must-watch", note: "Histoire Uchiha" },
          { ep: 86, type: "must-watch", note: "Nouvel entraînement" },
          { ep: 87, type: "must-watch", note: "Rasengan training" },
          { ep: 88, type: "must-watch", note: "Suite entraînement" },
          { ep: 89, type: "must-watch", note: "Histoire Tsunade" },
          { ep: 90, type: "must-watch", note: "Orochimaru vs Jiraiya" },
          { ep: 91, type: "must-watch", note: "Collier de Tsunade" },
          { ep: 92, type: "must-watch", note: "Décision Tsunade" },
          { ep: 93, type: "must-watch", note: "Combat début" },
          { ep: 94, type: "must-watch", note: "Rasengan complet" },
          { ep: 95, type: "must-watch", note: "Tsunade devient Hokage" },
          { ep: 96, type: "must-watch", note: "Combat 3 Sannin" },
          { ep: 97, type: "skip", note: "Filler" },
          { ep: 98, type: "skip", note: "Filler" },
          { ep: 99, type: "skip", note: "Filler" },
          { ep: 100, type: "must-watch", note: "Départ Sasuke" },
          { ep: 101, type: "optional", note: "Filler amusant - visage Kakashi" },
          { ep: 102, type: "skip", note: "Filler arc Tea" },
          { ep: 103, type: "skip", note: "Filler arc Tea" },
          { ep: 104, type: "skip", note: "Filler arc Tea" },
          { ep: 105, type: "skip", note: "Filler arc Tea" },
          { ep: 106, type: "skip", note: "Filler arc Tea" },
          { ep: 107, type: "skip", note: "Filler arc Tea" },
          { ep: 108, type: "skip", note: "Filler arc Tea" },
          { ep: 109, type: "must-watch", note: "Début combat final Naruto vs Sasuke" },
          { ep: 110, type: "must-watch", note: "Combat Naruto vs Sasuke" },
          { ep: 111, type: "must-watch", note: "Sasuke part" },
          { ep: 112, type: "must-watch", note: "Équipe de récupération" },
          { ep: 113, type: "must-watch", note: "Combat début" },
          { ep: 114, type: "must-watch", note: "Problèmes dans l'équipe" },
          { ep: 115, type: "must-watch", note: "Choji vs Jirobo" },
          { ep: 116, type: "must-watch", note: "Choji utilise pilules" },
          { ep: 117, type: "must-watch", note: "Kiba vs Sakon" },
          { ep: 118, type: "must-watch", note: "Kiba combat" },
          { ep: 119, type: "must-watch", note: "Sasuke dans le vase" },
          { ep: 120, type: "must-watch", note: "Kimimaro apparaît" },
          { ep: 121, type: "must-watch", note: "Nouveau ennemi" },
          { ep: 122, type: "must-watch", note: "Gaara vs Kimimaro" },
          { ep: 123, type: "must-watch", note: "Combats multiples" },
          { ep: 124, type: "must-watch", note: "Shikamaru stratège" },
          { ep: 125, type: "must-watch", note: "Lee vs Kimimaro" },
          { ep: 126, type: "must-watch", note: "Lee boit alcool" },
          { ep: 127, type: "must-watch", note: "Gaara sauve Lee" },
          { ep: 128, type: "must-watch", note: "Combat légendaire Gaara vs Kimimaro" },
          { ep: 129, type: "must-watch", note: "Kimimaro technique finale" },
          { ep: 130, type: "must-watch", note: "Naruto rattrape Sasuke" },
          { ep: 131, type: "must-watch", note: "Flashback Sasuke" },
          { ep: 132, type: "must-watch", note: "Histoire Uchiha" },
          { ep: 133, type: "must-watch", note: "Secrets Sharingan" },
          { ep: 134, type: "must-watch", note: "Naruto vs Sasuke début" },
          { ep: 135, type: "must-watch", note: "Naruto vs Sasuke" },
          { ep: 136, type: "must-watch", note: "Combat final" },
          { ep: 137, type: "must-watch", note: "Sasuke s'en va" },
          { ep: 138, type: "skip", note: "Filler arc Kaima" },
          { ep: 139, type: "skip", note: "Filler arc Kaima" },
          { ep: 140, type: "skip", note: "Filler arc Kaima" },
          { ep: 141, type: "skip", note: "Filler arc Kaima" },
          { ep: 142, type: "skip", note: "Filler arc Kaima" },
          { ep: 143, type: "skip", note: "Filler arc Kaima" },
          { ep: 144, type: "skip", note: "Filler arc Kaima" },
          { ep: 145, type: "skip", note: "Filler arc Kaima" },
          { ep: 146, type: "skip", note: "Filler arc Kaima" },
          { ep: 147, type: "skip", note: "Filler" },
          { ep: 148, type: "skip", note: "Filler" },
          { ep: 149, type: "skip", note: "Filler arc Menma" },
          { ep: 150, type: "skip", note: "Filler arc Menma" },
          { ep: 151, type: "skip", note: "Filler arc Menma" },
          { ep: 152, type: "skip", note: "Filler arc Menma" },
          { ep: 153, type: "skip", note: "Filler arc Menma" },
          { ep: 154, type: "skip", note: "Filler arc Menma" },
          { ep: 155, type: "skip", note: "Filler arc Menma" },
          { ep: 156, type: "skip", note: "Filler clip show" },
          { ep: 157, type: "skip", note: "Filler clip show" },
          { ep: 158, type: "skip", note: "Filler arc Raiga" },
          { ep: 159, type: "skip", note: "Filler arc Raiga" },
          { ep: 160, type: "skip", note: "Filler arc Raiga" },
          { ep: 161, type: "skip", note: "Filler arc Raiga" },
          { ep: 162, type: "skip", note: "Filler arc Raiga" },
          { ep: 163, type: "skip", note: "Filler clip show" },
          { ep: 164, type: "skip", note: "Filler clip show" },
          { ep: 165, type: "skip", note: "Filler clip show" },
          { ep: 166, type: "skip", note: "Filler arc Raiga" },
          { ep: 167, type: "skip", note: "Filler arc Raiga" },
          { ep: 168, type: "skip", note: "Filler clip show" },
          { ep: 169, type: "skip", note: "Filler clip show" },
          { ep: 170, type: "skip", note: "Filler arc curry" },
          { ep: 171, type: "skip", note: "Filler arc curry" },
          { ep: 172, type: "skip", note: "Filler arc curry" },
          { ep: 173, type: "skip", note: "Filler arc curry" },
          { ep: 174, type: "skip", note: "Filler arc curry" },
          { ep: 175, type: "skip", note: "Filler arc mer" },
          { ep: 176, type: "skip", note: "Filler arc mer" },
          { ep: 177, type: "skip", note: "Filler arc mer" },
          { ep: 178, type: "skip", note: "Filler arc mer" },
          { ep: 179, type: "skip", note: "Filler arc postier" },
          { ep: 180, type: "skip", note: "Filler arc postier" },
          { ep: 181, type: "skip", note: "Filler arc postier" },
          { ep: 182, type: "skip", note: "Filler arc postier" },
          { ep: 183, type: "skip", note: "Filler arc postier" },
          { ep: 184, type: "skip", note: "Filler arc postier" },
          { ep: 185, type: "skip", note: "Filler arc postier" },
          { ep: 186, type: "skip", note: "Filler arc Onbaa" },
          { ep: 187, type: "skip", note: "Filler arc Onbaa" },
          { ep: 188, type: "skip", note: "Filler arc Onbaa" },
          { ep: 189, type: "skip", note: "Filler déménagement" },
          { ep: 190, type: "skip", note: "Filler déménagement" },
          { ep: 191, type: "skip", note: "Filler déménagement" },
          { ep: 192, type: "skip", note: "Filler arc marchands" },
          { ep: 193, type: "skip", note: "Filler arc marchands" },
          { ep: 194, type: "skip", note: "Filler arc marchands" },
          { ep: 195, type: "skip", note: "Filler arc marchands" },
          { ep: 196, type: "skip", note: "Filler arc marchands" },
          { ep: 197, type: "skip", note: "Filler arc marchands" },
          { ep: 198, type: "skip", note: "Filler arc marchands" },
          { ep: 199, type: "skip", note: "Filler arc marchands" },
          { ep: 200, type: "skip", note: "Filler arc marchands" },
          { ep: 201, type: "skip", note: "Filler arc marchands" },
          { ep: 202, type: "skip", note: "Filler arc marchands" },
          { ep: 203, type: "skip", note: "Filler arc marchands" },
          { ep: 204, type: "skip", note: "Filler arc marchands" },
          { ep: 205, type: "skip", note: "Filler arc marchands" },
          { ep: 206, type: "skip", note: "Filler arc marchands" },
          { ep: 207, type: "skip", note: "Filler arc marchands" },
          { ep: 208, type: "skip", note: "Filler arc marchands" },
          { ep: 209, type: "skip", note: "Filler arc Kurenai" },
          { ep: 210, type: "skip", note: "Filler arc Kurenai" },
          { ep: 211, type: "skip", note: "Filler arc Kurenai" },
          { ep: 212, type: "skip", note: "Filler arc Kurenai" },
          { ep: 213, type: "skip", note: "Filler arc Kurenai" },
          { ep: 214, type: "skip", note: "Filler arc Kurenai" },
          { ep: 215, type: "skip", note: "Filler arc Kurenai" },
          { ep: 216, type: "skip", note: "Filler arc Kurenai" },
          { ep: 217, type: "skip", note: "Filler arc Kurenai" },
          { ep: 218, type: "skip", note: "Filler arc Kurenai" },
          { ep: 219, type: "skip", note: "Filler arc Kurenai" },
          { ep: 220, type: "must-watch", note: "Fin Naruto - Début Shippuden" }
        ]
      }
    }
  },
  'naruto-shippuden': {
    tmdbId: 31910,
    guides: {
      fr: {
        s1: [
          { ep: 1, type: "must-watch", note: "Retour à Konoha" },
          { ep: 2, type: "must-watch", note: "Les Akatsuki se déploient" },
          { ep: 3, type: "skip", note: "Résultats de l'examen" },
          { ep: 4, type: "skip", note: "Les résultats" }
        ]
      }
    }
  },
  'one-piece': {
    tmdbId: 37854,
    guides: {
      fr: {
        s1: [
          { ep: 1, type: "must-watch", note: "Je suis Luffy ! Je deviendrai le roi des pirates !" },
          { ep: 2, type: "must-watch", note: "Le grand escrimeur" },
          { ep: 3, type: "must-watch", note: "Morgan vs Luffy" },
          { ep: 4, type: "optional", note: "Luffy passe à l'attaque" }
        ]
      }
    }
  },
  'bleach': {
    tmdbId: 30984,
    guides: {
      fr: {
        s1: [
          { ep: 1, type: "must-watch", note: "Le jour où je suis devenu Shinigami" },
          { ep: 2, type: "must-watch", note: "Le travail d'un Shinigami" },
          { ep: 3, type: "must-watch", note: "Le frère disparu, la sœur retrouvée" },
          { ep: 4, type: "optional", note: "Le crieur de pierre" }
        ]
      }
    }
  },
  'attack-on-titan': {
    tmdbId: 1429,
    guides: {
      fr: {
        s1: [
          { ep: 1, type: "must-watch", note: "À toi, 2000 ans dans le futur" },
          { ep: 2, type: "must-watch", note: "Ce jour-là" },
          { ep: 3, type: "must-watch", note: "Une triste nuit" },
          { ep: 4, type: "must-watch", note: "Première sortie" }
        ]
      }
    }
  },
  'my-hero-academia': {
    tmdbId: 65930,
    guides: {
      fr: {
        s1: [
          { ep: 1, type: "must-watch", note: "Izuku Midoriya : Les origines" },
          { ep: 2, type: "must-watch", note: "Les qualifications pour être un héros" },
          { ep: 3, type: "must-watch", note: "Le grondement des muscles" },
          { ep: 4, type: "must-watch", note: "La ligne de départ" }
        ]
      }
    }
  },
  'demon-slayer': {
    tmdbId: 85937,
    guides: {
      fr: {
        s1: [
          { ep: 1, type: "must-watch", note: "Cruauté" },
          { ep: 2, type: "must-watch", note: "Le mentor Sakonji Urokodaki" },
          { ep: 3, type: "must-watch", note: "Sabito et Makomo" },
          { ep: 4, type: "must-watch", note: "Première mission" }
        ]
      }
    }
  },
  'dragon-ball-z': {
    tmdbId: 12971,
    guides: {
      fr: {
        s1: [
          { ep: 1, type: "must-watch", note: "Arrivée de Raditz" },
          { ep: 2, type: "must-watch", note: "Le frère de Goku" },
          { ep: 3, type: "must-watch", note: "L'entraînement de Piccolo" },
          { ep: 4, type: "optional", note: "Run Gohan !" }
        ]
      }
    }
  },
  'death-note': {
    tmdbId: 13916,
    guides: {
      fr: {
        s1: [
          { ep: 1, type: "must-watch", note: "Renaissance" },
          { ep: 2, type: "must-watch", note: "Confrontation" },
          { ep: 3, type: "must-watch", note: "Dealings" },
          { ep: 4, type: "must-watch", note: "Poursuite" }
        ]
      }
    }
  },
  'fullmetal-alchemist-brotherhood': {
    tmdbId: 31911,
    guides: {
      fr: {
        s1: [
          { ep: 1, type: "must-watch", note: "Fullmetal Alchemist" },
          { ep: 2, type: "must-watch", note: "Le premier jour" },
          { ep: 3, type: "must-watch", note: "La cité des péchés" },
          { ep: 4, type: "must-watch", note: "L'alchimiste au bras d'acier" }
        ]
      }
    }
  },
  'hunter-x-hunter': {
    tmdbId: 46298,
    guides: {
      fr: {
        s1: [
          { ep: 1, type: "must-watch", note: "Le départ x et x les amis" },
          { ep: 2, type: "must-watch", note: "Les épreuves du Hunter" },
          { ep: 3, type: "must-watch", note: "La rivale x et x l'accident" },
          { ep: 4, type: "must-watch", note: "Espoir x et x Ambition" }
        ]
      }
    }
  },
  'jujutsu-kaisen': {
    tmdbId: 90462,
    guides: {
      fr: {
        s1: [
          { ep: 1, type: "must-watch", note: "Ryomen Sukuna" },
          { ep: 2, type: "must-watch", note: "Pour moi-même" },
          { ep: 3, type: "must-watch", note: "Fille de l'acier" },
          { ep: 4, type: "must-watch", note: "La malédiction de la matière" }
        ]
      }
    }
  }
};

// TMDB API client
class TMDB {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.themoviedb.org/3';
    this.imageBase = 'https://image.tmdb.org/t/p';
  }
  
  async fetch(endpoint, lang = 'fr-FR') {
    const url = `${this.baseUrl}${endpoint}?api_key=${this.apiKey}&language=${lang}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`TMDB error: ${response.status}`);
    return response.json();
  }
  
  getPoster(path, size = 'w342') {
    return path ? `${this.imageBase}/${size}${path}` : null;
  }
  
  getBackdrop(path, size = 'w1280') {
    return path ? `${this.imageBase}/${size}${path}` : null;
  }
  
  async getShow(id, lang = 'fr-FR') {
    return this.fetch(`/tv/${id}`, lang);
  }
  
  async getSeason(showId, seasonNum, lang = 'fr-FR') {
    return this.fetch(`/tv/${showId}/season/${seasonNum}`, lang);
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // Get language preference
    const cookies = request.headers.get('Cookie') || '';
    const langMatch = cookies.match(/lang=(fr|en)/);
    const lang = langMatch ? langMatch[1] : 'fr';
    const tmdbLang = lang === 'fr' ? 'fr-FR' : 'en-US';
    
    // Initialize TMDB client
    const tmdb = new TMDB(env.TMDB_API_KEY);
    
    if (path === '/' || path === '/index.html') {
      return renderHome(tmdb, lang, tmdbLang);
    }
    
    if (path === '/anime') {
      return renderAnime(tmdb, lang, tmdbLang);
    }
    
    if (path.startsWith('/show/')) {
      const showId = path.split('/')[2];
      const seasonNum = parseInt(url.searchParams.get('season')) || 1;
      return renderShow(showId, seasonNum, tmdb, lang, tmdbLang);
    }
    
    if (path === '/api/set-language') {
      return setLanguage(request);
    }
    
    return new Response('Not Found', { status: 404 });
  }
};

async function renderHome(tmdb, lang, tmdbLang) {
  const t = {
    fr: {
      badge: 'Nouveau — Stargate SG-1 disponible',
      title: 'Ne perds plus de temps avec les épisodes inutiles',
      subtitle: 'Guides d\'épisodes complets avec notation must-watch, important et optionnel. Pour les séries qui en valent la peine.',
      cta: 'Explorer les séries →',
      stats: { series: 'Séries référencées', episodes: 'Épisodes notés', price: 'Gratuit, toujours' },
      popular: 'Séries populaires',
      free: 'Tous les guides gratuits',
      langLabel: 'FR'
    },
    en: {
      badge: 'New — Stargate SG-1 available',
      title: 'Stop wasting time on useless episodes',
      subtitle: 'Complete episode guides with must-watch, important and optional ratings.',
      cta: 'Browse shows →',
      stats: { series: 'Shows referenced', episodes: 'Episodes rated', price: 'Free, always' },
      popular: 'Popular shows',
      free: 'All guides free',
      langLabel: 'EN'
    }
  }[lang];
  
  // Fetch real data from TMDB for all shows
  const showIds = Object.keys(SHOWS_DB);
  const showsData = [];
  
  for (const id of showIds) {
    try {
      const data = await tmdb.getShow(SHOWS_DB[id].tmdbId, tmdbLang);
      showsData.push({
        id,
        name: data.name,
        overview: data.overview,
        poster: tmdb.getPoster(data.poster_path, 'w342'),
        backdrop: tmdb.getBackdrop(data.backdrop_path, 'w780'),
        year: data.first_air_date?.split('-')[0] || 'N/A',
        seasons: data.number_of_seasons,
        rating: data.vote_average?.toFixed(1),
        genres: data.genres?.slice(0, 2).map(g => g.name).join(', ') || ''
      });
    } catch (e) {
      console.error(`Failed to fetch ${id}:`, e);
    }
  }
  
  const showsHtml = showsData.map(show => `
    <a href="/show/${show.id}" class="show-card">
        <div class="show-poster" style="background-image: url('${show.poster || ''}');">
            ${!show.poster ? '<span style="font-size: 3rem;">📺</span>' : ''}
        </div>
        <div class="show-info">
            <h3 class="show-title">${show.name}</h3>
            <p class="show-meta">${show.year} • ${show.seasons}S <span class="show-rating-inline">⭐ ${show.rating}</span></p>
        </div>
    </a>
  `).join('');
  
  const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover">
    <meta name="theme-color" content="#0c0c0c">
    <title>Filler Tracker — Episode Guides</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500&display=swap" rel="stylesheet">
    <style>
      :root {
        --bg: #0c0c0c;
        --surface: #141414;
        --surface-hover: #1a1a1a;
        --border: #222;
        --text: #f5f5f5;
        --text-muted: #888;
        --accent: #ff6b35;
        --must-watch: #22c55e;
        --important: #f59e0b;
        --optional: #ef4444;
      }
      
      * { margin: 0; padding: 0; box-sizing: border-box; }
      
      body {
        font-family: 'Inter', system-ui, sans-serif;
        background: var(--bg);
        color: var(--text);
        line-height: 1.6;
      }
      
      .nav {
        position: fixed;
        top: 0; left: 0; right: 0;
        height: 64px;
        background: rgba(12, 12, 12, 0.95);
        backdrop-filter: blur(10px);
        border-bottom: 1px solid var(--border);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 48px;
        z-index: 100;
      }
      
      .logo {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 1.4rem;
        font-weight: 700;
        color: var(--text);
        text-decoration: none;
      }
      
      .logo span { color: var(--accent); }
      
      .nav-links {
        display: flex;
        gap: 32px;
        align-items: center;
      }
      
      .nav-links a {
        color: var(--text-muted);
        text-decoration: none;
        font-size: 0.9rem;
        font-weight: 500;
        transition: color 0.2s;
      }
      
      .nav-links a:hover { color: var(--text); }
      
      .lang-switch {
        background: var(--surface);
        border: 1px solid var(--border);
        color: var(--text);
        padding: 8px 14px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.85rem;
        min-height: 36px;
        min-width: 44px;
      }
      
      /* Mobile Menu */
      .mobile-menu-btn {
        display: none;
        width: 44px;
        height: 44px;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 8px;
        color: var(--text);
        font-size: 1.1rem;
        cursor: pointer;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        -webkit-tap-highlight-color: rgba(255, 107, 53, 0.3);
      }
      
      .mobile-menu-btn:hover { background: var(--surface-hover); border-color: var(--accent); }
      .mobile-menu-btn:active { transform: scale(0.95); }
      
      .mobile-nav {
        display: none;
        position: fixed;
        top: 64px;
        left: 0; right: 0;
        background: rgba(12, 12, 12, 0.98);
        backdrop-filter: blur(20px);
        border-bottom: 1px solid var(--border);
        padding: 12px;
        z-index: 99;
        transform: translateY(-100%);
        opacity: 0;
        transition: all 0.25s ease;
      }
      
      .mobile-nav.active { transform: translateY(0); opacity: 1; }
      
      .mobile-nav a, .mobile-nav button {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        padding: 16px;
        color: var(--text-muted);
        text-decoration: none;
        font-weight: 500;
        font-size: 1rem;
        border-radius: 8px;
        transition: all 0.2s;
        min-height: 56px;
        background: none;
        border: none;
        cursor: pointer;
        text-align: left;
      }
      
      .mobile-nav a:hover, .mobile-nav a.active, .mobile-nav button:hover {
        background: var(--surface);
        color: var(--text);
      }
      
      .hero {
        padding: 140px 48px 80px;
        max-width: 1200px;
        margin: 0 auto;
      }
      
      .badge {
        display: inline-block;
        padding: 6px 14px;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 4px;
        font-size: 0.8rem;
        color: var(--accent);
        font-weight: 500;
        margin-bottom: 24px;
      }
      
      .hero h1 {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 4rem;
        font-weight: 700;
        line-height: 1.05;
        letter-spacing: -2px;
        margin-bottom: 24px;
        max-width: 800px;
      }
      
      .hero p {
        font-size: 1.15rem;
        color: var(--text-muted);
        max-width: 500px;
        margin-bottom: 40px;
      }
      
      .btn {
        padding: 14px 28px;
        border-radius: 4px;
        font-weight: 600;
        text-decoration: none;
        font-size: 0.95rem;
        transition: all 0.2s;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }
      
      .btn-primary {
        background: var(--accent);
        color: #000;
      }
      
      .stats {
        display: flex;
        gap: 80px;
        padding: 40px 48px;
        border-top: 1px solid var(--border);
        border-bottom: 1px solid var(--border);
        max-width: 1200px;
        margin: 0 auto;
      }
      
      .stat h3 {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 2.5rem;
        font-weight: 700;
        color: var(--accent);
      }
      
      .stat p { color: var(--text-muted); font-size: 0.9rem; }
      
      .section {
        padding: 80px 48px;
        max-width: 1200px;
        margin: 0 auto;
      }
      
      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-bottom: 48px;
      }
      
      .section h2 {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 1.75rem;
        font-weight: 600;
      }
      
      .section h2 span { color: var(--text-muted); font-weight: 400; }
      
      .shows-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 20px;
      }
      
      .show-card {
        display: flex;
        min-width: 0;
        flex-direction: column;
        text-decoration: none;
        color: var(--text);
        transition: all 0.3s ease;
      }
      
      .show-card:hover {
        transform: translateY(-4px);
      }
      
      .show-card:hover .show-poster {
        box-shadow: 0 16px 50px rgba(0,0,0,0.5);
        transform: scale(1.02);
      }
      
      .show-card:hover .show-info {
        background: rgba(40, 40, 40, 0.8);
        border-color: rgba(255,107,53,0.2);
      }
      
      .show-poster {
        width: 100%;
        height: auto;
        aspect-ratio: 2 / 3;
        border-radius: 12px;
        background-size: cover;
        background-position: center;
        box-shadow: 0 8px 30px rgba(0,0,0,0.4);
        transition: all 0.3s ease;
        overflow: hidden;
        position: relative;
        z-index: 5;
      }
      
      .show-poster span {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
      
      .show-info {
        margin-top: -20px;
        margin-left: 8px;
        margin-right: 8px;
        padding: 16px;
        padding-top: 24px;
        background: rgba(30, 30, 30, 0.7);
        backdrop-filter: blur(16px);
        border-radius: 12px;
        border: 1px solid rgba(255,255,255,0.08);
        position: relative;
        z-index: 10;
        box-shadow: 0 -4px 20px rgba(0,0,0,0.3);
      }
      
      .show-title {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 1rem;
        font-weight: 600;
        margin-bottom: 4px;
        line-height: 1.3;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .show-meta {
        color: var(--text-muted);
        font-size: 0.8rem;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .show-rating-inline {
        color: var(--accent);
        font-weight: 600;
      }
      
      footer {
        padding: 48px;
        text-align: center;
        color: var(--text-muted);
        font-size: 0.85rem;
        border-top: 1px solid var(--border);
      }
      
      @media (max-width: 1200px) {
        .shows-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      }
      
      @media (max-width: 900px) {
        .shows-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      }
      
      @media (max-width: 768px) {
        .nav { padding: 0 20px; height: 60px; }
        .nav-links { display: none; }
        .mobile-menu-btn { display: flex; }
        .mobile-nav { display: block; top: 60px; }
        .hero { padding: 100px 20px 60px; }
        .hero h1 { font-size: 2rem; letter-spacing: -1px; }
        .hero p { font-size: 1rem; }
        .stats { flex-direction: column; gap: 20px; padding: 30px 20px; }
        .section { padding: 40px 20px; }
        footer { padding: 40px 20px; }
      }
      
      @media (max-width: 480px) {
        .hero h1 { font-size: 1.6rem; }
        .shows-grid { grid-template-columns: 1fr; }
        .btn { width: 100%; justify-content: center; min-height: 52px; }
      }
      
      @supports (padding-top: env(safe-area-inset-top)) {
        .nav { padding-top: env(safe-area-inset-top); height: calc(64px + env(safe-area-inset-top)); }
        .mobile-nav { top: calc(64px + env(safe-area-inset-top)); }
        .hero { padding-top: calc(140px + env(safe-area-inset-top)); }
        @media (max-width: 768px) {
          .nav { height: calc(60px + env(safe-area-inset-top)); }
          .mobile-nav { top: calc(60px + env(safe-area-inset-top)); }
          .hero { padding-top: calc(100px + env(safe-area-inset-top)); }
        }
      }
    </style>
</head>
<body>
    <nav class="nav">
        <a href="/" class="logo">Filler<span>.</span></a>
        <div class="nav-links">
            <a href="/" class="active">${lang === 'fr' ? 'Accueil' : 'Home'}</a>
            <a href="/anime">${lang === 'fr' ? 'Anime' : 'Anime'}</a>
            <button class="lang-switch" onclick="toggleLang()">${t.langLabel}</button>
        </div>
        <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Menu">☰</button>
    </nav>
    
    <div class="mobile-nav" id="mobileNav">
        <a href="/" class="active">${lang === 'fr' ? '🏠 Accueil' : '🏠 Home'}</a>
        <a href="/anime">📺 ${lang === 'fr' ? 'Anime' : 'Anime'}</a>
        <button onclick="toggleLang()">🌐 ${t.langLabel === 'FR' ? 'English' : 'Français'}</button>
    </div>

    <section class="hero">
        <div class="badge">${t.badge}</div>
        <h1>${t.title}</h1>
        <p>${t.subtitle}</p>
        <a href="#shows" class="btn btn-primary">${t.cta}</a>
    </section>

    <div class="stats">
        <div class="stat"><h3>${showsData.length}</h3><p>${t.stats.series}</p></div>
        <div class="stat"><h3>500+</h3><p>${t.stats.episodes}</p></div>
        <div class="stat"><h3>0$</h3><p>${t.stats.price}</p></div>
    </div>

    <section class="section" id="shows">
        <div class="section-header">
            <h2>${t.popular} <span>— ${t.free}</span></h2>
        </div>
        <div class="shows-grid">
            ${showsHtml}
        </div>
    </section>

    <footer>
        <p>© 2026 Filler Tracker — Données TMDB</p>
    </footer>
    
    <script>
        function toggleLang() {
            const newLang = document.documentElement.lang === 'fr' ? 'en' : 'fr';
            fetch('/api/set-language?lang=' + newLang).then(() => location.reload());
        }
        
        // Mobile Menu Toggle
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileNav = document.getElementById('mobileNav');
        let isMenuOpen = false;
        
        mobileMenuBtn.addEventListener('click', () => {
            isMenuOpen = !isMenuOpen;
            mobileNav.classList.toggle('active', isMenuOpen);
            mobileMenuBtn.textContent = isMenuOpen ? '✕' : '☰';
            mobileMenuBtn.setAttribute('aria-expanded', isMenuOpen);
        });
        
        mobileNav.querySelectorAll('a, button').forEach(link => {
            link.addEventListener('click', () => {
                isMenuOpen = false;
                mobileNav.classList.remove('active');
                mobileMenuBtn.textContent = '☰';
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
            });
        });
        
        document.addEventListener('click', (e) => {
            if (isMenuOpen && !mobileNav.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                isMenuOpen = false;
                mobileNav.classList.remove('active');
                mobileMenuBtn.textContent = '☰';
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
            }
        });
    </script>
</body>
</html>`;

  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

async function renderAnime(tmdb, lang, tmdbLang) {
  const t = {
    fr: {
      title: 'Anime — Guides d\'épisodes',
      subtitle: 'Les meilleurs anime avec guides anti-filler. Naruto, One Piece, Attack on Titan et plus.',
      badge: 'Nouveau',
      langLabel: 'FR',
      anime: 'Anime'
    },
    en: {
      title: 'Anime — Episode Guides',
      subtitle: 'Best anime with filler guides. Naruto, One Piece, Attack on Titan and more.',
      badge: 'New',
      langLabel: 'EN',
      anime: 'Anime'
    }
  }[lang];
  
  const animeIds = ['naruto', 'naruto-shippuden', 'one-piece', 'bleach', 'attack-on-titan', 
                   'my-hero-academia', 'demon-slayer', 'dragon-ball-z', 'death-note', 
                   'fullmetal-alchemist-brotherhood', 'hunter-x-hunter', 'jujutsu-kaisen'];
  
  const showsData = [];
  for (const id of animeIds) {
    try {
      const data = await tmdb.getShow(SHOWS_DB[id].tmdbId, tmdbLang);
      showsData.push({
        id,
        name: data.name,
        overview: data.overview,
        poster: tmdb.getPoster(data.poster_path, 'w342'),
        year: data.first_air_date?.split('-')[0] || 'N/A',
        seasons: data.number_of_seasons,
        rating: data.vote_average?.toFixed(1)
      });
    } catch (e) {
      console.error(`Failed to fetch ${id}:`, e);
    }
  }
  
  const showsHtml = showsData.map(show => `
    <a href="/show/${show.id}" class="show-card">
        <div class="show-poster" style="background-image: url('${show.poster || ''}');">
            ${!show.poster ? '<span style="font-size: 3rem;">📺</span>' : ''}
        </div>
        <div class="show-info">
            <h3 class="show-title">${show.name}</h3>
            <p class="show-meta">${show.year} • ${show.seasons}S <span class="show-rating-inline">⭐ ${show.rating}</span></p>
        </div>
    </a>
  `).join('');
  
  const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover">
    <meta name="theme-color" content="#0c0c0c">
    <title>${t.title}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500&display=swap" rel="stylesheet">
    <style>
      :root {
        --bg: #0c0c0c;
        --surface: #141414;
        --surface-hover: #1a1a1a;
        --border: #222;
        --text: #f5f5f5;
        --text-muted: #888;
        --accent: #ff6b35;
      }
      
      * { margin: 0; padding: 0; box-sizing: border-box; }
      
      body {
        font-family: 'Inter', system-ui, sans-serif;
        background: var(--bg);
        color: var(--text);
        line-height: 1.6;
      }
      
      .nav {
        position: fixed;
        top: 0; left: 0; right: 0;
        height: 64px;
        background: rgba(12, 12, 12, 0.95);
        backdrop-filter: blur(10px);
        border-bottom: 1px solid var(--border);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 48px;
        z-index: 100;
      }
      
      .logo {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 1.4rem;
        font-weight: 700;
        color: var(--text);
        text-decoration: none;
      }
      
      .logo span { color: var(--accent); }
      
      .nav-links {
        display: flex;
        gap: 32px;
        align-items: center;
      }
      
      .nav-links a {
        color: var(--text-muted);
        text-decoration: none;
        font-size: 0.9rem;
        font-weight: 500;
        transition: color 0.2s;
      }
      
      .nav-links a:hover, .nav-links a.active { color: var(--text); }
      
      .lang-switch {
        background: var(--surface);
        border: 1px solid var(--border);
        color: var(--text);
        padding: 8px 14px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.85rem;
        min-height: 36px;
        min-width: 44px;
      }
      
      /* Mobile Menu */
      .mobile-menu-btn {
        display: none;
        width: 44px;
        height: 44px;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 8px;
        color: var(--text);
        font-size: 1.1rem;
        cursor: pointer;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        -webkit-tap-highlight-color: rgba(255, 107, 53, 0.3);
      }
      
      .mobile-menu-btn:hover { background: var(--surface-hover); border-color: var(--accent); }
      .mobile-menu-btn:active { transform: scale(0.95); }
      
      .mobile-nav {
        display: none;
        position: fixed;
        top: 64px;
        left: 0; right: 0;
        background: rgba(12, 12, 12, 0.98);
        backdrop-filter: blur(20px);
        border-bottom: 1px solid var(--border);
        padding: 12px;
        z-index: 99;
        transform: translateY(-100%);
        opacity: 0;
        transition: all 0.25s ease;
      }
      
      .mobile-nav.active { transform: translateY(0); opacity: 1; }
      
      .mobile-nav a, .mobile-nav button {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        padding: 16px;
        color: var(--text-muted);
        text-decoration: none;
        font-weight: 500;
        font-size: 1rem;
        border-radius: 8px;
        transition: all 0.2s;
        min-height: 56px;
        background: none;
        border: none;
        cursor: pointer;
        text-align: left;
      }
      
      .mobile-nav a:hover, .mobile-nav a.active, .mobile-nav button:hover {
        background: var(--surface);
        color: var(--text);
      }
      
      .hero {
        padding: 140px 48px 60px;
        max-width: 1200px;
        margin: 0 auto;
      }
      
      .badge {
        display: inline-block;
        padding: 6px 14px;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 4px;
        font-size: 0.8rem;
        color: var(--accent);
        font-weight: 500;
        margin-bottom: 24px;
      }
      
      .hero h1 {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 3.5rem;
        font-weight: 700;
        line-height: 1.1;
        letter-spacing: -2px;
        margin-bottom: 20px;
      }
      
      .hero p {
        font-size: 1.15rem;
        color: var(--text-muted);
        max-width: 600px;
      }
      
      .section {
        padding: 40px 48px 80px;
        max-width: 1200px;
        margin: 0 auto;
      }
      
      .shows-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 20px;
      }
      
      .show-card {
        display: flex;
        min-width: 0;
        flex-direction: column;
        text-decoration: none;
        color: var(--text);
        transition: all 0.3s ease;
      }
      
      .show-card:hover {
        transform: translateY(-4px);
      }
      
      .show-card:hover .show-poster {
        box-shadow: 0 16px 50px rgba(0,0,0,0.5);
        transform: scale(1.02);
      }
      
      .show-card:hover .show-info {
        background: rgba(40, 40, 40, 0.8);
        border-color: rgba(255,107,53,0.2);
      }
      
      .show-poster {
        width: 100%;
        height: auto;
        aspect-ratio: 2 / 3;
        border-radius: 12px;
        background-size: cover;
        background-position: center;
        box-shadow: 0 8px 30px rgba(0,0,0,0.4);
        transition: all 0.3s ease;
        overflow: hidden;
        position: relative;
        z-index: 5;
      }
      
      .show-poster span {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
      
      .show-info {
        margin-top: -20px;
        margin-left: 8px;
        margin-right: 8px;
        padding: 16px;
        padding-top: 24px;
        background: rgba(30, 30, 30, 0.7);
        backdrop-filter: blur(16px);
        border-radius: 12px;
        border: 1px solid rgba(255,255,255,0.08);
        position: relative;
        z-index: 10;
        box-shadow: 0 -4px 20px rgba(0,0,0,0.3);
      }
      
      .show-title {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 1rem;
        font-weight: 600;
        margin-bottom: 4px;
        line-height: 1.3;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .show-meta {
        color: var(--text-muted);
        font-size: 0.8rem;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .show-rating-inline {
        color: var(--accent);
        font-weight: 600;
      }
      
      footer {
        padding: 48px;
        text-align: center;
        color: var(--text-muted);
        font-size: 0.85rem;
        border-top: 1px solid var(--border);
      }
      
      @media (max-width: 1200px) {
        .shows-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      }
      
      @media (max-width: 900px) {
        .shows-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      }
      
      @media (max-width: 768px) {
        .nav { padding: 0 20px; height: 60px; }
        .nav-links { display: none; }
        .mobile-menu-btn { display: flex; }
        .mobile-nav { display: block; top: 60px; }
        .hero { padding: 100px 20px 60px; }
        .hero h1 { font-size: 2rem; }
        .hero p { font-size: 1rem; }
        .section { padding: 40px 20px; }
        footer { padding: 40px 20px; }
      }
      
      @media (max-width: 480px) {
        .hero h1 { font-size: 1.6rem; }
        .shows-grid { grid-template-columns: 1fr; }
      }
      
      @supports (padding-top: env(safe-area-inset-top)) {
        .nav { padding-top: env(safe-area-inset-top); height: calc(64px + env(safe-area-inset-top)); }
        .mobile-nav { top: calc(64px + env(safe-area-inset-top)); }
        .hero { padding-top: calc(140px + env(safe-area-inset-top)); }
        @media (max-width: 768px) {
          .nav { height: calc(60px + env(safe-area-inset-top)); }
          .mobile-nav { top: calc(60px + env(safe-area-inset-top)); }
          .hero { padding-top: calc(100px + env(safe-area-inset-top)); }
        }
      }
    </style>
</head>
<body>
    <nav class="nav">
        <a href="/" class="logo">Filler<span>.</span></a>
        <div class="nav-links">
            <a href="/">${lang === 'fr' ? 'Accueil' : 'Home'}</a>
            <a href="/anime" class="active">${t.anime}</a>
            <button class="lang-switch" onclick="toggleLang()">${t.langLabel}</button>
        </div>
        <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Menu">☰</button>
    </nav>
    
    <div class="mobile-nav" id="mobileNav">
        <a href="/">${lang === 'fr' ? '🏠 Accueil' : '🏠 Home'}</a>
        <a href="/anime" class="active">📺 ${t.anime}</a>
        <button onclick="toggleLang()">🌐 ${t.langLabel === 'FR' ? 'English' : 'Français'}</button>
    </div>

    <section class="hero">
        <div class="badge">${t.badge}</div>
        <h1>${t.title}</h1>
        <p>${t.subtitle}</p>
    </section>

    <section class="section">
        <div class="shows-grid">
            ${showsHtml}
        </div>
    </section>

    <footer>
        <p>© 2026 Filler Tracker — Données TMDB</p>
    </footer>
    
    <script>
        function toggleLang() {
            const newLang = document.documentElement.lang === 'fr' ? 'en' : 'fr';
            fetch('/api/set-language?lang=' + newLang).then(() => location.reload());
        }
        
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileNav = document.getElementById('mobileNav');
        let isMenuOpen = false;
        mobileMenuBtn.addEventListener('click', () => {
            isMenuOpen = !isMenuOpen;
            mobileNav.classList.toggle('active', isMenuOpen);
            mobileMenuBtn.textContent = isMenuOpen ? '✕' : '☰';
            mobileMenuBtn.setAttribute('aria-expanded', isMenuOpen);
        });
        mobileNav.querySelectorAll('a, button').forEach(link => {
            link.addEventListener('click', () => {
                isMenuOpen = false;
                mobileNav.classList.remove('active');
                mobileMenuBtn.textContent = '☰';
            });
        });
    </script>
</body>
</html>`;

  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

async function renderShow(showId, seasonNum, tmdb, lang, tmdbLang) {
  const show = SHOWS_DB[showId];
  if (!show) return new Response('Show not found', { status: 404 });
  
  const t = {
    fr: { back: '← Retour', guide: 'Guide des épisodes', season: 'Saison', mustWatch: 'À voir', important: 'Important', optional: 'Optionnel', skip: 'Skip' },
    en: { back: '← Back', guide: 'Episode Guide', season: 'Season', mustWatch: 'Must Watch', important: 'Important', optional: 'Optional', skip: 'Skip' }
  }[lang];
  
  // Fetch show data from TMDB
  let showData, seasonData, allEpisodes = [];
  try {
    showData = await tmdb.getShow(show.tmdbId, tmdbLang);
    
    // For Naruto: fetch all seasons and merge into one flat list
    if (showId === 'naruto') {
      const s1 = await tmdb.getSeason(show.tmdbId, 1, tmdbLang);
      const s2 = await tmdb.getSeason(show.tmdbId, 2, tmdbLang);
      const s3 = await tmdb.getSeason(show.tmdbId, 3, tmdbLang);
      const s4 = await tmdb.getSeason(show.tmdbId, 4, tmdbLang);
      
      // Concatenate with offset
      allEpisodes = [
        ...(s1.episodes || []),
        ...(s2.episodes || []).map(e => ({ ...e, episode_number: e.episode_number + 52 })),
        ...(s3.episodes || []).map(e => ({ ...e, episode_number: e.episode_number + 104 })),
        ...(s4.episodes || []).map(e => ({ ...e, episode_number: e.episode_number + 158 }))
      ];
      seasonData = { episodes: allEpisodes };
    } else {
      seasonData = await tmdb.getSeason(show.tmdbId, seasonNum, tmdbLang);
    }
  } catch (e) {
    return new Response('Error fetching data', { status: 500 });
  }
  
  const backdrop = tmdb.getBackdrop(showData.backdrop_path, 'w1280');
  const poster = tmdb.getPoster(showData.poster_path, 'w342');
  const totalSeasons = showData.number_of_seasons;
  
  // Build season selector (hide for Naruto)
  const seasonSelector = showId === 'naruto' ? '' : Array.from({ length: totalSeasons }, (_, i) => i + 1).map(s => `
    <a href="/show/${showId}?season=${s}" class="season-btn ${s === seasonNum ? 'active' : ''}">${t.season} ${s}</a>
  `).join('');
  
  // Merge TMDB episodes with our guides
  const guides = show.guides?.[lang] || show.guides?.['en'] || {};
  const seasonKey = `s${seasonNum}`;
  const guideMap = new Map((guides[seasonKey] || []).map(g => [g.ep, g]));
  
  const episodes = (seasonData.episodes || []).map(ep => {
    const guide = guideMap.get(ep.episode_number);
    return {
      number: ep.episode_number,
      title: ep.name,
      overview: ep.overview,
      still: tmdb.getPoster(ep.still_path, 'w300'),
      airDate: ep.air_date,
      type: guide?.type || 'unknown',
      note: guide?.note || ''
    };
  });
  
  const typeColors = {
    'must-watch': '#22c55e',
    'important': '#f59e0b',
    'optional': '#ef4444',
    'skip': '#666',
    'clip': '#3b82f6',
    'unknown': '#444'
  };
  
  const typeLabels = {
    'must-watch': t.mustWatch,
    'important': t.important,
    'optional': t.optional,
    'skip': t.skip,
    'clip': 'Clip',
    'unknown': lang === 'fr' ? 'Non classé' : 'Unrated'
  };
  
  const episodesHtml = episodes.map(ep => `
    <div class="episode" data-expanded="false">
        <div class="ep-still" style="background-image: url('${ep.still || ''}')">
            ${!ep.still ? `<span class="ep-number-fallback">${ep.number}</span>` : ''}
        </div>
        <div class="ep-content">
            <div class="ep-header">
                <div>
                    <span class="ep-num">S${seasonNum}E${ep.number}</span>
                    <h3 class="ep-title">${ep.title}</h3>
                </div>
                <span class="ep-badge" style="background: ${typeColors[ep.type]}20; color: ${typeColors[ep.type]}; border: 1px solid ${typeColors[ep.type]}40;">
                    ${typeLabels[ep.type]}
                </span>
            </div>
            <p class="ep-overview">${ep.overview || (lang === 'fr' ? 'Aucun résumé disponible' : 'No overview available')}</p>
            ${ep.note ? `<p class="ep-note">💡 ${ep.note}</p>` : ''}
            <button class="ep-toggle" onclick="toggleEp(this)">${lang === 'fr' ? 'Voir plus' : 'Show more'}</button>
        </div>
    </div>
  `).join('');
  
  const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover">
    <meta name="theme-color" content="#0c0c0c">
    <title>${showData.name} — Filler Tracker</title>
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500&display=swap" rel="stylesheet">
    <style>
      :root {
        --bg: #0c0c0c;
        --surface: #141414;
        --surface-hover: #1a1a1a;
        --border: #222;
        --text: #f5f5f5;
        --text-muted: #888;
        --accent: #ff6b35;
      }
      
      * { margin: 0; padding: 0; box-sizing: border-box; }
      
      body {
        font-family: 'Inter', system-ui, sans-serif;
        background: var(--bg);
        color: var(--text);
        line-height: 1.6;
      }
      
      .nav {
        position: fixed;
        top: 0; left: 0; right: 0;
        height: 64px;
        background: rgba(12, 12, 12, 0.95);
        backdrop-filter: blur(10px);
        border-bottom: 1px solid var(--border);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 48px;
        z-index: 100;
      }
      
      .logo {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 1.4rem;
        font-weight: 700;
        color: var(--text);
        text-decoration: none;
      }
      
      .logo span { color: var(--accent); }
      
      .nav-links a {
        color: var(--text-muted);
        text-decoration: none;
        font-size: 0.9rem;
        min-height: 44px;
        display: inline-flex;
        align-items: center;
        padding: 0 8px;
      }
      
      /* Mobile Menu */
      .mobile-menu-btn {
        display: none;
        width: 44px;
        height: 44px;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 8px;
        color: var(--text);
        font-size: 1.1rem;
        cursor: pointer;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        -webkit-tap-highlight-color: rgba(255, 107, 53, 0.3);
      }
      
      .mobile-menu-btn:hover { background: var(--surface-hover); border-color: var(--accent); }
      .mobile-menu-btn:active { transform: scale(0.95); }
      
      .mobile-nav {
        display: none;
        position: fixed;
        top: 64px;
        left: 0; right: 0;
        background: rgba(12, 12, 12, 0.98);
        backdrop-filter: blur(20px);
        border-bottom: 1px solid var(--border);
        padding: 12px;
        z-index: 99;
        transform: translateY(-100%);
        opacity: 0;
        transition: all 0.25s ease;
      }
      
      .mobile-nav.active { transform: translateY(0); opacity: 1; }
      
      .mobile-nav a {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        padding: 16px;
        color: var(--text-muted);
        text-decoration: none;
        font-weight: 500;
        font-size: 1rem;
        border-radius: 8px;
        transition: all 0.2s;
        min-height: 56px;
      }
      
      .mobile-nav a:hover, .mobile-nav a.active {
        background: var(--surface);
        color: var(--text);
      }
      
      .hero-backdrop {
        height: 400px;
        background-size: cover;
        background-position: center;
        position: relative;
      }
      
      .hero-backdrop::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(to bottom, rgba(12,12,12,0.3) 0%, var(--bg) 100%);
      }
      
      .container {
        max-width: 900px;
        margin: -100px auto 0;
        padding: 0 48px 48px;
        position: relative;
        z-index: 10;
      }
      
      .back-link {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: var(--text-muted);
        text-decoration: none;
        margin-bottom: 24px;
        font-size: 0.9rem;
      }
      
      .show-header {
        display: flex;
        gap: 32px;
        margin-bottom: 48px;
      }
      
      .show-poster {
        width: 200px;
        height: 300px;
        border-radius: 12px;
        background-size: cover;
        background-position: center;
        border: 1px solid var(--border);
        flex-shrink: 0;
      }
      
      .show-info h1 {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 3rem;
        margin-bottom: 16px;
      }
      
      .show-info p {
        color: var(--text-muted);
        margin-bottom: 16px;
        line-height: 1.7;
      }
      
      .meta {
        display: flex;
        gap: 24px;
        font-size: 0.9rem;
        color: var(--text-muted);
        margin-bottom: 16px;
      }
      
      .rating {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: var(--surface);
        padding: 8px 16px;
        border-radius: 6px;
        font-weight: 600;
      }
      
      .episodes-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      
      .episode {
        display: flex;
        gap: 20px;
        padding: 20px;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 12px;
        transition: all 0.2s;
      }
      
      .episode:hover {
        border-color: var(--border);
        background: var(--surface-hover);
      }
      
      .ep-still {
        width: 160px;
        height: 90px;
        background: var(--bg);
        border-radius: 8px;
        background-size: cover;
        background-position: center;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .ep-number-fallback {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 2rem;
        font-weight: 700;
        color: var(--text-muted);
      }
      
      .ep-content {
        flex: 1;
      }
      
      .ep-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 12px;
      }
      
      .ep-num {
        color: var(--accent);
        font-weight: 600;
        font-size: 0.85rem;
        margin-right: 8px;
      }
      
      .ep-title {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 1.1rem;
        font-weight: 600;
        display: inline;
      }
      
      .ep-badge {
        display: inline-flex;
        align-items: center;
        padding: 6px 12px;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .ep-overview {
        color: var(--text-muted);
        font-size: 0.95rem;
        line-height: 1.6;
        margin-bottom: 8px;
      }
      
      .ep-note {
        color: var(--accent);
        font-size: 0.9rem;
        font-style: italic;
      }
      
      .ep-overview {
        color: var(--text-muted);
        font-size: 0.95rem;
        line-height: 1.6;
        margin-bottom: 8px;
        max-height: 3.2em;
        overflow: hidden;
        transition: max-height 0.3s ease;
      }
      
      .episode[data-expanded="true"] .ep-overview {
        max-height: 500px;
      }
      
      .ep-toggle {
        background: transparent;
        border: none;
        color: var(--accent);
        font-size: 0.85rem;
        cursor: pointer;
        padding: 4px 0;
        font-weight: 500;
      }
      
      .ep-toggle:hover {
        text-decoration: underline;
      }
      
      .episode[data-expanded="true"] .ep-toggle {
        color: var(--text-muted);
      }
      
      .season-selector {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin: 32px 0 16px;
        padding: 16px;
        background: var(--surface);
        border-radius: 12px;
        border: 1px solid var(--border);
      }
      
      .season-btn {
        padding: 8px 16px;
        background: transparent;
        border: 1px solid var(--border);
        border-radius: 6px;
        color: var(--text-muted);
        text-decoration: none;
        font-size: 0.9rem;
        font-weight: 500;
        transition: all 0.2s;
      }
      
      .season-btn:hover {
        border-color: var(--accent);
        color: var(--text);
      }
      
      .season-btn.active {
        background: var(--accent);
        border-color: var(--accent);
        color: #000;
      }
      
      .season-header-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 24px 0 24px;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--border);
      }
      
      .expand-all-btn {
        background: var(--surface);
        border: 1px solid var(--border);
        color: var(--text);
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 0.85rem;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .expand-all-btn:hover {
        border-color: var(--accent);
      }
      
      @media (max-width: 768px) {
        .nav { padding: 0 20px; height: 60px; }
        .nav-links { display: none; }
        .mobile-menu-btn { display: flex; }
        .mobile-nav { display: block; top: 60px; }
        .container { padding: 20px; padding-bottom: 48px; }
        .show-header { flex-direction: column; }
        .show-poster { width: 140px; height: 210px; }
        .show-info h1 { font-size: 1.6rem; }
        .show-info p { font-size: 0.9rem; }
        .episode { flex-direction: column; gap: 16px; padding: 16px; }
        .ep-still { width: 100%; height: 160px; }
        .ep-header { flex-direction: column; gap: 12px; }
        .ep-title { font-size: 1rem; }
        .ep-badge { align-self: flex-start; }
        .season-selector { padding: 12px; margin: 20px 0 12px; }
        .season-btn { padding: 10px 14px; font-size: 0.85rem; min-height: 44px; }
        .season-header-row { flex-direction: column; gap: 16px; align-items: flex-start; margin: 20px 0; }
        .expand-all-btn { width: 100%; min-height: 44px; }
        .back-link { margin: 20px 0; display: inline-flex; min-height: 44px; align-items: center; }
      }
      
      @media (max-width: 480px) {
        .show-info h1 { font-size: 1.4rem; }
        .ep-still { height: 140px; }
        .ep-number-fallback { font-size: 1.5rem; }
      }
      
      @supports (padding-top: env(safe-area-inset-top)) {
        .nav { padding-top: env(safe-area-inset-top); height: calc(64px + env(safe-area-inset-top)); }
        .mobile-nav { top: calc(64px + env(safe-area-inset-top)); }
        @media (max-width: 768px) {
          .nav { height: calc(60px + env(safe-area-inset-top)); }
          .mobile-nav { top: calc(60px + env(safe-area-inset-top)); }
        }
      }
    </style>
</head>
<body>
    <nav class="nav">
        <a href="/" class="logo">Filler<span>.</span></a>
        <div class="nav-links">
            <a href="/">${lang === 'fr' ? 'Accueil' : 'Home'}</a>
            <a href="/anime">${lang === 'fr' ? 'Anime' : 'Anime'}</a>
        </div>
        <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Menu">☰</button>
    </nav>
    
    <div class="mobile-nav" id="mobileNav">
        <a href="/">${lang === 'fr' ? '🏠 Accueil' : '🏠 Home'}</a>
        <a href="/anime">📺 ${lang === 'fr' ? 'Anime' : 'Anime'}</a>
    </div>
    
    <div class="hero-backdrop" style="background-image: url('${backdrop || poster}')"></div>
    
    <div class="container">
        <a href="/" class="back-link">${t.back}</a>
        
        <div class="show-header">
            <div class="show-poster" style="background-image: url('${poster}')"></div>
            <div class="show-info">
                <h1>${showData.name}</h1>
                <p>${showData.overview}</p>
                <div class="meta">
                    <span>${showData.number_of_seasons} ${lang === 'fr' ? 'saisons' : 'seasons'}</span>
                    <span>•</span>
                    <span>${showData.first_air_date?.split('-')[0] || 'N/A'}</span>
                    <span>•</span>
                    <span>${showData.genres?.map(g => g.name).join(', ')}</span>
                </div>
                <div class="rating">⭐ ${showData.vote_average?.toFixed(1)} / 10</div>
            </div>
        </div>
        
        <div class="season-selector">
            ${seasonSelector}
        </div>
        
        <div class="season-header-row">
            <h2 class="season-title" style="font-family: 'Space Grotesk', sans-serif; font-size: 1.5rem; margin: 0;">${t.guide} — ${t.season} ${seasonNum}</h2>
            <button class="expand-all-btn" onclick="toggleAllEps()">${lang === 'fr' ? 'Tout déplier' : 'Expand all'}</button>
        </div>
        
        <div class="episodes-list">
            ${episodesHtml}
        </div>
    </div>
    <script>
        function toggleEp(btn) {
            const episode = btn.closest('.episode');
            const isExpanded = episode.getAttribute('data-expanded') === 'true';
            episode.setAttribute('data-expanded', !isExpanded);
            btn.textContent = isExpanded ? '${lang === 'fr' ? 'Voir plus' : 'Show more'}' : '${lang === 'fr' ? 'Voir moins' : 'Show less'}';
        }
        
        let allExpanded = false;
        function toggleAllEps() {
            allExpanded = !allExpanded;
            const episodes = document.querySelectorAll('.episode');
            const btn = document.querySelector('.expand-all-btn');
            episodes.forEach(ep => {
                ep.setAttribute('data-expanded', allExpanded);
                const toggleBtn = ep.querySelector('.ep-toggle');
                if (toggleBtn) {
                    toggleBtn.textContent = allExpanded ? '${lang === 'fr' ? 'Voir moins' : 'Show less'}' : '${lang === 'fr' ? 'Voir plus' : 'Show more'}';
                }
            });
            btn.textContent = allExpanded ? '${lang === 'fr' ? 'Tout replier' : 'Collapse all'}' : '${lang === 'fr' ? 'Tout déplier' : 'Expand all'}';
        }
        
        // Mobile Menu Toggle
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileNav = document.getElementById('mobileNav');
        let isMenuOpen = false;
        mobileMenuBtn.addEventListener('click', () => {
            isMenuOpen = !isMenuOpen;
            mobileNav.classList.toggle('active', isMenuOpen);
            mobileMenuBtn.textContent = isMenuOpen ? '✕' : '☰';
            mobileMenuBtn.setAttribute('aria-expanded', isMenuOpen);
        });
        mobileNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                isMenuOpen = false;
                mobileNav.classList.remove('active');
                mobileMenuBtn.textContent = '☰';
            });
        });
        document.addEventListener('click', (e) => {
            if (isMenuOpen && !mobileNav.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                isMenuOpen = false;
                mobileNav.classList.remove('active');
                mobileMenuBtn.textContent = '☰';
            }
        });
    </script>
</body>
</html>`;

  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

function setLanguage(request) {
  const url = new URL(request.url);
  const lang = url.searchParams.get('lang') || 'fr';
  
  return new Response(JSON.stringify({ success: true, lang }), {
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': `lang=${lang}; Path=/; Max-Age=31536000; SameSite=Strict`
    }
  });
}