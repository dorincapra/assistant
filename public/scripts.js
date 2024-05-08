document
  .getElementById("toggle-chat-btn")
  .addEventListener("click", function () {
    var chatContainer = document.getElementById("chat-container-assistant");
    chatContainer.classList.add("chat-shown");
    this.classList.add("chat-hidden");
  });

document
  .getElementById("close-chat-btn")
  .addEventListener("click", function () {
    var chatContainer = document.getElementById("chat-container-assistant");
    chatContainer.classList.remove("chat-shown");
    document.getElementById("toggle-chat-btn").classList.remove("chat-hidden");
  });
