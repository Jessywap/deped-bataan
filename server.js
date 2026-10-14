app.post('/api/issuances', requireAdmin, upload.single('file'), async (req, res) => {
  try {
    const { title, number, type, uploadedBy } = req.body;

    if (!title || !number || !type) {
      return res.status(400).json({ error: 'Title, number, and type are required.' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'File is required.' });
    }

    // Only allow numeric issuance numbers
    if (!/^\d+$/.test(String(number).trim())) {
      return res.status(400).json({ error: 'Issuance number must be digits only (e.g., 400).' });
    }

    // Build the full label based on type
    const prefixes = {
      memorandum: 'Division Memorandum No.',
      advisory: 'Division Advisory No.',
      letter: 'Division Letter No.',
      office: 'Office Memorandum No.'
    };

    const typeLabels = {
      memorandum: 'Division Memorandum',
      advisory: 'Division Advisory',
      letter: 'Division Letter',
      office: 'Office Memorandum'
    };

    const badgeClasses = {
      memorandum: 'badge-memo',
      advisory: 'badge-advisory',
      letter: 'badge-letter',
      office: 'badge-office'
    };

    const year = new Date().getFullYear();
    const fullNumber = `${prefixes[type]} ${String(number).trim()}, s. ${year}`;

    const now = new Date();
    const issuance = await Issuance.create({
      title: title.trim(),
      number: fullNumber,                     // e.g., "Division Memorandum No. 400, s. 2026"
      type,
      typeLabel: typeLabels[type] || 'Issuance',
      badgeClass: badgeClasses[type] || 'badge-memo',
      uploadedBy: uploadedBy?.trim() || 'Division Office',
      fileUrl: req.file.path,
      cloudinaryId: req.file.filename,
      originalName: req.file.originalname,
      fileSize: (req.file.size / 1024).toFixed(0) + ' KB',
      dateUploaded: now,
      dateFormatted: now.toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      })
    });

    res.status(201).json({ message: 'Uploaded successfully', issuance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});