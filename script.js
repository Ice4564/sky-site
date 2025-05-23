const form = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const messageBox = document.getElementById('formMessage');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // แสดงสถานะ loading
  submitBtn.classList.add('loading');
  messageBox.textContent = "กำลังส่งข้อความ...";
  messageBox.className = "message-box visible";

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
      messageBox.textContent = "ส่งข้อความสำเร็จ! ขอบคุณที่ติดต่อเรา 😊 จะติดต่อกลับในไม่ช้า";
      messageBox.className = "message-box visible success";
      form.reset();
    } else {
      throw new Error('เกิดข้อผิดพลาดในการส่ง');
    }
  } catch (error) {
    messageBox.textContent = "ส่งข้อความไม่สำเร็จ กรุณาลองใหม่อีกครั้ง";
    messageBox.className = "message-box visible error";
  } finally {
    submitBtn.classList.remove('loading');
  }
});
