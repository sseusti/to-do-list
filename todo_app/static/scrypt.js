function updateTodoCount() {
    const activeTasks = document.querySelectorAll('.todo:not(.completed)').length;
    const countElement = document.querySelector('.todo-count');
    countElement.textContent = `${activeTasks} item${activeTasks !== 1 ? 's' : ''} left`;
}

document.querySelector('.todo-text.new-input').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        const text = event.target.value.trim();
        if (!text) return;

        fetch('/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: text })
        })
        .then(response => response.json())
        .then(task => {
            const newTask = document.createElement('div');
            newTask.classList.add('todo');
            newTask.innerHTML = `
                <button class="todo-button" data-id="${task.id}"></button>
                <span class="todo-text">${task.text}</span>
            `;
            const bottom = document.querySelector('.bottom');
            bottom.parentNode.insertBefore(newTask, bottom);
            event.target.value = '';
            updateTodoCount();
        })
        .catch(error => {
            console.error('Ошибка при добавлении задачи:', error);
        });
    }
});

document.addEventListener('click', function(event) {
    if (event.target.classList.contains('todo-button')) {
        const button = event.target;
        const taskId = button.dataset.id;

        fetch('/toggle', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: taskId })
        })
        .then(response => response.json())
        .then(updatedTask => {
            const todoItem = button.closest('.todo');

            if (updatedTask.completed) {
                todoItem.classList.add('completed');
                todoItem.querySelector('.todo-text').classList.add('completed-text');
            } else {
                todoItem.classList.remove('completed');
                todoItem.querySelector('.todo-text').classList.remove('completed-text');
            }
            updateTodoCount();
        })
        .catch(error => {
            console.error('Ошибка при переключении статуса задачи:', error);
        });
    }
});

document.addEventListener('click', function(event) {
    if (event.target.classList.contains('clear-completed')) {
        fetch('/clear_completed', {
            method: 'POST'
        })
        .then(response => {
            if (!response.ok) throw new Error('Ошибка при очистке задач');

            document.querySelectorAll('.todo.completed').forEach(todo => {
                todo.remove();
            });
            updateTodoCount();
        })
        .catch(error => {
            console.error('Ошибка при удалении задач:', error);
        });
    }
});

document.addEventListener('click', function(event) {
    if (event.target.classList.contains('filter-button')) {
        const filter = event.target.textContent.trim();

        document.querySelectorAll('.filter-button').forEach(btn => {
            btn.classList.remove('activated');
        });
        event.target.classList.add('activated');

        document.querySelectorAll('.todo').forEach(todo => {
            const isCompleted = todo.classList.contains('completed');

            if (filter === 'All') {
                todo.style.display = 'flex';
            } else if (filter === 'Active') {
                todo.style.display = isCompleted ? 'none' : 'flex';
            } else if (filter === 'Completed') {
                todo.style.display = isCompleted ? 'flex' : 'none';
            }
        });
    }
});
