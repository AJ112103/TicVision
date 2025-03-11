import OpenAI from "openai";

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const cors = require("cors")({
  origin: (origin: any, callback: any) =>
    [
      "https://www.ticvision.io",
      "https://tic-vision-y6v6-git-feature-ml-recs-aj112103s-projects.vercel.app",
      "http://localhost:5173",
    ].includes(origin) || !origin
      ? callback(null, true)
      : callback(new Error("Not allowed by CORS")),
});

admin.initializeApp();

export const logTic = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    const idToken = req.headers.authorization?.split("Bearer ")[1];

    if (!idToken) {
      return res.status(401).send({ error: "Unauthorized: No token provided" });
    }

    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const userId = decodedToken.uid;

      // Destructure description from req.body
      const {
        date,
        timeOfDay,
        location,
        intensity,
        latitude,
        longitude,
        description,
      } = req.body;

      const db = admin.firestore();

      // Add tic to ticHistory
      const ticData = {
        date,
        timeOfDay,
        location: location.toLowerCase(),
        intensity,
        latitude: latitude || null,
        longitude: longitude || null,
        description: description || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await db.collection("users").doc(userId).collection("ticHistory").add(ticData);

      // Update or create tic type count
      const ticTypeRef = db
        .collection("users")
        .doc(userId)
        .collection("mytics")
        .doc(location);

      const ticTypeDoc = await ticTypeRef.get();

      if (ticTypeDoc.exists) {
        await ticTypeRef.update({
          count: admin.firestore.FieldValue.increment(1),
        });
      } else {
        await ticTypeRef.set({
          name: location,
          count: 1,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      // Increment global tic counter
      const userRef = db.collection("users").doc(userId);
      await userRef.set(
        {
          ticCounter: admin.firestore.FieldValue.increment(1),
        },
        { merge: true }
      );

      // Retrieve the updated ticCounter
      const userDoc = await userRef.get();
      const ticCounter = userDoc.data()?.ticCounter;

      console.log("sending data to chatGPT");

      // Call ChatGPT to get advice every 10 tics
      if (ticCounter > 0 && ticCounter % 10 === 0) {
        const ticHistorySnapshot = await db
          .collection("users")
          .doc(userId)
          .collection("ticHistory")
          .get();

        const ticHistory = ticHistorySnapshot.docs.map((doc: { data: () => any }) =>
          doc.data()
        );

        // Pass the current ticCounter as the starting point
        const advice = await getAdviceFromChatGPT(ticHistory, ticCounter);

        // Store the advice in the user's Firestore document
        await userRef.collection("advice").add({
          advice,
          ticCounter,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      return res.status(200).send({ success: true });
    } catch (error) {
      console.error("Error logging tic:", error);
      return res.status(500).send({ error: "Internal server error" });
    }
  });
});

const getAdviceFromChatGPT = async (ticHistory: any[], ticStartNumber: number) => {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY, // Access the API key securely
    });

    const ticDataString = ticHistory
      .map(
        (tic) =>
          `Date: ${tic.date}, Time of Day: ${tic.timeOfDay}, Location: ${tic.location}, Intensity: ${tic.intensity}`
      )
      .join("\n");

    // Define the messages for the ChatGPT conversation
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: "user",
        content: `
Based on the following tic data, generate 10 personalized, actionable suggestions to help the user manage and better understand their tics. The advice must be rooted in evidence-based approaches, including Comprehensive Behavioral Intervention for Tics (CBIT), Habit Reversal Therapy (HRT), and Cognitive Behavioral Therapy (CBT). Ensure that each suggestion is tailored to the user’s specific tic type, intensity, frequency, and observed tic patterns or trends. The recommendations should be practical, clear, and user-friendly, with a focus on enhancing self-awareness and effective management.

The advice should be numbered sequentially, starting from ${ticStartNumber} to ${
          ticStartNumber + 9
        }.

Tic Data:
${ticDataString}
        `,
      },
    ];

    // Call the OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4", // or "gpt-3.5-turbo"
      messages: messages,
      max_tokens: 800,
      temperature: 0.7, // Adjust the creativity of the responses
    });

    console.log("received: " + completion);
    const adviceText = completion.choices?.[0]?.message?.content?.trim() ?? "";
    const adviceList = adviceText
      .split("\n")
      .filter((item: string) => item && /^[0-9]+\./.test(item.trim())); // Ensure only numbered items are included

    return adviceList; // Return the processed list of advice
  } catch (error) {
    console.error("Error calling ChatGPT API:", error);
    throw new Error("Failed to get advice from ChatGPT");
  }
};

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

export const getAdvice = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    const idToken = req.headers.authorization?.split("Bearer ")[1];

    if (!idToken) {
      return res.status(401).send({ error: "Unauthorized: No token provided" });
    }

    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const userId = decodedToken.uid;

      const db = admin.firestore();
      const userRef = db.collection("users").doc(userId);

      const adviceSnapshot = await userRef
        .collection("advice")
        .orderBy("createdAt", "desc")
        .limit(1)
        .get();

      const advice = adviceSnapshot.docs[0]?.data() || null;

      return res.status(200).send({ advice });
    } catch (error) {
      console.error("Error getting advice:", error);
      return res.status(500).send({ error: "Internal server error" });
    }
  });
});

export const deleteUserData = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    // Extract and verify the Firebase ID token from the Authorization header
    const idToken = req.headers.authorization?.split("Bearer ")[1];
    if (!idToken) {
      return res.status(401).send({ error: "Unauthorized: No token provided" });
    }

    try {
      // Verify ID token and get user ID
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const userId = decodedToken.uid;

      const db = admin.firestore();
      const userDocRef = db.collection("users").doc(userId);

      // List all subcollections under the user document
      const subcollections = await userDocRef.listCollections();

      // For each subcollection, delete all documents in a batch
      for (const subcollectionRef of subcollections) {
        const docsSnapshot = await subcollectionRef.get();

        const batch = db.batch();
        docsSnapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });

        // Commit each batch
        await batch.commit();
      }

      // Finally, delete the user document itself
      await userDocRef.delete();

      return res.status(200).send({
        success: true,
        message: "All user data has been successfully deleted",
      });
    } catch (error) {
      console.error("Error deleting user data:", error);
      return res.status(500).send({ error: "Internal server error" });
    }
  });
});

export const countTicsLast24Hours = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    // Extract and verify the Firebase ID token
    const idToken = req.headers.authorization?.split("Bearer ")[1];
    if (!idToken) {
      return res.status(401).send({ error: "Unauthorized: No token provided" });
    }

    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const userId = decodedToken.uid;
      const db = admin.firestore();

      // Calculate the timestamp for 24 hours ago
      const twentyFourHoursAgo = admin.firestore.Timestamp.fromDate(
        new Date(Date.now() - 24 * 60 * 60 * 1000)
      );

      // Query the ticHistory subcollection for tics with createdAt >= twentyFourHoursAgo
      const ticsSnapshot = await db
        .collection("users")
        .doc(userId)
        .collection("ticHistory")
        .where("createdAt", ">=", twentyFourHoursAgo)
        .get();

      // Get the count from the snapshot size
      const count = ticsSnapshot.size;

      return res.status(200).send({ count });
    } catch (error) {
      console.error("Error counting tics in last 24 hours:", error);
      return res.status(500).send({ error: "Internal server error" });
    }
  });
});

export const getTicCounter = functions.https.onCall(async (data, context: any) => {
  // Optional: Enforce that the caller is authenticated.
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  // Get the uid from the auth token
  const uid: string = context.auth.uid;
  if (!uid) {
    throw new functions.https.HttpsError('invalid-argument', 'User ID must be provided.');
  }

  try {
    const userRef = admin.firestore().collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User document not found.');
    }

    // Fetch the ticCounter field from the document.
    const ticCounter = userDoc.get('ticCounter');
    return { ticCounter };
  } catch (error: any) {
    console.error('Error fetching ticCounter:', error);
    throw new functions.https.HttpsError('internal', 'Error fetching ticCounter.');
  }
});