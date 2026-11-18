import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
      match: emailPattern,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      maxlength: 72,
      select: false,
    },
    avatar: {
      type: String,
      trim: true,
      maxlength: 2048,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.password);
};

userSchema.set("toJSON", {
  transform(_document, value) {
    delete value.password;
    delete value.__v;
    return value;
  },
});

export default mongoose.models.User || mongoose.model("User", userSchema);
