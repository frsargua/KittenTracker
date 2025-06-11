// server/controllers/weightRecordController.js
const { db, bucket } = require("../config/firebaseAdmin");
const { v4: uuidv4 } = require("uuid");

// Helper for weight record ownership, ensuring parent kitten and litter also belong to user
const ensureWeightRecordOwnership = async (
  litterId,
  kittenId,
  weightId,
  currentUserId,
  res,
  checkWeightExists = true
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
  if (
    !kittenSnap.exists ||
    kittenSnap.data().userId !== currentUserId ||
    kittenSnap.data().litterId !== litterId
  ) {
    res.status(403).json({
      message:
        "Forbidden: You do not own the parent kitten or it does not belong to the specified litter.",
    });
    return null;
  }

  if (!checkWeightExists) {
    // For creation, just check parent ownership
    return { kittenOwned: true };
  }

  const weightRef = db.collection("weightRecords").doc(weightId);
  const weightSnap = await weightRef.get();
  if (!weightSnap.exists) {
    res.status(404).json({ message: "Weight record not found." });
    return null;
  }
  const weightData = weightSnap.data();
  if (weightData.kittenId !== kittenId || weightData.userId !== currentUserId) {
    res.status(403).json({
      message:
        "Forbidden: Weight record does not belong to this kitten or user.",
    });
    return null;
  }
  return { id: weightSnap.id, ...weightData };
};

exports.addWeightRecord = async (req, res, next) => {
  try {
    const userId = req.auth.payload.sub;
    const { litterId, kittenId } = req.params;
    const { dateRecorded, weightInGrams, notes } = req.body;

    // Check ownership of parent kitten (and its litter)
    const ownershipCheck = await ensureWeightRecordOwnership(
      litterId,
      kittenId,
      null,
      userId,
      res,
      false
    );

    if (!ownershipCheck || !ownershipCheck.kittenOwned) return;

    if (!dateRecorded || weightInGrams === undefined) {
      return res
        .status(400)
        .json({ message: "Date recorded and weight are required." });
    }
    const parsedWeight = parseFloat(weightInGrams);
    if (isNaN(parsedWeight) || parsedWeight <= 0) {
      return res
        .status(400)
        .json({ message: "Weight must be a positive number." });
    }

    const newWeightData = {
      kittenId,
      userId,
      dateRecorded,
      weightInGrams: parseFloat(weightInGrams),
      notes: notes || "",
      createdAt: new Date().toISOString(),
      photoUrl: null,
    };

    if (req.file) {
      if (!bucket) {
        throw new Error(
          "Firebase Storage bucket is not initialized. Cannot upload file."
        );
      }
      const blob = bucket.file(
        `kitten-weights/${userId}/${kittenId}/${uuidv4()}-${
          req.file.originalname
        }`
      );

      const blobStream = blob.createWriteStream({
        metadata: {
          contentType: req.file.mimetype,
        },
      });

      blobStream.on("error", (err) => next(err));

      blobStream.on("finish", async () => {
        // The public URL can be accessed at
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        newWeightData.photoUrl = publicUrl;

        // Save the record to Firestore after the file is uploaded
        const weightRef = await db
          .collection("weightRecords")
          .add(newWeightData);
        res.status(201).json({ id: weightRef.id, ...newWeightData });
      });

      blobStream.end(req.file.buffer);
    } else {
      // If no file, save directly to Firestore
      const weightRef = await db.collection("weightRecords").add(newWeightData);
      res.status(201).json({ id: weightRef.id, ...newWeightData });
    }
  } catch (error) {
    console.error("Error adding weight record:", error);
    next(error);
  }
};

exports.getKittenWeightRecords = async (req, res, next) => {
  try {
    const userId = req.auth.payload.sub;
    const { litterId, kittenId } = req.params;

    // Check ownership of parent kitten
    const ownershipCheck = await ensureWeightRecordOwnership(
      litterId,
      kittenId,
      null,
      userId,
      res,
      false
    );
    if (!ownershipCheck || !ownershipCheck.kittenOwned) return;

    const weightsSnapshot = await db
      .collection("weightRecords")
      .where("kittenId", "==", kittenId)
      .where("userId", "==", userId)
      .orderBy("dateRecorded", "desc")
      .get();

    const kittenWeights = [];
    weightsSnapshot.forEach((doc) => {
      kittenWeights.push({ id: doc.id, ...doc.data() });
    });
    res.status(200).json(kittenWeights);
  } catch (error) {
    console.error("Error fetching weight records:", error);
    next(error);
  }
};

exports.updateWeightRecord = async (req, res, next) => {
  try {
    const userId = req.auth.payload.sub;
    const { litterId, kittenId, weightId } = req.params;
    const { dateRecorded, weightInGrams, notes } = req.body;

    const existingRecord = await ensureWeightRecordOwnership(
      litterId,
      kittenId,
      weightId,
      userId,
      res
    );
    if (!existingRecord) return;

    const updateData = {};
    if (dateRecorded !== undefined) updateData.dateRecorded = dateRecorded;
    if (weightInGrams !== undefined) {
      const parsedWeight = parseFloat(weightInGrams);
      if (isNaN(parsedWeight) || parsedWeight <= 0) {
        return res
          .status(400)
          .json({ message: "Weight must be a positive number if provided." });
      }
      updateData.weightInGrams = parsedWeight;
    }
    if (notes !== undefined) updateData.notes = notes;
    updateData.updatedAt = new Date().toISOString();

    if (Object.keys(updateData).length === 1 && updateData.updatedAt) {
      return res.status(400).json({ message: "No fields to update provided." });
    }

    await db.collection("weightRecords").doc(weightId).update(updateData);
    res.status(200).json({ id: weightId, ...existingRecord, ...updateData });
  } catch (error) {
    console.error("Error updating weight record:", error);
    next(error);
  }
};

exports.removeWeightRecord = async (req, res, next) => {
  try {
    const userId = req.auth.payload.sub;
    const { litterId, kittenId, weightId } = req.params;

    const record = await ensureWeightRecordOwnership(
      litterId,
      kittenId,
      weightId,
      userId,
      res
    );
    if (!record) return;

    await db.collection("weightRecords").doc(weightId).delete();
    res.status(200).json({ message: "Weight record deleted successfully." });
  } catch (error) {
    console.error("Error removing weight record:", error);
    next(error);
  }
};
