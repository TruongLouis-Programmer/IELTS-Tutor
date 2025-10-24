A powerful and intuitive web application designed to help you excel in the IELTS Academic Writing Task 2. Powered by Google Gemini AI.
<img width="2940" height="1600" alt="image" src="https://github.com/user-attachments/assets/1f25d8b2-adfc-4aa4-b362-8dda435debe6" />


</div>

- Instantly generate a wide variety of authentic IELTS Task 2 essay questions. You can also edit the topic or write your own.

- Simulate the pressure of the real exam with a customizable timer. The application automatically submits your essay when the time runs out.

- As you write, you can request instant feedback. The AI provides an estimated band score, highlights grammatical errors, and offers a concise hint for improvement without disrupting your flow.
<img width="2940" height="1592" alt="image" src="https://github.com/user-attachments/assets/59f9d25e-394c-4f50-9283-3ff653eb0553" />

- Upon submission, receive a comprehensive report that breaks down your performance based on the four official IELTS criteria:
  - Task Achievement
  - Coherence and Cohesion
  - Lexical Resource
  - Grammatical Range and Accuracy
<img width="2938" height="1594" alt="image" src="https://github.com/user-attachments/assets/3140e75f-4619-4695-9f8b-89996f513499" />


- The report clearly identifies your key **Strengths** and provides a constructive list of **Areas for Improvement**, allowing you to focus your efforts effectively.
<img width="2940" height="1594" alt="image" src="https://github.com/user-attachments/assets/7e4609d0-0a32-4b3b-8a99-b2e94600df71" />


- All your completed essays and their reports are saved automatically. A visual chart tracks your overall band score over time, and you can revisit any past essay to review your writing and the AI's feedback.
<img width="2790" height="1256" alt="image" src="https://github.com/user-attachments/assets/6a6fecad-7374-4089-a6b8-f232f29c311e" />


All data is stored locally in your browser's `localStorage`. Clearing browser cache results in data lost.

## Run Locally

**Required:**  [Node.js](https://nodejs.org/)

1. Download the zip [file](https://github.com/TruongLouis-Programmer/IELTS-Writing-Tutor/releases/tag/Universal) from the releases.
2. Upack the file.
4. Install dependencies:
   `npm install`
5. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your [Gemini API key](https://aistudio.google.com/api-keys) (The application already includes a pre-configured API key; however, the rate limit may occasionally be exceeded, resulting in failed processing. You may wish to add your own API key to ensure more reliable performance.)
6. Run the app:
   `npm run dev`
7. Visit [localhost](http://localhost:3000/) to access the app.
