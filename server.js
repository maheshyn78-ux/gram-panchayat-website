const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const contactsFile = path.join(__dirname, 'data', 'contacts.json');
const farmerRoutes = require('./routes/farmerRoutes');
const applicationRoutes = require('./routes/applicationRoutes');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

app.use('/api', farmerRoutes);
app.use('/api', applicationRoutes);

function loadContacts() {
    try {
        if (!fs.existsSync(contactsFile)) {
            return [];
        }
        const content = fs.readFileSync(contactsFile, 'utf8');
        return content ? JSON.parse(content) : [];
    } catch (error) {
        console.error('Failed to load contacts:', error);
        return [];
    }
}

function saveContacts(contacts) {
    try {
        fs.writeFileSync(contactsFile, JSON.stringify(contacts, null, 2), 'utf8');
    } catch (error) {
        console.error('Failed to save contacts:', error);
        throw error;
    }
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/contact', (req, res) => {
    const { name, phone, email, subject, address, message, urgent } = req.body;
    if (!name || !phone || !subject || !message) {
        return res.status(400).json({ error: 'Please complete all required fields.' });
    }

    const contacts = loadContacts();
    const entry = {
        id: Date.now(),
        name: name.trim(),
        phone: phone.trim(),
        email: (email || '').trim(),
        subject: subject.trim(),
        address: (address || '').trim(),
        message: message.trim(),
        urgent: Boolean(urgent),
        submittedAt: new Date().toISOString(),
    };

    contacts.push(entry);
    saveContacts(contacts);

    res.json({ success: true, message: 'Your message has been submitted successfully.' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
