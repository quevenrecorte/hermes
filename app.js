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

// New Elements
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

// Templates Data
const templates = {
  medical: {
    subject: "MEDICAL EMERGENCY",
    message: "A medical emergency has occurred at my location. Please send immediate assistance. Individual requires immediate attention."
  },
  security: {
    subject: "SECURITY INCIDENT",
    message: "A security breach/incident is actively occurring. Immediate response is required to secure the perimeter and ensure safety."
  },
  power: {
    subject: "INFRASTRUCTURE FAILURE",
    message: "Significant power or infrastructure failure detected. Critical systems may be offline. Awaiting further instructions."
  },
  weather: {
    subject: "SEVERE WEATHER WARNING",
    message: "Severe weather conditions are impacting our sector. Taking shelter and following standard safety protocols."
  },
  checkin: {
    subject: "ROUTINE STATUS CHECK",
    message: "All systems nominal. Personnel accounted for. No incidents to report at this time."
  }
};

// Update Theme based on Urgency
urgencyRadios.forEach(radio => {
  radio.addEventListener('change', (e) => {
    const urgency = e.target.value;
    html.setAttribute('data-theme', urgency);
    
    // Update status text
    if(urgency === 'routine') statusText.textContent = 'SYSTEM SECURE';
    if(urgency === 'urgent') statusText.textContent = 'ELEVATED ALERT';
    if(urgency === 'critical') statusText.textContent = 'CRITICAL ALERT';
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
  confirmPin.textContent = "AUTHORIZE";
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
      pinError.textContent = "INVALID CRYPTOGRAPHIC PIN";
      pinInput.value = "";
      pinInput.focus();
      return;
    }

    pinError.textContent = "";
    confirmPin.innerHTML = '<i class="ph ph-spinner ph-spin"></i> TRANSMITTING...';
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
    pinError.textContent = "SYSTEM ERROR: PIN VALIDATION FAILED";
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
    alert("SYSTEM HALT: Missing recipient email.");
    return;
  }

  if (!subject) {
    alert("SYSTEM HALT: Subject payload missing.");
    return;
  }

  if (!message) {
    alert("SYSTEM HALT: Message payload missing.");
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