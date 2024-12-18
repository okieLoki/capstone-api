import mongoose, { InferSchemaType, Schema } from "mongoose";

export const paperSchema = new Schema({
  researcher_id: {
    type: mongoose.Types.ObjectId,
    ref: "Researcher",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
  authors: [
    {
      type: String,
    },
  ],
  publication: {
    type: String,
    required: true,
  },
  publicationYear: {
    type: Number,
    required: true,
  },
  totalCitations: {
    type: Number,
    required: true,
  },
});

export type PaperType = InferSchemaType<typeof paperSchema>;
export const PaperModel = mongoose.model<PaperType>("Paper", paperSchema);