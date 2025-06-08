// server/controllers/litterController.js
const { db } = require("../config/firebaseAdmin"); // Use Firestore

// Helper to check ownership for Firestore documents
const ensureOwnership = async (collectionName, docId, currentUserId, res) => {
  const docRef = db.collection(collectionName).doc(docId);
  const docSnap = await docRef.get();

  if (!docSnap.exists) {
    res
      .status(404)
      .json({ message: `${collectionName.slice(0, -1)} not found.` });
    return null; // Indicate resource not found or error
  }
  const resource = { id: docSnap.id, ...docSnap.data() };
  if (resource.userId !== currentUserId) {
    res
      .status(403)
      .json({ message: "Forbidden: You do not own this resource." });
    return null; // Indicate forbidden
  }
  return resource; // Return the resource if ownership is confirmed
};

exports.createLitter = async (req, res, next) => {
  try {
    const { name, dateOfBirth, motherName, breed, notes } = req.body;
    const userId = req.auth.payload.sub;

    if (!name || !dateOfBirth) {
      return res
        .status(400)
        .json({ message: "Name and Date of Birth are required." });
    }

    const newLitterData = {
      userId,
      name,
      dateOfBirth,
      motherName: motherName || "",
      breed: breed || "",
      notes: notes || "",
      createdAt: new Date().toISOString(), // Optional: timestamp
    };

    const litterRef = await db.collection("litters").add(newLitterData);
    res.status(201).json({ id: litterRef.id, ...newLitterData });
  } catch (error) {
    console.error("Error creating litter:", error);
    next(error);
  }
};

exports.getUserLitters = async (req, res, next) => {
  try {
    const userId = req.auth.payload.sub;
    const littersSnapshot = await db
      .collection("litters")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    const userLitters = [];
    littersSnapshot.forEach((doc) => {
      userLitters.push({ id: doc.id, ...doc.data() });
    });
    res.status(200).json(userLitters);
  } catch (error) {
    console.error("Error fetching user litters:", error);
    next(error);
  }
};

exports.getLitterById = async (req, res, next) => {
  try {
    const userId = req.auth.payload.sub;
    const { litterId } = req.params;

    const litter = await ensureOwnership("litters", litterId, userId, res);
    if (!litter) return; // Error response already sent by ensureOwnership

    // Fetch kittens for this litter
    const kittensSnapshot = await db
      .collection("kittens")
      .where("litterId", "==", litterId)
      .where("userId", "==", userId) // Ensure user owns kittens too
      .get();
    const litterKittens = [];
    kittensSnapshot.forEach((doc) =>
      litterKittens.push({ id: doc.id, ...doc.data() })
    );

    res.status(200).json({ ...litter, kittens: litterKittens });
  } catch (error) {
    console.error("Error fetching litter by ID:", error);
    next(error);
  }
};

exports.updateLitter = async (req, res, next) => {
  try {
    const userId = req.auth.payload.sub;
    const { litterId } = req.params;
    const { name, dateOfBirth, motherName, breed, notes } = req.body;

    const existingLitter = await ensureOwnership(
      "litters",
      litterId,
      userId,
      res
    );
    if (!existingLitter) return;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
    if (motherName !== undefined) updateData.motherName = motherName;
    if (breed !== undefined) updateData.breed = breed;
    if (notes !== undefined) updateData.notes = notes;
    updateData.updatedAt = new Date().toISOString(); // Optional: timestamp

    if (Object.keys(updateData).length === 1 && updateData.updatedAt) {
      // Only updatedAt
      return res.status(400).json({ message: "No fields to update provided." });
    }

    await db.collection("litters").doc(litterId).update(updateData);
    res.status(200).json({ id: litterId, ...existingLitter, ...updateData });
  } catch (error) {
    console.error("Error updating litter:", error);
    next(error);
  }
};

exports.deleteLitter = async (req, res, next) => {
  try {
    const userId = req.auth.payload.sub;
    const { litterId } = req.params;

    const litter = await ensureOwnership("litters", litterId, userId, res);
    if (!litter) return;

    const batch = db.batch(); // Use a batch for multiple deletes

    // Find and delete kittens associated with the litter
    const kittensSnapshot = await db
      .collection("kittens")
      .where("litterId", "==", litterId)
      .where("userId", "==", userId)
      .get();

    const kittenIds = [];
    kittensSnapshot.forEach((doc) => {
      kittenIds.push(doc.id);
      batch.delete(db.collection("kittens").doc(doc.id));
    });

    // Find and delete weight records associated with these kittens
    if (kittenIds.length > 0) {
      // Firestore `in` query supports up to 30 elements per query
      // For more than 30 kittens, you'd need multiple queries
      const maxKittensPerQuery = 30;
      for (let i = 0; i < kittenIds.length; i += maxKittensPerQuery) {
        const kittenIdChunk = kittenIds.slice(i, i + maxKittensPerQuery);
        const weightsSnapshot = await db
          .collection("weightRecords")
          .where("kittenId", "in", kittenIdChunk)
          .where("userId", "==", userId)
          .get();
        weightsSnapshot.forEach((doc) => {
          batch.delete(db.collection("weightRecords").doc(doc.id));
        });
      }
    }

    // Delete the litter itself
    batch.delete(db.collection("litters").doc(litterId));

    await batch.commit();
    res
      .status(200)
      .json({ message: "Litter and associated data deleted successfully." });
  } catch (error) {
    console.error("Error deleting litter:", error);
    next(error);
  }
};
