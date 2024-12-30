const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

exports.addTic = functions.https.onCall(async (data: { date: any; timeOfDay: any; location: any; intensity: any; }, context: { auth: { uid: any; }; }) => {
    console.log("Full Context:", JSON.stringify(context, null, 2));

    if (!context.auth) {
        console.log("User not authenticated");
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
    }

    const { date, timeOfDay, location, intensity } = data;

    // Validate the input data
    if (!date || !timeOfDay || !location || !intensity) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "All tic data fields (date, timeOfDay, location, intensity) are required."
        );
    }

    try {
        const userId = context.auth.uid;

        const newTic = {
            date,
            timeOfDay,
            location,
            intensity,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        await db
            .collection("users")
            .doc(userId)
            .collection("ticHistory")
            .add(newTic);

        return { success: true, message: "Tic added successfully!" };
    } catch (error) {
        console.error("Error adding tic: ", error);
        throw new functions.https.HttpsError(
            "internal",
            "An error occurred while adding the tic."
        );
    }
});

