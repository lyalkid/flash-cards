document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.container');
  const addQuestionCard = document.getElementById('add-question-card');
  const saveBtn = document.getElementById('save-btn');
  const question = document.getElementById('question');
  const answer = document.getElementById('answer');
  const errorMessage = document.getElementById('error');
  const addFlashcardBtn = document.getElementById('add-flashcard');
  const cardListContainer = document.querySelector('.card-list-container');
  const closeBtn = document.getElementById('close-btn');
  let editId = null;

  const loadFlashcards = async () => {
    const response = await fetch('/flashcards');
    const flashcards = await response.json();
    cardListContainer.innerHTML = '';
    flashcards.forEach(({ id, question, answer }) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="question-div">${question}</div>
        <div class="answer-div hide">${answer}</div>
        <a href="#" class="show-hide-btn">Show Answer</a>
        <div class="buttons-con">
          <button class="edit" data-id="${id}"><i class="fa-solid fa-edit"></i></button>
          <button class="delete" data-id="${id}"><i class="fa-solid fa-trash"></i></button>
        </div>
      `;
      cardListContainer.appendChild(card);
    });
  };

  const showHideAnswer = (event) => {
    if (event.target.classList.contains('show-hide-btn')) {
      event.preventDefault();
      const answerDiv = event.target.previousElementSibling;
      if (answerDiv.classList.contains('hide')) {
        answerDiv.classList.remove('hide');
        event.target.textContent = 'Hide Answer';
      } else {
        answerDiv.classList.add('hide');
        event.target.textContent = 'Show Answer';
      }
    }
  };

  const handleCardActions = (event) => {
    if (event.target.closest('.edit')) {
      const id = event.target.closest('.edit').dataset.id;
      const questionDiv = event.target.closest('.card').querySelector('.question-div').textContent;
      const answerDiv = event.target.closest('.card').querySelector('.answer-div').textContent;
      editId = id;
      question.value = questionDiv;
      answer.value = answerDiv;
      addQuestionCard.classList.remove('hide');
    }

    if (event.target.closest('.delete')) {
      const id = event.target.closest('.delete').dataset.id;
      deleteFlashcard(id);
    }
  };

  const saveFlashcard = async () => {
    const newQuestion = question.value.trim();
    const newAnswer = answer.value.trim();

    if (!newQuestion || !newAnswer) {
      errorMessage.classList.remove('hide');
      return;
    }

    const flashcard = {
      question: newQuestion,
      answer: newAnswer,
    };

    if (editId) {
      flashcard.id = editId;
      editId = null;
    }

    const response = await fetch('/save-flashcard', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(flashcard),
    });

    if (response.ok) {
      addQuestionCard.classList.add('hide');
      question.value = '';
      answer.value = '';
      errorMessage.classList.add('hide');
      loadFlashcards();
    }
  };

  const deleteFlashcard = async (id) => {
    const response = await fetch(`/delete-flashcard/${id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      loadFlashcards();
    }
  };

  addFlashcardBtn.addEventListener('click', () => {
    addQuestionCard.classList.remove('hide');
  });

  closeBtn.addEventListener('click', () => {
    addQuestionCard.classList.add('hide');
    question.value = '';
    answer.value = '';
    editId = null;
    errorMessage.classList.add('hide');
  });

  saveBtn.addEventListener('click', saveFlashcard);
  cardListContainer.addEventListener('click', showHideAnswer);
  cardListContainer.addEventListener('click', handleCardActions);

  loadFlashcards();
});
