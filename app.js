const form = document.getElementById("emailForm");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const selectedContact = document.getElementById("contact").value;
  const manualEmail = document.getElementById("manualEmail").value.trim();
  const subject = document.getElementById("subject").value.trim();
  const message = document.getElementById("message").value.trim();

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

  alert("Hermes is ready to send email.");
});