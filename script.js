document.addEventListener('DOMContentLoaded', () => {
  // Игровые переменные
  let balance = parseFloat(localStorage.getItem('minesBalance')) || 45189.51;
  let currentBet = 16;
  const minesCount = 3;
  const maxWin = 35144;
  let gameActive = false;
  let minesPositions = [];
  let revealedCells = 0;
  let cashoutMultiplier = 1;

  // DOM элементы
  const balanceButton = document.getElementById('balanceButton');
  const depositModal = document.getElementById('depositModal');
  const depositInput = document.getElementById('depositInput');
  const confirmDeposit = document.getElementById('confirmDeposit');
  const cancelDeposit = document.getElementById('cancelDeposit');
  const betAmount = document.getElementById('betAmount');
  const playButton = document.getElementById('playButton');
  const gameGrid = document.getElementById('gameGrid');
  const helpButton = document.querySelector('.help-button');

  // Инициализация игры
  function initGame() {
    updateBalance();
    createGrid();
    setupEventListeners();
  }

  // Создание игровой сетки
  function createGrid() {
    gameGrid.innerHTML = '';
    for (let i = 0; i < 25; i++) {
      const cell = document.createElement('div');
      cell.className = 'grid-cell';
      cell.dataset.index = i;
      cell.textContent = '?';
      gameGrid.appendChild(cell);
    }
  }

  // Настройка обработчиков событий
  function setupEventListeners() {
    // Пополнение баланса
    balanceButton.addEventListener('click', () => {
      depositModal.style.display = 'flex';
      depositInput.focus();
    });

    confirmDeposit.addEventListener('click', () => {
      const amount = parseFloat(depositInput.value);
      if (amount > 0) {
        balance += amount;
        updateBalance();
        saveBalance();
        depositModal.style.display = 'none';
        depositInput.value = '';
      }
    });

    cancelDeposit.addEventListener('click', () => {
      depositModal.style.display = 'none';
      depositInput.value = '';
    });

    // Изменение ставки
    betAmount.addEventListener('change', (e) => {
      currentBet = parseInt(e.target.value) || 16;
    });

    // Кнопка игры
    playButton.addEventListener('click', () => {
      if (gameActive) {
        cashout();
      } else {
        startGame();
      }
    });

    // Помощь
    helpButton.addEventListener('click', () => {
      alert('Открывайте клетки, чтобы увеличить множитель выигрыша. Заберите выигрыш до того, как откроете мину!');
    });
  }

  // Начало игры
  function startGame() {
    if (balance < currentBet) {
      alert('Недостаточно средств на балансе');
      return;
    }

    balance -= currentBet;
    updateBalance();
    saveBalance();
    
    gameActive = true;
    revealedCells = 0;
    cashoutMultiplier = 1;
    minesPositions = [];
    playButton.textContent = 'Забрать';
    
    // Очищаем сетку
    const cells = document.querySelectorAll('.grid-cell');
    cells.forEach(cell => {
      cell.className = 'grid-cell';
      cell.textContent = '?';
    });
  }

  // Обработка клика по клетке
  gameGrid.addEventListener('click', (e) => {
    if (!gameActive) return;
    
    const cell = e.target.closest('.grid-cell');
    if (!cell || cell.classList.contains('revealed')) return;
    
    const index = parseInt(cell.dataset.index);
    
    // При первом клике размещаем мины (исключая выбранную клетку)
    if (minesPositions.length === 0) {
      placeMines(index);
    }
    
    // Проверяем, есть ли мина в клетке
    if (minesPositions.includes(index)) {
      // В этой версии мины не открываются - игра беспроигрышная
      return;
    }
    
    // Открываем клетку
    revealCell(cell);
  });

  // Размещение мин
  function placeMines(firstClickIndex) {
    minesPositions = [];
    
    while (minesPositions.length < minesCount) {
      const randomIndex = Math.floor(Math.random() * 25);
      if (randomIndex !== firstClickIndex && !minesPositions.includes(randomIndex)) {
        minesPositions.push(randomIndex);
      }
    }
  }

  // Открытие клетки
  function revealCell(cell) {
    cell.classList.add('revealed');
    cell.textContent = '💰';
    revealedCells++;
    
    // Увеличиваем множитель
    cashoutMultiplier = 1 + (revealedCells * 0.5);
  }

  // Забрать выигрыш
  function cashout() {
    const winAmount = currentBet * cashoutMultiplier;
    balance += winAmount;
    updateBalance();
    saveBalance();
    
    gameActive = false;
    playButton.textContent = 'Играть';
    
    // Показываем мины после завершения игры
    revealMines();
  }

  // Показать мины после завершения игры
  function revealMines() {
    minesPositions.forEach(index => {
      const cell = document.querySelector(`.grid-cell[data-index="${index}"]`);
      if (!cell.classList.contains('revealed')) {
        cell.classList.add('mine');
        cell.textContent = '💣';
      }
    });
  }

  // Обновление баланса
  function updateBalance() {
    balanceButton.textContent = balance.toLocaleString('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + ' ₽';
  }

  // Сохранение баланса
  function saveBalance() {
    localStorage.setItem('minesBalance', balance.toString());
  }

  // Запуск игры
  initGame();
});