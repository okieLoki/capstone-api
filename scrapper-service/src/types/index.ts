import mongoose from "mongoose";

export type Article = {
  title: string;
  link: string;
  authors: string[];
  publication: string;
  publicationYear: number;
  totalCitations: number;
  admin_id?: mongoose.Types.ObjectId;
  researcher? : {
    researcher_id: mongoose.Types.ObjectId;
    name: string;
    scholar_id: string;
  }
};
export type ArticleExtended = {
  title: string;
  link: string;
  authors: string[];
  publicationDate: string;
  journal: string;
  volume: string;
  issue: string;
  pages: string;
  publisher: string;
  description: string;
  totalCitations: number;
  publicationLink: string;
  pdfLink: string;
  admin_id?: mongoose.Types.ObjectId;
  researcher? : {
    researcher_id: mongoose.Types.ObjectId;
    name: string;
    scholar_id: string;
  }
};

export type ArticleQueueMessage = {
  researcher: {
    researcher_id: string;
    name: string;
    scholar_id: string;
  };
  scholar_id: string;
  admin_id: string;
};

export type ResearcherData = {
  name: string;
  emailEnding: string;
  citations: string;
  hIndex: string;
  i10Index: string;
};
