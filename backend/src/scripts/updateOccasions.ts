import mongoose from "mongoose";
import { ClothingItem } from "../models/ClothingItem";

// 🔥 USE YOUR EXISTING ENV VARIABLE
mongoose.connect(process.env.MONGO_URI || "").then(() => {
  console.log("Connected to DB");
});

function assignOccasion(item: any) {
  const set = new Set<string>();

  if (item.formality_score >= 7) {
    set.add("formal");
    set.add("business");
  } else if (item.formality_score >= 4) {
    set.add("casual");
  } else {
    set.add("outdoor");
    set.add("travel");
  }

  if (item.category === "activewear") set.add("outdoor");
  if (item.category === "formal") {
    set.add("formal");
    set.add("business");
  }
  if (item.category === "dresses") {
    set.add("party");
    set.add("date");
  }

  return Array.from(set);
}

async function run() {
  const items = await ClothingItem.find();

  for (let item of items) {
    if (!item.occasions || item.occasions.length === 0) {
      item.occasions = assignOccasion(item);
      await item.save();
      console.log("Updated:", item.name);
    }
  }

  console.log("DONE");
  process.exit();
}

run();