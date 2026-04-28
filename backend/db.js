import admin from 'firebase-admin';

let cred;
if (process.env.FIREBASE_CONFIG) {
  cred = admin.credential.cert(JSON.parse(process.env.FIREBASE_CONFIG));
} else {
  cred = admin.credential.cert({
    projectId: "goat-of-maths-2dc00",
    clientEmail: "firebase-adminsdk-fbsvc@goat-of-maths-2dc00.iam.gserviceaccount.com",
    privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDJyh2d2RppFpf3\nb3gZHcKvPfGUckM9Sxl4MG+ijXYPIZscUG/S0GsdhVMYQDxk/avWnTyFFJrIgK2Z\nFSrSdsAYz3PmQlS9yJHQR1LGpTa+i0Uq4FC70Ha2LUruKK4pOSoyfzikiNYgIK09\ndWq2Hz5wKGVfsK5R2Fr+xyL4uNBMeasVYT1aFRCvQXII0HDbxEAc2ifQoIvQHutV\njBpFzA3DbXW3LUiSNRp/7nYWT2DqVTGNyx10nLXNggawm1VZTPn0G1W2o0C63IP3\nyWqa0vr5/rLHwfahdkuJV6bOrmAuT2JpQAb7T5X7O5YUeNY7UdlGrbM9ncgbUhiO\nJ46l5d9dAgMBAAECggEADO1gWVjrurjCUo03FfDUpJJk1Bw/14DkqFD+Dd1fJ1gB\nTl6O02QbwJ/mc2LGG7guloirNGFeCyNHO8vh2urVoqFDrQgp0qCzSrMPB//Ukn9s\nlnMZaPbRbBlZuAkuIyDw5ZxF3jCP+y3su0e25uT4hInp+KfiewbPyYurX2DDo2p4\n3FgN961Ej90ziUf329pKVVJzqOutarpS0grfZUcurDPsR3AEGQqLPgWozV2qq+I9\nLt+TgeOkgHh5v6seUIzj9KFlcYGPL7c1J9Pj0iOiCqU51MbFKnTGSGrfXaXn+nds\n7s+j2I1pym+KFjGrqrEpndMngZxDXgQ01eHS0L4gFwKBgQDpJnTuDfZ2F5mIlfqO\ny02SUT1T8qTNQ5WiTnAbQu8zZri+ibuelTGRABABbyuwOxK+g/QCDgEhlbWOIMFN\nu47iDTsYLupi0xh2tNmbSvWa0z+/AeVHSoZDbvEUFW7Q52NIPBaK8TRwOv8L37V5\nTV+/ceMUTKwDWXAQUSgqFBqAhwKBgQDdkNhaKshnAA7fcyuqSKwz7oDABx7Qeyyp\nnndHOdN/F0AiUU8uVEooi+rYGaaZc0wEqxnhidd2VW7789OwgRpJMrygf0bsxCnT\nVXhaNZZznZlFigJ+DwWxghPnyASXB001sRsN+CnxeYwcGmBJ2lpZD+t/CRqvAMX2\nba0BNUUN+wKBgFYXpUXiUgf5XvBYsVTZLaPB6+t7xe8l7bMpU6w9YyaP39g789Pz\nM4Jfi4l8C53fsmQ3RXscwL4uEgSRg8+4WmKOkCu150bmvDnZPiFh5J9vMjLN+GQC\n2OE9rjfEUk9Boh+iUJCt0LdAkb1ItjI8qAaBf2CXj00NUZw026fuFHsxAoGBAKLh\n39txhkAKT+S/M0ONB2NqG6aP1XxogO31PDTVcwEEY7aW1cH2X0otiijxuoMmuqTX\n8D/Y6NfqeJuqpV4lmuBi9z56MvbOQv1E4SRYLtGx80Km8awgeQwE14NWjOFGkeE9\n4OjFHniR5Ymnbk/8wNymknaih8ZNqDrAaCXyNmDPAoGAZyKEr9r0Vz6qO1gWigry\nYezScYW5RKi93hQY3FAkm0xu4mOCk5YyqjsCOAMlvGTIH7pE6GTdIbhDCZFXCeUF\nt/8aSzWSKY0AvSWeDFyHMKAxWC0PjZ4AQS8lRW72BwSBWDkM4MiAW5plZstvMo6o\nZFEKXwoWrtOHxFKvkhYJEns=\n-----END PRIVATE KEY-----\n",
  });
}

if (!admin.apps.length) {
  admin.initializeApp({ credential: cred });
}

const db = admin.firestore();

export default db;
