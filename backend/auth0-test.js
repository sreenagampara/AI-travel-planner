const http = require('http');
const token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlZlUjhkUV9aTEVndm9fdzBKV2NQYiJ9.eyJpc3MiOiJodHRwczovL2Rldi1xa20yMDEyOGI1cjJla2tmLnVzLmF1dGgwLmNvbS8iLCJzdWIiOiJnb29nbGUtb2F1Z2lvfDEwMzkwMTc1ODM5NjY0NDk0Njg1NCIsImF1ZCI6WyJodHRwczovL2Rldi1xa20yMDEyOGI1cjJla2tmLnVzLmF1Z2gwLmNvbS9hcGkvdjIvIiwiaHR0cHM6Ly9kZXYtcWttMjAxMjhiNXIyZWtrZi51cy5hdXRoMC5jb20vdXNlcmluZm8iXSwiaWF0IjoxNzgyNDUyODM3LCJleHAiOjE3ODI1MzkyMzcsInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwiLCJhenAiOiIzNERDdFR0c3BKNUYwUzdDSk94TWVQR3Fwb3BmT1oyaSJ9.Y3XLV8uTjh74a-pA6dBVFk97mHfnJMNkCpcYiedzILBmazVIGRdIgEZ1CbeSZzLiSN1MW3dfTTaKdGFByBZMQmNo8FPQC4O6H4osk6DVxNose_YrzNC0yEWl1WgVNDxnpr8pYB-Cn3X7bDvE3L-Hhsfjg4ObEyQLhmC-TJhs2oce08ISpYnRUEHM-96LFFSBse5PmLVVib0eF6IOWztu4Y7-_Otus3A_lFx6jnf9QJOZok27f3Q3DYXc0h9ZlIptf9GFAGdyt43sGfgayvnOOCNSwAH4lPLadUGyrlfZeQFvJ8ZXmmJAEiXtvOlcpShIv1paOVXe9Gz2z6PAgUhv0w';
const [header, payload] = token.split('.');
const decode = (segment) => {
  const padded = segment + '='.repeat((4 - segment.length % 4) % 4);
  return JSON.parse(Buffer.from(padded, 'base64').toString('utf8'));
};
console.log('HEADER', JSON.stringify(decode(header), null, 2));
console.log('PAYLOAD', JSON.stringify(decode(payload), null, 2));
const options = {
  hostname: '127.0.0.1',
  port: 5001,
  path: '/api/trips/stats',
  method: 'GET',
  headers: {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
  },
};
const req = http.request(options, (res) => {
  console.log('STATUS', res.statusCode);
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => { console.log(data); });
});
req.on('error', (err) => { console.error('REQUEST_ERROR', err.message); });
req.end();
