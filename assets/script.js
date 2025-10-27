document.addEventListener("DOMContentLoaded", function() {
  // Current language
  let currentLang = localStorage.getItem('language') || 'it';

  // Theme Toggle
  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;

  // Load saved theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    body.classList.add('dark-mode');
  }

  themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const theme = body.classList.contains('dark-mode') ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
  });

  // Language Toggle
  const languageToggle = document.getElementById('languageToggle');

  // Apply saved language
  document.documentElement.lang = currentLang;
  updateLanguage(currentLang);

  languageToggle.addEventListener('click', () => {
    currentLang = currentLang === 'it' ? 'en' : 'it';
    document.documentElement.lang = currentLang;
    localStorage.setItem('language', currentLang);
    updateLanguage(currentLang);
  });

  // Update language function
  function updateLanguage(lang) {
    document.getElementById('flag').src = lang === 'it' ? 'assets/it.svg' : 'assets/en.svg';
    const t = translations[lang];

    document.querySelector('h1').innerHTML = `<i class="fas fa-moon text-primary"></i> ${t.title}`;
    document.querySelector('label[for="bedDate"]').innerHTML = `<i class="fas fa-bed"></i> ${t.bedDateLabel}`;
    document.querySelector('label[for="bedTime"]').innerHTML = `<i class="fas fa-clock"></i> ${t.bedTimeLabel}`;
    document.querySelector('label[for="wakeDate"]').innerHTML = `<i class="fas fa-sun"></i> ${t.wakeDateLabel}`;
    document.querySelector('label[for="wakeTime"]').innerHTML = `<i class="fas fa-alarm-clock"></i> ${t.wakeTimeLabel}`;
    document.querySelector('button[type="submit"]').innerHTML = `<i class="fas fa-calculator"></i> ${t.calculateButton}`;
    document.querySelector('#result h3').innerHTML = `<i class="fas fa-moon"></i> ${t.resultTitle}`;

    // Update title
    document.title = t.title;

    // Update result if already displayed
    const resultCard = document.getElementById('result');
    if (resultCard.classList.contains('show')) {
      const hoursValue = resultCard.dataset.hours;
      if (hoursValue) {
        const hours = parseInt(hoursValue);
        if (hours === 1) {
          document.getElementById('hoursDisplay').textContent = t.oneHourText;
        } else {
          document.getElementById('hoursDisplay').textContent = `${hours} ${t.hoursText}`;
        }
      }
    }
  }

  // Error toast function
  function showError(message) {
    const toastElement = document.getElementById('errorToast');
    const toastMessage = document.getElementById('toastMessage');
    toastMessage.textContent = message;

    const toast = new bootstrap.Toast(toastElement);
    toast.show();
  }

  // Sleep Calculator
  const sleepForm = document.getElementById('sleepForm');
  const result = document.getElementById('result');
  const hoursDisplay = document.getElementById('hoursDisplay');

  sleepForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const bedDate = document.getElementById('bedDate').value;
    const bedTime = parseInt(document.getElementById('bedTime').value);
    const wakeDate = document.getElementById('wakeDate').value;
    const wakeTime = parseInt(document.getElementById('wakeTime').value);

    const t = translations[currentLang];

    // Validate hours
    if (bedTime < 0 || bedTime > 23 || wakeTime < 0 || wakeTime > 23) {
      showError(t.errorInvalidHour);
      return;
    }

    // Create date objects
    const bedDateTime = new Date(`${bedDate}T${bedTime.toString().padStart(2, '0')}:00:00`);
    const wakeDateTime = new Date(`${wakeDate}T${wakeTime.toString().padStart(2, '0')}:00:00`);

    // Calculate difference in hours
    const diffMs = wakeDateTime - bedDateTime;

    if (diffMs <= 0) {
      showError(t.errorInvalidTime);
      return;
    }

    const hours = Math.round(diffMs / (1000 * 60 * 60));

    // Display result with translation
    if (hours === 1) {
      hoursDisplay.textContent = t.oneHourText;
    } else {
      hoursDisplay.textContent = `${hours} ${t.hoursText}`;
    }
    result.classList.add('show');
    result.dataset.hours = hours;

    // Scroll to result
    result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  // Imposta la data di oggi come default
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const currentHour = now.getHours();

  // Imposta la data minima per bedDate (non può essere prima di oggi)
  document.getElementById('bedDate').setAttribute('min', today);

  // Calcola l'ora di andata a dormire (ora successiva)
  const bedHour = currentHour + 1;

  // Se l'ora di andata a dormire supera le 23, passa al giorno successivo
  if (bedHour > 23) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    document.getElementById('bedDate').value = tomorrowStr;
    document.getElementById('bedTime').value = 0; // Mezzanotte del giorno dopo
    // Imposta min per wakeDate
    document.getElementById('wakeDate').setAttribute('min', tomorrowStr);
  } else {
    document.getElementById('bedDate').value = today;
    document.getElementById('bedTime').value = bedHour;
    // Imposta min per wakeDate
    document.getElementById('wakeDate').setAttribute('min', today);
  }

  // Se l'ora di andata a dormire è >= 18, il giorno di sveglia è il successivo
  if (bedHour >= 18 && bedHour <= 23) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('wakeDate').value = tomorrow.toISOString().split('T')[0];
  } else if (bedHour > 23) {
    // Se andiamo a dormire dopo mezzanotte (0:00 del giorno dopo), sveglia è 2 giorni dopo
    const dayAfterTomorrow = new Date(now);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    document.getElementById('wakeDate').value = dayAfterTomorrow.toISOString().split('T')[0];
  } else {
    // Se andiamo a dormire prima delle 18, sveglia è lo stesso giorno
    document.getElementById('wakeDate').value = document.getElementById('bedDate').value;
  }

  // Aggiorna automaticamente la data di sveglia quando cambia la data di andata a dormire
  document.getElementById('bedDate').addEventListener('change', function() {
    const bedDate = this.value;
    const wakeDate = document.getElementById('wakeDate');

    // Aggiorna il min per wakeDate in base a bedDate
    wakeDate.setAttribute('min', bedDate);

    // Se la data di sveglia è precedente alla data di andata a dormire, aggiornala
    if (wakeDate.value && new Date(wakeDate.value) < new Date(bedDate)) {
      wakeDate.value = bedDate;
    }
  });

  // Aggiorna anche il min di wakeDate quando cambia l'ora di andata a dormire
  document.getElementById('bedTime').addEventListener('change', function() {
    const bedDate = document.getElementById('bedDate').value;
    document.getElementById('wakeDate').setAttribute('min', bedDate);
  });

  document.getElementById('t').addEventListener('click', function() {
    window.location.href = 'trapano';
  });
  document.getElementById('s').addEventListener('click', function() {
    window.location.href = 'shampoo';
  });
});

const translations = {
  it: {
    title: 'Calcola ore di sonno',
    bedDateLabel: 'Data di andata a dormire',
    bedTimeLabel: 'Orario di andata a dormire (ora)',
    wakeDateLabel: 'Data di sveglia',
    wakeTimeLabel: 'Orario di sveglia (ora)',
    calculateButton: 'Calcola',
    resultTitle: 'Durata del sonno',
    hoursText: 'ore',
    oneHourText: "Un'ora",
    errorInvalidTime: 'L\'orario di sveglia deve essere successivo all\'orario di andata a dormire!',
    errorInvalidHour: 'Inserisci un orario valido (0-23)!',
  },
  en: {
    title: 'Sleep Hours Calculator',
    bedDateLabel: 'Bedtime date',
    bedTimeLabel: 'Bedtime (hour)',
    wakeDateLabel: 'Wake up date',
    wakeTimeLabel: 'Wake up time (hour)',
    calculateButton: 'Calculate',
    resultTitle: 'Sleep Duration',
    hoursText: 'hours',
    oneHourText: 'One hour',
    errorInvalidTime: 'Wake up time must be after bedtime!',
    errorInvalidHour: 'Enter a valid time (0-23)!',
  }
};
