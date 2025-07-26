from flask import Flask, render_template, request, jsonify
import json
import os

TASKS_FILE = 'tasks.json'

def load_tasks():
    if not os.path.exists(TASKS_FILE):
        return []
    with open(TASKS_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_tasks():
    with open(TASKS_FILE, 'w', encoding='utf-8') as f:
        json.dump(tasks, f, ensure_ascii=False, indent=4)

app = Flask(__name__)

tasks = load_tasks()
next_id = 1

@app.route('/')
def index():
    return render_template('index.html', tasks=tasks)


@app.route('/add', methods=['POST'])
def add_task():
    global next_id
    data = request.get_json()
    text = data.get('text', '').strip()

    if not text:
        return jsonify({'error': 'empty task'}), 400
    
    new_task = {
        'id': next_id,
        'text': text,
        'completed': False
    }
    
    tasks.append(new_task)
    next_id += 1
    
    save_tasks()
    
    return jsonify(new_task)

@app.route('/toggle', methods=['POST'])
def toggle_task():
    data = request.get_json()
    task_id = int(data.get('id'))

    for task in tasks:
        if task['id'] == task_id:
            task['completed'] = not task['completed']
            
            save_tasks()
            
            return jsonify(task)
        
    return jsonify({'error': 'task not found'}), 404

@app.route('/clear_completed', methods=['POST'])
def clear_completed():
    global tasks
    tasks = [task for task in tasks if not task['completed']]
    
    save_tasks()
    
    return '', 204

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)
