import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false });
  }

  const { name, email, message } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.verify();

    await transporter.sendMail({
      from: `"Trees Tech" <${process.env.EMAIL_USER}>`,
      to: "trees.sanjuan@gmail.com",
      replyTo: email,
      subject: `Nuevo mensaje de ${name}`,
      text: message,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("MAIL ERROR:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
