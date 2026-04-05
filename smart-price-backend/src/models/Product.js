import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  originalUrl: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  platform: { type: String, required: true, enum: ["Amazon", "Flipkart"] },
  image: { type: String },
  searchQuery: { type: String },
  lastScraped: { type: Date, default: Date.now },

  priceHistory: [
    {
      price: { type: Number, required: true },
      date: { type: Date, default: Date.now },
    },
  ],

  competitor: {
    url: { type: String },
    title: { type: String },
    price: { type: Number },
    platform: { type: String },
    image: { type: String },
  },
});

export const Product = mongoose.model("Product", productSchema);
