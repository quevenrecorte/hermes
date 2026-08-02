const form = document.getElementById("emailForm");
const contactSelect = document.getElementById("contact");
const manualEmailInput = document.getElementById("manualEmail");
const subjectInput = document.getElementById("subject");
const messageInput = document.getElementById("message");

const pinModal = document.getElementById("pinModal");
const pinInput = document.getElementById("pinInput");
const confirmPin = document.getElementById("confirmPin");
const cancelPin = document.getElementById("cancelPin");
const pinError = document.getElementById("pinError");

// UI Elements
const urgencyRadios = document.querySelectorAll('input[name="urgency"]');
const templateSelect = document.getElementById("templateSelect");
const attachmentInput = document.getElementById("attachment");
const fileNameDisplay = document.getElementById("fileName");
const locationBtn = document.getElementById("locationBtn");
const locationText = document.getElementById("locationText");
const html = document.documentElement;
const statusText = document.querySelector(".status-text");

let pendingRecipient = null;
let userLocation = "";

// Simple, clear message templates
const templates = {
  medical: {
    subject: "MEDICAL EMERGENCY",
    message: "There is a medical emergency here. Please send help immediately."
  },
  security: {
    subject: "SECURITY INCIDENT",
    message: "There is a security problem here. We need assistance to keep everyone safe."
  },
  power: {
    subject: "POWER OUTAGE",
    message: "The power is out here. Some of our systems are offline. Please let us know what to do."
  },
  weather: {
    subject: "SEVERE WEATHER WARNING",
    message: "We are having severe weather here. We are staying safe inside and waiting it out."
  },
  checkin: {
    subject: "ROUTINE STATUS CHECK-IN",
    message: "Everything is okay here. All team members are safe and there are no problems."
  },
  lost_phone: {
    subject: "LOST PHONE - CONTACT ME",
    message: "I have lost my phone or am using a different device. Please contact me through this email as soon as possible."
  },
  unsafe: {
    subject: "UNSAFE STATUS - TRACK MY LOCATION",
    message: "I do not feel safe at my current location. Please track my coordinates and contact me immediately."
  },
  ride: {
    subject: "NEED A RIDE / FETCH ME",
    message: "I need a ride and would like to be picked up from my current location. Please let me know if you can fetch me."
  },
  help: {
    subject: "NEED URGENT HELP",
    message: "I need urgent help or assistance. Please reach out to me as soon as you see this."
  },
  late: {
    subject: "RUNNING LATE",
    message: "I am running late but everything is fine. I will keep you updated."
  }
};

// Update Theme based on Urgency
urgencyRadios.forEach(radio => {
  radio.addEventListener('change', (e) => {
    const urgency = e.target.value;
    html.setAttribute('data-theme', urgency);
    
    // Update status text with simple terms
    if (urgency === 'routine') statusText.textContent = 'READY TO SEND';
    if (urgency === 'urgent') statusText.textContent = 'URGENT ALERT';
    if (urgency === 'critical') statusText.textContent = 'EMERGENCY ALERT';
  });
});

// Handle Templates
templateSelect.addEventListener('change', (e) => {
  const selected = e.target.value;
  if (selected && templates[selected]) {
    const urgency = document.querySelector('input[name="urgency"]:checked').value;
    const prefix = urgency !== 'routine' ? `[${urgency.toUpperCase()}] ` : '';
    subjectInput.value = prefix + templates[selected].subject;
    
    // Append location if it exists
    let bodyText = templates[selected].message;
    if (userLocation) {
      bodyText += `\n\nGPS Coordinates: ${userLocation}`;
    }
    messageInput.value = bodyText;
  }
});

// File Attachment Handler
attachmentInput.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    fileNameDisplay.textContent = e.target.files[0].name;
    fileNameDisplay.parentElement.classList.add('active');
  } else {
    fileNameDisplay.textContent = 'Attach File';
    fileNameDisplay.parentElement.classList.remove('active');
  }
});

// Location Handler
locationBtn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser");
    return;
  }

  locationText.textContent = "Locating...";
  locationBtn.classList.add('active');

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const mapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
      userLocation = mapsLink;
      
      locationText.textContent = "Location Pinned";
      
      // If message isn't empty and doesn't have a map link, append it
      if (messageInput.value && !messageInput.value.includes("maps?q=")) {
         messageInput.value += `\n\nGPS Coordinates: ${mapsLink}`;
      } else if (!messageInput.value) {
         messageInput.value = `GPS Coordinates: ${mapsLink}`;
      }
    },
    () => {
      alert("Unable to retrieve your location");
      locationText.textContent = "Pin Location";
      locationBtn.classList.remove('active');
    }
  );
});

// Load contacts from core.json
async function loadContacts() {
  try {
    const response = await fetch("data/core.json");
    const data = await response.json();

    data.contacts.forEach(contact => {
      const option = document.createElement("option");
      option.value = contact.email;
      option.textContent = contact.name.toUpperCase();
      contactSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Failed to load contacts:", error);
  }
}

// Show PIN modal
function showPinModal(recipient) {
  pendingRecipient = recipient;
  pinInput.value = "";
  pinError.textContent = "";
  confirmPin.textContent = "CONFIRM & SEND";
  confirmPin.disabled = false;
  pinModal.classList.remove("hidden");
  setTimeout(() => pinInput.focus(), 100);
}

// Hide PIN modal
function hidePinModal() {
  pinModal.classList.add("hidden");
}

// Validate PIN from runtime.json
async function checkPin() {
  try {
    const response = await fetch("data/runtime.json");
    const data = await response.json();

    if (pinInput.value !== data.pin) {
      pinError.textContent = "INCORRECT PIN";
      pinInput.value = "";
      pinInput.focus();
      return;
    }

    pinError.textContent = "";
    confirmPin.innerHTML = '<i class="ph ph-spinner ph-spin"></i> SENDING...';
    confirmPin.disabled = true;

    // Apply urgency prefix to subject before sending if not already there
    const urgency = document.querySelector('input[name="urgency"]:checked').value;
    if (urgency !== 'routine' && !subjectInput.value.toUpperCase().includes(`[${urgency.toUpperCase()}]`)) {
      subjectInput.value = `[${urgency.toUpperCase()}] ${subjectInput.value}`;
    }

    form.action = `https://formsubmit.co/${pendingRecipient}`;

    setTimeout(() => {
      form.submit();
    }, 800);

  } catch (error) {
    console.error("Failed to load PIN:", error);
    pinError.textContent = "PIN ERROR: VALIDATION FAILED";
  }
}

// Confirm PIN button
confirmPin.addEventListener("click", checkPin);

// Cancel button
cancelPin.addEventListener("click", hidePinModal);

// Form submit handler
form.addEventListener("submit", function (e) {
  e.preventDefault();

  const selectedContact = contactSelect.value;
  const manualEmail = manualEmailInput.value.trim();
  const subject = subjectInput.value.trim();
  const message = messageInput.value.trim();

  const recipient = manualEmail || selectedContact;

  if (!recipient) {
    alert("Please select or enter a recipient email.");
    return;
  }

  if (!subject) {
    alert("Please enter a subject.");
    return;
  }

  if (!message) {
    alert("Please enter a message.");
    return;
  }

  showPinModal(recipient);
});

pinInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    checkPin();
  }
});

// Initial load
loadContacts();
