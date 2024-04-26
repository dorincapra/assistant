document
  .getElementById("toggle-chat-btn")
  .addEventListener("click", function () {
    var chatContainer = document.getElementById("chat-container");
    chatContainer.classList.add("chat-shown");
    this.classList.add("chat-hidden");
  });

document
  .getElementById("close-chat-btn")
  .addEventListener("click", function () {
    var chatContainer = document.getElementById("chat-container");
    chatContainer.classList.remove("chat-shown");
    document.getElementById("toggle-chat-btn").classList.remove("chat-hidden");
  });
