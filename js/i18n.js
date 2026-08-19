/**
 * Live RainWise / JalRaksha - Multilingual Indian Languages Engine (11 Languages)
 * Instant translation across: English, Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Odia.
 */

const TRANSLATIONS = {
  en: {
    appTitle: "Live RainWise",
    appSubtitle: "Disaster Management & Flood Emergency Response Command Center",
    floodThreat: "Flood Threat",
    extreme: "EXTREME",
    rainfall: "Rainfall",
    offlineReady: "Offline Ready (PWA)",
    sirenBtn: "📢 EMERGENCY SIREN",
    highContrastBtn: "⚡ 2G / High Contrast",
    simulateBtn: "🔄 Simulate Incident",
    tabMap: "🗺️ Live Flood Radar & Evacuation Map",
    tabPinRoute: "📍 PIN Code Route Weather",
    tabSOS: "🚨 One-Touch SOS & Dispatch",
    tabCrowdReport: "📸 Verified Incident Reports",
    tabShelters: "⛺ Relief Camps & Logistics",
    tabTelemetry: "🌧️ Meteorologist HUD & Wind",
    tabSurvival: "📖 Survival Protocols & Safe Check-In",
    pinSearchTitle: "🔍 Check Route Weather by PIN Code",
    originPinPlaceholder: "Origin PIN (e.g. 400001)",
    destPinPlaceholder: "Destination PIN (e.g. 400076)",
    checkRouteBtn: "🚦 Analyze Route Hazards & Safe Detours",
    reportIncidentTitle: "📸 Report Weather Incident with Photo/Video",
    doubleVerifiedBadge: "🛡️ Transit-Verified Reporter (Anti-Fake Protected)",
    imdTitle: "🌪️ IMD Meteorologist Synoptic Advisories",
    windSpeed: "Wind Speed",
    windGust: "Wind Gust",
    smsBroadcastTitle: "📱 Emergency SMS Disaster Alert",
    helplineTitle: "🚨 Instant Helplines:"
  },
  hi: {
    appTitle: "लाइव रेनवाइज़ (जल रक्षा)",
    appSubtitle: "आपदा प्रबंधन एवं बाढ़ आपातकालीन प्रतिक्रिया नियंत्रण केंद्र",
    floodThreat: "बाढ़ का खतरा",
    extreme: "अत्यधिक गंभीर",
    rainfall: "वर्षा दर",
    offlineReady: "ऑफलाइन तैयार (PWA)",
    sirenBtn: "📢 आपातकालीन सायरन",
    highContrastBtn: "⚡ 2G / हाई कंट्रास्ट",
    simulateBtn: "🔄 घटना सिमुलेट करें",
    tabMap: "🗺️ लाइव बाढ़ रडार और सुरक्षित मार्ग",
    tabPinRoute: "📍 पिन कोड मार्ग मौसम जांच",
    tabSOS: "🚨 वन-टच एसओएस एवं बचाव",
    tabCrowdReport: "📸 सत्यापित घटना रिपोर्ट",
    tabShelters: "⛺ राहत शिविर एवं रसद",
    tabTelemetry: "🌧️ मौसम विज्ञानी अलर्ट और हवा",
    tabSurvival: "📖 जीवन रक्षा नियम एवं सुरक्षा चेक-इन",
    pinSearchTitle: "🔍 पिन कोड द्वारा यात्रा मार्ग का मौसम जांचें",
    originPinPlaceholder: "प्रारंभिक पिन कोड (उदा. 400001)",
    destPinPlaceholder: "गंतव्य पिन कोड (उदा. 400076)",
    checkRouteBtn: "🚦 मार्ग जोखिम और सुरक्षित रास्ता खोजें",
    reportIncidentTitle: "📸 फोटो/वीडियो के साथ मौसम की घटना रिपोर्ट करें",
    doubleVerifiedBadge: "🛡️ बस/परिवहन सत्यापित रिपोर्टर (नकली रिपोर्ट प्रतिबंधित)",
    imdTitle: "🌪️ भारतीय मौसम विभाग (IMD) विशेष चेतावनी",
    windSpeed: "हवा की गति",
    windGust: "हवा का झोंका",
    smsBroadcastTitle: "📱 आपातकालीन एसएमएस अलर्ट",
    helplineTitle: "🚨 त्वरित हेल्पलाइन:"
  },
  bn: {
    appTitle: "লাইভ রেইনওয়াইজ (জল রক্ষা)",
    appSubtitle: "দুর্যোগ ব্যবস্থাপনা ও বন্যা জরুরি প্রতিক্রিয়া নিয়ন্ত্রণ কেন্দ্র",
    floodThreat: "বন্যার ঝুঁকি",
    extreme: "চরম বিপদ",
    rainfall: "বৃষ্টিপাতের পরিমাণ",
    offlineReady: "অফলাইন প্রস্তুত",
    sirenBtn: "📢 জরুরি সাইরেন",
    highContrastBtn: "⚡ 2G / হাই কনট্রাস্ট",
    simulateBtn: "🔄 ঘটনা সিমুলেশন",
    tabMap: "🗺️ লাইভ বন্যা রাডার ও নিরাপদ রুট",
    tabPinRoute: "📍 পিন কোড রুট আবহাওয়া",
    tabSOS: "🚨 ওয়ান-টাচ এসওএস ও উদ্ধার",
    tabCrowdReport: "📸 যাচাইকৃত ঘটনা রিপোর্ট",
    tabShelters: "⛺ ত্রাণ শিবির ও সরবরাহ",
    tabTelemetry: "🌧️ আবহাওয়াবিদ তথ্য ও বাতাস",
    tabSurvival: "📖 জীবন রক্ষা প্রটোকল",
    pinSearchTitle: "🔍 পিন কোড দিয়ে রাস্তার আবহাওয়া পরীক্ষা করুন",
    originPinPlaceholder: "উৎস পিন (যেমন 400001)",
    destPinPlaceholder: "গন্তব্য পিন (যেমন 400076)",
    checkRouteBtn: "🚦 রুটের বিপদ ও নিরাপদ পথ দেখুন",
    reportIncidentTitle: "📸 ছবি/ভিডিও সহ আবহাওয়ার পরিস্থিতি রিপোর্ট করুন",
    doubleVerifiedBadge: "🛡️ ট্রানজিট-যাচাইকৃত রিপোর্টার (ভুয়া রিপোর্ট নিষিদ্ধ)",
    imdTitle: "🌪️ আইএমডি আবহাওয়া অফিসিয়াল বুলেটিন",
    windSpeed: "বাতাসের গতি",
    windGust: "দমকা বাতাস",
    smsBroadcastTitle: "📱 জরুরি এসএমএস সতর্কতা",
    helplineTitle: "🚨 জরুরি হেল্পলাইন:"
  },
  mr: {
    appTitle: "लाईव्ह रेनवाईज (जल रक्षा)",
    appSubtitle: "आपत्ती व्यवस्थापन व पूर आपत्कालीन प्रतिसाद नियंत्रण केंद्र",
    floodThreat: "पुराचा धोका",
    extreme: "अत्यंत तीव्र",
    rainfall: "पावसाचे प्रमाण",
    offlineReady: "ऑफलाइन सज्ज (PWA)",
    sirenBtn: "📢 आणीबाणी सायरन",
    highContrastBtn: "⚡ 2G / हाय कॉन्ट्रास्ट",
    simulateBtn: "🔄 आपत्ती घटना सिम्युलेट करा",
    tabMap: "🗺️ थेट पूर रडार आणि सुरक्षित मार्ग",
    tabPinRoute: "📍 पिन कोड मार्ग हवामान तपासणी",
    tabSOS: "🚨 वन-टच एसओएस व बचाव",
    tabCrowdReport: "📸 पडताळणी केलेले अहवाल",
    tabShelters: "⛺ मदत छावण्या व पुरवठा",
    tabTelemetry: "🌧️ हवामान शास्त्रज्ञ बुलेटिन व वारे",
    tabSurvival: "📖 सुरक्षितता मार्गदर्शक व चेक-इन",
    pinSearchTitle: "🔍 पिन कोडवरून प्रवासाच्या मार्गावरील हवामान तपासा",
    originPinPlaceholder: "सुरुवातीचा पिन (उदा. 400001)",
    destPinPlaceholder: "गंतव्य पिन (उदा. 400076)",
    checkRouteBtn: "🚦 रस्त्यावरील धोके व सुरक्षित मार्ग शोधा",
    reportIncidentTitle: "📸 फोटो/व्हिडिओसह हवामानाची माहिती नोंदवा",
    doubleVerifiedBadge: "🛡️ बस/प्रवास पडताळणीकृत नागरिक (खोटे वृत्त बंदी)",
    imdTitle: "🌪️ भारतीय हवामान विभाग (IMD) अंदाज",
    windSpeed: "वाऱ्याचा वेग",
    windGust: "वाऱ्याचा झोत",
    smsBroadcastTitle: "📱 आणीबाणी एसएमएस अलर्ट",
    helplineTitle: "🚨 तात्काळ मदत क्रमांक:"
  },
  ta: {
    appTitle: "லைவ் ரெயின்வைஸ் (ஜல் ரக்ஷா)",
    appSubtitle: "பேரிடர் மேலாண்மை & வெள்ள அவசர கால கட்டுப்பாட்டு மையம்",
    floodThreat: "வெள்ள அபாயம்",
    extreme: "மிகத் தீவிரம்",
    rainfall: "மழைப்பொழிவு",
    offlineReady: "ஆஃப்லைன் தயார்",
    sirenBtn: "📢 அவசர சைரன்",
    highContrastBtn: "⚡ 2G / உயர் மாறுபாடு",
    simulateBtn: "🔄 நிகழ்வு உருவகப்படுத்துதல்",
    tabMap: "🗺️ நேரலை வெள்ள ரேடார் & பாதுகாப்பு பாதை",
    tabPinRoute: "📍 பின்கோடு வழித்தட வானிலை",
    tabSOS: "🚨 ஒரு-தொடு SOS மீட்பு",
    tabCrowdReport: "📸 சரிபார்க்கப்பட்ட புகார்கள்",
    tabShelters: "⛺ நிவாரண முகாம்கள் & இருப்பு",
    tabTelemetry: "🌧️ வானிலை ஆய்வாளர் தகவல் & காற்று",
    tabSurvival: "📖 உயிர் பாதுகாப்பு நெறிமுறைகள்",
    pinSearchTitle: "🔍 பின்கோடு மூலம் பயண வழித்தட வானிலையை அறியவும்",
    originPinPlaceholder: "புறப்படும் பின்கோடு (எ.கா. 400001)",
    destPinPlaceholder: "சேருமிடம் பின்கோடு (எ.கா. 400076)",
    checkRouteBtn: "🚦 வழித்தட ஆபத்துகளை ஆய்வு செய்து மாற்றுப்பாதை காண்க",
    reportIncidentTitle: "📸 புகைப்படம்/வீடியோவுடன் வானிலை தகவலைப் பகிரவும்",
    doubleVerifiedBadge: "🛡️ பேருந்து/பயண சரிபார்க்கப்பட்ட அறிக்கை (போலி தடை)",
    imdTitle: "🌪️ இந்திய வானிலை ஆய்வு மையம் (IMD) எச்சரிக்கை",
    windSpeed: "காற்றின் வேகம்",
    windGust: "சுழல் காற்று",
    smsBroadcastTitle: "📱 அவசர எஸ்எம்எஸ் எச்சரிக்கை",
    helplineTitle: "🚨 அவசர உதவி எண்கள்:"
  },
  te: {
    appTitle: "లైవ్ రెయిన్‌వైజ్ (జల్ రక్ష)",
    appSubtitle: "విపత్తు నిర్వహణ మరియు వరద అత్యవసర స్పందన కేంద్రం",
    floodThreat: "వరద ముప్పు",
    extreme: "తీవ్రమైనది",
    rainfall: "వర్షపాతం",
    offlineReady: "ఆఫ్‌లైన్ సిద్ధం",
    sirenBtn: "📢 అత్యవసర సైరన్",
    highContrastBtn: "⚡ 2G / హై కాంట్రాస్ట్",
    simulateBtn: "🔄 పరిస్థితిని అనుకరించండి",
    tabMap: "🗺️ లైవ్ వరద రాడార్ & సురక్షిత మార్గం",
    tabPinRoute: "📍 పిన్ కోడ్ రూట్ వాతావరణం",
    tabSOS: "🚨 వన్-టచ్ SOS రక్షణ",
    tabCrowdReport: "📸 ధృవీకరించిన నివేదికలు",
    tabShelters: "⛺ పునరావాస కేంద్రాలు",
    tabTelemetry: "🌧️ వాతావరణ నిపుణుల హెచ్చరికలు & గాలి",
    tabSurvival: "📖 మనుగడ సూత్రాలు & చెక్-ఇన్",
    pinSearchTitle: "🔍 పిన్ కోడ్ ద్వారా ప్రయాణ మార్గ వాతావరణాన్ని తనిఖీ చేయండి",
    originPinPlaceholder: "ప్రారంభ పిన్ (ఉదా. 400001)",
    destPinPlaceholder: "గమ్యస్థాన పిన్ (ఉదా. 400076)",
    checkRouteBtn: "🚦 రహదారి ప్రమాదాలు & సురక్షిత మార్గాన్ని కనుగొనండి",
    reportIncidentTitle: "📸 ఫోటో/వీడియోతో వాతావరణ సమాచారాన్ని సమర్పించండి",
    doubleVerifiedBadge: "🛡️ బస్సు ప్రయాణ ధృవీకృత సమాచారం (నకిలీ ఖాతాల నిషేధం)",
    imdTitle: "🌪️ ఐఎండి (IMD) అధికారిక బులెటిన్",
    windSpeed: "గాలి వేగం",
    windGust: "తుఫాను గాలి",
    smsBroadcastTitle: "📱 అత్యవసర SMS హెచ్చరిక",
    helplineTitle: "🚨 హెల్ప్‌లైన్ నంబర్లు:"
  },
  gu: {
    appTitle: "લાઈવ રેઈનવાઈઝ (જલ રક્ષા)",
    appSubtitle: "આપત્તિ વ્યવસ્થાપન અને પૂર ઈમરજન્સી રિસ્પોન્સ કંટ્રોલ સેન્ટર",
    floodThreat: "પૂરનું જોખમ",
    extreme: "અતિ ગંભીર",
    rainfall: "વરસાદનું પ્રમાણ",
    offlineReady: "ઑફલાઇન સક્ષમ",
    sirenBtn: "📢 ઈમરજન્સી સાયરન",
    highContrastBtn: "⚡ 2G / હાઇ કોન્ટ્રાસ્ટ",
    simulateBtn: "🔄 ઘટના સિમ્યુલેટ કરો",
    tabMap: "🗺️ લાઈવ પૂર રડાર અને સલામત માર્ગ",
    tabPinRoute: "📍 પિન કોડ રૂટ હવામાન",
    tabSOS: "🚨 વન-ટચ SOS અને બચાવ",
    tabCrowdReport: "📸 ચકાસાયેલ અહેવાલ",
    tabShelters: "⛺ રાહત શિબિર અને પુરવઠો",
    tabTelemetry: "🌧️ હવામાનશાસ્ત્રી બુલેટિન અને પવન",
    tabSurvival: "📖 જીવન રક્ષણ નિયમો",
    pinSearchTitle: "🔍 પિન કોડ દ્વારા રૂટનું હવામાન તપાસો",
    originPinPlaceholder: "પ્રસ્થાન પિન (દા.ત. 400001)",
    destPinPlaceholder: "ગંતવ્ય પિન (દા.ત. 400076)",
    checkRouteBtn: "🚦 માર્ગના જોખમો અને સલામત ડાયવર્ઝન શોધો",
    reportIncidentTitle: "📸 ફોટો/વિડિયો સાથે હવામાનની સ્થિતિ નોંધો",
    doubleVerifiedBadge: "🛡️ બસ/ટ્રાન્ઝિટ વેરિફાઇડ સિટિઝન (ફેક રિપોર્ટ પ્રતિબંધિત)",
    imdTitle: "🌪️ ભારતીય હવામાન વિભાગ (IMD) ચેતવણી",
    windSpeed: "પવનની ગતિ",
    windGust: "પવનનો ઝોકો",
    smsBroadcastTitle: "📱 ઈમરજન્સી એસએમએસ ચેતવણી",
    helplineTitle: "🚨 તાત્કાલિક હેલ્પલાઇન:"
  },
  kn: {
    appTitle: "ಲೈವ್ ರೇನ್‌ವೈಸ್ (ಜಲ ರಕ್ಷಾ)",
    appSubtitle: "ವಿಪತ್ತು ನಿರ್ವಹಣೆ ಮತ್ತು ಪ್ರವಾಹ ತುರ್ತು ಸ್ಪಂದನಾ ನಿಯಂತ್ರಣ ಕೇಂದ್ರ",
    floodThreat: "ಪ್ರವಾಹದ ಬೆದರಿಕೆ",
    extreme: "ಅತ್ಯಂತ ತೀವ್ರ",
    rainfall: "ಮಳೆ ಪ್ರಮಾಣ",
    offlineReady: "ಆಫ್‌ಲೈನ್ ಸಿದ್ಧ",
    sirenBtn: "📢 ತುರ್ತು ಸೈರನ್",
    highContrastBtn: "⚡ 2G / ಹೈ ಕಾಂಟ್ರಾಸ್ಟ್",
    simulateBtn: "🔄 ಘಟನೆ ಸಿಮ್ಯುಲೇಶನ್",
    tabMap: "🗺️ ಲೈವ್ ಪ್ರವಾಹ ರೇಡಾರ್ & ಸುರಕ್ಷಿತ ಮಾರ್ಗ",
    tabPinRoute: "📍 ಪಿನ್ ಕೋಡ್ ಮಾರ್ಗ ಹವಾಮಾನ",
    tabSOS: "🚨 ಒನ್-ಟಚ್ SOS ರಕ್ಷಣೆ",
    tabCrowdReport: "📸 ಪರಿಶೀಲಿಸಿದ ವರದಿಗಳು",
    tabShelters: "⛺ ಪರಿಹಾರ ಶಿಬಿರಗಳು",
    tabTelemetry: "🌧️ ಹವಾಮಾನ ತಜ್ಞರ ಮಾಹಿತಿ & ಗಾಳಿ",
    tabSurvival: "📖 ಜೀವ ರಕ್ಷಣಾ ನಿಯಮಗಳು",
    pinSearchTitle: "🔍 ಪಿನ್ ಕೋಡ್ ಮೂಲಕ ಪ್ರಯಾಣ ಮಾರ್ಗದ ಹವಾಮಾನ ಪರಿಶೀಲಿಸಿ",
    originPinPlaceholder: "ಆರಂಭಿಕ ಪಿನ್ (ಉದಾ: 400001)",
    destPinPlaceholder: "ಗಮ್ಯಸ್ಥಾನ ಪಿನ್ (ಉದಾ: 400076)",
    checkRouteBtn: "🚦 ಮಾರ್ಗದ ಅಪಾಯಗಳು & ಸುರಕ್ಷಿತ ದಾರಿ ಹುಡುಕಿ",
    reportIncidentTitle: "📸 ಫೋಟೋ/ವೀಡಿಯೊದೊಂದಿಗೆ ಹವಾಮಾನ ವರದಿ ನೀಡಿ",
    doubleVerifiedBadge: "🛡️ ಬಸ್ ಪ್ರಯಾಣ ಪರಿಶೀಲಿಸಿದ ನಾಗರಿಕ (ನಕಲಿ ನಿಷೇಧ)",
    imdTitle: "🌪️ ಭಾರತೀಯ ಹವಾಮಾನ ಇಲಾಖೆ (IMD) ಎಚ್ಚರಿಕೆ",
    windSpeed: "ಗಾಳಿಯ ವೇಗ",
    windGust: "ಬಿರುಗಾಳಿ",
    smsBroadcastTitle: "📱 ತುರ್ತು SMS ಎಚ್ಚರಿಕೆ",
    helplineTitle: "🚨 ತುರ್ತು ಸಹಾಯವಾಣಿ:"
  },
  ml: {
    appTitle: "ലൈവ് റെയിൻവൈസ് (ജൽ രക്ഷ)",
    appSubtitle: "ദുരന്ത നിവാരണ & പ്രളയ അടിയന്തര പ്രതികരണ കൺട്രോൾ റൂം",
    floodThreat: "പ്രളയ സാധ്യത",
    extreme: "അതിതീവ്രം",
    rainfall: "മഴയുടെ അളവ്",
    offlineReady: "ഓഫ്‌ലൈൻ തയ്യാറാണ്",
    sirenBtn: "📢 അടിയന്തര സൈറൺ",
    highContrastBtn: "⚡ 2G / ഹൈ കോൺട്രാസ്റ്റ്",
    simulateBtn: "🔄 സാഹചര്യം സിമുലേറ്റ് ചെയ്യുക",
    tabMap: "🗺️ ലൈവ് പ്രളയ റഡാർ & സുരക്ഷിത പാത",
    tabPinRoute: "📍 പിൻ കോഡ് റൂട്ട് കാലാവസ്ഥ",
    tabSOS: "🚨 വൺ-ടച്ച് SOS രക്ഷാപ്രവർത്തനം",
    tabCrowdReport: "📸 പരിശോധിച്ച വിവരങ്ങൾ",
    tabShelters: "⛺ ദുരിതാശ്വാസ ക്യാമ്പുകൾ",
    tabTelemetry: "🌧️ കാലാവസ്ഥാ ബുള്ളറ്റിൻ & കാറ്റ്",
    tabSurvival: "📖 അതിജീവന പ്രോട്ടോക്കോളുകൾ",
    pinSearchTitle: "🔍 പിൻ കോഡ് ഉപയോഗിച്ച് യാത്രാ പാതയിലെ കാലാവസ്ഥ അറിയാം",
    originPinPlaceholder: "പുറപ്പെടുന്ന പിൻ (ഉദാ. 400001)",
    destPinPlaceholder: "എത്തിച്ചേരേണ്ട പിൻ (ഉദാ. 400076)",
    checkRouteBtn: "🚦 റോഡ് തടസ്സങ്ങളും സുരക്ഷിത പാതയും കണ്ടെത്തുക",
    reportIncidentTitle: "📸 ഫോട്ടോ/വീഡിയോ സഹിതം കാലാവസ്ഥ റിപ്പോർട്ട് ചെയ്യുക",
    doubleVerifiedBadge: "🛡️ ബസ്സ് യാത്രാ സ്ഥിരീകരിച്ച വിവരങ്ങൾ (വ്യാജം തടയും)",
    imdTitle: "🌪️ കേന്ദ്ര കാലാവസ്ഥാ വകുപ്പ് (IMD) മുന്നറിയിപ്പ്",
    windSpeed: "കാറ്റിന്റെ വേഗത",
    windGust: "ചുഴലിക്കാറ്റ്",
    smsBroadcastTitle: "📱 അടിയന്തര SMS സന്ദേശം",
    helplineTitle: "🚨 ഹെൽപ്പ് ലൈൻ നമ്പറുകൾ:"
  },
  pa: {
    appTitle: "ਲਾਈਵ ਰੇਨਵਾਈਜ਼ (ਜਲ ਰਕਸ਼ਾ)",
    appSubtitle: "ਆਫ਼ਤ ਪ੍ਰਬੰਧਨ ਅਤੇ ਹੜ੍ਹ ਐਮਰਜੈਂਸੀ ਕੰਟਰੋਲ ਸੈਂਟਰ",
    floodThreat: "ਹੜ੍ਹ ਦਾ ਖ਼ਤਰਾ",
    extreme: "ਬਹੁਤ ਗੰਭੀਰ",
    rainfall: "ਮੀਂਹ ਦੀ ਮਾਤਰਾ",
    offlineReady: "ਆਫਲਾਈਨ ਤਿਆਰ",
    sirenBtn: "📢 ਐਮਰਜੈਂਸੀ ਸਾਇਰਨ",
    highContrastBtn: "⚡ 2G / ਹਾਈ ਕੰਟ੍ਰਾਸਟ",
    simulateBtn: "🔄 ਘਟਨਾ ਸਿਮੂਲੇਟ ਕਰੋ",
    tabMap: "🗺️ ਲਾਈਵ ਹੜ੍ਹ ਰਾਡਾਰ ਤੇ ਸੁਰੱਖਿਅਤ ਰਸਤਾ",
    tabPinRoute: "📍 ਪਿੰਨ ਕੋਡ ਰੂਟ ਮੌਸਮ",
    tabSOS: "🚨 ਵਨ-ਟਚ SOS ਤੇ ਬਚਾਅ",
    tabCrowdReport: "📸 ਪ੍ਰਮਾਣਿਤ ਘਟਨਾ ਰਿਪੋਰਟਾਂ",
    tabShelters: "⛺ ਰਾਹਤ ਕੈਂਪ ਤੇ ਸਪਲਾਈ",
    tabTelemetry: "🌧️ ਮੌਸਮ ਵਿਭਾਗ ਬੁਲੇਟਿਨ ਤੇ ਹਵਾ",
    tabSurvival: "📖 ਬਚਾਅ ਨਿਯਮ ਤੇ ਚੈੱਕ-ਇਨ",
    pinSearchTitle: "🔍 ਪਿੰਨ ਕੋਡ ਰਾਹੀਂ ਯਾਤਰਾ ਰਸਤੇ ਦਾ ਮੌਸਮ ਦੇਖੋ",
    originPinPlaceholder: "ਸ਼ੁਰੂਆਤੀ ਪਿੰਨ (ਜਿਵੇਂ 400001)",
    destPinPlaceholder: "ਮੰਜ਼ਿਲ ਪਿੰਨ (ਜਿਵੇਂ 400076)",
    checkRouteBtn: "🚦 ਰਸਤੇ ਦੇ ਖ਼ਤਰੇ ਅਤੇ ਬਦਲਵਾਂ ਰਸਤਾ ਲੱਭੋ",
    reportIncidentTitle: "📸 ਫੋਟੋ/ਵੀਡੀਓ ਨਾਲ ਮੌਸਮ ਦੀ ਜਾਣਕਾਰੀ ਦਿਓ",
    doubleVerifiedBadge: "🛡️ ਬੱਸ ਯਾਤਰਾ ਪ੍ਰਮਾਣਿਤ ਰਿਪੋਰਟਰ (ਜਾਅਲੀ ਰਿਪੋਰਟ ਰੋਕੂ)",
    imdTitle: "🌪️ ਭਾਰਤੀ ਮੌਸਮ ਵਿਭਾਗ (IMD) ਅਲਰਟ",
    windSpeed: "ਹਵਾ ਦੀ ਗਤੀ",
    windGust: "ਤੇਜ਼ ਝੱਖੜ",
    smsBroadcastTitle: "📱 ਐਮਰਜੈਂਸੀ SMS ਅਲਰਟ",
    helplineTitle: "🚨 ਹੈਲਪਲਾਈਨ ਨੰਬਰ:"
  },
  or: {
    appTitle: "ଲାଇଭ୍ ରେନୱାଇଜ୍ (ଜଳ ରକ୍ଷା)",
    appSubtitle: "ବିପର୍ଯ୍ୟୟ ପରିଚାଳନା ଏବଂ ବନ୍ୟା ଜରୁରୀକାଳୀନ କେନ୍ଦ୍ର",
    floodThreat: "ବନ୍ୟା ଆଶଙ୍କା",
    extreme: "ଅତ୍ୟନ୍ତ ଭୟଙ୍କର",
    rainfall: "ବର୍ଷା ପରିମାଣ",
    offlineReady: "ଅଫଲାଇନ୍ ପ୍ରସ୍ତୁତ",
    sirenBtn: "📢 ଜରୁରୀକାଳୀନ ସାଇରନ୍",
    highContrastBtn: "⚡ 2G / ହାଇ କଣ୍ଟ୍ରାଷ୍ଟ",
    simulateBtn: "🔄 ପରିସ୍ଥିତି ସିମୁଲେଟ୍",
    tabMap: "🗺️ ଲାଇଭ୍ ବନ୍ୟା ରାଡାର୍ ଓ ସୁରକ୍ଷିତ ରାସ୍ତା",
    tabPinRoute: "📍 ପିନ୍ କୋଡ୍ ରୁଟ୍ ପାଣିପାଗ",
    tabSOS: "🚨 ୱାନ୍-ଟଚ୍ SOS ଉଦ୍ଧାର",
    tabCrowdReport: "📸 ଯାଞ୍ଚ ହୋଇଥିବା ରିପୋର୍ଟ",
    tabShelters: "⛺ ରିଲିଫ୍ କ୍ୟାମ୍ପ୍ ଓ ସାମଗ୍ରୀ",
    tabTelemetry: "🌧️ ପାଣିପାଗ ବିଜ୍ଞାନୀ ସୂଚନା ଓ ପବନ",
    tabSurvival: "📖 ଜୀବନ ରକ୍ଷା ନିୟମାବଳୀ",
    pinSearchTitle: "🔍 ପିନ୍ କୋଡ୍ ସାହାଯ୍ୟରେ ଯାତ୍ରା ପଥର ପାଣିପାଗ ଯାଞ୍ଚ କରନ୍ତୁ",
    originPinPlaceholder: "ଉତ୍ସ ପିନ୍ (ଯଥା 400001)",
    destPinPlaceholder: "ଗନ୍ତବ୍ୟ ପିନ୍ (ଯଥା 400076)",
    checkRouteBtn: "🚦 ରାସ୍ତା ବିପଦ ଏବଂ ସୁରକ୍ଷିତ ବାଟ ଖୋଜନ୍ତୁ",
    reportIncidentTitle: "📸 ଫଟୋ/ଭିଡିଓ ସହ ପାଣିପାଗ ସ୍ଥିତି ରିପୋର୍ଟ କରନ୍ତୁ",
    doubleVerifiedBadge: "🛡️ ବସ୍/ଯାତ୍ରା ପ୍ରମାଣିତ ରିପୋର୍ଟର୍ (ନକଲି ବନ୍ଦ)",
    imdTitle: "🌪️ ଭାରତୀୟ ପାଣିପାଗ ବିଭାଗ (IMD) ବୁଲେଟିନ୍",
    windSpeed: "ପବନର ବେଗ",
    windGust: "ଝଡ଼ ପବନ",
    smsBroadcastTitle: "📱 ଜରୁରୀକାଳୀନ SMS ସତର୍କତା",
    helplineTitle: "🚨 ଜରୁରୀକାଳୀନ ହେଲ୍ପଲାଇନ୍:"
  }
};

class I18nEngine {
  constructor() {
    this.currentLang = localStorage.getItem('monsoon_selected_language') || 'en';
    this.init();
  }

  init() {
    this.applyLanguage(this.currentLang);
  }

  setLanguage(langCode) {
    if (TRANSLATIONS[langCode]) {
      this.currentLang = langCode;
      localStorage.setItem('monsoon_selected_language', langCode);
      this.applyLanguage(langCode);
      window.app?.showToast(`Language updated to ${this.getLangName(langCode)}`, 'success');
    }
  }

  getLangName(code) {
    const map = {
      en: 'English', hi: 'हिन्दी (Hindi)', bn: 'বাংলা (Bengali)', mr: 'मराठी (Marathi)',
      ta: 'தமிழ் (Tamil)', te: 'తెలుగు (Telugu)', gu: 'ગુજરાતી (Gujarati)',
      kn: 'ಕನ್ನಡ (Kannada)', ml: 'മലയാളം (Malayalam)', pa: 'ਪੰਜਾਬੀ (Punjabi)', or: 'ଓଡ଼ିଆ (Odia)'
    };
    return map[code] || code;
  }

  getText(key) {
    const langDict = TRANSLATIONS[this.currentLang] || TRANSLATIONS.en;
    return langDict[key] || TRANSLATIONS.en[key] || key;
  }

  applyLanguage(lang) {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;

    // Update elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = dict[key];
        } else {
          el.textContent = dict[key];
        }
      }
    });

    // Update select dropdown if present
    const selector = document.getElementById('language-select');
    if (selector) {
      selector.value = lang;
    }
  }
}

window.i18n = new I18nEngine();
