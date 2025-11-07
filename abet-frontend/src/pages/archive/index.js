const stream = require("stream");
const express = require("express");
const multer = require("multer");
const path = require("path");
const { google } = require("googleapis");
const app = express();
const upload = multer();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Configuration ---
const KEYFILEPATH = path.join(__dirname, 'cred.json');
const SCOPES = ['https://www.googleapis.com/auth/drive'];
const PORT = 5050;

// --- Google Drive Folder IDs ---
//  Important: Replace these with your actual folder IDs.
const DEPARTMENT_FOLDERS = {
    'computer-engineering': '1aEn0xUiti3ZuOAMAualYLURYkjM1Wkad',
    'materials-engineering': '1LoI6eMEOW2PnJaD-q-ONz2BvXxv5IGED',
    'architecture-engineering': '11PihECET-BW_2D7VgMu2DCph-XN5kmsa',
    'electronics-communications': '1zKcv1bBIv4eeXRjQsedxwIRKrLFqIdBJ',
};

const SUBJECT_FOLDERS = {
    'computer-engineering': {
        'Introduction to Computer Engineering': '1HG_L1CFkz8elGq2G28u2F34ZC4AA5mOw',
        'Programming 1': '1EGqAYWI3_4FMHGQC5JRRbyjnVCalQe_X',
        'Programming 2': '19Zy6tdWLkm9mVxxv1-KF99Gq1FZ7Z6yv',
    },
    'materials-engineering': {
        'Introduction to Materials Science': 'YOUR_MAT_ENG_INTRO_FOLDER_ID',
        'Properties of Materials': 'YOUR_MAT_ENG_PROP_FOLDER_ID',
        'Materials Processing': 'YOUR_MAT_ENG_PROC_FOLDER_ID',
    },
    'architecture-engineering': {
        'Architectural Design 1': 'YOUR_ARCH_ENG_DESIGN1_FOLDER_ID',
        'Architectural Design 2': 'YOUR_ARCH_ENG_DESIGN2_FOLDER_ID',
        'History of Architecture': 'YOUR_ARCH_ENG_HIST_FOLDER_ID',
    },
    'electronics-communications': {
        'Electronics 1': 'YOUR_ELEC_COMM_ELEC1_FOLDER_ID',
        'Electronics 2': 'YOUR_ELEC_COMM_ELEC2_FOLDER_ID',
        'Communications': 'YOUR_ELEC_COMM_COMM_FOLDER_ID',
    },
};

// --- Helper Functions ---

const getDriveService = async () => {
    const auth = new google.auth.GoogleAuth({
        keyFile: KEYFILEPATH,
        scopes: SCOPES,
    });
    const authClient = await auth.getClient();
    return google.drive({ version: 'v3', auth: authClient });
};

const uploadFile = async (fileObject, parentFolderId) => {
    const drive = await getDriveService();
    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileObject.buffer);

    const { data } = await drive.files.create({
        media: {
            mimeType: fileObject.mimetype,
            body: bufferStream,
        },
        requestBody: {
            name: fileObject.originalname,
            parents: [parentFolderId],
        },
        fields: 'id, name, webViewLink, size, mimeType',
    });

    console.log(`Uploaded file ${data.name} to folder ${parentFolderId} with ID ${data.id}`);
    return {
        id: data.id,
        name: data.name,
        webViewLink: data.webViewLink,
        size: data.size,
        mimeType: data.mimeType,
    };
};

// --- Routes ---

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/files', async (req, res) => {
    try {
        const department = req.query.department;
        const subject = req.query.subject;

        if (!department || !subject) {
            return res.status(400).send('Department and subject are required.');
        }

        const drive = await getDriveService();
        const folderId = SUBJECT_FOLDERS[department]?.[subject];

        if (!folderId) {
            return res.status(404).send(`Folder not found for ${department} - ${subject}`);
        }

        const response = await drive.files.list({
            q: `'${folderId}' in parents AND trashed = false`,
            fields: 'files(id, name, mimeType, webViewLink, size)',
        });

        const files = response.data.files.map(file => ({
            id: file.id,
            name: file.name,
            mimeType: file.mimeType,
            webViewLink: file.webViewLink,
            size: file.size,
            isImage: file.mimeType.startsWith('image/'),
        }));

        res.status(200).json(files);
    } catch (error) {
        console.error(`Error listing files for ${department} - ${subject}:`, error);
        res.status(500).send(`Error listing files: ${error.message}`);
    }
});

app.get('/download/:fileId', async (req, res) => {
    try {
        const fileId = req.params.fileId;
        const drive = await getDriveService();

        const file = await drive.files.get(
            {
                fileId: fileId,
                alt: 'media',
            },
            { responseType: 'stream' }
        );

        const fileMetadata = await drive.files.get({
            fileId: fileId,
            fields: 'name, mimeType',
        });
        const { name, mimeType } = fileMetadata.data;

        res.setHeader('Content-Disposition', `attachment; filename="${name}"`);
        res.setHeader('Content-Type', mimeType);
        file.data.pipe(res);
    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).send(`Error downloading file: ${error.message}`);
    }
});

app.post('/upload', upload.array('files'), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).send('No files uploaded.');
        }

        const department = req.query.department;
        const subject = req.query.subject;

        if (!department || !subject) {
            return res.status(400).send('Department and subject are required.');
        }

        const parentFolderId = SUBJECT_FOLDERS[department]?.[subject];
        if (!parentFolderId) {
            return res.status(404).send(`Folder not found for ${department} - ${subject}`);
        }

        const uploadedFilesInfo = [];
        for (const file of req.files) {
            const uploaded = await uploadFile(file, parentFolderId);
            uploadedFilesInfo.push(uploaded);
        }
        res.status(200).json({ message: 'Files uploaded successfully!', files: uploadedFilesInfo });
    } catch (error) {
        console.error('Error uploading files:', error);
        res.status(500).send(`Error uploading files: ${error.message}`);
    }
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server is running on port ${5050}`);
});
