import mongoose, { Schema, Document } from "mongoose";

export interface ICart extends Document {
  userID: mongoose.Types.ObjectId;
  restaurantId: mongoose.Types.ObjectId;
  itemId: mongoose.Types.ObjectId;
  quantity: number;
  createdAt: Date;
  UpdatedAt: Date;
}

const schema = new Schema<ICart>(
  {
    userID: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },

    itemId: {
      type: Schema.Types.ObjectId,
      ref: "MenuItem",
      required: true,
      index: true,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  { timestamps: true },
);

schema.index({ userId: 1, restaurant: 1, itemId: 1 }, { unique: true }); //simply gave unique attribute to all of the data

export default mongoose.model<ICart>("Cart", schema);
