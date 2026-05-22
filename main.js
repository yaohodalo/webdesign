/* ===================================================
   Would You Join Me for One Hour? — main.js (v3)
   - Chapels loaded from /api/chapels (DB-backed)
   - All markers physical (green)
   - Single EWTN live stream for "Start Adoration"
   - Pledge / contact / chapel forms → /api endpoints
   - Marker clustering for performance
=================================================== */

/* ============ CONFIG ============ */
const CONFIG = {
  // Single, stable live Adoration stream — EWTN's 24/7 Eucharistic Adoration
  // (Swap this anytime if the URL ever moves: edit just this one line.)
  liveAdorationUrl: 'https://www.youtube.com/embed/SDRgXmiWkM0?autoplay=1&rel=0',
  apiBase: '', // same-origin on Vercel
};

/* ============ STATE ============ */
const state = {
  currentLang: 'en',
  map: null,
  chapels: [],
  markersGroup: null,   // clustered group
  allMarkers: [],       // for search
  music: null,
  musicBtn: null,
  hasUserGestured: false,
};

/* ============ TRANSLATIONS ============ */
const translations = {
  en: {
    'btn.start':       'Start Adoration',
    'btn.nearby':      'Nearby Chapel',
    'btn.pledge':      'Pledge an Hour',
    'btn.addChapel':   'Add Chapel',
    'btn.musicPlay':   'Play Music',
    'btn.musicPause':  'Pause Music',
    'site.subtitle':   'Eucharistic Adoration Worldwide',
    'search.placeholder': 'Search by city, country, or chapel name…',
    'stats.chapels':   'Chapels Worldwide',
    'stats.pledged':   'Hours Pledged',
    'stats.countries': 'Countries',
    'stats.perpetual': 'Perpetual Prayer',
    'live.eyebrow':    'Live · 24/7',
    'live.title':      'Adoration <em>in Progress</em>',
    'live.subhead':    '"Could you not watch with me one hour?" — Matthew 26:40',
    'live.placeholder':'Scroll to begin Adoration',
    'live.credit':     'Stream courtesy of EWTN',
    'nearby.heading':  'Adoration Near You',
    'pledge.title':    'Pledge an Hour of Prayer',
    'pledge.subhead':  '"Could you not watch with me one hour?" — Matthew 26:40',
    'pledge.name':     'Your name',
    'pledge.email':    'Email (optional — for reminder)',
    'pledge.intention':'Your prayer intention (optional)',
    'pledge.submit':   'Pledge My Hour',
    'pledge.thanks':   'Thank you. Your hour has been pledged. Join adorers worldwide at your appointed time.',
    'mission.eyebrow': 'Our Mission',
    'mission.title':   'One Hour.<br><em>United Worldwide.</em>',
    'mission.statement': 'Helping people worldwide commit to an hour of Eucharistic Adoration and unite in prayer.',
    'mission.body':    'Our Lord asked His disciples in the Garden of Gethsemane, <em>"Could you not watch with me one hour?"</em> This platform exists to make that one hour easier — to find a chapel, pledge your time, and join a global family of adorers praying before the Blessed Sacrament.',
    'saint1.name':     'St. Peter Julian Eymard',
    'saint1.quote':    '"The Eucharist is the heart of Jesus opened to us."',
    'saint2.name':     'St. Tarcisius',
    'saint2.quote':    'Martyr who died protecting the Blessed Sacrament, c. 257 AD.',
    'saint3.name':     'St. Carlo Acutis',
    'saint3.quote':    '"The Eucharist is my highway to Heaven."',
    'how.eyebrow':     'How It Works',
    'how.title':       "Four Steps to Begin",
    'how.step1.title': 'Find a Chapel',
    'how.step1.body':  'Use the map to locate a chapel near you offering Eucharistic Adoration.',
    'how.step2.title': 'Arrive & Be Still',
    'how.step2.body':  'The Blessed Sacrament is exposed on the altar. Simply sit, kneel, or stand in the presence of Jesus. No experience required.',
    'how.step3.title': 'Pray Your Hour',
    'how.step3.body':  'Spend time in silent prayer, read Scripture, pray the Rosary, or simply rest in His presence. One hour is the traditional commitment.',
    'how.step4.title': 'Unite Worldwide',
    'how.step4.body':  'Pledge your hour and join thousands of adorers around the world praying before the Blessed Sacrament every hour of every day.',
    'tst.eyebrow':     'From Adorers',
    'tst.title':       'Stories of Grace',
    'tst1.text':       '"I started one hour a week and it transformed my marriage. There is no explaining it — only experiencing it."',
    'tst1.author':     '— Maria, Philippines',
    'tst2.text':       '"During the hardest year of my life, that one hour each Thursday was the only thing that kept me sane and hopeful."',
    'tst2.author':     '— James, Ireland',
    'tst3.text':       '"I found this site while searching late at night. Something changed in me that hour."',
    'tst3.author':     '— Anonymous, USA',
    'rsc.eyebrow':     'Go Deeper',
    'rsc.title':       'Resources on Eucharistic Adoration',
    'rsc1.title':      'Eucharistic Miracles',
    'rsc1.sub':        'St. Carlo Acutis — documented miracles worldwide',
    'rsc2.title':      'Mysterium Fidei',
    'rsc2.sub':        'Pope Paul VI — on the mystery of faith',
    'rsc3.title':      'Sacramentum Caritatis',
    'rsc3.sub':        'Pope Benedict XVI — sacrament of charity',
    'rsc4.title':      'National Eucharistic Revival',
    'rsc4.sub':        'USA — renewing belief in the Real Presence',
    'rsc5.title':      'Eucharistic Devotion',
    'rsc5.sub':        'USCCB — guides and devotional resources',
    'rsc6.title':      'Perpetual Adoration',
    'rsc6.sub':        'EWTN — Catholic teaching on the Holy Eucharist',
    'contact.eyebrow': 'Get In Touch',
    'contact.title':   'Contact Us',
    'contact.intro':   "Questions, chapel submissions, or partnership inquiries — we'd love to hear from you.",
    'contact.name':    'Your Name',
    'contact.email':   'Your Email',
    'contact.message': 'Your Message',
    'contact.send':    'Send Message',
    'contact.sending': 'Sending…',
    'footer.missionTitle': 'Our Mission',
    'footer.quickLinks':   'Quick Links',
    'footer.findChapel':   'Find a Chapel',
    'footer.pledgeLink':   'Pledge Your Hour',
    'footer.addChapelLink':'Add a Chapel',
    'footer.contactLink':  'Contact Us',
    'footer.resourcesH':   'Resources',
    'footer.languageH':    'Language',
    'footer.shareH':       'Share',
    'footer.shareIntro':   'Invite others to pledge their hour',
    'footer.shareBtn':     'Share This Site',
    'footer.bottom':       '© 2026 WouldYouJoinMeForOneHour.org · Built for the Glory of God',
    'modal.addTitle':  'Add a Chapel',
    'modal.addSub':    'Help grow the worldwide adoration community by adding your chapel.',
    'modal.chapelName':'Chapel Name',
    'modal.city':      'City',
    'modal.country':   'Country',
    'modal.yourEmail': 'Your email (optional)',
    'modal.lat':       'Latitude (e.g. 51.5074)',
    'modal.lng':       'Longitude (e.g. -0.1278)',
    'modal.address':   'Address (optional)',
    'modal.schedule':  'Adoration schedule (e.g. Mon–Fri 7am–7pm)',
    'modal.perpetual': '24/7 Perpetual Adoration',
    'modal.submitChapel': 'Submit Chapel',
    'modal.note':      'Submissions are reviewed before appearing on the map.',
    'map.caption': '"From the rising of the sun to its setting, my name will be great among the nations,"',
    'map.cite': '— Malachi 1:11',
    'count.preface': 'At this hour,',
    'count.chapels': 'chapels',
    'count.across': 'across',
    'count.countries': 'countries',
    'count.shelter': 'shelter the Blessed Sacrament,',
    'count.held': 'and',
    'count.heldEnd': 'hours have been pledged in prayer.',
    'mission.aside': '"The Eucharist is the heart of Jesus opened to us."',
    'mission.asideAuthor': '— St. Peter Julian Eymard',
    'mission.coda': 'We are not building a movement. We are joining one — older than us, larger than us, and still answering the question Jesus first asked in the garden.',
    'rsc1.author': 'Bl. Carlo Acutis · International Exhibition',
    'rsc2.author': 'Pope Paul VI · 1965',
    'rsc3.author': 'Pope Benedict XVI · 2007',
    'rsc4.author': 'USA · Ongoing',
    'rsc5.author': 'USCCB',
    'rsc6.author': 'EWTN',
    'hero.eyebrow': 'Eucharistic Adoration Worldwide',
    'hero.verse': '"Could you not watch with me one hour?" — Matthew 26:40',
    'featured.statement': "Jesus Christ is truly present, waiting for us.",
    'featured.caption': '— Divine Mercy Shrine, Krakow, Poland',
    'hero.attribution': "Photo courtesy of St. Anthony &amp; St. Mary Parishes, Menomonee Falls, WI · St. John Paul II Monstrance on loan from ARISE MKE",
    verses: [
      '"Could you not watch with me one hour?" — Matthew 26:40',
      '"Be still and know that I am God." — Psalm 46:10',
      '"I am the bread of life." — John 6:35',
      '"Remain in me, as I remain in you." — John 15:4',
      '"He who eats my flesh and drinks my blood has eternal life." — John 6:54',
    ],
    'msg.pledgeOk':    'Your hour has been pledged.',
    'msg.pledgeErr':   'Could not record pledge. Please try again.',
    'msg.contactOk':   "Message sent. We'll be in touch soon.",
    'msg.contactErr':  'Could not send. Please try again later.',
    'msg.chapelOk':    'Thank you! Your chapel will appear on the map after review.',
    'msg.chapelErr':   'Could not submit. Please check the coordinates and try again.',
    'msg.noResults':   'No results found',
    'msg.noNearby':    'No chapels found within 80 km.',
    'msg.perpetual':   'Perpetual Adoration (24/7)',
    'msg.directions':  'Get Directions',
  },

  es: {
    'btn.start':       'Comenzar Adoración',
    'btn.nearby':      'Capilla Cercana',
    'btn.pledge':      'Comprometer una hora',
    'btn.addChapel':   'Agregar Capilla',
    'btn.musicPlay':   'Reproducir música',
    'btn.musicPause':  'Pausar música',
    'site.subtitle':   'Adoración Eucarística en Todo el Mundo',
    'search.placeholder': 'Buscar por ciudad, país o nombre de capilla…',
    'stats.chapels':   'Capillas en el mundo',
    'stats.pledged':   'Horas comprometidas',
    'stats.countries': 'Países',
    'stats.perpetual': 'Oración perpetua',
    'live.eyebrow':    'En vivo · 24/7',
    'live.title':      'Adoración <em>en curso</em>',
    'live.subhead':    '"¿No habéis podido velar conmigo una hora?" — Mateo 26:40',
    'live.placeholder':'Desplázate para comenzar la Adoración',
    'live.credit':     'Transmisión cortesía de EWTN',
    'nearby.heading':  'Adoración cerca de ti',
    'pledge.title':    'Comprométete a una hora de oración',
    'pledge.subhead':  '"¿No habéis podido velar conmigo una hora?" — Mateo 26:40',
    'pledge.name':     'Tu nombre',
    'pledge.email':    'Correo (opcional — para recordatorio)',
    'pledge.intention':'Tu intención de oración (opcional)',
    'pledge.submit':   'Comprometer mi hora',
    'pledge.thanks':   'Gracias. Tu hora ha sido registrada. Únete a los adoradores del mundo a tu hora señalada.',
    'mission.eyebrow': 'Nuestra Misión',
    'mission.title':   'Una hora.<br><em>Unidos en el mundo.</em>',
    'mission.statement': 'Ayudamos a personas en todo el mundo a comprometerse a una hora de Adoración Eucarística y a unirse en oración.',
    'mission.body':    'Nuestro Señor preguntó a sus discípulos en el Huerto de Getsemaní: <em>"¿No habéis podido velar conmigo una hora?"</em> Esta plataforma existe para hacer esa hora más fácil — encontrar una capilla, comprometer tu tiempo y unirte a una familia mundial de adoradores ante el Santísimo Sacramento.',
    'saint1.name':     'San Pedro Julián Eymard',
    'saint1.quote':    '"La Eucaristía es el corazón de Jesús abierto a nosotros."',
    'saint2.name':     'San Tarcisio',
    'saint2.quote':    'Mártir que murió protegiendo el Santísimo Sacramento, c. 257 d.C.',
    'saint3.name':     'San Carlo Acutis',
    'saint3.quote':    '"La Eucaristía es mi autopista al Cielo."',
    'how.eyebrow':     'Cómo Funciona',
    'how.title':       "Cuatro pasos para comenzar",
    'how.step1.title': 'Encuentra una capilla',
    'how.step1.body':  'Usa el mapa para localizar una capilla cerca de ti que ofrezca Adoración Eucarística.',
    'how.step2.title': 'Llega y guarda silencio',
    'how.step2.body':  'El Santísimo Sacramento está expuesto en el altar. Simplemente siéntate, arrodíllate o ponte de pie en presencia de Jesús. No se requiere experiencia.',
    'how.step3.title': 'Reza tu hora',
    'how.step3.body':  'Dedica tiempo a la oración silenciosa, lee la Escritura, reza el Rosario o simplemente descansa en su presencia. Una hora es el compromiso tradicional.',
    'how.step4.title': 'Únete al mundo',
    'how.step4.body':  'Compromete tu hora y únete a miles de adoradores en todo el mundo que oran ante el Santísimo Sacramento cada hora de cada día.',
    'tst.eyebrow':     'De los adoradores',
    'tst.title':       'Historias de gracia',
    'tst1.text':       '"Comencé con una hora a la semana y transformó mi matrimonio. No hay explicación — solo experiencia."',
    'tst1.author':     '— María, Filipinas',
    'tst2.text':       '"Durante el año más difícil de mi vida, esa hora cada jueves fue lo único que me mantuvo cuerdo y esperanzado."',
    'tst2.author':     '— James, Irlanda',
    'tst3.text':       '"Encontré este sitio buscando tarde en la noche. Algo cambió en mí esa hora."',
    'tst3.author':     '— Anónimo, EE. UU.',
    'rsc.eyebrow':     'Profundiza',
    'rsc.title':       'Recursos sobre la Adoración Eucarística',
    'rsc1.title':      'Milagros eucarísticos',
    'rsc1.sub':        'San Carlo Acutis — milagros documentados en todo el mundo',
    'rsc2.title':      'Mysterium Fidei',
    'rsc2.sub':        'Papa Pablo VI — sobre el misterio de la fe',
    'rsc3.title':      'Sacramentum Caritatis',
    'rsc3.sub':        'Papa Benedicto XVI — sacramento de la caridad',
    'rsc4.title':      'Avivamiento Eucarístico Nacional',
    'rsc4.sub':        'EE. UU. — renovando la fe en la Presencia Real',
    'rsc5.title':      'Devoción eucarística',
    'rsc5.sub':        'USCCB — guías y recursos devocionales',
    'rsc6.title':      'Adoración perpetua',
    'rsc6.sub':        'EWTN — enseñanza católica sobre la Sagrada Eucaristía',
    'contact.eyebrow': 'Ponte en contacto',
    'contact.title':   'Contáctanos',
    'contact.intro':   'Preguntas, envíos de capillas o consultas de colaboración — nos encantará saber de ti.',
    'contact.name':    'Tu nombre',
    'contact.email':   'Tu correo',
    'contact.message': 'Tu mensaje',
    'contact.send':    'Enviar mensaje',
    'contact.sending': 'Enviando…',
    'footer.missionTitle': 'Nuestra Misión',
    'footer.quickLinks':   'Enlaces rápidos',
    'footer.findChapel':   'Encontrar una capilla',
    'footer.pledgeLink':   'Comprometer tu hora',
    'footer.addChapelLink':'Agregar una capilla',
    'footer.contactLink':  'Contáctanos',
    'footer.resourcesH':   'Recursos',
    'footer.languageH':    'Idioma',
    'footer.shareH':       'Compartir',
    'footer.shareIntro':   'Invita a otros a comprometer su hora',
    'footer.shareBtn':     'Compartir este sitio',
    'footer.bottom':       '© 2026 WouldYouJoinMeForOneHour.org · Hecho para la Gloria de Dios',
    'modal.addTitle':  'Agregar una capilla',
    'modal.addSub':    'Ayuda a crecer la comunidad mundial de adoración agregando tu capilla.',
    'modal.chapelName':'Nombre de la capilla',
    'modal.city':      'Ciudad',
    'modal.country':   'País',
    'modal.yourEmail': 'Tu correo (opcional)',
    'modal.lat':       'Latitud (ej. 51.5074)',
    'modal.lng':       'Longitud (ej. -0.1278)',
    'modal.address':   'Dirección (opcional)',
    'modal.schedule':  'Horario de adoración (ej. Lun–Vie 7h–19h)',
    'modal.perpetual': 'Adoración perpetua 24/7',
    'modal.submitChapel': 'Enviar capilla',
    'modal.note':      'Los envíos son revisados antes de aparecer en el mapa.',
    'map.caption': '"Desde donde sale el sol hasta donde se pone, grande es mi nombre entre las naciones,"',
    'map.cite': '— Malaquías 1:11',
    'count.preface': 'En esta hora,',
    'count.chapels': 'capillas',
    'count.across': 'en',
    'count.countries': 'países',
    'count.shelter': 'guardan el Santísimo Sacramento,',
    'count.held': 'y',
    'count.heldEnd': 'horas han sido comprometidas en oración.',
    'mission.aside': '"La Eucaristía es el corazón de Jesús abierto a nosotros."',
    'mission.asideAuthor': '— San Pedro Julián Eymard',
    'mission.coda': 'No estamos construyendo un movimiento. Nos estamos uniendo a uno — más antiguo que nosotros, más grande que nosotros, y que aún responde a la pregunta que Jesús hizo por primera vez en el huerto.',
    'rsc1.author': 'Bto. Carlo Acutis · Exposición Internacional',
    'rsc2.author': 'Papa Pablo VI · 1965',
    'rsc3.author': 'Papa Benedicto XVI · 2007',
    'rsc4.author': 'EE. UU. · En curso',
    'rsc5.author': 'USCCB',
    'rsc6.author': 'EWTN',
    'hero.eyebrow': 'Adoración Eucarística en Todo el Mundo',
    'hero.verse': '"¿No habéis podido velar conmigo una hora?" — Mateo 26:40',
    'featured.statement': "Jesucristo está verdaderamente presente, esperándonos.",
    'featured.caption': '— Santuario de la Divina Misericordia, Cracovia, Polonia',
    'hero.attribution': "Foto cortesía de las parroquias St. Anthony y St. Mary, Menomonee Falls, WI · Custodia de San Juan Pablo II en préstamo de ARISE MKE",
    verses: [
      '"¿No habéis podido velar conmigo una hora?" — Mateo 26:40',
      '"Estad quietos y conoced que yo soy Dios." — Salmo 46:10',
      '"Yo soy el pan de vida." — Juan 6:35',
      '"Permaneced en mí, como yo en vosotros." — Juan 15:4',
      '"El que come mi carne y bebe mi sangre tiene vida eterna." — Juan 6:54',
    ],
    'msg.pledgeOk':    'Tu hora ha sido registrada.',
    'msg.pledgeErr':   'No se pudo registrar. Inténtalo de nuevo.',
    'msg.contactOk':   'Mensaje enviado. Te contactaremos pronto.',
    'msg.contactErr':  'No se pudo enviar. Inténtalo más tarde.',
    'msg.chapelOk':    '¡Gracias! Tu capilla aparecerá en el mapa tras revisión.',
    'msg.chapelErr':   'No se pudo enviar. Revisa las coordenadas.',
    'msg.noResults':   'Sin resultados',
    'msg.noNearby':    'No hay capillas en un radio de 80 km.',
    'msg.perpetual':   'Adoración Perpetua (24/7)',
    'msg.directions':  'Cómo llegar',
  },

  fr: {
    'btn.start':       "Commencer l'Adoration",
    'btn.nearby':      'Chapelle Proche',
    'btn.pledge':      'Engager une heure',
    'btn.addChapel':   'Ajouter une chapelle',
    'btn.musicPlay':   'Jouer la musique',
    'btn.musicPause':  'Mettre en pause',
    'site.subtitle':   'Adoration Eucharistique dans le Monde',
    'search.placeholder': 'Rechercher par ville, pays ou nom de chapelle…',
    'stats.chapels':   'Chapelles dans le monde',
    'stats.pledged':   'Heures engagées',
    'stats.countries': 'Pays',
    'stats.perpetual': 'Prière perpétuelle',
    'live.eyebrow':    'En direct · 24/7',
    'live.title':      'Adoration <em>en cours</em>',
    'live.subhead':    '"N\'avez-vous pas pu veiller une heure avec moi ?" — Matthieu 26:40',
    'live.placeholder':"Faites défiler pour commencer l'Adoration",
    'live.credit':     'Diffusion offerte par EWTN',
    'nearby.heading':  'Adoration près de chez vous',
    'pledge.title':    'Engagez-vous pour une heure de prière',
    'pledge.subhead':  '"N\'avez-vous pas pu veiller une heure avec moi ?" — Matthieu 26:40',
    'pledge.name':     'Votre nom',
    'pledge.email':    'E-mail (facultatif — pour rappel)',
    'pledge.intention':'Votre intention de prière (facultatif)',
    'pledge.submit':   'Engager mon heure',
    'pledge.thanks':   "Merci. Votre heure est enregistrée. Joignez-vous aux adorateurs du monde à l'heure prévue.",
    'mission.eyebrow': 'Notre Mission',
    'mission.title':   'Une heure.<br><em>Unis dans le monde.</em>',
    'mission.statement': "Aider les gens du monde entier à s'engager pour une heure d'Adoration Eucharistique et à s'unir dans la prière.",
    'mission.body':    "Notre Seigneur a demandé à ses disciples au Jardin de Gethsémani : <em>\"N'avez-vous pas pu veiller une heure avec moi ?\"</em> Cette plateforme existe pour rendre cette heure plus facile — trouver une chapelle, engager votre temps, et rejoindre une famille mondiale d'adorateurs devant le Saint-Sacrement.",
    'saint1.name':     'St Pierre-Julien Eymard',
    'saint1.quote':    "\"L'Eucharistie est le cœur de Jésus ouvert à nous.\"",
    'saint2.name':     'St Tarcisius',
    'saint2.quote':    'Martyr mort en protégeant le Saint-Sacrement, vers 257 ap. J.-C.',
    'saint3.name':     'Bx Carlo Acutis',
    'saint3.quote':    "\"L'Eucharistie est mon autoroute vers le Ciel.\"",
    'how.eyebrow':     'Comment ça marche',
    'how.title':       "Quatre étapes pour commencer",
    'how.step1.title': 'Trouver une chapelle',
    'how.step1.body':  "Utilisez la carte pour repérer une chapelle près de chez vous offrant l'Adoration Eucharistique.",
    'how.step2.title': 'Arrivez et soyez en silence',
    'how.step2.body':  "Le Saint-Sacrement est exposé sur l'autel. Asseyez-vous, agenouillez-vous ou tenez-vous debout en présence de Jésus. Aucune expérience requise.",
    'how.step3.title': 'Priez votre heure',
    'how.step3.body':  "Passez du temps en prière silencieuse, lisez l'Écriture, priez le Rosaire, ou reposez-vous simplement en sa présence. Une heure est l'engagement traditionnel.",
    'how.step4.title': 'Unis dans le monde',
    'how.step4.body':  "Engagez votre heure et rejoignez des milliers d'adorateurs dans le monde priant devant le Saint-Sacrement à chaque heure de chaque jour.",
    'tst.eyebrow':     'Des adorateurs',
    'tst.title':       'Histoires de grâce',
    'tst1.text':       "\"J'ai commencé par une heure par semaine et cela a transformé mon mariage. On ne peut pas l'expliquer — seulement le vivre.\"",
    'tst1.author':     '— Maria, Philippines',
    'tst2.text':       "\"Pendant l'année la plus dure de ma vie, cette heure chaque jeudi est ce qui m'a gardé sain d'esprit et plein d'espoir.\"",
    'tst2.author':     '— James, Irlande',
    'tst3.text':       "\"J'ai trouvé ce site en cherchant tard dans la nuit. Quelque chose a changé en moi cette heure-là.\"",
    'tst3.author':     '— Anonyme, États-Unis',
    'rsc.eyebrow':     'Aller plus loin',
    'rsc.title':       "Ressources sur l'Adoration Eucharistique",
    'rsc1.title':      'Miracles eucharistiques',
    'rsc1.sub':        'St Carlo Acutis — miracles documentés dans le monde',
    'rsc2.title':      'Mysterium Fidei',
    'rsc2.sub':        'Pape Paul VI — sur le mystère de la foi',
    'rsc3.title':      'Sacramentum Caritatis',
    'rsc3.sub':        'Pape Benoît XVI — sacrement de la charité',
    'rsc4.title':      'Renouveau Eucharistique National',
    'rsc4.sub':        'États-Unis — renouveau de la foi en la Présence Réelle',
    'rsc5.title':      'Dévotion eucharistique',
    'rsc5.sub':        'USCCB — guides et ressources de dévotion',
    'rsc6.title':      'Adoration perpétuelle',
    'rsc6.sub':        'EWTN — enseignement catholique sur la Sainte Eucharistie',
    'contact.eyebrow': 'Nous joindre',
    'contact.title':   'Nous contacter',
    'contact.intro':   "Questions, propositions de chapelles ou demandes de partenariat — nous serions ravis de vous entendre.",
    'contact.name':    'Votre nom',
    'contact.email':   'Votre e-mail',
    'contact.message': 'Votre message',
    'contact.send':    'Envoyer',
    'contact.sending': 'Envoi…',
    'footer.missionTitle': 'Notre Mission',
    'footer.quickLinks':   'Liens rapides',
    'footer.findChapel':   'Trouver une chapelle',
    'footer.pledgeLink':   'Engager votre heure',
    'footer.addChapelLink':'Ajouter une chapelle',
    'footer.contactLink':  'Nous contacter',
    'footer.resourcesH':   'Ressources',
    'footer.languageH':    'Langue',
    'footer.shareH':       'Partager',
    'footer.shareIntro':   "Invitez d'autres à engager leur heure",
    'footer.shareBtn':     'Partager ce site',
    'footer.bottom':       '© 2026 WouldYouJoinMeForOneHour.org · Construit pour la Gloire de Dieu',
    'modal.addTitle':  'Ajouter une chapelle',
    'modal.addSub':    "Aidez la communauté mondiale d'adoration à grandir en ajoutant votre chapelle.",
    'modal.chapelName':'Nom de la chapelle',
    'modal.city':      'Ville',
    'modal.country':   'Pays',
    'modal.yourEmail': 'Votre e-mail (facultatif)',
    'modal.lat':       'Latitude (ex. 51.5074)',
    'modal.lng':       'Longitude (ex. -0.1278)',
    'modal.address':   'Adresse (facultatif)',
    'modal.schedule':  "Horaires d'adoration (ex. Lun–Ven 7h–19h)",
    'modal.perpetual': 'Adoration perpétuelle 24/7',
    'modal.submitChapel': 'Envoyer',
    'modal.note':      "Les soumissions sont vérifiées avant d'apparaître sur la carte.",
    'map.caption': '"Du levant au couchant du soleil, mon nom est grand parmi les nations,"',
    'map.cite': '— Malachie 1:11',
    'count.preface': 'À cette heure,',
    'count.chapels': 'chapelles',
    'count.across': 'dans',
    'count.countries': 'pays',
    'count.shelter': 'abritent le Saint-Sacrement,',
    'count.held': 'et',
    'count.heldEnd': 'heures ont été engagées en prière.',
    'mission.aside': '"L\'Eucharistie est le cœur de Jésus ouvert à nous."',
    'mission.asideAuthor': '— St Pierre-Julien Eymard',
    'mission.coda': 'Nous ne construisons pas un mouvement. Nous en rejoignons un — plus ancien que nous, plus grand que nous, et qui répond encore à la question que Jésus a posée pour la première fois au jardin.',
    'rsc1.author': 'Bx Carlo Acutis · Exposition Internationale',
    'rsc2.author': 'Pape Paul VI · 1965',
    'rsc3.author': 'Pape Benoît XVI · 2007',
    'rsc4.author': 'États-Unis · En cours',
    'rsc5.author': 'USCCB',
    'rsc6.author': 'EWTN',
    'hero.eyebrow': 'Adoration Eucharistique dans le Monde',
    'hero.verse': '"N\'avez-vous pas pu veiller une heure avec moi ?" — Matthieu 26:40',
    'featured.statement': "Jésus-Christ est vraiment présent, qui nous attend.",
    'featured.caption': '— Sanctuaire de la Divine Miséricorde, Cracovie, Pologne',
    'hero.attribution': "Photo offerte par les paroisses St. Anthony &amp; St. Mary, Menomonee Falls, WI · Ostensoir St. Jean-Paul II prêté par ARISE MKE",
    verses: [
      '"N\'avez-vous pas pu veiller une heure avec moi ?" — Matthieu 26:40',
      '"Arrêtez, et sachez que je suis Dieu." — Psaume 46:10',
      '"Je suis le pain de vie." — Jean 6:35',
      '"Demeurez en moi, comme je demeure en vous." — Jean 15:4',
      '"Celui qui mange ma chair et boit mon sang a la vie éternelle." — Jean 6:54',
    ],
    'msg.pledgeOk':    'Votre heure a été enregistrée.',
    'msg.pledgeErr':   "Échec de l'enregistrement. Réessayez.",
    'msg.contactOk':   'Message envoyé. À bientôt.',
    'msg.contactErr':  'Échec. Réessayez plus tard.',
    'msg.chapelOk':    'Merci ! Votre chapelle apparaîtra après vérification.',
    'msg.chapelErr':   'Échec. Vérifiez les coordonnées.',
    'msg.noResults':   'Aucun résultat',
    'msg.noNearby':    'Aucune chapelle dans un rayon de 80 km.',
    'msg.perpetual':   'Adoration Perpétuelle (24/7)',
    'msg.directions':  'Itinéraire',
  },

  it: {
    'btn.start':       'Inizia Adorazione',
    'btn.nearby':      'Cappella Vicina',
    'btn.pledge':      'Impegnare un\'ora',
    'btn.addChapel':   'Aggiungi Cappella',
    'btn.musicPlay':   'Riproduci musica',
    'btn.musicPause':  'Metti in pausa',
    'site.subtitle':   'Adorazione Eucaristica nel Mondo',
    'search.placeholder': 'Cerca per città, paese o nome cappella…',
    'stats.chapels':   'Cappelle nel mondo',
    'stats.pledged':   'Ore impegnate',
    'stats.countries': 'Paesi',
    'stats.perpetual': 'Preghiera perpetua',
    'live.eyebrow':    'In diretta · 24/7',
    'live.title':      'Adorazione <em>in corso</em>',
    'live.subhead':    '"Non siete riusciti a vegliare un\'ora con me?" — Matteo 26:40',
    'live.placeholder':"Scorri per iniziare l'Adorazione",
    'live.credit':     'Trasmissione offerta da EWTN',
    'nearby.heading':  'Adorazione vicino a te',
    'pledge.title':    "Impegnati per un'ora di preghiera",
    'pledge.subhead':  '"Non siete riusciti a vegliare un\'ora con me?" — Matteo 26:40',
    'pledge.name':     'Il tuo nome',
    'pledge.email':    'Email (opzionale — per promemoria)',
    'pledge.intention':'La tua intenzione di preghiera (opzionale)',
    'pledge.submit':   'Impegna la mia ora',
    'pledge.thanks':   "Grazie. La tua ora è registrata. Unisciti agli adoratori del mondo all'ora stabilita.",
    'mission.eyebrow': 'La Nostra Missione',
    'mission.title':   "Un'ora.<br><em>Uniti nel mondo.</em>",
    'mission.statement': "Aiutiamo le persone in tutto il mondo a impegnarsi per un'ora di Adorazione Eucaristica e a unirsi nella preghiera.",
    'mission.body':    "Nostro Signore chiese ai suoi discepoli nel Getsemani: <em>\"Non siete riusciti a vegliare un'ora con me?\"</em> Questa piattaforma esiste per rendere quell'ora più semplice — trovare una cappella, impegnare il tuo tempo, e unirti a una famiglia mondiale di adoratori davanti al Santissimo Sacramento.",
    'saint1.name':     'San Pier Giuliano Eymard',
    'saint1.quote':    "\"L'Eucaristia è il cuore di Gesù aperto a noi.\"",
    'saint2.name':     'San Tarcisio',
    'saint2.quote':    'Martire morto proteggendo il Santissimo Sacramento, c. 257 d.C.',
    'saint3.name':     'Beato Carlo Acutis',
    'saint3.quote':    "\"L'Eucaristia è la mia autostrada per il Cielo.\"",
    'how.eyebrow':     'Come Funziona',
    'how.title':       "Quattro passi per iniziare",
    'how.step1.title': 'Trova una cappella',
    'how.step1.body':  "Usa la mappa per trovare una cappella vicino a te che offre l'Adorazione Eucaristica.",
    'how.step2.title': 'Arriva e fai silenzio',
    'how.step2.body':  "Il Santissimo Sacramento è esposto sull'altar. Siediti, inginocchiati o stai in piedi alla presenza di Gesù. Nessuna esperienza richiesta.",
    'how.step3.title': 'Prega la tua ora',
    'how.step3.body':  "Dedica tempo alla preghiera silenziosa, leggi la Scrittura, prega il Rosario, o semplicemente riposa nella Sua presenza. Un'ora è l'impegno tradizionale.",
    'how.step4.title': 'Uniti nel mondo',
    'how.step4.body':  'Impegna la tua ora e unisciti a migliaia di adoratori nel mondo che pregano davanti al Santissimo ogni ora di ogni giorno.',
    'tst.eyebrow':     'Dagli adoratori',
    'tst.title':       'Storie di grazia',
    'tst1.text':       "\"Ho iniziato con un'ora a settimana e ha trasformato il mio matrimonio. Non si può spiegare — solo vivere.\"",
    'tst1.author':     '— Maria, Filippine',
    'tst2.text':       "\"Durante l'anno più difficile della mia vita, quell'ora ogni giovedì è stata l'unica cosa che mi ha mantenuto sano e pieno di speranza.\"",
    'tst2.author':     '— James, Irlanda',
    'tst3.text':       "\"Ho trovato questo sito cercando a tarda notte. Qualcosa è cambiato in me in quell'ora.\"",
    'tst3.author':     '— Anonimo, USA',
    'rsc.eyebrow':     'Approfondisci',
    'rsc.title':       "Risorse sull'Adorazione Eucaristica",
    'rsc1.title':      'Miracoli eucaristici',
    'rsc1.sub':        'Beato Carlo Acutis — miracoli documentati nel mondo',
    'rsc2.title':      'Mysterium Fidei',
    'rsc2.sub':        'Papa Paolo VI — sul mistero della fede',
    'rsc3.title':      'Sacramentum Caritatis',
    'rsc3.sub':        'Papa Benedetto XVI — sacramento della carità',
    'rsc4.title':      'Risveglio Eucaristico Nazionale',
    'rsc4.sub':        'USA — rinnovare la fede nella Presenza Reale',
    'rsc5.title':      'Devozione eucaristica',
    'rsc5.sub':        'USCCB — guide e risorse devozionali',
    'rsc6.title':      'Adorazione perpetua',
    'rsc6.sub':        "EWTN — insegnamento cattolico sulla Santa Eucaristia",
    'contact.eyebrow': 'Mettiti in contatto',
    'contact.title':   'Contattaci',
    'contact.intro':   'Domande, segnalazione di cappelle o richieste di collaborazione — saremo felici di sentirti.',
    'contact.name':    'Il tuo nome',
    'contact.email':   'La tua email',
    'contact.message': 'Il tuo messaggio',
    'contact.send':    'Invia',
    'contact.sending': 'Invio…',
    'footer.missionTitle': 'La Nostra Missione',
    'footer.quickLinks':   'Link rapidi',
    'footer.findChapel':   'Trova una cappella',
    'footer.pledgeLink':   'Impegna la tua ora',
    'footer.addChapelLink':'Aggiungi una cappella',
    'footer.contactLink':  'Contattaci',
    'footer.resourcesH':   'Risorse',
    'footer.languageH':    'Lingua',
    'footer.shareH':       'Condividi',
    'footer.shareIntro':   'Invita altri a impegnare la loro ora',
    'footer.shareBtn':     'Condividi questo sito',
    'footer.bottom':       '© 2026 WouldYouJoinMeForOneHour.org · Costruito per la Gloria di Dio',
    'modal.addTitle':  'Aggiungi una cappella',
    'modal.addSub':    'Aiuta la comunità mondiale di adorazione a crescere aggiungendo la tua cappella.',
    'modal.chapelName':'Nome della cappella',
    'modal.city':      'Città',
    'modal.country':   'Paese',
    'modal.yourEmail': 'La tua email (opzionale)',
    'modal.lat':       'Latitudine (es. 51.5074)',
    'modal.lng':       'Longitudine (es. -0.1278)',
    'modal.address':   'Indirizzo (opzionale)',
    'modal.schedule':  'Orari di adorazione (es. Lun–Ven 7–19)',
    'modal.perpetual': 'Adorazione perpetua 24/7',
    'modal.submitChapel': 'Invia',
    'modal.note':      'Le richieste vengono verificate prima di apparire sulla mappa.',
    'map.caption': '"Dal sorgere del sole al suo tramonto, grande è il mio nome fra le genti,"',
    'map.cite': '— Malachia 1:11',
    'count.preface': 'In questa ora,',
    'count.chapels': 'cappelle',
    'count.across': 'in',
    'count.countries': 'paesi',
    'count.shelter': 'custodiscono il Santissimo Sacramento,',
    'count.held': 'e',
    'count.heldEnd': 'ore sono state impegnate in preghiera.',
    'mission.aside': '"L\'Eucaristia è il cuore di Gesù aperto a noi."',
    'mission.asideAuthor': '— San Pier Giuliano Eymard',
    'mission.coda': 'Non stiamo costruendo un movimento. Ci stiamo unendo a uno — più antico di noi, più grande di noi, e che ancora risponde alla domanda che Gesù pose per la prima volta nel giardino.',
    'rsc1.author': 'Beato Carlo Acutis · Mostra Internazionale',
    'rsc2.author': 'Papa Paolo VI · 1965',
    'rsc3.author': 'Papa Benedetto XVI · 2007',
    'rsc4.author': 'USA · In corso',
    'rsc5.author': 'USCCB',
    'rsc6.author': 'EWTN',
    'hero.eyebrow': 'Adorazione Eucaristica nel Mondo',
    'hero.verse': '"Non siete riusciti a vegliare un\'ora con me?" — Matteo 26:40',
    'featured.statement': "Gesù Cristo è veramente presente, ci aspetta.",
    'featured.caption': '— Santuario della Divina Misericordia, Cracovia, Polonia',
    'hero.attribution': "Foto per gentile concessione delle parrocchie St. Anthony e St. Mary, Menomonee Falls, WI · Ostensorio San Giovanni Paolo II in prestito da ARISE MKE",
    verses: [
      '"Non siete riusciti a vegliare un\'ora con me?" — Matteo 26:40',
      '"Fermatevi e sappiate che io sono Dio." — Salmo 46:10',
      '"Io sono il pane della vita." — Giovanni 6:35',
      '"Rimanete in me e io in voi." — Giovanni 15:4',
      '"Chi mangia la mia carne e beve il mio sangue ha la vita eterna." — Giovanni 6:54',
    ],
    'msg.pledgeOk':    'La tua ora è stata registrata.',
    'msg.pledgeErr':   'Impossibile registrare. Riprova.',
    'msg.contactOk':   'Messaggio inviato. Ti contatteremo presto.',
    'msg.contactErr':  'Errore. Riprova più tardi.',
    'msg.chapelOk':    'Grazie! La cappella apparirà dopo revisione.',
    'msg.chapelErr':   'Errore. Controlla le coordinate.',
    'msg.noResults':   'Nessun risultato',
    'msg.noNearby':    'Nessuna cappella entro 80 km.',
    'msg.perpetual':   'Adorazione Perpetua (24/7)',
    'msg.directions':  'Indicazioni',
  },

  pt: {
    'btn.start':       'Iniciar Adoração',
    'btn.nearby':      'Capela Próxima',
    'btn.pledge':      'Comprometer uma hora',
    'btn.addChapel':   'Adicionar Capela',
    'btn.musicPlay':   'Tocar música',
    'btn.musicPause':  'Pausar música',
    'site.subtitle':   'Adoração Eucarística no Mundo',
    'search.placeholder': 'Pesquisar por cidade, país ou nome da capela…',
    'stats.chapels':   'Capelas no mundo',
    'stats.pledged':   'Horas comprometidas',
    'stats.countries': 'Países',
    'stats.perpetual': 'Oração perpétua',
    'live.eyebrow':    'Ao vivo · 24/7',
    'live.title':      'Adoração <em>em curso</em>',
    'live.subhead':    '"Não pudestes vigiar uma hora comigo?" — Mateus 26:40',
    'live.placeholder':'Role para começar a Adoração',
    'live.credit':     'Transmissão cortesia da EWTN',
    'nearby.heading':  'Adoração perto de si',
    'pledge.title':    'Comprometa-se com uma hora de oração',
    'pledge.subhead':  '"Não pudestes vigiar uma hora comigo?" — Mateus 26:40',
    'pledge.name':     'O seu nome',
    'pledge.email':    'E-mail (opcional — para lembrete)',
    'pledge.intention':'A sua intenção de oração (opcional)',
    'pledge.submit':   'Comprometer a minha hora',
    'pledge.thanks':   'Obrigado. A sua hora foi registada. Junte-se aos adoradores do mundo na hora marcada.',
    'mission.eyebrow': 'A Nossa Missão',
    'mission.title':   'Uma hora.<br><em>Unidos no mundo.</em>',
    'mission.statement': 'Ajudar pessoas em todo o mundo a comprometerem-se com uma hora de Adoração Eucarística e a unirem-se em oração.',
    'mission.body':    'O Nosso Senhor perguntou aos seus discípulos no Jardim do Getsémani: <em>"Não pudestes vigiar uma hora comigo?"</em> Esta plataforma existe para tornar essa hora mais fácil — encontrar uma capela, comprometer o seu tempo e juntar-se a uma família mundial de adoradores diante do Santíssimo Sacramento.',
    'saint1.name':     'São Pedro Juliano Eymard',
    'saint1.quote':    '"A Eucaristia é o coração de Jesus aberto a nós."',
    'saint2.name':     'São Tarcísio',
    'saint2.quote':    'Mártir que morreu protegendo o Santíssimo Sacramento, c. 257 d.C.',
    'saint3.name':     'Beato Carlo Acutis',
    'saint3.quote':    '"A Eucaristia é a minha autoestrada para o Céu."',
    'how.eyebrow':     'Como Funciona',
    'how.title':       "Quatro passos para começar",
    'how.step1.title': 'Encontre uma capela',
    'how.step1.body':  'Use o mapa para localizar uma capela perto de si que oferece Adoração Eucarística.',
    'how.step2.title': 'Chegue e fique em silêncio',
    'how.step2.body':  'O Santíssimo Sacramento está exposto no altar. Simplesmente sente-se, ajoelhe-se ou fique de pé na presença de Jesus. Nenhuma experiência é necessária.',
    'how.step3.title': 'Reze a sua hora',
    'how.step3.body':  'Passe tempo em oração silenciosa, leia a Escritura, reze o Terço ou simplesmente descanse na Sua presença. Uma hora é o compromisso tradicional.',
    'how.step4.title': 'Unidos no mundo',
    'how.step4.body':  'Comprometa a sua hora e junte-se a milhares de adoradores no mundo que rezam diante do Santíssimo a cada hora de cada dia.',
    'tst.eyebrow':     'Dos adoradores',
    'tst.title':       'Histórias de graça',
    'tst1.text':       '"Comecei com uma hora por semana e transformou o meu casamento. Não há explicação — apenas vivência."',
    'tst1.author':     '— Maria, Filipinas',
    'tst2.text':       '"Durante o ano mais difícil da minha vida, aquela hora de quinta-feira foi a única coisa que me manteve são e esperançoso."',
    'tst2.author':     '— James, Irlanda',
    'tst3.text':       '"Encontrei este site pesquisando tarde da noite. Algo mudou em mim naquela hora."',
    'tst3.author':     '— Anónimo, EUA',
    'rsc.eyebrow':     'Aprofundar',
    'rsc.title':       'Recursos sobre a Adoração Eucarística',
    'rsc1.title':      'Milagres eucarísticos',
    'rsc1.sub':        'Beato Carlo Acutis — milagres documentados no mundo',
    'rsc2.title':      'Mysterium Fidei',
    'rsc2.sub':        'Papa Paulo VI — sobre o mistério da fé',
    'rsc3.title':      'Sacramentum Caritatis',
    'rsc3.sub':        'Papa Bento XVI — sacramento da caridade',
    'rsc4.title':      'Renovação Eucarística Nacional',
    'rsc4.sub':        'EUA — renovando a fé na Presença Real',
    'rsc5.title':      'Devoção eucarística',
    'rsc5.sub':        'USCCB — guias e recursos devocionais',
    'rsc6.title':      'Adoração perpétua',
    'rsc6.sub':        'EWTN — ensino católico sobre a Santa Eucaristia',
    'contact.eyebrow': 'Entre em contacto',
    'contact.title':   'Contacte-nos',
    'contact.intro':   'Dúvidas, sugestões de capelas ou propostas de parceria — ficaremos felizes em ouvi-lo.',
    'contact.name':    'O seu nome',
    'contact.email':   'O seu e-mail',
    'contact.message': 'A sua mensagem',
    'contact.send':    'Enviar',
    'contact.sending': 'A enviar…',
    'footer.missionTitle': 'A Nossa Missão',
    'footer.quickLinks':   'Links rápidos',
    'footer.findChapel':   'Encontrar uma capela',
    'footer.pledgeLink':   'Comprometer a sua hora',
    'footer.addChapelLink':'Adicionar uma capela',
    'footer.contactLink':  'Contacte-nos',
    'footer.resourcesH':   'Recursos',
    'footer.languageH':    'Idioma',
    'footer.shareH':       'Partilhar',
    'footer.shareIntro':   'Convide outros a comprometer a sua hora',
    'footer.shareBtn':     'Partilhar este site',
    'footer.bottom':       '© 2026 WouldYouJoinMeForOneHour.org · Construído para a Glória de Deus',
    'modal.addTitle':  'Adicionar uma capela',
    'modal.addSub':    'Ajude a comunidade mundial de adoração a crescer adicionando a sua capela.',
    'modal.chapelName':'Nome da capela',
    'modal.city':      'Cidade',
    'modal.country':   'País',
    'modal.yourEmail': 'O seu e-mail (opcional)',
    'modal.lat':       'Latitude (ex. 51.5074)',
    'modal.lng':       'Longitude (ex. -0.1278)',
    'modal.address':   'Endereço (opcional)',
    'modal.schedule':  'Horário de adoração (ex. Seg–Sex 7h–19h)',
    'modal.perpetual': 'Adoração perpétua 24/7',
    'modal.submitChapel': 'Enviar',
    'modal.note':      'As submissões são revistas antes de aparecerem no mapa.',
    'map.caption': '"Desde o nascer do sol até ao seu ocaso, grande é o meu nome entre as nações,"',
    'map.cite': '— Malaquias 1:11',
    'count.preface': 'Nesta hora,',
    'count.chapels': 'capelas',
    'count.across': 'em',
    'count.countries': 'países',
    'count.shelter': 'guardam o Santíssimo Sacramento,',
    'count.held': 'e',
    'count.heldEnd': 'horas foram comprometidas em oração.',
    'mission.aside': '"A Eucaristia é o coração de Jesus aberto a nós."',
    'mission.asideAuthor': '— São Pedro Juliano Eymard',
    'mission.coda': 'Não estamos a construir um movimento. Estamos a juntar-nos a um — mais antigo do que nós, maior do que nós, e que ainda responde à pergunta que Jesus fez pela primeira vez no jardim.',
    'rsc1.author': 'Beato Carlo Acutis · Exposição Internacional',
    'rsc2.author': 'Papa Paulo VI · 1965',
    'rsc3.author': 'Papa Bento XVI · 2007',
    'rsc4.author': 'EUA · Em curso',
    'rsc5.author': 'USCCB',
    'rsc6.author': 'EWTN',
    'hero.eyebrow': 'Adoração Eucarística no Mundo',
    'hero.verse': '"Não pudestes vigiar uma hora comigo?" — Mateus 26:40',
    'featured.statement': "Jesus Cristo está verdadeiramente presente, esperando por nós.",
    'featured.caption': '— Santuário da Divina Misericórdia, Cracóvia, Polónia',
    'hero.attribution': "Foto cortesia das paróquias St. Anthony e St. Mary, Menomonee Falls, WI · Custódia São João Paulo II por empréstimo da ARISE MKE",
    verses: [
      '"Não pudestes vigiar uma hora comigo?" — Mateus 26:40',
      '"Aquietai-vos e sabei que eu sou Deus." — Salmo 46:10',
      '"Eu sou o pão da vida." — João 6:35',
      '"Permanecei em mim, e eu permanecerei em vós." — João 15:4',
      '"Quem come a minha carne e bebe o meu sangue tem a vida eterna." — João 6:54',
    ],
    'msg.pledgeOk':    'A sua hora foi registada.',
    'msg.pledgeErr':   'Não foi possível registar. Tente novamente.',
    'msg.contactOk':   'Mensagem enviada.',
    'msg.contactErr':  'Erro ao enviar. Tente mais tarde.',
    'msg.chapelOk':    'Obrigado! A capela aparecerá após revisão.',
    'msg.chapelErr':   'Erro. Verifique as coordenadas.',
    'msg.noResults':   'Sem resultados',
    'msg.noNearby':    'Nenhuma capela num raio de 80 km.',
    'msg.perpetual':   'Adoração Perpétua (24/7)',
    'msg.directions':  'Como chegar',
  },
};

const t = () => translations[state.currentLang] || translations.en;
const $ = id => document.getElementById(id);

/* ============ LANGUAGE ============ */
const LANG_KEY = 'wyjmfoh_lang';

function setLanguage(lang) {
  if (!translations[lang]) lang = 'en';
  state.currentLang = lang;
  const tr = t();

  document.documentElement.lang = lang;
  try { localStorage.setItem(LANG_KEY, lang); } catch {}

  const langSelect = $('languageSelect');
  if (langSelect && langSelect.value !== lang) langSelect.value = lang;

  // Plain text via data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (tr[key] !== undefined) el.textContent = tr[key];
  });

  // Allows <em>, <br>, etc. via data-i18n-html
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.dataset.i18nHtml;
    if (tr[key] !== undefined) el.innerHTML = tr[key];
  });

  // Placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (tr[key] !== undefined) el.placeholder = tr[key];
  });

  // Aria labels
  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    const key = el.dataset.i18nAria;
    if (tr[key] !== undefined) el.setAttribute('aria-label', tr[key]);
  });

  const verseEl = document.querySelector('.verse-track');
  if (verseEl && tr.verses) {
    verseEl.innerHTML = [...tr.verses, ...tr.verses]
      .join(' &nbsp;&nbsp;&nbsp;✦&nbsp;&nbsp;&nbsp; ');
  }

  updateMusicButton();
}

function detectInitialLanguage() {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved && translations[saved]) return saved;
  } catch {}
  const bl = (navigator.language || 'en').slice(0, 2).toLowerCase();
  if (translations[bl]) return bl;
  return 'en';
}

/* ============ MUSIC ============ */
function updateMusicButton() {
  if (!state.music || !state.musicBtn) return;
  const isPaused = state.music.paused;
  const iconEl = $('musicIcon');
  if (iconEl) {
    const useEl = iconEl.querySelector('use');
    if (useEl) useEl.setAttribute('href', isPaused ? '#orn-music' : '#orn-pause');
  }
  const ariaKey = isPaused ? 'btn.musicPlay' : 'btn.musicPause';
  state.musicBtn.setAttribute('aria-label', t()[ariaKey] || '');
  state.musicBtn.dataset.i18nAria = ariaKey;
}

function stopMusic() {
  if (state.music && !state.music.paused) {
    state.music.pause();
    updateMusicButton();
  }
}

/* ============ API ============ */
async function api(path, opts = {}) {
  const res = await fetch(CONFIG.apiBase + path, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  let data = null;
  try { data = await res.json(); } catch {}
  if (!res.ok) {
    const err = new Error(data?.error || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

/* ============ MAP ============ */
const physicalIcon = () => L.divIcon({
  className: 'custom-marker physical',
  html: '<div class="marker-circle physical-circle"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function chapelPopupHtml(c) {
  const tr = t();
  const loc = [c.city, c.country].filter(Boolean).join(', ');
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}`;
  return `
    <div class="popup-card">
      <strong>${escapeHtml(c.name)}</strong>
      <div class="popup-loc">${escapeHtml(c.address || loc)}</div>
      ${c.perpetual ? `<div class="popup-perpetual">${tr['msg.perpetual']}</div>` : ''}
      ${c.schedule ? `<div class="popup-schedule">${escapeHtml(c.schedule)}</div>` : ''}
      <a class="popup-directions" href="${directionsUrl}" target="_blank" rel="noopener">
        ${tr['msg.directions']}
      </a>
    </div>
  `;
}

function escapeHtml(s) {
  return String(s || '').replace(/[<>&"]/g, c => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;',
  }[c]));
}

function addChapelMarker(c) {
  if (!Number.isFinite(+c.lat) || !Number.isFinite(+c.lng)) return null;
  const marker = L.marker([+c.lat, +c.lng], { icon: physicalIcon() });
  marker.chapelData = c;
  marker.bindPopup(chapelPopupHtml(c));
  state.markersGroup.addLayer(marker);
  state.allMarkers.push(marker);
  return marker;
}

function buildLegend() {
  const legend = L.control({ position: 'bottomright' });
  legend.onAdd = () => {
    const div = L.DomUtil.create('div', 'map-legend');
    div.innerHTML = `
      <div class="legend-title">CHAPELS</div>
      <div class="legend-row"><span class="legend-dot legend-physical"></span>Adoration Chapel</div>
    `;
    return div;
  };
  return legend;
}

async function initMap() {
  state.map = L.map('map', { maxZoom: 18, minZoom: 2 }).setView([20, 0], 2);
  state.map.scrollWheelZoom.disable();

  // Marker clustering (handles 1 → 10,000 markers gracefully)
  state.markersGroup = L.markerClusterGroup({
    showCoverageOnHover: false,
    spiderfyOnMaxZoom: true,
    maxClusterRadius: 50,
  });
  state.map.addLayer(state.markersGroup);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
  }).addTo(state.map);

  state.map.on('click zoomstart dragstart', stopMusic);
  buildLegend().addTo(state.map);

  for (const c of state.chapels) addChapelMarker(c);

  initSearch();
}

/* ============ DATA LOAD ============ */
async function loadChapels() {
  try {
    const data = await api('/api/chapels');
    state.chapels = Array.isArray(data?.chapels) ? data.chapels : [];
  } catch (e) {
    console.warn('[chapels] load failed, falling back to empty list:', e);
    state.chapels = [];
  }
}

async function loadStats() {
  try {
    const s = await api('/api/stats');
    animateCount('statChapels', s.chapels || 0);
    animateCount('statCountries', s.countries || 0);
    animateCount('statPledged', s.pledges || 0);
  } catch (e) {
    console.warn('[stats] load failed:', e);
    // Fall back to client-side count from already-loaded chapels
    const cs = new Set(state.chapels.map(c => c.country).filter(Boolean));
    animateCount('statChapels', state.chapels.length);
    animateCount('statCountries', cs.size);
    animateCount('statPledged', 0);
  }
}

function animateCount(id, target) {
  const el = $(id);
  if (!el) return;
  let start = 0;
  const duration = 1200;
  const step = Math.max(target / (duration / 16), 1);
  const timer = setInterval(() => {
    start = Math.min(start + step, target);
    el.textContent = Math.floor(start).toLocaleString();
    if (start >= target) clearInterval(timer);
  }, 16);
}

/* ============ SEARCH ============ */
function initSearch() {
  const input = $('searchInput');
  const box = $('suggestions');
  if (!input || !box) return;

  const hideBox = () => { box.innerHTML = ''; box.classList.remove('visible'); };

  input.addEventListener('input', () => {
    const q = input.value.toLowerCase().trim();
    if (!q) { hideBox(); return; }

    const results = state.allMarkers
      .map(m => {
        const d = m.chapelData || {};
        return {
          marker: m,
          name: d.name || '',
          sub: [d.city, d.country].filter(Boolean).join(', '),
          searchText: `${d.name || ''} ${d.city || ''} ${d.country || ''} ${d.address || ''}`.toLowerCase(),
        };
      })
      .filter(item => item.searchText.includes(q))
      .slice(0, 10);

    if (!results.length) {
      box.innerHTML = `<div class="suggestion-item" style="color:var(--ink-faint);">${t()['msg.noResults']}</div>`;
      box.classList.add('visible');
      return;
    }

    box.innerHTML = results.map((r, i) => `
      <div class="suggestion-item" data-idx="${i}" role="option">
        <strong>${escapeHtml(r.name)}</strong>
        ${r.sub ? `<span style="color:var(--ink-faint);font-size:0.85em;font-style:italic;"> — ${escapeHtml(r.sub)}</span>` : ''}
      </div>
    `).join('');
    box.classList.add('visible');

    box.querySelectorAll('.suggestion-item').forEach((el, i) => {
      el.addEventListener('click', () => {
        const match = results[i]?.marker;
        if (!match) return;
        input.value = results[i].name;
        hideBox();
        const { lat, lng } = match.getLatLng();
        state.map.setView([lat, lng], 13);
        match.openPopup();
      });
    });
  });

  // Click outside the search wrapper to dismiss
  document.addEventListener('click', e => {
    if (!e.target.closest('.header-search')) hideBox();
  });
}

/* ============ PLAYER ============ */
function openLiveAdoration() {
  // Smooth-scroll to the embedded section instead of opening modal
  const section = $('liveAdoration');
  if (section) {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// Lazy-load the YouTube embed only when the user scrolls near it
function initLiveAdorationEmbed() {
  const frame = $('liveVideoFrame');
  if (!frame) return;

  let loaded = false;
  const load = () => {
    if (loaded) return;
    loaded = true;
    // muted=1 is required for autoplay; user can unmute via player controls
    // Note: we strip ?autoplay=1 from the config URL and rebuild with mute=1
    const url = new URL(CONFIG.liveAdorationUrl);
    url.searchParams.set('autoplay', '1');
    url.searchParams.set('mute', '1');
    url.searchParams.set('rel', '0');
    frame.innerHTML = `
      <iframe
        src="${url.toString()}"
        title="Live Eucharistic Adoration — EWTN"
        frameborder="0"
        allow="autoplay; encrypted-media; picture-in-picture"
        allowfullscreen
        loading="lazy"></iframe>
    `;
    stopMusic();
  };

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          load();
          io.disconnect();
        }
      }
    }, { rootMargin: '200px' });
    io.observe(frame);
  } else {
    // Fallback: load after a short delay
    setTimeout(load, 1500);
  }
}

function closeLiveAdoration() {
  // Kept for backward compatibility — the modal still exists
  const modal = $('videoModal');
  const f = $('adorationFrame');
  if (modal) modal.style.display = 'none';
  if (f) f.src = '';
}

/* ============ NEARBY ============ */
function focusMarker(marker) {
  const { lat, lng } = marker.getLatLng();
  state.map.setView([lat, lng], 13);
  // Wait a tick for cluster spiderfy
  setTimeout(() => marker.openPopup(), 200);
}

// Add or move a "You are here" marker
let userLocationMarker = null;
function showUserLocation(lat, lng) {
  if (userLocationMarker) state.map.removeLayer(userLocationMarker);
  const icon = L.divIcon({
    className: 'user-location-marker',
    html: '<div class="user-pulse"></div><div class="user-dot"></div>',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
  userLocationMarker = L.marker([lat, lng], { icon, zIndexOffset: 1000 }).addTo(state.map);
}

function formatDistance(meters) {
  if (meters < 1000) return `${Math.round(meters)} m`;
  if (meters < 100000) return `${(meters / 1000).toFixed(1)} km`;
  return `${Math.round(meters / 1000).toLocaleString()} km`;
}

function initNearby() {
  const panel = $('nearbyPanel');
  if (!panel) return;

  const closePanel = () => panel.classList.add('hidden');

  // Close button
  $('nearbyClose')?.addEventListener('click', e => {
    e.stopPropagation();
    closePanel();
  });

  // Click outside the panel closes it (but not when clicking the trigger button itself)
  document.addEventListener('click', e => {
    if (panel.classList.contains('hidden')) return;
    if (e.target.closest('#nearbyPanel')) return;
    if (e.target.closest('#findChapel')) return;
    closePanel();
  });

  // Escape key closes it
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !panel.classList.contains('hidden')) closePanel();
  });

  $('findChapel')?.addEventListener('click', () => {
    const list = $('nearbyList');

    if (!navigator.geolocation) {
      panel.classList.remove('hidden');
      list.innerHTML = `<div class="nearby-empty">Geolocation is not supported by your browser.</div>`;
      panel.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    // Show loading state immediately
    panel.classList.remove('hidden');
    list.innerHTML = `<div class="nearby-empty">Finding your location…</div>`;
    panel.scrollIntoView({ behavior: 'smooth' });

    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude: lat, longitude: lng } = pos.coords;
        showUserLocation(lat, lng);

        if (!state.allMarkers.length) {
          list.innerHTML = `<div class="nearby-empty">No chapels are on the map yet.</div>`;
          return;
        }

        // Compute distance to every chapel, sort, take top 5 — no distance cap
        const sorted = state.allMarkers
          .map(m => {
            const ll = m.getLatLng();
            const dist = state.map.distance([lat, lng], [ll.lat, ll.lng]);
            return { m, dist, data: m.chapelData || {} };
          })
          .sort((a, b) => a.dist - b.dist)
          .slice(0, 5);

        const nearest = sorted[0];
        const isClose = nearest.dist < 80000; // 80 km

        // Frame the map: if nearest is close, fit both; otherwise just center on user
        if (isClose) {
          const userLL = L.latLng(lat, lng);
          const nearestLL = nearest.m.getLatLng();
          state.map.fitBounds(L.latLngBounds(userLL, nearestLL).pad(0.4), { maxZoom: 12 });
        } else {
          state.map.setView([lat, lng], 4);
        }

        // Build the list — header explains the result
        const header = isClose
          ? `<div class="nearby-header">Showing the ${sorted.length} closest chapels to you</div>`
          : `<div class="nearby-header">The nearest chapel is ${formatDistance(nearest.dist)} away. Showing the ${sorted.length} closest:</div>`;

        list.innerHTML = header;
        sorted.forEach(({ m, dist, data }) => {
          const item = document.createElement('div');
          item.className = 'nearby-item';
          const loc = [data.city, data.country].filter(Boolean).join(', ');
          item.innerHTML = `
            <div class="nearby-name">${escapeHtml(data.name || 'Chapel')}</div>
            ${loc ? `<div class="nearby-meta">${escapeHtml(loc)} · ${formatDistance(dist)}${data.perpetual ? ' · 24/7' : ''}</div>` : `<div class="nearby-meta">${formatDistance(dist)} away${data.perpetual ? ' · 24/7' : ''}</div>`}
          `;
          item.addEventListener('click', () => focusMarker(m));
          list.appendChild(item);
        });
      },
      err => {
        const messages = {
          1: 'Location access was denied. Please enable location in your browser settings and try again.',
          2: 'Your location could not be determined. Please check your internet connection.',
          3: 'Location request timed out. Please try again.',
        };
        list.innerHTML = `<div class="nearby-empty">${messages[err.code] || 'Could not get your location.'}</div>`;
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  });
}

/* ============ FORM HANDLERS ============ */
function showStatus(el, kind, msg) {
  if (!el) return;
  el.textContent = msg;
  el.style.color = kind === 'ok' ? '#a8d8a8' : kind === 'err' ? '#f08080' : '';
  el.hidden = !msg;
}

function initPledgeForm() {
  $('pledgeButton')?.addEventListener('click', () => {
    const section = $('pledge');
    section.classList.remove('hidden');
    section.style.display = 'block';
    section.scrollIntoView({ behavior: 'smooth' });
  });

  $('pledgeForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const err = $('pledgeError');
    const data = Object.fromEntries(new FormData(e.target));

    try {
      await api('/api/pledge', { method: 'POST', body: JSON.stringify(data) });
      e.target.style.display = 'none';
      $('thanks').classList.remove('hidden');
      // Refresh stats so the pledge count ticks up
      loadStats();
    } catch (ex) {
      showStatus(err, 'err', t()['msg.pledgeErr']);
    }
  });
}

function initContactForm() {
  $('contactBtn')?.addEventListener('click', e => {
    e.preventDefault();
    $('contactSection').scrollIntoView({ behavior: 'smooth' });
  });

  $('contactForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    const msg = $('contactMsg');
    const btn = $('contactSubmitBtn');
    const originalLabel = t()['contact.send'];

    btn.disabled = true;
    btn.innerText = t()['contact.sending'];
    showStatus(msg, null, '');

    try {
      await api('/api/contact', { method: 'POST', body: JSON.stringify(data) });
      showStatus(msg, 'ok', t()['msg.contactOk']);
      e.target.reset();
    } catch (ex) {
      showStatus(msg, 'err', t()['msg.contactErr']);
    } finally {
      btn.disabled = false;
      btn.innerText = originalLabel;
    }
  });
}

function initAddChapelForm() {
  const addBtn = $('addChapelBtn');
  const modal = $('addChapelModal');
  const closeBtn = $('closeAddChapel');
  const footerAdd = $('footerAddChapel');

  const open = () => { modal.style.display = 'flex'; };
  const close = () => { modal.style.display = 'none'; };

  addBtn?.addEventListener('click', open);
  footerAdd?.addEventListener('click', e => { e.preventDefault(); open(); });
  closeBtn?.addEventListener('click', close);

  $('chapelForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const err = $('chapelError');
    const fd = new FormData(e.target);
    const payload = {
      name: fd.get('name'),
      city: fd.get('city'),
      country: fd.get('country'),
      address: fd.get('address') || null,
      schedule: fd.get('schedule') || null,
      submitter_email: fd.get('submitter_email') || null,
      lat: parseFloat(fd.get('lat')),
      lng: parseFloat(fd.get('lng')),
      perpetual: fd.get('perpetual') === 'yes',
    };

    if (!payload.name || !payload.city || !payload.country ||
        !Number.isFinite(payload.lat) || !Number.isFinite(payload.lng)) {
      showStatus(err, 'err', 'Please fill all required fields and valid coordinates.');
      return;
    }

    try {
      await api('/api/chapel', { method: 'POST', body: JSON.stringify(payload) });
      close();
      e.target.reset();
      alert(t()['msg.chapelOk']);
    } catch (ex) {
      showStatus(err, 'err', t()['msg.chapelErr']);
    }
  });

  // Close on backdrop click
  window.addEventListener('click', e => {
    if (e.target === modal) close();
  });
}

/* ============ SHARE ============ */
function initShare() {
  $('shareBtn')?.addEventListener('click', async () => {
    const data = {
      title: 'Would You Join Me for One Hour?',
      text: 'Find Eucharistic Adoration chapels near you and unite with adorers worldwide.',
      url: 'https://wouldyoujoinmeforonehour.org',
    };
    if (navigator.share) {
      try { await navigator.share(data); } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(data.url);
        alert('Link copied to clipboard!');
      } catch {
        prompt('Copy this link:', data.url);
      }
    }
  });
}

/* ============ INIT ============ */
/* ============ TESTIMONY ROTATOR ============ */
function initTestimony() {
  const quoteEl  = $('testimonyQuote');
  const authorEl = $('testimonyAuthor');
  const dots = document.querySelectorAll('.testimony-dot');
  if (!quoteEl || !authorEl || !dots.length) return;

  let current = 1;
  let timer = null;

  function show(n) {
    current = n;
    const tr = t();
    const text   = tr[`tst${n}.text`]   || '';
    const author = tr[`tst${n}.author`] || '';
    // Strip any surrounding quote marks — we render them as a separate ornament
    quoteEl.textContent  = text.replace(/^["']|["']$/g, '');
    quoteEl.dataset.i18n = `tst${n}.text`;
    authorEl.textContent  = author;
    authorEl.dataset.i18n = `tst${n}.author`;
    dots.forEach((d, i) => d.classList.toggle('active', i + 1 === n));
  }

  function next() { show(current === 3 ? 1 : current + 1); }

  function start() { stop(); timer = setInterval(next, 9000); }
  function stop()  { if (timer) clearInterval(timer); timer = null; }

  dots.forEach(d => d.addEventListener('click', () => {
    show(parseInt(d.dataset.tst, 10));
    start(); // reset timer on manual nav
  }));

  // Pause auto-advance when out of view
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => e.isIntersecting ? start() : stop());
  });
  obs.observe(quoteEl.closest('.testimony-section') || quoteEl);
}

document.addEventListener('DOMContentLoaded', async () => {
  // Music
  state.music = $('bgMusic');
  state.musicBtn = $('musicToggle');

  if (state.music) {
    state.music.volume = 0.35;
    state.music.addEventListener('error', () => {
      console.warn('[music] Audio file failed to load. Check that "204-stay with me.mp3" exists at the site root.');
    });
  }

  state.musicBtn?.addEventListener('click', e => {
    e.stopPropagation();
    if (!state.music) return;
    if (state.music.paused) {
      state.music.play()
        .then(() => updateMusicButton())
        .catch(err => {
          console.error('[music] play failed:', err);
          alert('Could not start music. The audio file may be missing — check that "204-stay with me.mp3" is uploaded.');
        });
    } else {
      state.music.pause();
      updateMusicButton();
    }
  });

  // Language
  setLanguage(detectInitialLanguage());
  $('languageSelect')?.addEventListener('change', e => setLanguage(e.target.value));

  // Start Adoration → single EWTN stream
  $('startAdoration')?.addEventListener('click', openLiveAdoration);
  $('closeModal')?.addEventListener('click', closeLiveAdoration);
  window.addEventListener('click', e => {
    if (e.target === $('videoModal')) closeLiveAdoration();
  });

  // Forms
  initPledgeForm();
  initContactForm();
  initAddChapelForm();
  initShare();

  // Live Adoration embed (lazy-loaded when scrolled into view)
  initLiveAdorationEmbed();

  // Testimony rotator
  initTestimony();

  // Load data, then build map and stats in parallel
  await loadChapels();
  await initMap();
  initNearby();
  loadStats();
});
