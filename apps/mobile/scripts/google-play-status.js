const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function base64url(str, encoding = 'utf8') {
  return Buffer.from(str, encoding)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function createJWT(serviceAccount) {
  const header = {
    alg: 'RS256',
    typ: 'JWT'
  };

  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 3600; // 1 hour validity

  const payload = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/androidpublisher',
    aud: serviceAccount.token_uri || 'https://oauth2.googleapis.com/token',
    iat: iat,
    exp: exp
  };

  const stringifiedHeader = base64url(JSON.stringify(header));
  const stringifiedPayload = base64url(JSON.stringify(payload));

  const sign = crypto.createSign('RSA-SHA256');
  sign.update(`${stringifiedHeader}.${stringifiedPayload}`);
  const signature = base64url(sign.sign(serviceAccount.private_key, 'binary'), 'binary');

  return `${stringifiedHeader}.${stringifiedPayload}.${signature}`;
}

async function getAccessToken(jwt) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Authentication failed: ${errText}`);
  }

  const data = await res.json();
  return data.access_token;
}

const PACKAGE_NAME = 'com.grovkornet.app';

async function checkPlayStatus() {
  const keyPath = path.resolve(__dirname, '../play-uploader-key.json');
  if (!fs.existsSync(keyPath)) {
    console.error(`\n❌ Error: Credentials file not found at ${keyPath}`);
    console.error(`Make sure you have saved the key as 'play-uploader-key.json' in 'apps/mobile/'`);
    process.exit(1);
  }

  console.log('🔑 Loading local credentials...');
  let serviceAccount;
  try {
    serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
  } catch (error) {
    console.error('❌ Error parsing credentials JSON file:', error.message);
    process.exit(1);
  }

  try {
    console.log('🌐 Generating JWT token and authenticating with Google Cloud...');
    const jwt = createJWT(serviceAccount);
    const token = await getAccessToken(jwt);
    console.log('✅ Authentication completed successfully.\n');

    console.log('📂 Opening read session on Google Play Console...');
    const editRes = await fetch(`https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE_NAME}/edits`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!editRes.ok) {
      const errText = await editRes.text();
      console.error('\n❌ Unable to open session on Google Play. Please verify Service Account permissions.');
      console.error('Error details:', errText);
      console.error('\n⚠️ SECURITY SUGGESTION:');
      console.error('1. Ensure that the "Google Play Android Developer API" is enabled in Google Cloud.');
      console.error('2. You must invite the Service Account email in Google Play Console (under "Users and permissions") with read permissions for the app.');
      console.error(`   Service Account Email: ${serviceAccount.client_email}`);
      process.exit(1);
    }

    const editData = await editRes.json();
    const editId = editData.id;
    console.log(`✅ Session opened with ID: ${editId}\n`);

    const tracks = ['production', 'beta', 'alpha', 'internal'];
    console.log('📊 Retrieving release track details:');
    console.log('==============================================');

    for (const trackName of tracks) {
      const trackRes = await fetch(`https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE_NAME}/edits/${editId}/tracks/${trackName}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!trackRes.ok) {
        if (trackRes.status === 404) {
          console.log(`\n🔹 Track [${trackName.toUpperCase()}]: No active releases or track not initialized.`);
        } else {
          const errText = await trackRes.text();
          console.log(`\n🔹 Track [${trackName.toUpperCase()}]: Error retrieving: ${errText}`);
        }
        continue;
      }

      const trackData = await trackRes.json();
      console.log(`\n🔹 Track [${trackName.toUpperCase()}]:`);
      if (trackData.releases && trackData.releases.length > 0) {
        trackData.releases.forEach((rel, i) => {
          const status = rel.status || 'unknown';
          const name = rel.name || 'N/A';
          const versionCodes = rel.versionCodes ? rel.versionCodes.join(', ') : 'N/A';
          const userFraction = rel.userFraction ? `${(rel.userFraction * 100).toFixed(1)}%` : '100%';
          console.log(`  Release #${i + 1}:`);
          console.log(`    Version Name:   ${name}`);
          console.log(`    Version Code:   ${versionCodes}`);
          console.log(`    Release Status: ${status}`);
          console.log(`    User Fraction:  ${userFraction}`);
        });
      } else {
        console.log('  No active release found in this track.');
      }
    }

    console.log('\n==============================================');
    console.log('🧹 Closing session...');
    await fetch(`https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE_NAME}/edits/${editId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Session closed. Done!');
  } catch (error) {
    console.error('❌ An unexpected error occurred:', error.message);
    process.exit(1);
  }
}

checkPlayStatus();
