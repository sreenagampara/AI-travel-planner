const jwt = require('jsonwebtoken');
const https = require('https');
const token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlZlUjhkUV9aTEVndm9fdzBKV2NQYiJ9.eyJpc3MiOiJodHRwczovL2Rldi1xa20yMDEyOGI1cjJla2tmLnVzLmF1dGgwLmNvbS8iLCJzdWIiOiJnb29nbGUtb2F1Z2lvfDEwMzkwMTc1ODM5NjY0NDk0Njg1NCIsImF1ZCI6WyJodHRwczovL2Rldi1xa20yMDEyOGI1cjJla2tmLnVzLmF1Z2gwLmNvbS9hcGkvdjIvIiwiaHR0cHM6Ly9kZXYtcWttMjAxMjhiNXIyZWtrZi51cy5hdXRoMC5jb20vdXNlcmluZm8iXSwiaWF0IjoxNzgyNDUyODM3LCJleHAiOjE3ODI1MzkyMzcsInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwiLCJhenAiOiIzNERDdFR0c3BKNUYwUzdDSk94TWVQR3Fwb3BmT1oyaSJ9.Y3XLV8uTjh74a-pA6dBVFk97mHfnJMNkCpcYiedzILBmazVIGRdIgEZ1CbeSZzLiSN1MW3dfTTaKdGFByBZMQmNo8FPQC4O6H4osk6DVxNose_YrzNC0yEWl1WgVNDxnpr8pYB-Cn3X7bDvE3L-Hhsfjg4ObEyQLhmC-TJhs2oce08ISpYnRUEHM-96LFFSBse5PmLVVib0eF6IOWztu4Y7-_Otus3A_lFx6jnf9QJOZok27f3Q3DYXc0h9ZlIptf9GFAGdyt43sGfgayvnOOCNSwAH4lPLadUGyrlfZeQFvJ8ZXmmJAEiXtvOlcpShIv1paOVXe9Gz2z6PAgUhv0w';
const auth0Domain = 'dev-qkm20128b5r2ekkf.us.auth0.com';
const aud = 'https://dev-qkm20128b5r2ekkf.us.auth0.com/api/v2/';
const jwksUrl = `https://${auth0Domain}/.well-known/jwks.json`;

https.get(jwksUrl, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    const jwks = JSON.parse(body);
    const header = JSON.parse(Buffer.from(token.split('.')[0] + '==='.slice(0, (4-token.split('.')[0].length%4)%4), 'base64').toString());
    console.log('JWT header', header);
    const key = jwks.keys.find((k) => k.kid === header.kid);
    if (!key) {
      console.error('No key found for kid', header.kid);
      return;
    }
    const x5c = key.x5c[0];
    console.log('x5c length', x5c.length);
    const cert = `-----BEGIN CERTIFICATE-----\n${x5c.match(/.{1,64}/g).join('\n')}\n-----END CERTIFICATE-----\n`;
    console.log(cert);
    try {
      const payload = jwt.verify(token, cert, {
        algorithms: ['RS256'],
        audience: aud,
        issuer: `https://${auth0Domain}/`,
      });
      console.log('Verified payload:', payload);
    } catch (err) {
      console.error('verify error', err);
    }
  });
});
