const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Функция для загрузки всех карточек из CSV
function loadFlashcards() {
  if (!fs.existsSync('flashcards.csv')) {
    return [];
  }

  const data = fs.readFileSync('flashcards.csv', 'utf8');
  return data.trim().split('\n').map(line => {
    const [id, question, answer] = line.split(',');
    return { id, question, answer };
  });
}

// Функция для сохранения всех карточек в CSV
function saveFlashcards(flashcards) {
  const data = flashcards.map(({ id, question, answer }) => `${id},${question.replace(/,/g, '')},${answer.replace(/,/g, '')}`).join('\n');
  fs.writeFileSync('flashcards.csv', data);
}

// Конечная точка для получения всех карточек
app.get('/flashcards', (req, res) => {
  res.json(loadFlashcards());
});

// Конечная точка для сохранения карточки в CSV
app.post('/save-flashcard', (req, res) => {
  const { id, question, answer } = req.body;

  if (!question || !answer) {
    return res.status(400).send('Question and Answer are required.');
  }

  let flashcards = loadFlashcards();

  if (id) {
    // Редактирование существующей карточки
    const index = flashcards.findIndex(card => card.id === id);
    if (index !== -1) {
      flashcards[index] = { id, question, answer };
    }
  } else {
    // Добавление новой карточки
    const newId = Date.now().toString();
    flashcards.push({ id: newId, question, answer });
  }

  saveFlashcards(flashcards);
  res.status(200).send('Flashcard saved successfully.');
});

// Конечная точка для удаления карточки
app.delete('/delete-flashcard/:id', (req, res) => {
  const { id } = req.params;
  let flashcards = loadFlashcards();
  flashcards = flashcards.filter(card => card.id !== id);
  saveFlashcards(flashcards);
  res.status(200).send('Flashcard deleted successfully.');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
