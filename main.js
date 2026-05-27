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
    'rsc1.author': 'St. Carlo Acutis · International Exhibition',
    'rsc2.author': 'Pope Paul VI · 1965',
    'rsc3.author': 'Pope Benedict XVI · 2007',
    'rsc4.author': 'USA · Ongoing',
    'rsc5.author': 'USCCB',
    'rsc6.author': 'EWTN',
    'hero.eyebrow': 'Eucharistic Adoration Worldwide',
    'hero.verse': '"Could you not watch with me one hour?" — Matthew 26:40',
    'hero.attribution': "Photo courtesy of St. Anthony &amp; St. Mary Parishes, Menomonee Falls, WI",
    'nearby.loading': 'Finding your location…',
    'nearby.noGeo': 'Geolocation is not supported by your browser.',
    'nearby.empty': 'No chapels are on the map yet.',
    'nearby.headerClose': 'Showing the {n} closest chapels to you',
    'nearby.headerFar': 'The nearest chapel is {d} away. Showing the {n} closest:',
    'nearby.geoDenied': 'Location access was denied. Please enable location in your browser settings and try again.',
    'nearby.geoUnavailable': 'Your location could not be determined. Please check your internet connection.',
    'nearby.geoTimeout': 'Location request timed out. Please try again.',
    'nearby.geoError': 'Could not get your location.',
    'nearby.away': '{d} away',
    'nav.home': "Home",
    'nav.about': "About",
    'nav.pledge': "Pledge an Hour",
    'nav.contact': "Contact",
    'about.eyebrow': "About",
    'about.title': "On Eucharistic Adoration <em>&amp; This Work</em>",
    'about.subhead': "\"Could you not watch with me one hour?\" — Matthew 26:40",
    'about.lead1': "<em>Eucharistic Adoration is the practice of praying before the consecrated Host — the true Body and Blood of Jesus Christ, exposed in a sacred vessel called a monstrance, set upon the altar of a Catholic church or chapel.</em>",
    'about.body1': "For Catholics, the Eucharist is not a symbol or a remembrance. It is the Real Presence of Christ — the same Lord who walked the roads of Galilee, who taught in the synagogue, who suffered on the Cross and rose on the third day. To kneel before the Blessed Sacrament is to keep company with Him, just as Peter, James, and John were asked to keep company in the garden of Gethsemane.",
    'about.body2': "The practice is ancient. The early Church reserved the consecrated Host so it could be brought to the sick. By the Middle Ages, Christians began to spend time in silent prayer before the reserved Eucharist. From these roots grew the tradition of public Adoration — and, in many parishes worldwide, the practice of perpetual Adoration, in which the Blessed Sacrament is exposed continuously, day and night, with adorers signed up for every hour.",
    'about.body3': "There is no script. People come and sit, kneel, read Scripture, pray the Rosary, or simply rest in the silence. Saints have called it \"the school of the heart.\" Whatever you bring — joy, sorrow, distraction, doubt — you bring to a Lord who is really there.",
    'about.missionEyebrow': "This Work",
    'about.missionTitle': "Why This Site <em>Exists</em>",
    'about.missionBody1': "This platform exists for one purpose: to make the question Jesus asked in the garden easier to answer. <em>\"Could you not watch with me one hour?\"</em>",
    'about.missionBody2': "It is a directory of Eucharistic Adoration chapels around the world, a place to pledge an hour of prayer, and — through the live stream and the worldwide map — a quiet reminder that you are not alone. At any given hour, somewhere on the earth, the Blessed Sacrament is exposed and a brother or sister in Christ is kneeling before it.",
    'about.saintsEyebrow': "A Cloud of Witnesses",
    'about.saintsTitle': "Those Who Came Before",
    'about.ctaLine': "Will you join us?",
    'about.ctaFind': "Find a Chapel",
    'about.ctaPledge': "Pledge an Hour",
    'saint1.context': "Founder of the Congregation of the Blessed Sacrament. Spent his life promoting devotion to the Real Presence.",
    'saint2.context': "A young acolyte who chose death rather than surrender the consecrated Host. Patron of first communicants.",
    'saint3.context': "A teenage Italian computer programmer canonized in 2025. Catalogued Eucharistic miracles around the world.",
    'footer.benedictQuote': "\"God is waiting for us in Jesus Christ in the Blessed Sacrament. Let us not keep Him waiting in vain!\"",
    'footer.benedictAuthor': "— Pope Benedict XVI",
    'nav.streams': "Live Streams",
    'streams.eyebrow': "Live Adoration",
    'streams.title': "Adoration <em>Streamed Worldwide</em>",
    'streams.subhead': "A curated list of live Eucharistic Adoration broadcasts you can join from anywhere, at any hour.",
    'streams.featuredEyebrow': "Featured · Now Live",
    'streams.featuredTitle': "EWTN · 24/7 Live Adoration",
    'streams.featuredSub': "From the EWTN Chapel in Irondale, Alabama (9 am – 5 pm ET) and St. Maximilian Kolbe Chapel in Niepokalanów, Poland.",
    'streams.featuredCredit': "Stream courtesy of EWTN",
    'streams.moreEyebrow': "More Live Streams",
    'streams.moreTitle': "Other Broadcasters",
    'streams.shalomSource': "Shalom Media · Global · 24/7",
    'streams.shalomDesc': "A dedicated prayer channel from Shalom World offering Eucharistic Adoration, Holy Mass, the Rosary, and the Divine Mercy Chaplet around the clock.",
    'streams.watchOnYoutube': "Watch on YouTube",
    'streams.suggestTitle': "Know a stream we should add?",
    'streams.suggestDesc': "If you know of a legitimate Catholic live Adoration stream we should include, please write to us. We review each submission carefully before adding it.",
    'streams.suggestCta': "Suggest a Stream →",
    'companion.label': "Where will you pray?",
    'companion.optional': "(optional)",
    'companion.tabNone': "No destination yet",
    'companion.tabChapel': "A chapel",
    'companion.tabStream': "A live stream",
    'companion.chapelSearchPh': "Search by city, country, or chapel name",
    'map.openNowLabel': "Open right now",
    'map.openNow': "Open now",
    'map.checkSchedule': "Check schedule",
    'modal.contactSection': "Your Contact Information",
    'modal.parishSection': "Parish Information",
    'modal.addressFull': "Full street address (e.g. 123 Main St, Springfield, IL, USA)",
    'modal.findOnMap': "Find on Map",
    'modal.dragPinHint': "Drag the pin to fine-tune the chapel's location.",
    'modal.addressTooShort': "Please enter a more complete address.",
    'modal.findingAddress': "Finding address on map…",
    'modal.addressNotFound': "Address not found. Please be more specific.",
    'modal.addressFound': "Location found! Drag the pin if needed.",
    'modal.geocodeError': "Could not find that address.",
    'modal.timesSection': "Adoration Times",
    'modal.timesHint': "When is the Blessed Sacrament exposed? Add a row per regular time.",
    'modal.addAnotherTime': "+ Add another time",
    'modal.codeRequired': "A code is required to access this chapel (visitors must contact the parish)",
    'modal.freq': "Frequency",
    'modal.day': "Day",
    'modal.startTime': "Start",
    'modal.endTime': "End",
    'modal.missingFields': "Please complete all required fields.",
    'modal.confirmLocation': 'Please click "Find on Map" first to confirm the location.',
    'msg.codeRequired': "Code required — contact the parish for access",
    'msg.variousTimes': "Various times — contact parish",
    'map.closedNow': "Closed now",
    'day.sun': "Sun",
    'day.mon': "Mon",
    'day.tue': "Tue",
    'day.wed': "Wed",
    'day.thu': "Thu",
    'day.fri': "Fri",
    'day.sat': "Sat",
    'modal.fromDay': "From day",
    'modal.toDay': "To day",
    'modal.notesSection': "Additional Notes",
    'modal.notesHint': 'Anything else visitors should know? For example: "Adoration starts after the 8:30 AM Mass" or "Closed during Holy Week."',
    'modal.notesLabel': "Notes",
    'modal.notesPh': "Optional notes about hours, access, or special arrangements",
    'msg.daily': "Daily",
    'msg.note': "Note",
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
    'rsc1.author': 'San Carlo Acutis · Exposición Internacional',
    'rsc2.author': 'Papa Pablo VI · 1965',
    'rsc3.author': 'Papa Benedicto XVI · 2007',
    'rsc4.author': 'EE. UU. · En curso',
    'rsc5.author': 'USCCB',
    'rsc6.author': 'EWTN',
    'hero.eyebrow': 'Adoración Eucarística en Todo el Mundo',
    'hero.verse': '"¿No habéis podido velar conmigo una hora?" — Mateo 26:40',
    'hero.attribution': "Foto cortesía de las parroquias St. Anthony y St. Mary, Menomonee Falls, WI",
    'nearby.loading': 'Buscando tu ubicación…',
    'nearby.noGeo': 'Tu navegador no admite geolocalización.',
    'nearby.empty': 'Aún no hay capillas en el mapa.',
    'nearby.headerClose': 'Mostrando las {n} capillas más cercanas a ti',
    'nearby.headerFar': 'La capilla más cercana está a {d}. Mostrando las {n} más cercanas:',
    'nearby.geoDenied': 'Se denegó el acceso a la ubicación. Habilita la ubicación en tu navegador e inténtalo de nuevo.',
    'nearby.geoUnavailable': 'No se pudo determinar tu ubicación. Comprueba tu conexión a internet.',
    'nearby.geoTimeout': 'La solicitud de ubicación tardó demasiado. Inténtalo de nuevo.',
    'nearby.geoError': 'No se pudo obtener tu ubicación.',
    'nearby.away': 'a {d}',
    'nav.home': "Inicio",
    'nav.about': "Acerca de",
    'nav.pledge': "Prometer una hora",
    'nav.contact': "Contacto",
    'about.eyebrow': "Acerca de",
    'about.title': "Sobre la Adoración Eucarística <em>y esta obra</em>",
    'about.subhead': "\"¿No habéis podido velar conmigo una hora?\" — Mateo 26:40",
    'about.lead1': "<em>La Adoración Eucarística es la práctica de orar ante la Hostia consagrada — el verdadero Cuerpo y Sangre de Jesucristo, expuesta en un vaso sagrado llamado custodia, colocado sobre el altar de una iglesia o capilla católica.</em>",
    'about.body1': "Para los católicos, la Eucaristía no es un símbolo ni un recuerdo. Es la Presencia Real de Cristo — el mismo Señor que caminó por los caminos de Galilea, que enseñó en la sinagoga, que sufrió en la Cruz y resucitó al tercer día. Arrodillarse ante el Santísimo Sacramento es hacerle compañía, como se pidió a Pedro, Santiago y Juan en el jardín de Getsemaní.",
    'about.body2': "La práctica es antigua. La Iglesia primitiva reservaba la Hostia consagrada para llevarla a los enfermos. En la Edad Media, los cristianos comenzaron a pasar tiempo en oración silenciosa ante la Eucaristía reservada. De estas raíces creció la tradición de la Adoración pública — y, en muchas parroquias del mundo, la práctica de la Adoración perpetua, en la que el Santísimo Sacramento se expone continuamente, día y noche, con adoradores inscritos para cada hora.",
    'about.body3': "No hay un guión. Las personas vienen y se sientan, se arrodillan, leen la Escritura, rezan el Rosario o simplemente descansan en el silencio. Los santos lo han llamado \"la escuela del corazón.\" Lo que sea que traigas — alegría, dolor, distracción, duda — lo traes a un Señor que está realmente presente.",
    'about.missionEyebrow': "Esta obra",
    'about.missionTitle': "¿Por qué <em>existe este sitio</em>?",
    'about.missionBody1': "Esta plataforma existe con un solo propósito: hacer más fácil responder a la pregunta que Jesús hizo en el jardín. <em>\"¿No habéis podido velar conmigo una hora?\"</em>",
    'about.missionBody2': "Es un directorio de capillas de Adoración Eucarística en todo el mundo, un lugar para prometer una hora de oración y — a través de la transmisión en vivo y el mapa mundial — un recordatorio silencioso de que no estás solo. En cualquier hora, en algún lugar de la tierra, el Santísimo Sacramento está expuesto y un hermano o hermana en Cristo está arrodillado ante Él.",
    'about.saintsEyebrow': "Una nube de testigos",
    'about.saintsTitle': "Aquellos que vinieron antes",
    'about.ctaLine': "¿Te unirás a nosotros?",
    'about.ctaFind': "Encontrar una capilla",
    'about.ctaPledge': "Prometer una hora",
    'saint1.context': "Fundador de la Congregación del Santísimo Sacramento. Dedicó su vida a promover la devoción a la Presencia Real.",
    'saint2.context': "Un joven acólito que prefirió la muerte antes que entregar la Hostia consagrada. Patrón de los primeros comulgantes.",
    'saint3.context': "Un programador italiano adolescente canonizado en 2025. Catalogó milagros eucarísticos en todo el mundo.",
    'footer.benedictQuote': "\"Dios nos espera en Jesucristo en el Santísimo Sacramento. ¡No le hagamos esperar en vano!\"",
    'footer.benedictAuthor': "— Papa Benedicto XVI",
    'nav.streams': "Transmisiones",
    'streams.eyebrow': "Adoración en Vivo",
    'streams.title': "Adoración <em>Transmitida al Mundo</em>",
    'streams.subhead': "Una lista curada de transmisiones en vivo de Adoración Eucarística a las que puedes unirte desde cualquier lugar, a cualquier hora.",
    'streams.featuredEyebrow': "Destacado · En vivo",
    'streams.featuredTitle': "EWTN · Adoración en vivo 24/7",
    'streams.featuredSub': "Desde la Capilla EWTN en Irondale, Alabama (9 am – 5 pm ET) y la Capilla de San Maximiliano Kolbe en Niepokalanów, Polonia.",
    'streams.featuredCredit': "Transmisión cortesía de EWTN",
    'streams.moreEyebrow': "Más transmisiones en vivo",
    'streams.moreTitle': "Otros canales",
    'streams.shalomSource': "Shalom Media · Mundial · 24/7",
    'streams.shalomDesc': "Un canal de oración dedicado de Shalom World que ofrece Adoración Eucarística, Santa Misa, el Rosario y la Coronilla de la Divina Misericordia las 24 horas.",
    'streams.watchOnYoutube': "Ver en YouTube",
    'streams.suggestTitle': "¿Conoces una transmisión que deberíamos añadir?",
    'streams.suggestDesc': "Si conoces una transmisión católica legítima de Adoración en vivo que deberíamos incluir, escríbenos. Revisamos cada propuesta cuidadosamente antes de añadirla.",
    'streams.suggestCta': "Sugerir una transmisión →",
    'companion.label': "¿Dónde rezarás?",
    'companion.optional': "(opcional)",
    'companion.tabNone': "Sin destino aún",
    'companion.tabChapel': "Una capilla",
    'companion.tabStream': "Una transmisión en vivo",
    'companion.chapelSearchPh': "Buscar por ciudad, país o nombre de capilla",
    'map.openNowLabel': "Abierto ahora",
    'map.openNow': "Abierto ahora",
    'map.checkSchedule': "Consultar horario",
    'modal.contactSection': "Tu información de contacto",
    'modal.parishSection': "Información de la parroquia",
    'modal.addressFull': "Dirección completa (ej. 123 Main St, Springfield, IL, USA)",
    'modal.findOnMap': "Buscar en el mapa",
    'modal.dragPinHint': "Arrastra el pin para ajustar la ubicación de la capilla.",
    'modal.addressTooShort': "Por favor ingresa una dirección más completa.",
    'modal.findingAddress': "Buscando la dirección en el mapa…",
    'modal.addressNotFound': "Dirección no encontrada. Sé más específico.",
    'modal.addressFound': "¡Ubicación encontrada! Arrastra el pin si es necesario.",
    'modal.geocodeError': "No se pudo encontrar esa dirección.",
    'modal.timesSection': "Horarios de Adoración",
    'modal.timesHint': "¿Cuándo se expone el Santísimo Sacramento? Agrega una fila por cada horario regular.",
    'modal.addAnotherTime': "+ Agregar otro horario",
    'modal.codeRequired': "Se requiere un código para acceder a esta capilla (contactar a la parroquia)",
    'modal.freq': "Frecuencia",
    'modal.day': "Día",
    'modal.startTime': "Inicio",
    'modal.endTime': "Fin",
    'modal.missingFields': "Por favor completa todos los campos requeridos.",
    'modal.confirmLocation': 'Haz clic en "Buscar en el mapa" primero para confirmar la ubicación.',
    'msg.codeRequired': "Se requiere código — contactar la parroquia para acceder",
    'msg.variousTimes': "Horarios variados — contactar parroquia",
    'map.closedNow': "Cerrado ahora",
    'day.sun': "Dom",
    'day.mon': "Lun",
    'day.tue': "Mar",
    'day.wed': "Mié",
    'day.thu': "Jue",
    'day.fri': "Vie",
    'day.sat': "Sáb",
    'modal.fromDay': "Desde el día",
    'modal.toDay': "Hasta el día",
    'modal.notesSection': "Notas adicionales",
    'modal.notesHint': '¿Algo más que los visitantes deberían saber? Por ejemplo: "La Adoración comienza después de la Misa de las 8:30 AM" o "Cerrado durante Semana Santa".',
    'modal.notesLabel': "Notas",
    'modal.notesPh': "Notas opcionales sobre horarios, acceso o arreglos especiales",
    'msg.daily': "Diariamente",
    'msg.note': "Nota",
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
    'saint3.name':     'St Carlo Acutis',
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
    'rsc1.author': 'St Carlo Acutis · Exposition Internationale',
    'rsc2.author': 'Pape Paul VI · 1965',
    'rsc3.author': 'Pape Benoît XVI · 2007',
    'rsc4.author': 'États-Unis · En cours',
    'rsc5.author': 'USCCB',
    'rsc6.author': 'EWTN',
    'hero.eyebrow': 'Adoration Eucharistique dans le Monde',
    'hero.verse': '"N\'avez-vous pas pu veiller une heure avec moi ?" — Matthieu 26:40',
    'hero.attribution': "Photo offerte par les paroisses St. Anthony &amp; St. Mary, Menomonee Falls, WI",
    'nearby.loading': 'Recherche de votre position…',
    'nearby.noGeo': "La géolocalisation n'est pas prise en charge par votre navigateur.",
    'nearby.empty': "Aucune chapelle n'est encore sur la carte.",
    'nearby.headerClose': 'Affichage des {n} chapelles les plus proches',
    'nearby.headerFar': 'La chapelle la plus proche est à {d}. Affichage des {n} plus proches :',
    'nearby.geoDenied': "L'accès à la localisation a été refusé. Activez la localisation dans votre navigateur et réessayez.",
    'nearby.geoUnavailable': "Votre position n'a pas pu être déterminée. Vérifiez votre connexion internet.",
    'nearby.geoTimeout': 'La demande de localisation a expiré. Réessayez.',
    'nearby.geoError': 'Impossible d\u0027obtenir votre position.',
    'nearby.away': 'à {d}',
    'nav.home': "Accueil",
    'nav.about': "À propos",
    'nav.pledge': "Promettre une heure",
    'nav.contact': "Contact",
    'about.eyebrow': "À propos",
    'about.title': "Sur l'Adoration eucharistique <em>et cette œuvre</em>",
    'about.subhead': "\"N'avez-vous pas pu veiller une heure avec moi ?\" — Matthieu 26:40",
    'about.lead1': "<em>L'Adoration eucharistique est la pratique de la prière devant l'Hostie consacrée — le vrai Corps et le vrai Sang de Jésus-Christ, exposé dans un vase sacré appelé ostensoir, placé sur l'autel d'une église ou d'une chapelle catholique.</em>",
    'about.body1': "Pour les catholiques, l'Eucharistie n'est ni un symbole ni un souvenir. C'est la Présence Réelle du Christ — le même Seigneur qui a parcouru les routes de Galilée, enseigné dans la synagogue, souffert sur la Croix et est ressuscité le troisième jour. S'agenouiller devant le Saint-Sacrement, c'est lui tenir compagnie, comme Pierre, Jacques et Jean ont été invités à le faire au jardin de Gethsémani.",
    'about.body2': "La pratique est ancienne. L'Église primitive réservait l'Hostie consacrée pour pouvoir l'apporter aux malades. Au Moyen Âge, les chrétiens ont commencé à passer du temps en prière silencieuse devant l'Eucharistie réservée. De ces racines est née la tradition de l'Adoration publique — et, dans de nombreuses paroisses à travers le monde, la pratique de l'Adoration perpétuelle, où le Saint-Sacrement est exposé en permanence, jour et nuit, avec des adorateurs inscrits pour chaque heure.",
    'about.body3': "Il n'y a pas de scénario. Les gens viennent et s'assoient, s'agenouillent, lisent l'Écriture, prient le Rosaire, ou se reposent simplement dans le silence. Les saints l'ont appelée \"l'école du cœur.\" Quoi que vous apportiez — joie, peine, distraction, doute — vous l'apportez à un Seigneur qui est vraiment là.",
    'about.missionEyebrow': "Cette œuvre",
    'about.missionTitle': "Pourquoi ce site <em>existe</em>",
    'about.missionBody1': "Cette plateforme existe dans un seul but : rendre plus facile la réponse à la question que Jésus a posée au jardin. <em>\"N'avez-vous pas pu veiller une heure avec moi ?\"</em>",
    'about.missionBody2': "C'est un répertoire des chapelles d'Adoration eucharistique dans le monde, un lieu pour promettre une heure de prière, et — à travers la diffusion en direct et la carte mondiale — un rappel silencieux que vous n'êtes pas seul. À toute heure, quelque part sur la terre, le Saint-Sacrement est exposé et un frère ou une sœur en Christ s'agenouille devant Lui.",
    'about.saintsEyebrow': "Une nuée de témoins",
    'about.saintsTitle': "Ceux qui sont venus avant",
    'about.ctaLine': "Nous rejoindrez-vous ?",
    'about.ctaFind': "Trouver une chapelle",
    'about.ctaPledge': "Promettre une heure",
    'saint1.context': "Fondateur de la Congrégation du Saint-Sacrement. A consacré sa vie à promouvoir la dévotion à la Présence Réelle.",
    'saint2.context': "Un jeune acolyte qui a préféré la mort plutôt que de livrer l'Hostie consacrée. Patron des premiers communiants.",
    'saint3.context': "Un programmeur italien adolescent canonisé en 2025. A catalogué les miracles eucharistiques dans le monde entier.",
    'footer.benedictQuote': "\"Dieu nous attend en Jésus-Christ dans le Saint-Sacrement. Ne Le faisons pas attendre en vain !\"",
    'footer.benedictAuthor': "— Pape Benoît XVI",
    'nav.streams': "Diffusions en direct",
    'streams.eyebrow': "Adoration en direct",
    'streams.title': "Adoration <em>diffusée dans le monde</em>",
    'streams.subhead': "Une sélection de diffusions en direct de l'Adoration eucharistique que vous pouvez rejoindre depuis n'importe où, à toute heure.",
    'streams.featuredEyebrow': "À la une · En direct",
    'streams.featuredTitle': "EWTN · Adoration en direct 24h/24",
    'streams.featuredSub': "Depuis la chapelle EWTN d'Irondale, Alabama (9h – 17h HE) et la chapelle Saint-Maximilien Kolbe de Niepokalanów, Pologne.",
    'streams.featuredCredit': "Diffusion offerte par EWTN",
    'streams.moreEyebrow': "Autres diffusions en direct",
    'streams.moreTitle': "Autres diffuseurs",
    'streams.shalomSource': "Shalom Media · Mondial · 24h/24",
    'streams.shalomDesc': "Une chaîne de prière dédiée de Shalom World offrant l'Adoration eucharistique, la Sainte Messe, le Rosaire et le Chapelet de la Divine Miséricorde 24 heures sur 24.",
    'streams.watchOnYoutube': "Regarder sur YouTube",
    'streams.suggestTitle': "Vous connaissez une diffusion à ajouter ?",
    'streams.suggestDesc': "Si vous connaissez une diffusion catholique légitime d'Adoration en direct que nous devrions inclure, écrivez-nous. Nous examinons chaque proposition avec soin avant de l'ajouter.",
    'streams.suggestCta': "Suggérer une diffusion →",
    'companion.label': "Où prierez-vous ?",
    'companion.optional': "(facultatif)",
    'companion.tabNone': "Pas encore de destination",
    'companion.tabChapel': "Une chapelle",
    'companion.tabStream': "Une diffusion en direct",
    'companion.chapelSearchPh': "Rechercher par ville, pays ou nom de chapelle",
    'map.openNowLabel': "Ouvert maintenant",
    'map.openNow': "Ouvert maintenant",
    'map.checkSchedule': "Consulter l'horaire",
    'modal.contactSection': "Vos coordonnées",
    'modal.parishSection': "Informations sur la paroisse",
    'modal.addressFull': "Adresse complète (ex. 123 Main St, Springfield, IL, USA)",
    'modal.findOnMap': "Trouver sur la carte",
    'modal.dragPinHint': "Déplacez l'épingle pour ajuster l'emplacement de la chapelle.",
    'modal.addressTooShort': "Veuillez saisir une adresse plus complète.",
    'modal.findingAddress': "Recherche de l'adresse sur la carte…",
    'modal.addressNotFound': "Adresse introuvable. Veuillez être plus précis.",
    'modal.addressFound': "Emplacement trouvé ! Déplacez l'épingle si nécessaire.",
    'modal.geocodeError': "Impossible de trouver cette adresse.",
    'modal.timesSection': "Horaires d'Adoration",
    'modal.timesHint': "Quand le Saint-Sacrement est-il exposé ? Ajoutez une ligne par horaire régulier.",
    'modal.addAnotherTime': "+ Ajouter un autre horaire",
    'modal.codeRequired': "Un code est requis pour accéder à cette chapelle (contacter la paroisse)",
    'modal.freq': "Fréquence",
    'modal.day': "Jour",
    'modal.startTime': "Début",
    'modal.endTime': "Fin",
    'modal.missingFields': "Veuillez compléter tous les champs obligatoires.",
    'modal.confirmLocation': "Cliquez d'abord sur « Trouver sur la carte » pour confirmer l'emplacement.",
    'msg.codeRequired': "Code requis — contacter la paroisse pour y accéder",
    'msg.variousTimes': "Horaires variés — contacter la paroisse",
    'map.closedNow': "Fermé maintenant",
    'day.sun': "Dim",
    'day.mon': "Lun",
    'day.tue': "Mar",
    'day.wed': "Mer",
    'day.thu': "Jeu",
    'day.fri': "Ven",
    'day.sat': "Sam",
    'modal.fromDay': "Du jour",
    'modal.toDay': "Au jour",
    'modal.notesSection': "Notes supplémentaires",
    'modal.notesHint': "Y a-t-il autre chose que les visiteurs devraient savoir ? Par exemple : « L'Adoration commence après la Messe de 8h30 » ou « Fermé pendant la Semaine sainte ».",
    'modal.notesLabel': "Notes",
    'modal.notesPh': "Notes facultatives sur les horaires, l'accès ou des arrangements particuliers",
    'msg.daily': "Quotidien",
    'msg.note': "Note",
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
    'saint3.name':     'San Carlo Acutis',
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
    'rsc1.sub':        'San Carlo Acutis — miracoli documentati nel mondo',
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
    'rsc1.author': 'San Carlo Acutis · Mostra Internazionale',
    'rsc2.author': 'Papa Paolo VI · 1965',
    'rsc3.author': 'Papa Benedetto XVI · 2007',
    'rsc4.author': 'USA · In corso',
    'rsc5.author': 'USCCB',
    'rsc6.author': 'EWTN',
    'hero.eyebrow': 'Adorazione Eucaristica nel Mondo',
    'hero.verse': '"Non siete riusciti a vegliare un\'ora con me?" — Matteo 26:40',
    'hero.attribution': "Foto per gentile concessione delle parrocchie St. Anthony e St. Mary, Menomonee Falls, WI",
    'nearby.loading': 'Ricerca della tua posizione…',
    'nearby.noGeo': 'La geolocalizzazione non è supportata dal tuo browser.',
    'nearby.empty': 'Nessuna cappella ancora sulla mappa.',
    'nearby.headerClose': 'Mostrando le {n} cappelle più vicine a te',
    'nearby.headerFar': 'La cappella più vicina è a {d}. Mostrando le {n} più vicine:',
    'nearby.geoDenied': 'Accesso alla posizione negato. Abilita la posizione nel browser e riprova.',
    'nearby.geoUnavailable': 'Impossibile determinare la tua posizione. Controlla la connessione internet.',
    'nearby.geoTimeout': 'Richiesta di posizione scaduta. Riprova.',
    'nearby.geoError': 'Impossibile ottenere la tua posizione.',
    'nearby.away': 'a {d}',
    'nav.home': "Home",
    'nav.about': "Chi siamo",
    'nav.pledge': "Promettere un'ora",
    'nav.contact': "Contatto",
    'about.eyebrow': "Chi siamo",
    'about.title': "Sull'Adorazione Eucaristica <em>e questa opera</em>",
    'about.subhead': "\"Non siete riusciti a vegliare un'ora con me?\" — Matteo 26:40",
    'about.lead1': "<em>L'Adorazione Eucaristica è la pratica della preghiera davanti all'Ostia consacrata — il vero Corpo e Sangue di Gesù Cristo, esposta in un vaso sacro chiamato ostensorio, posto sull'altare di una chiesa o cappella cattolica.</em>",
    'about.body1': "Per i cattolici, l'Eucaristia non è un simbolo né un ricordo. È la Presenza Reale di Cristo — lo stesso Signore che ha camminato per le strade della Galilea, che ha insegnato nella sinagoga, che ha sofferto sulla Croce ed è risorto il terzo giorno. Inginocchiarsi davanti al Santissimo Sacramento significa fargli compagnia, come fu chiesto a Pietro, Giacomo e Giovanni nel giardino del Getsemani.",
    'about.body2': "La pratica è antica. La Chiesa primitiva conservava l'Ostia consacrata per portarla agli ammalati. Nel Medioevo, i cristiani iniziarono a trascorrere tempo in preghiera silenziosa davanti all'Eucaristia conservata. Da queste radici è cresciuta la tradizione dell'Adorazione pubblica — e, in molte parrocchie nel mondo, la pratica dell'Adorazione perpetua, in cui il Santissimo Sacramento è esposto continuamente, giorno e notte, con adoratori iscritti per ogni ora.",
    'about.body3': "Non c'è un copione. Le persone vengono e si siedono, si inginocchiano, leggono la Scrittura, pregano il Rosario, o semplicemente riposano nel silenzio. I santi l'hanno chiamata \"la scuola del cuore.\" Qualunque cosa porti — gioia, dolore, distrazione, dubbio — la porti a un Signore che è veramente lì.",
    'about.missionEyebrow': "Questa opera",
    'about.missionTitle': "Perché questo sito <em>esiste</em>",
    'about.missionBody1': "Questa piattaforma esiste per un solo scopo: rendere più facile rispondere alla domanda che Gesù pose nel giardino. <em>\"Non siete riusciti a vegliare un'ora con me?\"</em>",
    'about.missionBody2': "È un elenco delle cappelle di Adorazione Eucaristica nel mondo, un luogo dove promettere un'ora di preghiera, e — attraverso la trasmissione in diretta e la mappa mondiale — un silenzioso promemoria che non sei solo. In qualsiasi ora, da qualche parte sulla terra, il Santissimo Sacramento è esposto e un fratello o una sorella in Cristo è inginocchiato davanti a Lui.",
    'about.saintsEyebrow': "Una nube di testimoni",
    'about.saintsTitle': "Coloro che ci hanno preceduto",
    'about.ctaLine': "Ti unirai a noi?",
    'about.ctaFind': "Trova una cappella",
    'about.ctaPledge': "Promettere un'ora",
    'saint1.context': "Fondatore della Congregazione del Santissimo Sacramento. Dedicò la vita alla promozione della devozione alla Presenza Reale.",
    'saint2.context': "Un giovane accolito che scelse la morte piuttosto che consegnare l'Ostia consacrata. Patrono dei primi comunicandi.",
    'saint3.context': "Un programmatore informatico italiano adolescente canonizzato nel 2025. Catalogò miracoli eucaristici in tutto il mondo.",
    'footer.benedictQuote': "\"Dio ci aspetta in Gesù Cristo nel Santissimo Sacramento. Non lasciamoLo aspettare invano!\"",
    'footer.benedictAuthor': "— Papa Benedetto XVI",
    'nav.streams': "Dirette",
    'streams.eyebrow': "Adorazione in diretta",
    'streams.title': "Adorazione <em>trasmessa nel mondo</em>",
    'streams.subhead': "Un elenco curato di dirette di Adorazione Eucaristica a cui puoi unirti da qualsiasi luogo, in qualsiasi ora.",
    'streams.featuredEyebrow': "In primo piano · In diretta",
    'streams.featuredTitle': "EWTN · Adorazione in diretta 24/7",
    'streams.featuredSub': "Dalla Cappella EWTN di Irondale, Alabama (9 – 17 ET) e dalla Cappella di San Massimiliano Kolbe di Niepokalanów, Polonia.",
    'streams.featuredCredit': "Diretta per gentile concessione di EWTN",
    'streams.moreEyebrow': "Altre dirette",
    'streams.moreTitle': "Altri canali",
    'streams.shalomSource': "Shalom Media · Mondiale · 24/7",
    'streams.shalomDesc': "Un canale di preghiera dedicato di Shalom World che offre Adorazione Eucaristica, Santa Messa, il Rosario e la Coroncina della Divina Misericordia 24 ore su 24.",
    'streams.watchOnYoutube': "Guarda su YouTube",
    'streams.suggestTitle': "Conosci una diretta da aggiungere?",
    'streams.suggestDesc': "Se conosci una diretta cattolica legittima di Adorazione che dovremmo includere, scrivici. Esaminiamo ogni proposta con cura prima di aggiungerla.",
    'streams.suggestCta': "Suggerisci una diretta →",
    'companion.label': "Dove pregherai?",
    'companion.optional': "(facoltativo)",
    'companion.tabNone': "Nessuna destinazione",
    'companion.tabChapel': "Una cappella",
    'companion.tabStream': "Una diretta",
    'companion.chapelSearchPh': "Cerca per città, paese o nome di cappella",
    'map.openNowLabel': "Aperto ora",
    'map.openNow': "Aperto ora",
    'map.checkSchedule': "Verifica l'orario",
    'modal.contactSection': "I tuoi recapiti",
    'modal.parishSection': "Informazioni sulla parrocchia",
    'modal.addressFull': "Indirizzo completo (es. 123 Main St, Springfield, IL, USA)",
    'modal.findOnMap': "Trova sulla mappa",
    'modal.dragPinHint': "Trascina il segnaposto per regolare la posizione della cappella.",
    'modal.addressTooShort': "Inserisci un indirizzo più completo.",
    'modal.findingAddress': "Ricerca dell'indirizzo sulla mappa…",
    'modal.addressNotFound': "Indirizzo non trovato. Sii più specifico.",
    'modal.addressFound': "Posizione trovata! Trascina il segnaposto se necessario.",
    'modal.geocodeError': "Impossibile trovare questo indirizzo.",
    'modal.timesSection': "Orari di Adorazione",
    'modal.timesHint': "Quando viene esposto il Santissimo Sacramento? Aggiungi una riga per ogni orario regolare.",
    'modal.addAnotherTime': "+ Aggiungi un altro orario",
    'modal.codeRequired': "È necessario un codice per accedere a questa cappella (contattare la parrocchia)",
    'modal.freq': "Frequenza",
    'modal.day': "Giorno",
    'modal.startTime': "Inizio",
    'modal.endTime': "Fine",
    'modal.missingFields': "Completa tutti i campi obbligatori.",
    'modal.confirmLocation': 'Clicca prima su "Trova sulla mappa" per confermare la posizione.',
    'msg.codeRequired': "Codice richiesto — contattare la parrocchia per accedere",
    'msg.variousTimes': "Orari vari — contattare la parrocchia",
    'map.closedNow': "Chiuso ora",
    'day.sun': "Dom",
    'day.mon': "Lun",
    'day.tue': "Mar",
    'day.wed': "Mer",
    'day.thu': "Gio",
    'day.fri': "Ven",
    'day.sat': "Sab",
    'modal.fromDay': "Dal giorno",
    'modal.toDay': "Al giorno",
    'modal.notesSection': "Note aggiuntive",
    'modal.notesHint': 'Qualcos\'altro che i visitatori dovrebbero sapere? Per esempio: "L\'Adorazione inizia dopo la Messa delle 8:30" o "Chiuso durante la Settimana Santa".',
    'modal.notesLabel': "Note",
    'modal.notesPh': "Note opzionali su orari, accesso o disposizioni speciali",
    'msg.daily': "Quotidiano",
    'msg.note': "Nota",
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
    'saint3.name':     'São Carlo Acutis',
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
    'rsc1.sub':        'São Carlo Acutis — milagres documentados no mundo',
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
    'rsc1.author': 'São Carlo Acutis · Exposição Internacional',
    'rsc2.author': 'Papa Paulo VI · 1965',
    'rsc3.author': 'Papa Bento XVI · 2007',
    'rsc4.author': 'EUA · Em curso',
    'rsc5.author': 'USCCB',
    'rsc6.author': 'EWTN',
    'hero.eyebrow': 'Adoração Eucarística no Mundo',
    'hero.verse': '"Não pudestes vigiar uma hora comigo?" — Mateus 26:40',
    'hero.attribution': "Foto cortesia das paróquias St. Anthony e St. Mary, Menomonee Falls, WI",
    'nearby.loading': 'A localizar a sua posição…',
    'nearby.noGeo': 'O seu navegador não suporta geolocalização.',
    'nearby.empty': 'Ainda não há capelas no mapa.',
    'nearby.headerClose': 'A mostrar as {n} capelas mais próximas',
    'nearby.headerFar': 'A capela mais próxima fica a {d}. A mostrar as {n} mais próximas:',
    'nearby.geoDenied': 'Acesso à localização negado. Ative a localização no navegador e tente novamente.',
    'nearby.geoUnavailable': 'Não foi possível determinar a sua localização. Verifique a sua ligação à internet.',
    'nearby.geoTimeout': 'O pedido de localização expirou. Tente novamente.',
    'nearby.geoError': 'Não foi possível obter a sua localização.',
    'nearby.away': 'a {d}',
    'nav.home': "Início",
    'nav.about': "Sobre",
    'nav.pledge': "Prometer uma hora",
    'nav.contact': "Contato",
    'about.eyebrow': "Sobre",
    'about.title': "Sobre a Adoração Eucarística <em>e esta obra</em>",
    'about.subhead': "\"Não pudestes vigiar uma hora comigo?\" — Mateus 26:40",
    'about.lead1': "<em>A Adoração Eucarística é a prática de orar diante da Hóstia consagrada — o verdadeiro Corpo e Sangue de Jesus Cristo, exposta num vaso sagrado chamado custódia, colocado sobre o altar de uma igreja ou capela católica.</em>",
    'about.body1': "Para os católicos, a Eucaristia não é um símbolo nem uma lembrança. É a Presença Real de Cristo — o mesmo Senhor que caminhou pelos caminhos da Galileia, que ensinou na sinagoga, que sofreu na Cruz e ressuscitou ao terceiro dia. Ajoelhar-se diante do Santíssimo Sacramento é fazer-Lhe companhia, como foi pedido a Pedro, Tiago e João no jardim do Getsêmani.",
    'about.body2': "A prática é antiga. A Igreja primitiva reservava a Hóstia consagrada para poder levá-la aos doentes. Na Idade Média, os cristãos começaram a passar tempo em oração silenciosa diante da Eucaristia reservada. Destas raízes cresceu a tradição da Adoração pública — e, em muitas paróquias pelo mundo, a prática da Adoração perpétua, na qual o Santíssimo Sacramento é exposto continuamente, dia e noite, com adoradores inscritos para cada hora.",
    'about.body3': "Não há roteiro. As pessoas vêm e sentam, ajoelham-se, leem a Escritura, rezam o Rosário, ou simplesmente descansam no silêncio. Os santos a chamaram de \"a escola do coração.\" Seja o que for que tragas — alegria, tristeza, distração, dúvida — tu o trazes a um Senhor que está realmente ali.",
    'about.missionEyebrow': "Esta obra",
    'about.missionTitle': "Por que este site <em>existe</em>",
    'about.missionBody1': "Esta plataforma existe com um único propósito: tornar mais fácil responder à pergunta que Jesus fez no jardim. <em>\"Não pudestes vigiar uma hora comigo?\"</em>",
    'about.missionBody2': "É um diretório de capelas de Adoração Eucarística pelo mundo, um lugar para prometer uma hora de oração, e — através da transmissão ao vivo e do mapa mundial — um lembrete silencioso de que não estás sozinho. A qualquer hora, em algum lugar da terra, o Santíssimo Sacramento está exposto e um irmão ou irmã em Cristo está ajoelhado diante d\u0027Ele.",
    'about.saintsEyebrow': "Uma nuvem de testemunhas",
    'about.saintsTitle': "Aqueles que vieram antes",
    'about.ctaLine': "Juntar-se-ás a nós?",
    'about.ctaFind': "Encontrar uma capela",
    'about.ctaPledge': "Prometer uma hora",
    'saint1.context': "Fundador da Congregação do Santíssimo Sacramento. Dedicou a vida a promover a devoção à Presença Real.",
    'saint2.context': "Um jovem acólito que preferiu a morte a entregar a Hóstia consagrada. Patrono dos primeiros comungantes.",
    'saint3.context': "Um programador italiano adolescente canonizado em 2025. Catalogou milagres eucarísticos pelo mundo.",
    'footer.benedictQuote': "\"Deus nos espera em Jesus Cristo no Santíssimo Sacramento. Não O deixemos esperar em vão!\"",
    'footer.benedictAuthor': "— Papa Bento XVI",
    'nav.streams': "Transmissões",
    'streams.eyebrow': "Adoração ao Vivo",
    'streams.title': "Adoração <em>transmitida ao mundo</em>",
    'streams.subhead': "Uma lista curada de transmissões ao vivo de Adoração Eucarística às quais te podes juntar de qualquer lugar, a qualquer hora.",
    'streams.featuredEyebrow': "Em destaque · Ao vivo",
    'streams.featuredTitle': "EWTN · Adoração ao vivo 24/7",
    'streams.featuredSub': "Da Capela EWTN em Irondale, Alabama (9h – 17h ET) e da Capela de São Maximiliano Kolbe em Niepokalanów, Polónia.",
    'streams.featuredCredit': "Transmissão por cortesia da EWTN",
    'streams.moreEyebrow': "Mais transmissões ao vivo",
    'streams.moreTitle': "Outros canais",
    'streams.shalomSource': "Shalom Media · Mundial · 24/7",
    'streams.shalomDesc': "Um canal de oração dedicado da Shalom World que oferece Adoração Eucarística, Santa Missa, o Rosário e a Coroa da Divina Misericórdia 24 horas por dia.",
    'streams.watchOnYoutube': "Ver no YouTube",
    'streams.suggestTitle': "Conheces uma transmissão que devamos adicionar?",
    'streams.suggestDesc': "Se conheces uma transmissão católica legítima de Adoração ao vivo que devamos incluir, escreve-nos. Analisamos cada sugestão com cuidado antes de a adicionar.",
    'streams.suggestCta': "Sugerir uma transmissão →",
    'companion.label': "Onde rezarás?",
    'companion.optional': "(opcional)",
    'companion.tabNone': "Sem destino ainda",
    'companion.tabChapel': "Uma capela",
    'companion.tabStream': "Uma transmissão ao vivo",
    'companion.chapelSearchPh': "Pesquisar por cidade, país ou nome da capela",
    'map.openNowLabel': "Aberto agora",
    'map.openNow': "Aberto agora",
    'map.checkSchedule': "Ver horário",
    'modal.contactSection': "Os seus contactos",
    'modal.parishSection': "Informações da paróquia",
    'modal.addressFull': "Morada completa (ex. 123 Main St, Springfield, IL, USA)",
    'modal.findOnMap': "Encontrar no mapa",
    'modal.dragPinHint': "Arraste o pino para ajustar a localização da capela.",
    'modal.addressTooShort': "Por favor introduza uma morada mais completa.",
    'modal.findingAddress': "A procurar morada no mapa…",
    'modal.addressNotFound': "Morada não encontrada. Por favor seja mais específico.",
    'modal.addressFound': "Localização encontrada! Arraste o pino se necessário.",
    'modal.geocodeError': "Não foi possível encontrar essa morada.",
    'modal.timesSection': "Horários de Adoração",
    'modal.timesHint': "Quando é exposto o Santíssimo Sacramento? Adicione uma linha por horário regular.",
    'modal.addAnotherTime': "+ Adicionar outro horário",
    'modal.codeRequired': "É necessário um código para aceder a esta capela (contactar a paróquia)",
    'modal.freq': "Frequência",
    'modal.day': "Dia",
    'modal.startTime': "Início",
    'modal.endTime': "Fim",
    'modal.missingFields': "Por favor preencha todos os campos obrigatórios.",
    'modal.confirmLocation': 'Clique em "Encontrar no mapa" primeiro para confirmar a localização.',
    'msg.codeRequired': "Código necessário — contactar a paróquia para aceder",
    'msg.variousTimes': "Horários variados — contactar paróquia",
    'map.closedNow': "Fechado agora",
    'day.sun': "Dom",
    'day.mon': "Seg",
    'day.tue': "Ter",
    'day.wed': "Qua",
    'day.thu': "Qui",
    'day.fri': "Sex",
    'day.sat': "Sáb",
    'modal.fromDay': "A partir do dia",
    'modal.toDay': "Até o dia",
    'modal.notesSection': "Notas adicionais",
    'modal.notesHint': 'Algo mais que os visitantes devem saber? Por exemplo: "A Adoração começa após a Missa das 8h30" ou "Fechado durante a Semana Santa".',
    'modal.notesLabel': "Notas",
    'modal.notesPh': "Notas opcionais sobre horários, acesso ou arranjos especiais",
    'msg.daily': "Diariamente",
    'msg.note': "Nota",
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
  html: `
    <svg viewBox="0 0 28 38" width="28" height="38" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="goldM" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stop-color="#e6c065"/>
          <stop offset="50%"  stop-color="#c89640"/>
          <stop offset="100%" stop-color="#7a5f1f"/>
        </linearGradient>
        <radialGradient id="hostM" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#fff8e1"/>
          <stop offset="100%" stop-color="#f0d68a"/>
        </radialGradient>
      </defs>

      <!-- Ground shadow -->
      <ellipse cx="14" cy="36" rx="6" ry="1.2" fill="rgba(0,0,0,0.3)"/>

      <!-- Sunburst rays (8 simplified, alternating long/short) -->
      <g fill="url(#goldM)" stroke="#7a5f1f" stroke-width="0.4" stroke-linejoin="round">
        <!-- Top -->
        <path d="M14 1 L14.8 6 L13.2 6 Z"/>
        <!-- Top-right -->
        <path d="M21 4 L20.3 7.5 L19 6.8 Z"/>
        <!-- Right -->
        <path d="M25 11 L20 11.5 L20 10 Z"/>
        <!-- Bottom-right -->
        <path d="M22 18 L19.5 15.5 L20.5 14.5 Z"/>
        <!-- Bottom-left -->
        <path d="M6 18 L8.5 15.5 L7.5 14.5 Z"/>
        <!-- Left -->
        <path d="M3 11 L8 11.5 L8 10 Z"/>
        <!-- Top-left -->
        <path d="M7 4 L7.7 7.5 L9 6.8 Z"/>
      </g>

      <!-- Outer ornate ring of the monstrance -->
      <circle cx="14" cy="11" r="6.5" fill="url(#goldM)" stroke="#7a5f1f" stroke-width="0.5"/>

      <!-- White host in the center -->
      <circle cx="14" cy="11" r="4.2" fill="url(#hostM)" stroke="#b8923a" stroke-width="0.4"/>

      <!-- Tiny cross etched on host (very subtle, doesn't need to read clearly at this size) -->
      <g fill="#7a5f1f" opacity="0.55">
        <rect x="13.6" y="8.5" width="0.8" height="5"/>
        <rect x="11.8" y="10.6" width="4.4" height="0.8"/>
      </g>

      <!-- Stem -->
      <rect x="13" y="17" width="2" height="10" fill="url(#goldM)" stroke="#7a5f1f" stroke-width="0.3"/>
      <!-- Node on stem -->
      <ellipse cx="14" cy="22" rx="3" ry="1.4" fill="url(#goldM)" stroke="#7a5f1f" stroke-width="0.3"/>

      <!-- Base -->
      <path d="M8.5 33 L19.5 33 L17.5 27 L10.5 27 Z" fill="url(#goldM)" stroke="#7a5f1f" stroke-width="0.4" stroke-linejoin="round"/>
      <ellipse cx="14" cy="33" rx="5.5" ry="1.3" fill="url(#goldM)" stroke="#7a5f1f" stroke-width="0.4"/>
    </svg>
  `,
  iconSize: [28, 38],
  iconAnchor: [14, 34],
  popupAnchor: [0, -34],
});

function chapelPopupHtml(c) {
  const tr = t();
  const loc = [c.city, c.country].filter(Boolean).join(', ');
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}`;

  // Status priority: perpetual > structured slots > legacy schedule text > unknown
  let badge = '';
  if (c.perpetual) {
    // Perpetual already implies open — don't duplicate with "Open now"
    badge = `<span class="popup-perpetual">${tr['msg.perpetual'] || '24/7 Perpetual'}</span>`;
  } else if (Array.isArray(c.adoration_times) && c.adoration_times.length && window.__isOpenStructured) {
    const open = window.__isOpenStructured(c.adoration_times, +c.lng);
    if (open === true) {
      badge = `<span class="popup-open-now">${tr['map.openNow'] || 'Open now'}</span>`;
    } else if (open === false) {
      badge = `<span class="popup-open-closed">${tr['map.closedNow'] || 'Closed now'}</span>`;
    }
  } else if (c.schedule && window.__isOpenNow) {
    // Legacy chapel with free-text schedule — best-effort, may be wrong
    const status = window.__isOpenNow(c.schedule, +c.lng, false);
    if (status === null) {
      badge = `<span class="popup-open-unknown">${tr['map.checkSchedule'] || 'Check schedule'}</span>`;
    }
  }

  // Format the structured times for display (if any)
  const timesHtml = Array.isArray(c.adoration_times) && c.adoration_times.length
    ? `<div class="popup-times">${formatTimesForPopup(c.adoration_times, tr)}</div>`
    : (c.schedule ? `<div class="popup-schedule">${escapeHtml(c.schedule)}</div>` : '');

  const codeBadge = c.code_required
    ? `<div class="popup-code-required">${tr['msg.codeRequired'] || 'Code required — contact the parish for access'}</div>`
    : '';

  const notesLine = c.notes
    ? `<div class="popup-notes"><strong>${tr['msg.note'] || 'Note'}:</strong> ${escapeHtml(c.notes)}</div>`
    : '';

  return `
    <div class="popup-card">
      <strong>${escapeHtml(c.name)}</strong>
      <div class="popup-loc">${escapeHtml(c.address || loc)}</div>
      <div style="margin-top:0.4rem;">
        ${badge}
      </div>
      ${timesHtml}
      ${notesLine}
      ${codeBadge}
      <a class="popup-directions" href="${directionsUrl}" target="_blank" rel="noopener">
        ${tr['msg.directions']}
      </a>
    </div>
  `;
}

// Render structured times as "Mon 7:00 AM–7:00 PM" lines, grouped by day
function formatTimesForPopup(slots, tr) {
  const dayNames = [
    tr['day.sun'] || 'Sun', tr['day.mon'] || 'Mon', tr['day.tue'] || 'Tue',
    tr['day.wed'] || 'Wed', tr['day.thu'] || 'Thu', tr['day.fri'] || 'Fri',
    tr['day.sat'] || 'Sat',
  ];
  const dailyLabel = tr['msg.daily'] || 'Daily';

  const variousSlot = slots.find(s => s.various_times);
  if (variousSlot && slots.length === 1) {
    return `<em>${tr['msg.variousTimes'] || 'Various times — contact parish'}</em>`;
  }

  // Group slots by (start_time, end_time) — same time means same logical schedule block
  const groups = new Map();
  for (const s of slots) {
    if (s.various_times) continue;
    const key = `${s.start_time}|${s.end_time}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(s.day_of_week);
  }

  const lines = [];
  for (const [timeKey, days] of groups) {
    const [start, end] = timeKey.split('|');
    days.sort((a, b) => a - b);
    const dayLabel = formatDaysCompact(days, dayNames, dailyLabel);
    const startStr = formatTimeAmPm(start);
    const endStr   = formatTimeAmPm(end);
    lines.push(`${dayLabel} ${startStr}–${endStr}`);
  }
  return lines.map(l => `<div>${escapeHtml(l)}</div>`).join('');
}

// Render an array of day-of-week numbers as a compact label:
// [0,1,2,3,4,5,6] → "Daily"
// [1,2,3,4,5]     → "Mon–Fri"
// [1,3,5]         → "Mon, Wed, Fri"
function formatDaysCompact(days, dayNames, dailyLabel) {
  if (!days.length) return '';
  if (days.length === 7) return dailyLabel;

  // Check if days form a contiguous range
  let isConsecutive = true;
  for (let i = 1; i < days.length; i++) {
    if (days[i] !== days[i - 1] + 1) { isConsecutive = false; break; }
  }
  if (isConsecutive && days.length > 1) {
    return `${dayNames[days[0]]}–${dayNames[days[days.length - 1]]}`;
  }
  return days.map(d => dayNames[d]).join(', ');
}

function formatTimeAmPm(hhmm) {
  if (!hhmm) return '';
  const [h, m] = hhmm.split(':').map(n => parseInt(n, 10));
  if (!Number.isFinite(h)) return hhmm;
  const h12 = ((h + 11) % 12) + 1;
  const suffix = h < 12 ? 'AM' : 'PM';
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
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
    disableClusteringAtZoom: 14,  // Stop clustering past city-level zoom — show individual markers
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

/* ============ FLOATING MINI-PLAYER ============ */
function initFloatingVideo() {
  const frame    = $('tabernacleFrame');
  const liveSec  = $('liveAdoration');
  const closeBtn = $('floatingClose');
  const restoreBtn = $('floatingRestore');
  const chrome   = frame?.querySelector('.floating-chrome');
  if (!frame || !liveSec || !closeBtn || !restoreBtn || !chrome) return;

  let isFloating = false;
  let dismissed = false; // user closed it manually — don't re-float until they re-engage
  let dragOffset = { x: 0, y: 0 };
  let isDragging = false;
  let customPosition = null; // {left, top} once user has dragged

  function activate() {
    if (isFloating || dismissed) return;
    // Only float if there's actually a video loaded (lazy IO has fired)
    if (!frame.querySelector('iframe')) return;
    isFloating = true;
    frame.classList.add('floating');
    liveSec.classList.add('video-detached');
    // Apply user position if previously dragged
    if (customPosition) {
      frame.style.left = customPosition.left + 'px';
      frame.style.top  = customPosition.top + 'px';
      frame.style.right = 'auto';
      frame.style.bottom = 'auto';
    }
  }

  function deactivate() {
    if (!isFloating) return;
    isFloating = false;
    frame.classList.remove('floating');
    liveSec.classList.remove('video-detached');
    // Reset inline positioning so the corner default applies next time
    frame.style.left = '';
    frame.style.top = '';
    frame.style.right = '';
    frame.style.bottom = '';
  }

  // Manually close — also pauses video and dismisses until live section is re-visited
  closeBtn.addEventListener('click', e => {
    e.stopPropagation();
    dismissed = true;
    deactivate();
    // Pause/clear the video
    const iframe = frame.querySelector('iframe');
    if (iframe) {
      const src = iframe.src;
      iframe.src = ''; // Stops video
      iframe.dataset.lastSrc = src; // Save for re-load if needed
    }
  });

  // Restore button — manually return video to its place without dismissing
  restoreBtn.addEventListener('click', e => {
    e.stopPropagation();
    deactivate();
    // Scroll back to live section so the user sees it
    liveSec.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  // Track whether the user has actually scrolled the live section into view at least once.
  let hasBeenSeen = false;

  // Helper: is the live section's TOP currently above the viewport? (user has scrolled past it)
  function liveSectionScrolledPast() {
    const rect = liveSec.getBoundingClientRect();
    return rect.bottom < 100; // bottom of live section is above the visible area
  }

  // Helper: is the live section currently visible at all?
  function liveSectionVisible() {
    const rect = liveSec.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    // At least the bottom 30% of section needs to be in viewport to count as "seen"
    return rect.top < viewportHeight * 0.7 && rect.bottom > viewportHeight * 0.3;
  }

  // Use simple scroll listener — deterministic, no IO quirks
  let scrollRAF = null;
  function onScroll() {
    if (scrollRAF) return;
    scrollRAF = requestAnimationFrame(() => {
      scrollRAF = null;
      if (liveSectionVisible()) {
        hasBeenSeen = true;
        if (isFloating) {
          deactivate();
          dismissed = false;
        }
      } else if (hasBeenSeen && liveSectionScrolledPast() && !dismissed) {
        // Only float when user has SCROLLED PAST the live section,
        // not when it's still below the fold on initial page load
        if (frame.querySelector('iframe')) activate();
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  // Don't call onScroll() on init — that's the bug. Only respond to actual user scroll.

  // Drag support — mouse + touch
  function startDrag(clientX, clientY, e) {
    if (!isFloating) return;
    const target = e.target;
    // Only drag if user grabbed the chrome bar (not the buttons inside it or the video)
    if (target.closest('.floating-btn')) return;
    if (!target.closest('.floating-chrome')) return;
    isDragging = true;
    frame.classList.add('dragging');
    const rect = frame.getBoundingClientRect();
    dragOffset.x = clientX - rect.left;
    dragOffset.y = clientY - rect.top;
    e.preventDefault();
  }

  function doDrag(clientX, clientY) {
    if (!isDragging) return;
    let left = clientX - dragOffset.x;
    let top  = clientY - dragOffset.y;
    // Clamp within viewport
    const w = frame.offsetWidth;
    const h = frame.offsetHeight;
    left = Math.max(4, Math.min(left, window.innerWidth  - w - 4));
    top  = Math.max(4, Math.min(top,  window.innerHeight - h - 4));
    frame.style.left = left + 'px';
    frame.style.top  = top + 'px';
    frame.style.right = 'auto';
    frame.style.bottom = 'auto';
    customPosition = { left, top };
  }

  function endDrag() {
    if (!isDragging) return;
    isDragging = false;
    frame.classList.remove('dragging');
  }

  chrome.addEventListener('mousedown', e => startDrag(e.clientX, e.clientY, e));
  document.addEventListener('mousemove', e => doDrag(e.clientX, e.clientY));
  document.addEventListener('mouseup', endDrag);

  chrome.addEventListener('touchstart', e => {
    const t = e.touches[0];
    if (t) startDrag(t.clientX, t.clientY, e);
  }, { passive: false });
  document.addEventListener('touchmove', e => {
    const t = e.touches[0];
    if (t && isDragging) {
      doDrag(t.clientX, t.clientY);
      e.preventDefault();
    }
  }, { passive: false });
  document.addEventListener('touchend', endDrag);
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
  // Close the nearby panel so the popup is visible (especially important on mobile)
  const panel = $('nearbyPanel');
  if (panel) panel.classList.add('hidden');

  // Scroll map into view first
  const mapEl = $('map');
  if (mapEl) {
    mapEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // Then center the marker, zoom in, and open its popup once scroll + zoom settle
  const { lat, lng } = marker.getLatLng();
  state.map.setView([lat, lng], 14);
  setTimeout(() => {
    marker.openPopup();
    // After cluster spiderfy + popup open, make sure popup is visible above the marker
    state.map.invalidateSize();
  }, 350);
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
    const tr = t();

    if (!navigator.geolocation) {
      panel.classList.remove('hidden');
      list.innerHTML = `<div class="nearby-empty">${escapeHtml(tr['nearby.noGeo'])}</div>`;
      panel.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    // Show loading state immediately
    panel.classList.remove('hidden');
    list.innerHTML = `<div class="nearby-empty">${escapeHtml(tr['nearby.loading'])}</div>`;
    panel.scrollIntoView({ behavior: 'smooth' });

    navigator.geolocation.getCurrentPosition(
      pos => {
        const tr = t();
        const { latitude: lat, longitude: lng } = pos.coords;
        showUserLocation(lat, lng);

        if (!state.allMarkers.length) {
          list.innerHTML = `<div class="nearby-empty">${escapeHtml(tr['nearby.empty'])}</div>`;
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

        if (isClose) {
          const userLL = L.latLng(lat, lng);
          const nearestLL = nearest.m.getLatLng();
          state.map.fitBounds(L.latLngBounds(userLL, nearestLL).pad(0.4), { maxZoom: 12 });
        } else {
          state.map.setView([lat, lng], 4);
        }

        // Build the list header from the translated template
        const headerText = isClose
          ? tr['nearby.headerClose'].replace('{n}', sorted.length)
          : tr['nearby.headerFar']
              .replace('{d}', formatDistance(nearest.dist))
              .replace('{n}', sorted.length);

        list.innerHTML = `<div class="nearby-header">${escapeHtml(headerText)}</div>`;
        sorted.forEach(({ m, dist, data }) => {
          const item = document.createElement('div');
          item.className = 'nearby-item';
          const loc = [data.city, data.country].filter(Boolean).join(', ');
          const distStr = formatDistance(dist);
          const awayStr = tr['nearby.away'].replace('{d}', distStr);
          const perpetualSuffix = data.perpetual ? ' · 24/7' : '';
          item.innerHTML = `
            <div class="nearby-name">${escapeHtml(data.name || 'Chapel')}</div>
            ${loc
              ? `<div class="nearby-meta">${escapeHtml(loc)} · ${escapeHtml(distStr)}${perpetualSuffix}</div>`
              : `<div class="nearby-meta">${escapeHtml(awayStr)}${perpetualSuffix}</div>`}
          `;
          item.addEventListener('click', () => focusMarker(m));
          list.appendChild(item);
        });
      },
      err => {
        const tr = t();
        const messages = {
          1: tr['nearby.geoDenied'],
          2: tr['nearby.geoUnavailable'],
          3: tr['nearby.geoTimeout'],
        };
        list.innerHTML = `<div class="nearby-empty">${escapeHtml(messages[err.code] || tr['nearby.geoError'])}</div>`;
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
  // Pledge button — scroll to the pledge section (which is always visible now)
  $('pledgeButton')?.addEventListener('click', () => {
    $('pledge')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  $('pledgeForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const err = $('pledgeError');
    const data = Object.fromEntries(new FormData(e.target));

    // Strip empty destination fields so the API doesn't see empty strings
    if (!data.destination_type) {
      delete data.destination_type;
      delete data.destination_id;
      delete data.destination_name;
      delete data.destination_url;
    }

    try {
      await api('/api/pledge', { method: 'POST', body: JSON.stringify(data) });
      e.target.style.display = 'none';
      $('thanks').classList.remove('hidden');
    } catch (ex) {
      showStatus(err, 'err', t()['msg.pledgeErr']);
    }
  });
}

/* ============ HOUR COMPANION ============ */
function initHourCompanion() {
  const block = document.querySelector('.companion-block');
  if (!block) return;

  const typeInput = $('destinationType');
  const idInput   = $('destinationId');
  const nameInput = $('destinationName');
  const urlInput  = $('destinationUrl');

  const tabs   = block.querySelectorAll('.companion-tab');
  const panes  = {
    none:   null,
    chapel: block.querySelector('.companion-pane-chapel'),
    stream: block.querySelector('.companion-pane-stream'),
  };

  function clearSelection() {
    typeInput.value = '';
    idInput.value = '';
    nameInput.value = '';
    urlInput.value = '';
    const selectedDisplay = $('companionChapelSelected');
    if (selectedDisplay) { selectedDisplay.hidden = true; selectedDisplay.innerHTML = ''; }
    block.querySelectorAll('.companion-stream-btn').forEach(b => b.classList.remove('selected'));
  }

  // Tab switching
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      Object.entries(panes).forEach(([key, el]) => {
        if (!el) return;
        if (key === tab.dataset.companion) el.classList.remove('hidden');
        else el.classList.add('hidden');
      });
      // Tab change clears any prior selection
      clearSelection();
    });
  });

  // ─── Chapel autocomplete ───
  const chapelInput = $('companionChapelSearch');
  const chapelBox   = $('companionChapelSuggestions');
  const chapelSelected = $('companionChapelSelected');

  if (chapelInput) {
    chapelInput.addEventListener('input', () => {
      const q = chapelInput.value.toLowerCase().trim();
      chapelBox.innerHTML = '';
      if (q.length < 2) {
        chapelBox.classList.remove('visible');
        return;
      }
      // Search chapels (use the same dataset the map uses)
      const matches = (state.chapels || [])
        .filter(c =>
          (c.name || '').toLowerCase().includes(q) ||
          (c.city || '').toLowerCase().includes(q) ||
          (c.country || '').toLowerCase().includes(q)
        )
        .slice(0, 8);

      if (!matches.length) {
        chapelBox.innerHTML = `<div class="companion-suggestion" style="color:var(--ink-faint);font-style:italic;">${t()['msg.noResults'] || 'No matches'}</div>`;
        chapelBox.classList.add('visible');
        return;
      }

      chapelBox.innerHTML = matches.map(c => `
        <div class="companion-suggestion" data-id="${c.id}" data-name="${escapeHtml(c.name)}" data-loc="${escapeHtml((c.city || '') + ', ' + (c.country || ''))}" data-lat="${c.lat}" data-lng="${c.lng}">
          <strong>${escapeHtml(c.name)}</strong>
          <small>${escapeHtml([c.city, c.country].filter(Boolean).join(', '))}</small>
        </div>
      `).join('');
      chapelBox.classList.add('visible');

      chapelBox.querySelectorAll('.companion-suggestion').forEach(el => {
        if (!el.dataset.id) return;
        el.addEventListener('click', () => {
          typeInput.value = 'chapel';
          idInput.value   = el.dataset.id;
          nameInput.value = `${el.dataset.name} — ${el.dataset.loc}`;
          urlInput.value  = `https://www.google.com/maps?q=${el.dataset.lat},${el.dataset.lng}`;

          chapelInput.value = el.dataset.name;
          chapelBox.classList.remove('visible');
          chapelBox.innerHTML = '';

          chapelSelected.hidden = false;
          chapelSelected.innerHTML = `
            <button type="button" class="companion-clear" aria-label="Clear selection">×</button>
            <strong>${escapeHtml(el.dataset.name)}</strong> — ${escapeHtml(el.dataset.loc)}
          `;
          chapelSelected.querySelector('.companion-clear').addEventListener('click', () => {
            clearSelection();
            chapelInput.value = '';
          });
        });
      });
    });

    document.addEventListener('click', e => {
      if (!e.target.closest('.companion-pane-chapel')) chapelBox.classList.remove('visible');
    });
  }

  // ─── Stream picker ───
  block.querySelectorAll('.companion-stream-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      block.querySelectorAll('.companion-stream-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      typeInput.value = 'stream';
      idInput.value   = '';
      nameInput.value = btn.dataset.streamName;
      urlInput.value  = btn.dataset.streamUrl;
    });
  });
}

/* ============ OPEN NOW (inline schedule parser) ============ */

(function setupOpenNow() {
  const DAY_TOKENS = {
    mon: 1, monday: 1, lun: 1, lunes: 1, lundi: 1, lunedi: 1, segunda: 1,
    tue: 2, tues: 2, tuesday: 2, mar: 2, martes: 2, mardi: 2, martedi: 2, terca: 2, 'terça': 2,
    wed: 3, weds: 3, wednesday: 3, mie: 3, miercoles: 3, 'miércoles': 3, mer: 3, mercredi: 3, mercoledi: 3, quarta: 3,
    thu: 4, thur: 4, thurs: 4, thursday: 4, jue: 4, jueves: 4, jeu: 4, jeudi: 4, gio: 4, giovedi: 4, quinta: 4,
    fri: 5, friday: 5, vie: 5, viernes: 5, ven: 5, vendredi: 5, venerdi: 5, sexta: 5,
    sat: 6, saturday: 6, sab: 6, sabado: 6, 'sábado': 6, samedi: 6, sabato: 6,
    sun: 0, sunday: 0, dom: 0, domingo: 0, dimanche: 0, domenica: 0,
  };

  function chapelLocalDate(lng, now) {
    const offset = Math.round((lng || 0) / 15);
    const utcMs = now.getTime() + (now.getTimezoneOffset() * 60_000);
    return new Date(utcMs + (offset * 3_600_000));
  }

  function parseTime(s) {
    if (!s) return null;
    const m = /^(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.?m\.?|p\.?m\.?)?/i.exec(s.trim());
    if (!m) return null;
    let h = parseInt(m[1], 10);
    const min = m[2] ? parseInt(m[2], 10) : 0;
    const mer = (m[3] || '').toLowerCase().replace(/\./g, '');
    if (mer.startsWith('p') && h < 12) h += 12;
    if (mer.startsWith('a') && h === 12) h = 0;
    if (h < 0 || h > 24 || min < 0 || min >= 60) return null;
    return h + (min / 60);
  }

  function parseDayRange(s) {
    const t = s.toLowerCase().trim();
    if (DAY_TOKENS[t] !== undefined) return [DAY_TOKENS[t], DAY_TOKENS[t]];
    const m = /^([a-zà-úáéíóúçñ]+)\s*[-–—]\s*([a-zà-úáéíóúçñ]+)$/i.exec(t)
           || /^([a-zà-úáéíóúçñ]+)\s+(?:to|through|au|à|a|fino al|até|hasta)\s+([a-zà-úáéíóúçñ]+)$/i.exec(t);
    if (m && DAY_TOKENS[m[1]] !== undefined && DAY_TOKENS[m[2]] !== undefined) {
      return [DAY_TOKENS[m[1]], DAY_TOKENS[m[2]]];
    }
    return null;
  }

  function dayInRange(dow, start, end) {
    if (start <= end) return dow >= start && dow <= end;
    return dow >= start || dow <= end;
  }

  window.__isOpenNow = function(scheduleText, chapelLng, perpetual, now) {
    if (perpetual) return true;
    if (!scheduleText) return null;
    const text = String(scheduleText).toLowerCase().trim();
    if (!text) return null;
    now = now || new Date();

    if (/(^|\s)24\s*[/\-x]\s*7(\s|$)/.test(text)) return true;
    if (/perpetual|always open|always-open|24 hours|24h(?!\d)|round[- ]?the[- ]?clock/.test(text)) return true;
    if (/24\s*horas|24\s*heures|24\s*ore|sempre aberto|siempre abierto|toujours ouvert/.test(text)) return true;

    const local = chapelLocalDate(chapelLng || 0, now);
    const dow = local.getDay();
    const hour = local.getHours() + (local.getMinutes() / 60);

    const clauses = text.split(/[;,]|\s+(?:and|y|et|e)\s+/i);
    let foundAnyClause = false;

    for (const rawClause of clauses) {
      const clause = rawClause.trim();
      if (!clause) continue;

      let dayRange = null;
      if (/\b(daily|every day|todos los dias|tous les jours|ogni giorno|todos os dias)\b/.test(clause)) {
        dayRange = [0, 6];
      } else if (/\b(weekday|monday[- ]?friday|m[-– ]?f)\b/.test(clause)) {
        dayRange = [1, 5];
      } else if (/\b(weekend)\b/.test(clause)) {
        dayRange = [6, 0];
      } else {
        const drMatch = clause.match(/\b([a-zà-úáéíóúçñ]+)\s*(?:[-–—]|\sto\s|\sthrough\s|\sau\s|\sa\s|\sfino al\s|\saté\s|\shasta\s)\s*([a-zà-úáéíóúçñ]+)\b/i);
        if (drMatch) {
          const r = parseDayRange(drMatch[0]);
          if (r) dayRange = r;
        }
        if (!dayRange) {
          const singleMatch = clause.match(/\b([a-zà-úáéíóúçñ]+)\b/i);
          if (singleMatch && DAY_TOKENS[singleMatch[1].toLowerCase()] !== undefined) {
            const d = DAY_TOKENS[singleMatch[1].toLowerCase()];
            dayRange = [d, d];
          }
        }
      }

      const timeMatch = clause.match(
        /(\d{1,2}(?::\d{2})?\s*(?:am|pm|a\.?m\.?|p\.?m\.?|h)?)\s*(?:[-–—]|\sto\s|\sau\s|\sa\s|\sal\s|\sat\s|\sá\s|\sà\s)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm|a\.?m\.?|p\.?m\.?|h)?)/i
      );
      if (!timeMatch) continue;
      const startTime = parseTime(timeMatch[1]);
      let endTime = parseTime(timeMatch[2]);
      if (startTime === null || endTime === null) continue;
      if (endTime <= startTime) endTime += 24;

      foundAnyClause = true;
      const range = dayRange || [0, 6];
      if (!dayInRange(dow, range[0], range[1])) continue;
      const h = hour < startTime ? hour + 24 : hour;
      if (h >= startTime && h < endTime) return true;
    }

    return foundAnyClause ? false : null;
  };

  // ─── Structured times — accurate check, no parsing ───
  // Slots: [{ frequency, day_of_week, start_time: 'HH:MM', end_time: 'HH:MM', various_times }]
  // Returns: true | false | null (null = various-times-only, can't determine)
  window.__isOpenStructured = function(slots, chapelLng, now) {
    if (!Array.isArray(slots) || slots.length === 0) return null;
    now = now || new Date();
    const local = chapelLocalDate(chapelLng || 0, now);
    const dow = local.getDay();
    const hour = local.getHours() + (local.getMinutes() / 60);

    let foundConcreteSlot = false;
    for (const slot of slots) {
      if (slot.various_times) continue;
      foundConcreteSlot = true;
      if (slot.day_of_week !== dow) continue;
      const start = parseHHMM(slot.start_time);
      const end   = parseHHMM(slot.end_time);
      if (start === null || end === null) continue;
      const realEnd = end <= start ? end + 24 : end;
      const h = hour < start ? hour + 24 : hour;
      if (h >= start && h < realEnd) return true;
    }
    return foundConcreteSlot ? false : null;
  };

  function parseHHMM(s) {
    if (!s || typeof s !== 'string') return null;
    const m = /^(\d{2}):(\d{2})$/.exec(s);
    if (!m) return null;
    const h = parseInt(m[1], 10), min = parseInt(m[2], 10);
    if (h < 0 || h > 23 || min < 0 || min > 59) return null;
    return h + min/60;
  }
})();

function initOpenNowFilter() {
  const toggle = $('openNowToggle');
  const countEl = $('openNowCount');
  if (!toggle) return;

  function refresh() {
    const isFilterOn = toggle.checked;
    const now = new Date();
    let openCount = 0;

    for (const marker of state.allMarkers) {
      const c = marker.chapelData || {};
      let status;
      // Priority: perpetual > structured times > legacy text parser
      if (c.perpetual) {
        status = true;
      } else if (Array.isArray(c.adoration_times) && c.adoration_times.length && window.__isOpenStructured) {
        status = window.__isOpenStructured(c.adoration_times, +c.lng, now);
      } else if (c.schedule && window.__isOpenNow) {
        status = window.__isOpenNow(c.schedule, +c.lng, false, now);
      } else {
        status = null;
      }
      marker.chapelOpenStatus = status;

      if (status === true) openCount++;

      if (isFilterOn) {
        if (status === true) {
          if (!state.markersGroup.hasLayer(marker)) state.markersGroup.addLayer(marker);
        } else {
          state.markersGroup.removeLayer(marker);
        }
      } else {
        if (!state.markersGroup.hasLayer(marker)) state.markersGroup.addLayer(marker);
      }
    }

    if (countEl) {
      countEl.textContent = isFilterOn ? `${openCount} open` : '';
    }
  }

  toggle.addEventListener('change', refresh);

  const tryRefresh = () => {
    if (state.allMarkers && state.allMarkers.length) refresh();
    else setTimeout(tryRefresh, 500);
  };
  tryRefresh();
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

/* ============ ADD CHAPEL MODAL ============ */

const DAY_LABELS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const FREQ_LABELS_EN = {
  daily:  'Daily',
  weekly: 'Weekly',
};

// Generate every 30-minute time of day as {value: 'HH:MM', label: '7:00 AM'}
function buildTimeOptions() {
  const out = [];
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      const v = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
      const h12 = ((h + 11) % 12) + 1;
      const suffix = h < 12 ? 'AM' : 'PM';
      const label = `${h12}:${String(m).padStart(2,'0')} ${suffix}`;
      out.push({ value: v, label });
    }
  }
  return out;
}
const TIME_OPTIONS = buildTimeOptions();

// Render a single time-slot row as a DOM element.
// New shape: Frequency (Daily | Weekly), From Day, To Day, Start, End.
// "Daily" hides the day pickers since it implies every day.
function buildTimeSlotRow(slot = {}) {
  const wrap = document.createElement('div');
  wrap.className = 'time-slot';
  const freq = slot.frequency === 'daily' ? 'daily' : 'weekly';
  wrap.dataset.frequency = freq;

  const freqOpts = ['weekly', 'daily']
    .map(v => `<option value="${v}" ${freq === v ? 'selected' : ''}>${FREQ_LABELS_EN[v]}</option>`).join('');

  const dayOpts = (selected) => DAY_LABELS_EN
    .map((name, i) => `<option value="${i}" ${selected === i ? 'selected' : ''}>${name}</option>`).join('');

  const timeOpts = (selected) =>
    TIME_OPTIONS.map(o => `<option value="${o.value}" ${o.value === selected ? 'selected' : ''}>${o.label}</option>`).join('');

  // Sensible defaults: if no day_from set, default to Monday (1)
  const dayFrom = Number.isInteger(slot.day_from) ? slot.day_from : 1;
  const dayTo   = Number.isInteger(slot.day_to)   ? slot.day_to   : 5;

  wrap.innerHTML = `
    <div class="time-slot-field ts-freq-field">
      <span class="time-slot-label" data-i18n="modal.freq">Frequency</span>
      <select class="ts-frequency">${freqOpts}</select>
    </div>
    <div class="time-slot-field ts-from-field">
      <span class="time-slot-label" data-i18n="modal.fromDay">From day</span>
      <select class="ts-day-from">${dayOpts(dayFrom)}</select>
    </div>
    <div class="time-slot-field ts-to-field">
      <span class="time-slot-label" data-i18n="modal.toDay">To day</span>
      <select class="ts-day-to">${dayOpts(dayTo)}</select>
    </div>
    <div class="time-slot-field ts-start-field">
      <span class="time-slot-label" data-i18n="modal.startTime">Start</span>
      <input type="time" class="ts-start" value="${slot.start_time || '07:00'}" step="300" required />
    </div>
    <div class="time-slot-field ts-end-field">
      <span class="time-slot-label" data-i18n="modal.endTime">End</span>
      <input type="time" class="ts-end" value="${slot.end_time || '19:00'}" step="300" required />
    </div>
    <button type="button" class="time-slot-remove" aria-label="Remove this time">×</button>
  `;

  // Show/hide day pickers based on frequency
  const freqSelect = wrap.querySelector('.ts-frequency');
  const fromField  = wrap.querySelector('.ts-from-field');
  const toField    = wrap.querySelector('.ts-to-field');
  function updateVisibility() {
    const isDaily = freqSelect.value === 'daily';
    fromField.style.display = isDaily ? 'none' : '';
    toField.style.display   = isDaily ? 'none' : '';
    wrap.dataset.frequency  = freqSelect.value;
    wrap.classList.toggle('is-daily', isDaily);
  }
  freqSelect.addEventListener('change', updateVisibility);
  updateVisibility();

  // Auto-update "To day" when "From day" changes (UX nicety:
  // if user picks From=Sunday and To is still default Friday, that's fine;
  // but if To < From numerically, jump To to match From so users don't accidentally
  // submit an empty range. Otherwise leave alone — they may want a custom span.)
  const fromSelect = wrap.querySelector('.ts-day-from');
  const toSelect   = wrap.querySelector('.ts-day-to');
  fromSelect.addEventListener('change', () => {
    // Don't force anything — wraparound (Fri→Mon) is legitimate.
    // But if To equals current From (single-day before change), keep them in sync.
    // No automatic change otherwise — preserve user intent.
  });

  wrap.querySelector('.time-slot-remove').addEventListener('click', () => {
    wrap.remove();
  });

  return wrap;
}

// Collect all the structured time slots from the DOM
function collectTimeSlots() {
  return Array.from(document.querySelectorAll('#adorationTimesList .time-slot')).map(el => {
    const frequency = el.querySelector('.ts-frequency').value;
    const slot = {
      frequency,
      start_time: el.querySelector('.ts-start').value,
      end_time:   el.querySelector('.ts-end').value,
      various_times: false,
    };
    if (frequency === 'weekly') {
      slot.day_from = parseInt(el.querySelector('.ts-day-from').value, 10);
      slot.day_to   = parseInt(el.querySelector('.ts-day-to').value, 10);
    }
    return slot;
  });
}

let addressMapInstance = null;
let addressMarker = null;

// Initialize / show the mini-map with the given coordinates
function showAddressMap(lat, lng) {
  const wrap = $('addressMapWrap');
  if (!wrap) return;
  wrap.classList.remove('hidden');

  // Invalidate hidden lat/lng inputs
  $('chapelLat').value = lat.toFixed(6);
  $('chapelLng').value = lng.toFixed(6);

  if (!addressMapInstance) {
    addressMapInstance = L.map('addressMap', {
      center: [lat, lng],
      zoom: 16,
      scrollWheelZoom: false,
    });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap, © CARTO',
      maxZoom: 19,
    }).addTo(addressMapInstance);
  } else {
    addressMapInstance.setView([lat, lng], 16);
  }

  if (!addressMarker) {
    addressMarker = L.marker([lat, lng], { draggable: true }).addTo(addressMapInstance);
    addressMarker.on('dragend', () => {
      const ll = addressMarker.getLatLng();
      $('chapelLat').value = ll.lat.toFixed(6);
      $('chapelLng').value = ll.lng.toFixed(6);
    });
  } else {
    addressMarker.setLatLng([lat, lng]);
  }

  // Leaflet needs to recalc size after the wrap becomes visible
  setTimeout(() => addressMapInstance.invalidateSize(), 100);
}

function initAddChapelForm() {
  const addBtn = $('addChapelBtn');
  const modal = $('addChapelModal');
  const closeBtn = $('closeAddChapel');
  const footerAdd = $('footerAddChapel');

  const open = () => {
    modal.style.display = 'flex';
    // Add one empty time slot if none exists yet
    const list = $('adorationTimesList');
    if (list && list.children.length === 0) {
      list.appendChild(buildTimeSlotRow());
    }
  };
  const close = () => { modal.style.display = 'none'; };

  addBtn?.addEventListener('click', open);
  footerAdd?.addEventListener('click', e => { e.preventDefault(); open(); });
  closeBtn?.addEventListener('click', close);

  // Add-another-time button
  $('addTimeSlotBtn')?.addEventListener('click', () => {
    $('adorationTimesList').appendChild(buildTimeSlotRow());
  });

  // 24/7 perpetual checkbox grays out the time list (still allowed to add, but not needed)
  $('chapelPerpetual')?.addEventListener('change', e => {
    const list = $('adorationTimesList');
    const addSlotBtn = $('addTimeSlotBtn');
    if (e.target.checked) {
      list.style.opacity = '0.4';
      list.style.pointerEvents = 'none';
      if (addSlotBtn) { addSlotBtn.style.opacity = '0.4'; addSlotBtn.disabled = true; }
    } else {
      list.style.opacity = '';
      list.style.pointerEvents = '';
      if (addSlotBtn) { addSlotBtn.style.opacity = ''; addSlotBtn.disabled = false; }
    }
  });

  // "Find on Map" button — geocode the address and reveal the mini-map
  $('findOnMapBtn')?.addEventListener('click', async () => {
    const addr = $('chapelAddress').value.trim();
    const city = document.querySelector('#chapelForm [name="city"]').value.trim();
    const country = document.querySelector('#chapelForm [name="country"]').value.trim();
    const status = $('addressStatus');
    const full = [addr, city, country].filter(Boolean).join(', ');

    if (full.length < 5) {
      status.className = 'address-status error';
      status.textContent = t()['modal.addressTooShort'] || 'Please enter more of the address.';
      return;
    }

    status.className = 'address-status';
    status.textContent = t()['modal.findingAddress'] || 'Looking up address…';

    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(full)}`);
      if (res.status === 404) {
        status.className = 'address-status error';
        status.textContent = t()['modal.addressNotFound'] || 'Address not found. Please be more specific.';
        return;
      }
      if (!res.ok) throw new Error('Geocoding failed');
      const data = await res.json();
      status.className = 'address-status success';
      status.textContent = t()['modal.addressFound'] || 'Found — drag the pin to refine.';
      showAddressMap(data.lat, data.lng);
    } catch (ex) {
      status.className = 'address-status error';
      status.textContent = t()['modal.geocodeError'] || 'Could not look up address. Please try again.';
    }
  });

  $('chapelForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const err = $('chapelError');
    const fd = new FormData(e.target);

    const perpetual = fd.get('perpetual') === 'yes';
    const lat = parseFloat(fd.get('lat'));
    const lng = parseFloat(fd.get('lng'));

    const payload = {
      name: fd.get('name'),
      city: fd.get('city'),
      country: fd.get('country'),
      address: fd.get('address') || null,
      submitter_email: fd.get('submitter_email') || null,
      lat: Number.isFinite(lat) ? lat : null,
      lng: Number.isFinite(lng) ? lng : null,
      perpetual,
      code_required: fd.get('code_required') === 'yes',
      adoration_times: perpetual ? [] : collectTimeSlots(),
    };

    if (!payload.name || !payload.city || !payload.country) {
      showStatus(err, 'err', t()['modal.missingFields'] || 'Please fill all required fields.');
      return;
    }
    if (payload.lat === null || payload.lng === null) {
      showStatus(err, 'err', t()['modal.confirmLocation'] || 'Please confirm the chapel location on the map first (click "Find on Map").');
      return;
    }

    try {
      await api('/api/chapel', { method: 'POST', body: JSON.stringify(payload) });
      close();
      e.target.reset();
      // Reset map/slot UI
      $('adorationTimesList').innerHTML = '';
      $('addressMapWrap').classList.add('hidden');
      $('addressStatus').textContent = '';
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
  initHourCompanion();
  initOpenNowFilter();
  initContactForm();
  initAddChapelForm();
  initShare();

  // Live Adoration embed (lazy-loaded when scrolled into view)
  initLiveAdorationEmbed();

  // Floating mini-player when scrolling away from live section
  initFloatingVideo();

  // Load data, then build map and stats in parallel
  await loadChapels();
  await initMap();
  initNearby();
  loadStats();
});
