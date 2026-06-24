const form = document.getElementById("emailForm");
const contactSelect = document.getElementById("contact");
const manualEmailInput = document.getElementById("manualEmail");
const subjectInput = document.getElementById("subject");
const messageInput = document.getElementById("message");

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

// Validate PIN from runtime.json
async function validatePin() {
  try {
    const response = await fetch("data/runtime.json");
    const data = await response.json();

    const enteredPin = prompt("Enter PIN to send email:");

    if (enteredPin === null) {
      return false;
    }

    return enteredPin === data.pin;
  } catch (error) {
    console.error("Failed to load PIN:", error);
    return false;
  }
}

// Form submit handler
form.addEventListener("submit", async function (e) {
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

  const pinValid = await validatePin();

  if (!pinValid) {
    alert("Invalid PIN.");
    return;
  }

  form.action = `https://formsubmit.co/${recipient}`;

  alert("Sending email...");

  form.submit();
});

// Initial load
loadContacts();