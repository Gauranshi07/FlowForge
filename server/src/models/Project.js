import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 120,
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: 10000,
    },
    status: {
      type: String,
      enum: ["Planning", "Active", "On Hold", "Completed"],
      default: "Planning",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    startDate: {
      type: Date,
    },
    dueDate: {
      type: Date,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

projectSchema.index({ owner: 1, createdAt: -1 });
projectSchema.set("toJSON", {
  transform(_document, value) {
    delete value.__v;
    return value;
  },
});

export default mongoose.models.Project ||
  mongoose.model("Project", projectSchema);
