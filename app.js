emailjs.init("gZEqoaLW8uSprpcyt");

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

  const templateParams = {
    to_email: recipient,
    subject: subject,
    message: message,
    name: "Hermes User"
  };

  emailjs.send(
    "service_1drjo6p",
    "template_scpcz1q",
    templateParams
  )
  .then(function () {
    alert("Email sent successfully!");

    form.reset();
  })
  .catch(function (error) {
    console.error("FAILED...", error);
    alert("Failed to send email.");
  });
});