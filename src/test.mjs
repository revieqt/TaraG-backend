// testContactApi.mjs
const response = await fetch('http://tarag-backend.onrender.com/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: "Joshua Opsima",
      email: "opsima.josh@gmail.com",
      contactNumber: "09123456789",
      subject: "I want to be a developer",
      message: "I want to be a developer"
    })
  });
  console.log(await response.json());