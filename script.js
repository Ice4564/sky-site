const form = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const messageBox = document.getElementById('formMessage');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  messageBox.textContent = "กำลังส่งข้อความ...";
  messageBox.className = "message-box loading";

  const formData = new FormData(form);

  try {
    const response = await fetch(form.action, {
      method: form.method,
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      messageBox.textContent = "ส่งข้อความสำเร็จ! ขอบคุณที่ติดต่อเรา 😊";
      messageBox.className = "message-box success";
      form.reset();
    } else {
      throw new Error('error');
    }
  } catch (error) {
    messageBox.textContent = "ส่งข้อความไม่สำเร็จ กรุณาลองใหม่อีกครั้ง";
    messageBox.className = "message-box error";
  }
});
