const fs = require('fs');
const path = require('path');
const http = require('http');
const FormData = require('form-data');

const token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlZlUjhkUV9aTEVndm9fdzBKV2NQYiJ9.eyJpc3MiOiJodHRwczovL2Rldi1xa20yMDEyOGI1cjJla2tmLnVzLmF1dGgwLmNvbS8iLCJzdWIiOiJnb29nbGUtb2F1dGhyfDEwMzkwMTc1ODM5NjY0NDk0Njg1NCIsImF1ZCI6WyJodHRwczovL2Rldi1xa20yMDEyOGI1cjJla2tmLnVzLmF1dGgwLmNvbS9hcGkvdjIvIiwiaHR0cHM6Ly9kZXYtcWttMjAxMjhiNXIyZWtrZi51cy5hdXRoMC5jb20vdXNlcmluZm8iXSwiaWF0IjoxNzgyNDUyODM3LCJleHAiOjE3ODI1MzkyMzcsInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwiLCJhenAiOiIzNERDdFR0c3BKNUYwUzdDSk94TWVQR3Fwb3BmT1oyaSJ9.Y3XLV8uTjh74a-pA6dBVFk97mHfnJMNkCpcYiedzILBmazVIGRdIgEZ1CbeSZzLiSN1MW3dfTTaKdGFByBZMQmNo8FPQC4O6H4osk6DVxNose_YrzNC0yEWl1WgVNDxnpr8pYB-Cn3X7bDvE3L-Hhsfjg4ObEyQLhmC-TJhs2oce08ISpYnRUEHM-96LFFSBse5PmLVVib0eF6IOWztu4Y7-_Otus3A_lFx6jnf9QJOZok27f3Q3DYXc0h9ZlIptf9GFAGdyt43sGfgayvnOOCNSwAH4lPLadUGyrlfZeQFvJ8ZXmmJAEiXtvOlcpShIv1paOVXe9Gz2z6PAgUhv0w';
const filePath = path.join(__dirname, 'test_upload.png');
if (!fs.existsSync(filePath)) {
  const data = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAn8B9kK0fQAAAABJRU5ErkJggg==';
  fs.writeFileSync(filePath, Buffer.from(data, 'base64'));
}

const form = new FormData();
form.append('files', fs.createReadStream(filePath));

const req = http.request(
  {
    method: 'POST',
    host: '127.0.0.1',
    port: 5001,
    path: '/api/upload',
    headers: {
      Authorization: `Bearer ${token}`,
      ...form.getHeaders(),
    },
  },
  (res) => {
    console.log('STATUS', res.statusCode);
    let body = '';
    res.on('data', (chunk) => (body += chunk));
    res.on('end', () => {
      console.log('BODY', body);
    });
  }
);

req.on('error', (err) => {
  console.error('REQUEST ERROR', err);
});
form.pipe(req);
