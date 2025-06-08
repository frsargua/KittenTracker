// server/controllers/kittenController.js
const { db } = require("../config/firebaseAdmin");

// Helper for kitten ownership, ensuring parent litter also belongs to user
const ensureKittenAndLitterOwnership = async (
  litterId,
  kittenId,
  currentUserId,
  res
) => {
  const litterRef = db.collection("litters").doc(litterId);
  const litterSnap = await litterRef.get();

  if (!litterSnap.exists || litterSnap.data().userId !== currentUserId) {
    res.status(403).json({
      message:
        "Forbidden: You do not own the parent litter or it does not exist.",
    });
    return null;
  }

  const kittenRef = db.collection("kittens").doc(kittenId);
  const kittenSnap = await kittenRef.get();

  if (!kittenSnap.exists) {
    res.status(404).json({ message: "Kitten not found." });
    return null;
  }
  const kittenData = kittenSnap.data();
  if (kittenData.litterId !== litterId || kittenData.userId !== currentUserId) {
    // This check is a bit redundant if litter ownership already established for userId,
    // but good for data integrity if kitten's userId was somehow different.
    res.status(403).json({
      message: "Forbidden: Kitten does not belong to this litter or user.",
    });
    return null;
  }
  return { id: kittenSnap.id, ...kittenData };
};

const ensureLitterOwnershipForKittenCreation = async (
  litterId,
  currentUserId,
  res
) => {
  const litterRef = db.collection("litters").doc(litterId);
  const litterSnap = await litterRef.get();

  if (!litterSnap.exists) {
    res.status(404).json({ message: "Parent litter not found." });
    return false;
  }
  if (litterSnap.data().userId !== currentUserId) {
    res
      .status(403)
      .json({ message: "Forbidden: You do not own the parent litter." });
    return false;
  }
  return true;
};

exports.addKittenToLitter = async (req, res, next) => {
  try {
    const userId = req.auth.payload.sub;
    const { litterId } = req.params;
    const { name, gender, color, description } = req.body;

    if (!(await ensureLitterOwnershipForKittenCreation(litterId, userId, res)))
      return;

    if (!name) {
      return res.status(400).json({ message: "Kitten name is required." });
    }

    const newKittenData = {
      litterId,
      userId,
      name,
      gender: gender || "",
      color: color || "",
      description: description || "",
      createdAt: new Date().toISOString(),
    };

    const kittenRef = await db.collection("kittens").add(newKittenData);
    res.status(201).json({ id: kittenRef.id, ...newKittenData });
  } catch (error) {
    console.error("Error adding kitten:", error);
    next(error);
  }
};

exports.getKittensInLitter = async (req, res, next) => {
  try {
    const userId = req.auth.payload.sub;
    const { litterId } = req.params;

    if (!(await ensureLitterOwnershipForKittenCreation(litterId, userId, res)))
      return; // Checks litter ownership

    const kittensSnapshot = await db
      .collection("kittens")
      .where("litterId", "==", litterId)
      .where("userId", "==", userId) // Double check userId for kittens
      .orderBy("createdAt", "asc")
      .get();

    const litterKittens = [];
    kittensSnapshot.forEach((doc) => {
      litterKittens.push({ id: doc.id, ...doc.data() });
    });
    res.status(200).json(litterKittens);
  } catch (error) {
    console.error("Error fetching kittens in litter:", error);
    next(error);
  }
};

exports.getKittenById = async (req, res, next) => {
  try {
    const userId = req.auth.payload.sub;
    const { litterId, kittenId } = req.params;

    const kitten = await ensureKittenAndLitterOwnership(
      litterId,
      kittenId,
      userId,
      res
    );
    if (!kitten) return;

    const weightsSnapshot = await db
      .collection("weightRecords")
      .where("kittenId", "==", kittenId)
      .where("userId", "==", userId)
      .orderBy("dateRecorded", "desc")
      .get();

    const kittenWeights = [];
    weightsSnapshot.forEach((doc) =>
      kittenWeights.push({ id: doc.id, ...doc.data() })
    );

    res.status(200).json({ ...kitten, weights: kittenWeights });
  } catch (error) {
    console.error("Error fetching kitten by ID:", error);
    next(error);
  }
};

exports.updateKitten = async (req, res, next) => {
  try {
    const userId = req.auth.payload.sub;
    const { litterId, kittenId } = req.params;
    const { name, gender, color, description } = req.body;

    const existingKitten = await ensureKittenAndLitterOwnership(
      litterId,
      kittenId,
      userId,
      res
    );
    if (!existingKitten) return;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (gender !== undefined) updateData.gender = gender;
    if (color !== undefined) updateData.color = color;
    if (description !== undefined) updateData.description = description;
    updateData.updatedAt = new Date().toISOString();

    if (Object.keys(updateData).length === 1 && updateData.updatedAt) {
      return res.status(400).json({ message: "No fields to update provided." });
    }

    await db.collection("kittens").doc(kittenId).update(updateData);
    res.status(200).json({ id: kittenId, ...existingKitten, ...updateData });
  } catch (error) {
    console.error("Error updating kitten:", error);
    next(error);
  }
};

exports.removeKitten = async (req, res, next) => {
  try {
    const userId = req.auth.payload.sub;
    const { litterId, kittenId } = req.params;

    const kitten = await ensureKittenAndLitterOwnership(
      litterId,
      kittenId,
      userId,
      res
    );
    if (!kitten) return;

    const batch = db.batch();

    // Find and delete weight records for this kitten
    const weightsSnapshot = await db
      .collection("weightRecords")
      .where("kittenId", "==", kittenId)
      .where("userId", "==", userId)
      .get();
    weightsSnapshot.forEach((doc) => {
      batch.delete(db.collection("weightRecords").doc(doc.id));
    });

    // Delete the kitten
    batch.delete(db.collection("kittens").doc(kittenId));

    await batch.commit();
    res.status(200).json({
      message: "Kitten and associated weight records deleted successfully.",
    });
  } catch (error) {
    console.error("Error removing kitten:", error);
    next(error);
  }
};
