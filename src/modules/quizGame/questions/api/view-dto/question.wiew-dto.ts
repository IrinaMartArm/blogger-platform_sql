export type QuestionsViewDto = {
  id: string;
  body: string;
  correctAnswers: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AnswerViewDto = {
  questionId: string;
  answerStatus: string;
  addedAt: string;
};
