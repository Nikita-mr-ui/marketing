const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const TARGETS_FILE = path.join(__dirname, 'targets.json');

const transporter = nodemailer.createTransport({
    host: 'smtp.mail.ru',
    port: 587, // Альтернативный порт, который отлично пропускает домашний интернет
    secure: false, // Для 587 всегда false
    connectionTimeout: 15000, 
    greetingTimeout: 15000,   
    auth: {
       user: 'backupsmart.team@mail.ru', 
       pass: 'i2Wy34daZQWok8i7ZmHx' // Твой пароль приложения Mail.ru
    }
});

function sendNextEmail() {
    if (!fs.existsSync(TARGETS_FILE)) {
        console.log('❌ Файл targets.json не найден!');
        return;
    }

    let rawData = fs.readFileSync(TARGETS_FILE, 'utf8').replace(/^\uFEFF/, '');
    let targets = JSON.parse(rawData);

    if (targets.length === 0) {
        console.log('🎉 🎉 🎉 ВСЕ ПИСЬМА УСПЕШНО ОТПРАВЛЕНЫ! Робот уходит на покой.');
        process.exit(0);
    }

    const currentTarget = targets.shift();

    const mailOptions = {
        from: '"BackupSmart Team" <backupsmart.team@mail.ru>', 
        to: currentTarget,
        subject: 'Production-ready encrypted backup engine for your Node.js apps',
        text: `Hi Team,\n\nIf one of your production databases fails tonight, how long will it take your team to restore it without losing client data?\n\nWe are a small indie team and we've built BackupSmart — a lightweight, autonomous backup engine designed specifically for Node.js production environments (PostgreSQL, MySQL, MongoDB).\n\nWhy it's better than standard shell scripts:\n1. Zero Command Injection: Built entirely on secure child_process.spawn architecture (100% exploit-proof).\n2. Military-Grade AES-256 Encryption: Dumps are encrypted on the fly via Node.js Streams, and raw unprotected files are instantly wiped from the disk server.\n3. Protected Perimeter: Pre-configured with Helmet security headers (0 errors on Nikto/OWASP scanners).\n\nWe stress-tested the core using Autocannon under a simulated DoS attack with 120 concurrent connections during a heavy 1,000,000 rows database dump. The engine maintained 100% success rate with a stable memory footprint of only 37.7 MB.\n\nInstead of wasting your developers' expensive hours writing a custom secure backup solution, you can get our clean, audited source code box for just $35.\n\nCheck out the architecture, full feature breakdown, and documentation on our launch page:\n https://backupsmart.backupsmart-team.workers.dev/ \n\nLet us know if you have any technical questions or need help with deployment!\n\nBest regards,\nNikita & BackupSmart Team`
    };

    console.log(`⏳ Отправляю письмо на: ${currentTarget}...`);

        transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(`❌ Ошибка отправки на ${currentTarget}:`, error.message);
            // Даже при ошибке перезаписываем файл, чтобы агент двигался дальше
            fs.writeFileSync(TARGETS_FILE, JSON.stringify(targets, null, 2), 'utf8');
        } else {
            console.log(`✅ Письмо успешно доставлено на ${currentTarget}!`);
            fs.writeFileSync(TARGETS_FILE, JSON.stringify(targets, null, 2), 'utf8');
        }

        console.log(`🎉 Шаг конвейера завершен. Передаю управление триггеру GitHub Actions.\n`);
        process.exit(0); // Жестко завершаем процесс, чтобы агент зафиксировал изменения на Гитхабе!
    });

console.log('🤖 Робот-маркетолог BackupSmart запущен и готов к ночной смене!');
sendNextEmail();
