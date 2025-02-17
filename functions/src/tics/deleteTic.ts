import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
const cors = require("cors")({ origin: (origin: any, callback: any) => (["https://www.ticvision.io/", "https://tic-vision-y6v6-git-feature-ml-recs-aj112103s-projects.vercel.app?_vercel_share=lwuu8eOoXY6w4IMHj7xtWkCQucbihahP", "http://localhost:5173"].includes(origin) || !origin ? callback(null, true) : callback(new Error("Not allowed by CORS"))) });

// Initialize the Firebase Admin SDK if it hasn't been initialized yet.
if (!admin.apps.length) {
  admin.initializeApp();
}

export const deleteTic = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    // Extract and verify the Firebase ID token from the Authorization header.
    const idToken = req.headers.authorization?.split("Bearer ")[1];
    if (!idToken) {
      return res.status(401).send({ error: "Unauthorized: No token provided" });
    }

    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const userId = decodedToken.uid;

      // Expect the tic document ID in the request body.
      const { ticId } = req.body;
      if (!ticId) {
        return res.status(400).send({ error: "Missing ticId" });
      }

      const db = admin.firestore();
      const userRef = db.collection("users").doc(userId);

      // Get the ticHistory document to retrieve tic details (such as location).
      const ticRef = userRef.collection("ticHistory").doc(ticId);
      const ticDoc = await ticRef.get();
      if (!ticDoc.exists) {
        return res.status(404).send({ error: "Tic not found" });
      }
      const ticData = ticDoc.data();
      const ticLocation = ticData?.location;

      // Delete the tic from the ticHistory subcollection.
      await ticRef.delete();

      // Update the tic type count in the "mytics" subcollection if ticLocation is provided.
      if (ticLocation) {
        const ticTypeRef = userRef.collection("mytics").doc(ticLocation);
        const ticTypeDoc = await ticTypeRef.get();

        if (ticTypeDoc.exists) {
          // Decrement the count.
          await ticTypeRef.update({
            count: admin.firestore.FieldValue.increment(-1),
          });
          // Retrieve the updated document.
          const updatedTicTypeDoc = await ticTypeRef.get();
          const updatedCount = updatedTicTypeDoc.data()?.count;
          // If count is less than or equal to 0, delete the tic type document.
          if (updatedCount <= 0) {
            await ticTypeRef.delete();
          }
        }
      }

      // Decrement the global tic counter.
      await userRef.set(
        {
          ticCounter: admin.firestore.FieldValue.increment(-1),
        },
        { merge: true }
      );

      return res.status(200).send({ success: true });
    } catch (error) {
      console.error("Error deleting tic:", error);
      return res.status(500).send({ error: "Internal server error" });
    }
  });
});
