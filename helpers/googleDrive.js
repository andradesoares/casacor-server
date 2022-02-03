const { google } = require('googleapis');
const fs = require('fs');

const KEYFILEPATH = __dirname + '/../google-credentials.json';
const SCOPES = ['https://www.googleapis.com/auth/drive'];

module.exports = {
  auth: new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPES,
  }),

  downloadFile: async (fileId, auth) => {
    const driveService = google.drive({ version: 'v3', auth });

    const file = fs.createWriteStream(__dirname + `/../images/logo.jpg`); // destination is path to a file

    await driveService.files.get(
      { fileId: fileId, alt: 'media' },
      { responseType: 'stream' },
      function (err, res) {
        res.data
          .on('end', () => {
            console.log('Done');
          })
          .on('error', (err) => {
            console.log('Error', err);
          })
          .pipe(file);
      }
    );
  },

  createAndUploadFile: async (auth, file, nome, folder) => {
    const driveService = google.drive({ version: 'v3', auth });
    let fileMetaData = {
      name: `${nome}.jpg`,
      parents: [folder],
    };
    let media = {
      mimeType: 'image/jpeg',
      body: fs.createReadStream(file),
    };

    let response = await driveService.files.create({
      resource: fileMetaData,
      media: media,
      fields: 'id',
    });

    switch (response.status) {
      case 200:
        return response.data.id;
    }
  },

  deleteFile: async (auth, fileId) => {
    const driveService = google.drive({ version: 'v3', auth });

    let response = await driveService.files.delete({
      fileId: fileId,
    });
  },
};
