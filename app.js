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

let pendingRecipient = null;

// Load contacts from core.json
async function loadContacts() {
  try {
    const response = await fetch("data/core.json");
    const data = await response.json();

    data.contacts.forEach(contact => {
      const option = document.createElement("option");
      option.value = contact.email;
      option.textContent = contact.name;
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
  confirmPin.textContent = "Confirm";
  confirmPin.disabled = false;
  pinModal.classList.remove("hidden");
  pinInput.focus();
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
      pinError.textContent = "Invalid PIN";
      pinInput.value = "";
      pinInput.focus();
      return;
    }

    pinError.textContent = "";
    confirmPin.textContent = "✈ Sending...";
    confirmPin.disabled = true;

    form.action = `https://formsubmit.co/${pendingRecipient}`;

    setTimeout(() => {
      form.submit();
    }, 500);

  } catch (error) {
    console.error("Failed to load PIN:", error);
    pinError.textContent = "PIN validation failed";
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