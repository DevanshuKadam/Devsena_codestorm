// Language configurations
const languageConfig = {
  en: {
    voiceName: 'Microsoft Mark - English (United States)',
    langCode: 'en-US',
    rate: 1.3
  },
  hi: {
    voiceName: 'Microsoft Hemant - Hindi (India)',
    langCode: 'hi-IN',
    rate: 1.0
  }
};

async function translateText(text, targetLang) {
  // Skip translation if target language is English
  if (targetLang === 'en') return text;

  const sourceLang = 'en'; // Assuming source is always English

  try {
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${import.meta.env.VITE_GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: sourceLang,
          target: targetLang,
          format: 'text'
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Translation failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.translations[0].translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Fallback to original text on error
  }
}

function getVoices() {
  return new Promise(resolve => {
    let voices = window.speechSynthesis.getVoices();
    if (voices.length) {
      resolve(voices);
    } else {
      window.speechSynthesis.onvoiceschanged = () => 
        resolve(window.speechSynthesis.getVoices());
    }
  });
}

export async function speakText(text) {
  const synth = window.speechSynthesis;
  let language;
  
  try {
    language = localStorage.getItem('app_language_preference') || 'en';
  } catch (error) {
    console.warn('Failed to read language preference:', error);
    language = 'en';
  }

  try {
    const voices = await getVoices();
    const config = languageConfig[language];
    
    // Translate if needed
    const translatedText = language !== 'en'
      ? await translateText(text, language)
      : text;
    
    const utterance = new SpeechSynthesisUtterance(translatedText);
    // console.log(voices)
    const selectedVoice = language == 'en' ? voices.find(voice =>
      voice.name.includes(config.voiceName)
    ) : voices.find(voice =>
      voice.lang.includes(config.langCode)
    )

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    } else {
      console.warn(`Voice ${config.voiceName} not found. Using default voice.`);
    }
    
    utterance.lang = config.langCode;
    utterance.rate = config.rate;
    utterance.pitch = 1;

    return new Promise((resolve, reject) => {
      utterance.onend = resolve;
      utterance.onerror = reject;
      synth.speak(utterance);
    });
  } catch (error) {
    console.error('Error in text-to-speech:', error);
  }
}