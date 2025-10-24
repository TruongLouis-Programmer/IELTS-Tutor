A powerful and intuitive web application designed to help you excel in the IELTS Academic Writing Task 2. Powered by the Google Gemini API, this tool provides a comprehensive practice environment that simulates exam conditions and delivers intelligent, actionable feedback to help you improve your band score.
<div align="center">
   <img width="2940" height="1592" alt="image" src="https://github.com/user-attachments/assets/ce94919b-5c11-41a5-9ffe-da90458f9969" />

</div>
- Instantly generate a wide variety of authentic IELTS Task 2 essay questions. You can also edit the topic or write your own.

- Simulate the pressure of the real exam with a customizable timer. The application automatically submits your essay when the time runs out.

- As you write, you can request instant feedback. The AI provides an estimated band score, highlights grammatical errors, and offers a concise hint for improvement without disrupting your flow.
<img width="2940" height="1568" alt="image" src="https://github.com/user-attachments/assets/58bb7744-0bc2-48af-80a1-a4428542347a" />

- Upon submission, receive a comprehensive report that breaks down your performance based on the four official IELTS criteria:
  - Task Achievement
  - Coherence and Cohesion
  - Lexical Resource
  - Grammatical Range and Accuracy
<img width="2940" height="1600" alt="image" src="https://github.com/user-attachments/assets/8fb29f25-815b-4ed8-9846-a110ed55aa57" />

- The report clearly identifies your key **Strengths** and provides a constructive list of **Areas for Improvement**, allowing you to focus your efforts effectively.
<img width="2940" height="1588" alt="image" src="https://github.com/user-attachments/assets/77a36d36-5ed1-4a0f-a7b0-a710f24f1d92" />

- All your completed essays and their reports are saved automatically. A visual chart tracks your overall band score over time, and you can revisit any past essay to review your writing and the AI's feedback.
<img width="2644" height="908" alt="image" src="https://github.com/user-attachments/assets/95fdff3f-f4b7-4a5f-a5b7-29f5c4117f09" />

All data is stored locally in your browser's `localStorage`. Clearing browser cache results in data lost.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
