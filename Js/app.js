$(document).ready(function () {
  const maxDaysInFuture = 7; // Максимальный период бронирования: 7 дней вперед
  const minDaysInPast = 7; // Минимальный период бронирования: 7 дней назад
  const sessionTimes = ["10:00", "12:00", "14:00", "16:00", "18:00", "20:00"];
  const seatCount = 160; // Количество мест в зале

  // Считываем данные из LocalStorage
  function loadData() {
      const storedData = localStorage.getItem("reservations");
      return storedData ? JSON.parse(storedData) : {};
  }

  // Сохраняем данные в LocalStorage
  function saveData(data) {
      localStorage.setItem("reservations", JSON.stringify(data));
  }

  // Форматирование даты в строку вида "YYYY-MM-DD"
  function formatDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
  }

  // Проверка, если дата в прошлом
  function isPastDate(date) {
      const today = new Date();
      return new Date(date) < today.setHours(0, 0, 0, 0);
  }

  // Очистить выбор мест
  function clearSeatSelection() {
      $(".seat").removeClass("selected");
  }

  // Отображение сеансов для выбранной даты
  function renderSessions(date) {
      const data = loadData();
      const sessionSelector = $("#session-selector");

      sessionSelector.empty();
      sessionTimes.forEach(time => {
          const sessionKey = `${date} ${time}`;
          const isPastSession = isPastDate(date) || new Date(`${date} ${time}`).getTime() < new Date().getTime();
          const isBooked = data[sessionKey] && data[sessionKey].some(seat => seat === "booked");

          const button = $('<button>')
              .text(time)
              .attr("data-session", sessionKey)
              .prop('disabled', isPastSession)
              .addClass(isBooked ? 'booked' : '')
              .on("click", function () {
                  $("#session-selector button").removeClass("selected"); // Убираем подсветку с предыдущего сеанса
                  $(this).addClass("selected"); // Добавляем подсветку на выбранный сеанс
                  renderSeats(date, time); // Отображаем места для выбранного сеанса
              });

          sessionSelector.append(button);
      });
  }

  // Отображение мест для выбранного сеанса
  function renderSeats(date, time) {
      const data = loadData();
      const sessionKey = `${date} ${time}`;
      const bookedSeats = data[sessionKey] || [];

      const seatMap = $("#seat-map");
      seatMap.empty().show(); // Показываем карту мест

      for (let i = 1; i <= seatCount; i++) {
          const seatClass = bookedSeats.includes(i) ? "booked" : "";
          const seat = $('<div>')
              .addClass(`seat ${seatClass}`)
              .text(i)
              .attr("data-seat", i)
              .on("click", function () {
                  if (!$(this).hasClass("booked")) {
                      toggleSeatSelection(date, time, i);
                  }
              });

          seatMap.append(seat);
      }
  }

  // Переключение состояния выбранного места
  function toggleSeatSelection(date, time, seatNumber) {
      const data = loadData();
      const sessionKey = `${date} ${time}`;
      const bookedSeats = data[sessionKey] || [];
      const seatIndex = bookedSeats.indexOf(seatNumber);

      if (seatIndex === -1) {
          bookedSeats.push(seatNumber);
      } else {
          bookedSeats.splice(seatIndex, 1);
      }

      data[sessionKey] = bookedSeats;
      saveData(data);
      renderSeats(date, time); // Перерисовываем места
  }

  // Инициализация
  const today = new Date();
  const minDate = new Date(today);
  minDate.setDate(today.getDate() - minDaysInPast); // 7 дней назад
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + maxDaysInFuture); // 7 дней вперед

  const dateInput = $("#date-input");
  dateInput.attr("min", formatDate(minDate)); // Устанавливаем минимальную дату (7 дней назад)
  dateInput.attr("max", formatDate(maxDate)); // Устанавливаем максимальную дату (7 дней вперед)

  // Устанавливаем текущую дату как выбранную по умолчанию
  dateInput.val(formatDate(today));

  // Обработчик выбора даты
  dateInput.on("change", function () {
      const selectedDate = $(this).val();
      if (selectedDate) {
          renderSessions(selectedDate); // Отображаем сеансы для выбранной даты
          $("#seat-map").hide(); // Скрываем карту мест, пока не выбран сеанс
      }
  });

  // Инициализируем сеансы для текущей даты
  renderSessions(formatDate(today)); // Отображаем сеансы для текущей даты
});
