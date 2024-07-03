import mongoose, { InferSchemaType, Schema } from "mongoose";

export const yearWiseSchema = new Schema({
  researcher_id: {
    type: mongoose.Types.ObjectId,
    ref: "Researcher",
    required: true,
  },
  admin_id: {
    type: mongoose.Types.ObjectId,
    ref: "Admin",
    required: true,
  },
  totalCitations: {
    type: Number,
    required: true,
  },
  totalArticles: {
    type: Number,
    required: true,
  },
  tags: [
    {
      type: String,
    },
  ],
});

export type YearWise = InferSchemaType<typeof yearWiseSchema>;
export const YearWiseDataModel = mongoose.model<YearWise>("YearWise", yearWiseSchema);

