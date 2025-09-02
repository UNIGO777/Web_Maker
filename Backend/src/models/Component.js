import mongoose from "mongoose";

const componentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // e.g., "Hero Section"
  },
  category: {
    type: String,
    default: "general", // e.g., hero, about, footer
  },
  description: {
    type: String,
  },
  thumbnail: {
    type: String, // URL to a preview image
  },
  code: {
    type: String,
    required: true, // JSX code as string
  },
  defaultProps: {
    type: Object, // default content/data for this component
    default: {},
  },
  styles: {
    type: Object, // optional Tailwind overrides or custom CSS
    default: {},
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // admin who created the component
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Component", componentSchema);
