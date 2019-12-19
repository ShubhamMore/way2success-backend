const Student = require('../models/student.model');
const sendMail = require('../email/mail');

const sendWishes = async () => {
  const now = new Date();
  const date = new RegExp(
    '.*' + (now.getMonth() + 1).toString() + '-' + now.getDate() + '.*'
  );
  const students = await Student.find(
    { birthDate: date },
    { _id: 0, name: 1, email: 1 }
  );
  const n = students.length;
  for (let i = 0; i < n; i++) {
    const mail = {
      from: process.env.EMAIL,
      to: students[i].email,
      subject: `Happy Birthday ${students[
        i
      ].name.toUpperCase()} From Way2Success`,
      text: '',
      html: `<strong>Happy Birthday <em>${students[
        i
      ].name.toUpperCase()}</em></strong><br><p>Wishing you happiness, good health and a great year ahead. Wishing you all the best that life has to offer on your birthday. May you always stay happy and blessed! May this day bring countless happiness and endless joy and live with peace and serenity.</p><br><p style="text-align: right;">From Way2Success</p>`
    };
    await sendMail(mail);
  }
};

const birthDayWishes = async () => {
  const now = new Date();
  let milliSecTill7 =
    new Date(now.getFullYear(), now.getMonth(), now.getDate(), 15, 36, 0, 0) -
    now;
  if (milliSecTill7 < 0) {
    milliSecTill7 += 86400000; // it's after 7am, try 7am tomorrow.
  }

  setTimeout(async () => {
    await sendWishes();
    setInterval(async () => {
      await sendWishes();
    }, 86400000);
  }, milliSecTill7);
};

module.exports = birthDayWishes;
