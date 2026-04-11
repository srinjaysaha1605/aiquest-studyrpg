export interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  monsterName: string;
}

export interface QuestData {
  topic: string;
  difficulty: number;
  questions: Question[];
}

export async function generateQuest(topic: string, difficulty: number = 1): Promise<QuestData> {
  const response = await fetch('/.netlify/functions/generate-quest', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ topic, difficulty }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to generate quest: ${response.statusText}`);
  }

  return await response.json();
}
