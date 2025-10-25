import json
import os
import psycopg2
from typing import Dict, Any, Optional
from datetime import datetime

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Решает учебные задачи с помощью YAPPERTAR AI и сохраняет в историю
    Args: event - dict с httpMethod, body (question, subject, user_session)
          context - объект с request_id
    Returns: HTTP response с решением задачи
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Session',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Метод не поддерживается'}),
            'isBase64Encoded': False
        }
    
    body_data = json.loads(event.get('body', '{}'))
    question: str = body_data.get('question', '').strip()
    subject: Optional[str] = body_data.get('subject')
    user_session: str = body_data.get('user_session', 'anonymous')
    
    if not question:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Вопрос не может быть пустым'}),
            'isBase64Encoded': False
        }
    
    api_key = os.environ.get('YAPPERTAR_API_KEY')
    if not api_key:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'API ключ YAPPERTAR AI не настроен'}),
            'isBase64Encoded': False
        }
    
    import requests
    
    system_prompt = """Ты - опытный преподаватель и репетитор YAPPERTAR AI. Твоя задача - помогать ученикам решать задачи и объяснять темы максимально понятно.

Правила:
- Всегда давай подробные пошаговые объяснения
- Используй простой язык, понятный школьникам
- Если это задача - покажи каждый шаг решения с пояснениями
- Если это теория - объясни простыми словами с примерами
- Форматируй ответ в markdown для удобства чтения
- Будь дружелюбным и поддерживающим"""

    if subject:
        system_prompt += f"\n\nПредмет: {subject}"
    
    try:
        response = requests.post(
            'https://api.yappertar.ai/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            },
            json={
                'messages': [
                    {'role': 'system', 'content': system_prompt},
                    {'role': 'user', 'content': question}
                ],
                'temperature': 0.7,
                'max_tokens': 2000
            },
            timeout=30
        )
        
        if response.status_code != 200:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': f'Ошибка YAPPERTAR AI: {response.status_code}'}),
                'isBase64Encoded': False
            }
        
        result = response.json()
        solution = result['choices'][0]['message']['content']
        
    except requests.exceptions.RequestException as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'Ошибка при обращении к YAPPERTAR AI: {str(e)}'}),
            'isBase64Encoded': False
        }
    
    db_url = os.environ.get('DATABASE_URL')
    if db_url:
        try:
            conn = psycopg2.connect(db_url)
            cursor = conn.cursor()
            
            cursor.execute(
                "INSERT INTO tasks_history (question, subject, solution, user_session) VALUES (%s, %s, %s, %s) RETURNING id",
                (question, subject, solution, user_session)
            )
            
            task_id = cursor.fetchone()[0]
            conn.commit()
            cursor.close()
            conn.close()
        except Exception:
            task_id = None
    else:
        task_id = None
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'solution': solution,
            'subject': subject,
            'task_id': task_id,
            'request_id': context.request_id
        }, ensure_ascii=False),
        'isBase64Encoded': False
    }
