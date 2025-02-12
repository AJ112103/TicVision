const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: "*" }); // Replace with your production frontend URL

import OpenAI from "openai";

admin.initializeApp();

exports.logTic = functions.https.onRequest(async (req: { headers: { authorization: string; }; body: { date: any; timeOfDay: any; location: any; intensity: any; latitude: any; longitude: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; send: { (arg0: { error?: string; success?: boolean; }): any; new(): any; }; }; }) => {
    cors(req, res, async () => {
      const idToken = req.headers.authorization?.split("Bearer ")[1];
  
      if (!idToken) {
        return res.status(401).send({ error: "Unauthorized: No token provided" });
      }
  
      try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const userId = decodedToken.uid;
  
        const { date, timeOfDay, location, intensity, latitude, longitude } = req.body;
  
        const db = admin.firestore();
  
        // Add tic to ticHistory
        const ticData = {
          date,
          timeOfDay,
          location,
          intensity,
          latitude: latitude || null,
          longitude: longitude || null,
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
  
        // Trigger ChatGPT advice logic if ticCounter is 10, 20, or 30
        // Trigger ChatGPT advice logic if ticCounter is 10, 20, or 30
          if ([10, 20, 30].includes(ticCounter)) {
            const ticHistorySnapshot = await db
              .collection("users")
              .doc(userId)
              .collection("ticHistory")
              .get();

            const ticHistory = ticHistorySnapshot.docs.map((doc: { data: () => any }) => doc.data());

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
            `Date: ${tic.date}, Time of Day: ${tic.timeOfDay}, Location: ${tic.location}, Intensity: ${tic.intensity}}`
        )
        .join("\n");
  
      // Define the messages for the ChatGPT conversation
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {
          role: "user",
          content: `
      Based on the following tic data, generate 10 personalized, actionable suggestions to help the user manage and better understand their tics. The advice must be rooted in evidence-based approaches, including Comprehensive Behavioral Intervention for Tics (CBIT), Habit Reversal Therapy (HRT), and Cognitive Behavioral Therapy (CBT). Ensure that each suggestion is tailored to the user’s specific tic type, intensity, frequency, and observed tic patterns or trends. The recommendations should be practical, clear, and user-friendly, with a focus on enhancing self-awareness and effective management.
      
      The advice should be numbered sequentially, starting from ${ticStartNumber} to ${ticStartNumber + 9}.
      
      Tic Data:
      ${ticDataString}
          `,
        },
      ];      
  
      // Call the OpenAI API
      const completion = await openai.chat.completions.create({
        model: "gpt-4", // Use "gpt-4" or "gpt-3.5-turbo"
        messages: messages,
        max_tokens: 800,
        temperature: 0.7, // Adjust the creativity of the responses
      });
  
      console.log("recieved: " + completion);
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
